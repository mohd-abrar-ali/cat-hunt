import React, { useEffect, useRef } from 'react';
import { ToyConfig, MovementStyle, Entity, Particle, VisualType, Ripple } from '../types';
import { CATCH_RADIUS_MULTIPLIER, PARTICLE_COUNT, MAX_TRAIL_LENGTH } from '../constants';
import { playCatchSound, playTapSound } from '../services/audioService';

interface GameAreaProps {
  toy: ToyConfig;
  toyCount: number;
  isPlaying: boolean;
  onCatch: () => void;
  onMiss: () => void;
  isSoundEnabled: boolean;
}

export const GameArea: React.FC<GameAreaProps> = ({ toy, toyCount, isPlaying, onCatch, onMiss, isSoundEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State Refs
  const entitiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const dustRef = useRef<Particle[]>([]);
  const seaweedRef = useRef<{x: number, height: number, offset: number}[]>([]);
  const requestRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  // Initialize position on mount/toy change
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      
      // Init Entities based on count
      entitiesRef.current = [];
      for (let i = 0; i < toyCount; i++) {
        let vx = (Math.random() - 0.5) * toy.speed;
        let vy = (Math.random() - 0.5) * toy.speed;
        // Ensure they start moving
        if (Math.abs(vx) < 1) vx = toy.speed / 2;
        if (Math.abs(vy) < 1) vy = toy.speed / 2;

        entitiesRef.current.push({
          x: Math.random() * (clientWidth - 100) + 50,
          y: Math.random() * (clientHeight - 100) + 50,
          vx: vx,
          vy: vy,
          angle: Math.atan2(vy, vx),
          waitTimer: 0,
          scaleX: 1,
          scaleY: 1,
          trail: []
        });
      }
      
      particlesRef.current = [];
      ripplesRef.current = [];

      // Init Dust / Bubbles
      const isFish = toy.visualType === VisualType.FISH;
      dustRef.current = [];
      const dustCount = isFish ? 30 : 20;
      for(let i = 0; i < dustCount; i++) {
        dustRef.current.push({
          x: Math.random() * clientWidth,
          y: Math.random() * clientHeight,
          vx: (Math.random() - 0.5) * 0.2,
          vy: isFish ? (Math.random() * -0.5 - 0.2) : (Math.random() - 0.5) * 0.2, // Fish mode: float up
          life: 1,
          color: isFish ? 'rgba(255,255,255,0.3)' : '#a1a1aa',
          size: Math.random() * (isFish ? 8 : 2) + 1
        });
      }

      // Init Seaweed (Only rendered if Fish)
      seaweedRef.current = [];
      if (isFish) {
        for(let i = 0; i < clientWidth; i+=40) {
          seaweedRef.current.push({
            x: i + Math.random() * 20,
            height: 50 + Math.random() * 100,
            offset: Math.random() * Math.PI * 2
          });
        }
      }
    }
  }, [toy, toyCount]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Helper Functions (Hoisted for use in Physics) ---
  const spawnParticles = (x: number, y: number) => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: toy.color,
        size: Math.random() * 6 + 2
      });
    }
  };

  const spawnRipple = (x: number, y: number) => {
    ripplesRef.current.push({
      x, y, size: 10, alpha: 1.0
    });
    if (isSoundEnabled) playTapSound();
  };

  // --- Physics Engine ---
  const updatePhysics = (width: number, height: number) => {
    const speed = toy.speed;
    const isFish = toy.visualType === VisualType.FISH;

    // Update all entities
    entitiesRef.current.forEach(e => {
      // Recover from Squash and Stretch
      if (e.scaleX !== 1 || e.scaleY !== 1) {
        e.scaleX = (e.scaleX || 1) + (1 - (e.scaleX || 1)) * 0.15;
        e.scaleY = (e.scaleY || 1) + (1 - (e.scaleY || 1)) * 0.15;
        
        if (Math.abs(1 - (e.scaleX || 1)) < 0.01) e.scaleX = 1;
        if (Math.abs(1 - (e.scaleY || 1)) < 0.01) e.scaleY = 1;
      }

      // Movement Logic
      if (toy.movementStyle === MovementStyle.STOP_GO) {
        if (e.waitTimer && e.waitTimer > 0) {
          e.waitTimer--;
          if (e.waitTimer === 0) {
            const angle = Math.random() * Math.PI * 2;
            e.vx = Math.cos(angle) * speed;
            e.vy = Math.sin(angle) * speed;
          }
        } else {
          if (Math.random() < 0.02) {
            e.vx = 0;
            e.vy = 0;
            e.waitTimer = Math.random() * 60 + 30; 
          }
        }
      } 
      else if (toy.movementStyle === MovementStyle.JITTERY) {
         if (Math.random() < 0.15) {
           e.vx += (Math.random() - 0.5) * speed;
           e.vy += (Math.random() - 0.5) * speed;
           const mag = Math.sqrt(e.vx*e.vx + e.vy*e.vy);
           if (mag > speed) {
             e.vx = (e.vx / mag) * speed;
             e.vy = (e.vy / mag) * speed;
           }
         }
      }
      else if (toy.movementStyle === MovementStyle.TELEPORT) {
        // Drift
        if (Math.random() < 0.1) {
           e.vx += (Math.random() - 0.5) * 0.5;
           e.vy += (Math.random() - 0.5) * 0.5;
           const driftSpeed = toy.speed * 0.3;
           const mag = Math.sqrt(e.vx*e.vx + e.vy*e.vy);
           if (mag > driftSpeed) {
             e.vx = (e.vx/mag) * driftSpeed;
             e.vy = (e.vy/mag) * driftSpeed;
           }
        }
        // Teleport randomly
        if (Math.random() < 0.01) { 
          spawnParticles(e.x, e.y);
          e.x = Math.random() * (width - toy.size);
          e.y = Math.random() * (height - toy.size);
          e.vx = 0; e.vy = 0;
          spawnParticles(e.x, e.y);
        }
      }
      else if (toy.movementStyle === MovementStyle.WANDER) {
        // WANDER: Smoothly changing random direction
        const steerAngle = (Math.random() - 0.5) * 0.5; // Increased steering for more activity
        const cos = Math.cos(steerAngle);
        const sin = Math.sin(steerAngle);
        
        const nx = e.vx * cos - e.vy * sin;
        const ny = e.vx * sin + e.vy * cos;
        
        e.vx = nx; 
        e.vy = ny;

        // Normalize speed
        const mag = Math.sqrt(e.vx*e.vx + e.vy*e.vy);
        if (mag > 0.1) {
          e.vx = (e.vx / mag) * speed;
          e.vy = (e.vy / mag) * speed;
        } else {
          // Restart if stopped
          const angle = Math.random() * Math.PI * 2;
          e.vx = Math.cos(angle) * speed;
          e.vy = Math.sin(angle) * speed;
        }
      }
      else if (toy.movementStyle === MovementStyle.BOUNCE) {
        // BOUNCE: Simulated gravity
        const gravity = 0.35;
        e.vy += gravity;
        
        // Air resistance
        e.vx *= 0.99; 
        
        // Keep horizontal movement alive
        if (Math.abs(e.vx) < 0.5) {
           e.vx = (Math.random() - 0.5) * speed;
        }
      }
      else { 
        // Smooth (Default)
        if (Math.random() < 0.05) {
          const turn = (Math.random() - 0.5) * 1;
          const cos = Math.cos(turn);
          const sin = Math.sin(turn);
          const nx = e.vx * cos - e.vy * sin;
          const ny = e.vx * sin + e.vy * cos;
          e.vx = nx; 
          e.vy = ny;
        }
         const mag = Math.sqrt(e.vx*e.vx + e.vy*e.vy);
         if (mag < 1) {
            e.vx = speed; e.vy = speed;
         }
      }

      // Update Position
      e.x += e.vx;
      e.y += e.vy;

      // Update Angle (Face direction)
      if (Math.abs(e.vx) > 0.1 || Math.abs(e.vy) > 0.1) {
        const targetAngle = Math.atan2(e.vy, e.vx);
        // Smooth rotation
        let diff = targetAngle - e.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        e.angle += diff * 0.2;
      }

      // Wall Bounce
      let bounced = false;
      
      // Left/Right Walls
      if (e.x <= toy.size/2) {
        e.vx = Math.abs(e.vx); // Force positive
        e.x = toy.size/2;
        bounced = true;
      } else if (e.x >= width - toy.size/2) {
        e.vx = -Math.abs(e.vx); // Force negative
        e.x = width - toy.size/2;
        bounced = true;
      }

      // Top/Bottom Walls
      if (e.y <= toy.size/2) {
        e.vy = Math.abs(e.vy); // Force positive
        e.y = toy.size/2;
        bounced = true;
      } else if (e.y >= height - toy.size/2) {
        e.vy = -Math.abs(e.vy); // Force negative
        e.y = height - toy.size/2;
        
        if (toy.movementStyle === MovementStyle.BOUNCE) {
          // Lose some energy on floor bounce
          e.vy *= 0.85;
          // Re-launch if too slow (prevents rolling on floor forever)
          if (Math.abs(e.vy) < speed * 0.5) {
            e.vy = -speed * (0.8 + Math.random() * 0.4);
            e.vx = (Math.random() - 0.5) * speed;
          }
        }
        bounced = true;
      }

      // Trail
      if (!e.trail) e.trail = [];
      e.trail.push({ x: e.x, y: e.y });
      if (e.trail.length > MAX_TRAIL_LENGTH) e.trail.shift();
    });

    // Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }

    // Ripples
    for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
      const r = ripplesRef.current[i];
      r.size += 2;
      r.alpha -= 0.02;
      if (r.alpha <= 0) {
        ripplesRef.current.splice(i, 1);
      }
    }

    // Ambient Dust / Bubbles
    dustRef.current.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (isFish) {
        d.x += Math.sin(d.y * 0.05 + frameCountRef.current * 0.05) * 0.5;
      }
      if (d.x < 0) d.x = width;
      if (d.x > width) d.x = 0;
      if (d.y < 0) d.y = height;
      if (d.y > height) d.y = 0;
    });
  };

  // --- Renderers ---

  const drawLaser = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    
    const gradient = ctx.createRadialGradient(x, y, size/4, x, y, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); 
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size/3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; 
  };

  const drawMouse = (ctx: CanvasRenderingContext2D, size: number, color: string, frame: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(size * 0.3, -size * 0.25, size * 0.15, 0, Math.PI * 2);
    ctx.arc(size * 0.3, size * 0.25, size * 0.15, 0, Math.PI * 2); 
    ctx.fill();
    
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(size * 0.3, -size * 0.25, size * 0.07, 0, Math.PI * 2);
    ctx.arc(size * 0.3, size * 0.25, size * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color; 
    ctx.lineWidth = size * 0.05;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, 0);
    const tailWiggle = Math.sin(frame * 0.2) * (size * 0.2);
    ctx.quadraticCurveTo(-size * 1.0, tailWiggle, -size * 1.5, 0);
    ctx.stroke();

    ctx.strokeStyle = '#4b5563'; 
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size * 0.6, -size * 0.1); ctx.lineTo(size * 0.9, -size * 0.3);
    ctx.moveTo(size * 0.6, 0); ctx.lineTo(size * 0.95, 0);
    ctx.moveTo(size * 0.6, size * 0.1); ctx.lineTo(size * 0.9, size * 0.3);
    ctx.stroke();
  };

  const drawFly = (ctx: CanvasRenderingContext2D, size: number, color: string, frame: number) => {
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(200, 220, 255, 0.7)';
    const wingScale = Math.abs(Math.sin(frame * 0.8));
    
    ctx.save();
    ctx.translate(-size * 0.1, -size * 0.1);
    ctx.rotate(-Math.PI / 4);
    ctx.scale(1, wingScale);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.4, size * 0.15, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke(); 
    ctx.restore();

    ctx.save();
    ctx.translate(-size * 0.1, size * 0.1);
    ctx.rotate(Math.PI / 4);
    ctx.scale(1, wingScale);
    ctx.beginPath();
    ctx.ellipse(0, size * 0.4, size * 0.15, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(size * 0.2, -size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.arc(size * 0.2, size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawButterfly = (ctx: CanvasRenderingContext2D, size: number, color: string, frame: number) => {
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.6, size * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0); ctx.lineTo(size * 0.7, -size * 0.2);
    ctx.moveTo(size * 0.5, 0); ctx.lineTo(size * 0.7, size * 0.2);
    ctx.stroke();

    const flap = Math.sin(frame * 0.15);
    const wingScale = 0.5 + 0.5 * flap; 
    
    ctx.fillStyle = color;
    ctx.save();
    ctx.scale(1, wingScale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.5, -size, size * 1.5, -size, 0, 0);
    ctx.bezierCurveTo(size * 0.5, size, size * 1.5, size, 0, 0);
    ctx.fill();
    
    ctx.fillStyle = '#fed7aa'; 
    ctx.beginPath();
    ctx.ellipse(-size * 0.2, -size * 0.4, size * 0.3, size * 0.2, -0.5, 0, Math.PI*2);
    ctx.ellipse(-size * 0.2, size * 0.4, size * 0.3, size * 0.2, 0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  };

  const drawBeetle = (ctx: CanvasRenderingContext2D, size: number, color: string, frame: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.5, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, 0);
    ctx.lineTo(size * 0.5, 0);
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(size * 0.5, 0, size * 0.2, -Math.PI/2, Math.PI/2);
    ctx.fill();

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    const legWiggle = Math.sin(frame * 0.5) * 5;
    for(let i = -1; i <= 1; i++) {
       ctx.beginPath();
       ctx.moveTo(i * size * 0.2, -size * 0.3);
       ctx.lineTo(i * size * 0.25 + legWiggle, -size * 0.6);
       ctx.stroke();
       
       ctx.beginPath();
       ctx.moveTo(i * size * 0.2, size * 0.3);
       ctx.lineTo(i * size * 0.25 - legWiggle, size * 0.6);
       ctx.stroke();
    }
  };

  const drawFish = (ctx: CanvasRenderingContext2D, size: number, color: string, frame: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.6, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    const tailWiggle = Math.sin(frame * 0.2) * (size * 0.1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-size * 0.4, 0);
    ctx.lineTo(-size * 0.9, -size * 0.3 + tailWiggle);
    ctx.lineTo(-size * 0.9, size * 0.3 + tailWiggle);
    ctx.fill();

    const finFlap = Math.abs(Math.sin(frame * 0.15));
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; 
    ctx.beginPath();
    ctx.moveTo(size * 0.1, 0);
    ctx.quadraticCurveTo(size * 0.1, size * 0.4 * finFlap, -size * 0.2, size * 0.2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(size * 0.3, -size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(size * 0.35, -size * 0.1, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawSnake = (ctx: CanvasRenderingContext2D, e: Entity, size: number, color: string) => {
     // Draw body segments
     if (e.trail && e.trail.length > 0) {
        for (let i = 0; i < e.trail.length; i++) {
           const point = e.trail[i];
           // i=0 is tail (oldest), i=length-1 is near head
           // Taper the size
           const segSize = size * (0.3 + 0.6 * (i / e.trail.length));
           ctx.fillStyle = color;
           
           // Alternate shades for pattern
           if (i % 3 === 0) {
              ctx.fillStyle = '#4d7c0f'; // Darker green pattern
           }

           ctx.beginPath();
           ctx.arc(point.x, point.y, segSize/2, 0, Math.PI*2);
           ctx.fill();
        }
     }

     // Draw Head
     ctx.save();
     ctx.translate(e.x, e.y);
     ctx.rotate(e.angle);
     
     // Head shape
     ctx.fillStyle = color;
     ctx.beginPath();
     ctx.ellipse(0, 0, size * 0.6, size * 0.5, 0, 0, Math.PI*2);
     ctx.fill();

     // Eyes
     ctx.fillStyle = 'white';
     ctx.beginPath();
     ctx.arc(size * 0.2, -size * 0.2, size * 0.15, 0, Math.PI*2);
     ctx.arc(size * 0.2, size * 0.2, size * 0.15, 0, Math.PI*2);
     ctx.fill();
     ctx.fillStyle = 'black';
     ctx.beginPath();
     ctx.arc(size * 0.25, -size * 0.2, size * 0.05, 0, Math.PI*2);
     ctx.arc(size * 0.25, size * 0.2, size * 0.05, 0, Math.PI*2);
     ctx.fill();

     // Tongue
     const tongueFlick = Math.sin(Date.now() * 0.015) > 0.7; // Flicker occasionally
     if (tongueFlick) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(size * 0.5, 0);
        ctx.lineTo(size * 0.9, 0);
        // Fork
        ctx.lineTo(size * 1.1, -size * 0.15);
        ctx.moveTo(size * 0.9, 0);
        ctx.lineTo(size * 1.1, size * 0.15);
        ctx.stroke();
     }
     ctx.restore();
  };

  // --- Main Loop ---
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const isFish = toy.visualType === VisualType.FISH;

    if (isFish) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0284c7'); 
      gradient.addColorStop(1, '#082f49'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#15803d'; 
      seaweedRef.current.forEach((plant, i) => {
        const sway = Math.sin(frameCountRef.current * 0.02 + plant.offset) * 10;
        ctx.beginPath();
        ctx.moveTo(plant.x, height);
        ctx.quadraticCurveTo(plant.x + sway, height - plant.height / 2, plant.x + sway * 1.5, height - plant.height);
        ctx.quadraticCurveTo(plant.x - sway, height - plant.height / 2, plant.x - 15, height);
        ctx.fill();
      });

    } else {
      ctx.clearRect(0, 0, width, height);
    }
    
    // Only update physics if playing, but always draw the last frame
    if (isPlaying) {
      updatePhysics(width, height);
      frameCountRef.current++;
    }

    // Draw Ambient
    dustRef.current.forEach(d => {
      ctx.fillStyle = d.color;
      if (isFish) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(d.x - d.size*0.3, d.y - d.size*0.3, d.size * 0.2, 0, Math.PI*2);
        ctx.fill();
      } else {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    });
    
    // Draw Ripples
    ripplesRef.current.forEach(r => {
      ctx.strokeStyle = isFish ? 'rgba(255,255,255,0.5)' : '#6366f1'; 
      ctx.lineWidth = 2;
      ctx.globalAlpha = r.alpha;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.globalAlpha = 1.0;

    // Loop through all Entities
    entitiesRef.current.forEach(e => {
      // Draw Trail (Only for non-snake, non-mouse, non-fish)
      if (e.trail && e.trail.length > 1 && 
          toy.visualType !== VisualType.MOUSE && 
          toy.visualType !== VisualType.FISH && 
          toy.visualType !== VisualType.SNAKE) {
        ctx.beginPath();
        ctx.moveTo(e.trail[0].x, e.trail[0].y);
        for (let i = 1; i < e.trail.length; i++) {
          ctx.lineTo(e.trail[i].x, e.trail[i].y);
        }
        ctx.strokeStyle = toy.color;
        ctx.lineWidth = toy.size / (toy.visualType === VisualType.LASER ? 4 : 8);
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Draw Entity
      if (toy.visualType === VisualType.LASER) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.scale(e.scaleX || 1, e.scaleY || 1);
        drawLaser(ctx, 0, 0, toy.size, toy.color);
        ctx.restore();
      } else if (toy.visualType === VisualType.SNAKE) {
        // Snake handles its own trail/rotation/translation in drawSnake
        // But we need to apply scaling if needed (though snake is segmented, squash/stretch on catch might look funny but we can apply it to segments or just the head)
        // Let's pass the entity to drawSnake and let it handle things.
        drawSnake(ctx, e, toy.size, toy.color);
      } else {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        ctx.scale(e.scaleX || 1, e.scaleY || 1);

        switch (toy.visualType) {
          case VisualType.MOUSE:
            drawMouse(ctx, toy.size, toy.color, frameCountRef.current);
            break;
          case VisualType.FLY:
            drawFly(ctx, toy.size, toy.color, frameCountRef.current);
            break;
          case VisualType.BUTTERFLY:
            drawButterfly(ctx, toy.size, toy.color, frameCountRef.current);
            break;
          case VisualType.BEETLE:
            drawBeetle(ctx, toy.size, toy.color, frameCountRef.current);
            break;
          case VisualType.FISH:
            drawFish(ctx, toy.size, toy.color, frameCountRef.current);
            break;
          default:
            ctx.rotate(-e.angle); 
            ctx.font = `${toy.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(toy.emoji, 0, 0);
        }
        ctx.restore();
      }
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toy, toyCount, isPlaying]); 


  // Input Handling
  const handleInteraction = (clientX: number, clientY: number) => {
    if (!canvasRef.current || !isPlaying) return; // Disable interaction when paused

    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    spawnRipple(x, y);

    const hitRadius = toy.size * CATCH_RADIUS_MULTIPLIER;
    const scaredRadius = toy.size * 4; 
    let hitAny = false;

    // Check against all entities
    entitiesRef.current.forEach(e => {
      const dist = Math.sqrt((x - e.x)**2 + (y - e.y)**2);

      if (dist < hitRadius) {
        hitAny = true;
        // CAUGHT!
        onCatch();
        if (isSoundEnabled) {
          playCatchSound(toy.visualType);
        }
        spawnParticles(e.x, e.y);
        
        e.scaleX = 1.5; 
        e.scaleY = 0.5;

        // Run away fast after catch
        const angle = Math.atan2(e.y - y, e.x - x);
        e.vx = Math.cos(angle) * (toy.speed * 3);
        e.vy = Math.sin(angle) * (toy.speed * 3);
        
        if (toy.movementStyle === MovementStyle.TELEPORT || toy.movementStyle === MovementStyle.JITTERY) {
          e.x = Math.random() * (canvasRef.current!.width - toy.size);
          e.y = Math.random() * (canvasRef.current!.height - toy.size);
        }
      } 
      else if (dist < scaredRadius) {
        const angle = Math.atan2(e.y - y, e.x - x);
        e.vx += Math.cos(angle) * (toy.speed * 0.5);
        e.vy += Math.sin(angle) * (toy.speed * 0.5);
        const maxSpeed = toy.speed * 2;
        const currentSpeed = Math.sqrt(e.vx*e.vx + e.vy*e.vy);
        if (currentSpeed > maxSpeed) {
          e.vx = (e.vx/currentSpeed) * maxSpeed;
          e.vy = (e.vy/currentSpeed) * maxSpeed;
        }
      }
    });

    // If no entity was hit, trigger miss
    if (!hitAny) {
      onMiss();
    }
  };

  const onTouch = (e: React.TouchEvent) => {
    for (let i=0; i<e.changedTouches.length; i++) {
      handleInteraction(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden touch-none select-none cursor-none">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        onTouchStart={onTouch}
        onMouseDown={onMouseDown}
      />
    </div>
  );
};