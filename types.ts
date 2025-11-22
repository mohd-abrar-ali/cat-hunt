import { Type } from "@google/genai";

export enum MovementStyle {
  SMOOTH = 'smooth',
  JITTERY = 'jittery',
  STOP_GO = 'stop_go',
  TELEPORT = 'teleport',
  WANDER = 'wander',
  BOUNCE = 'bounce'
}

export enum VisualType {
  LASER = 'laser',
  MOUSE = 'mouse',
  FLY = 'fly',
  BUTTERFLY = 'butterfly',
  BEETLE = 'beetle',
  FISH = 'fish',
  SNAKE = 'snake',
  EMOJI = 'emoji' // Fallback
}

export enum VoiceType {
  MEOW = 'meow',
  KITTEN = 'kitten',
  PURR = 'purr',
  GROWL = 'growl',
  CHIRP = 'chirp'
}

export interface CatVoiceProfile {
  id: string;
  name: string;
  description: string;
  avatarEmoji: string;
  voiceType: VoiceType;
  color: string;
}

export interface ToyConfig {
  id: string;
  name: string;
  emoji: string; // Used for UI icons
  visualType: VisualType;
  color: string; // Hex color for trails/effects/body
  speed: number; // 1-15
  size: number; // 20-100 px
  movementStyle: MovementStyle;
  isSystem?: boolean;
}

export interface GameState {
  isPlaying: boolean;
  score: number;
  highScore: number;
  selectedToyId: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface Ripple {
  x: number;
  y: number;
  size: number;
  alpha: number;
}

export interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // Current rotation in radians
  targetX?: number;
  targetY?: number;
  waitTimer?: number;
  scaleX?: number; // For squash and stretch animation
  scaleY?: number; // For squash and stretch animation
  trail?: {x: number, y: number}[];
}

// Schema for Gemini Toy Generation
export const ToySchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Creative name for the toy" },
    emoji: { type: Type.STRING, description: "A single emoji character representing the toy for the UI" },
    visualType: { 
      type: Type.STRING, 
      description: "The visual rendering style of the toy.",
      enum: ["laser", "mouse", "fly", "butterfly", "beetle", "fish", "snake", "emoji"]
    },
    color: { type: Type.STRING, description: "A vibrant hex color string for effects (e.g. #FF0000)" },
    speed: { type: Type.NUMBER, description: "Speed from 1 (slow) to 15 (super fast)" },
    size: { type: Type.NUMBER, description: "Size in pixels, typically 30 to 80" },
    movementStyle: { 
      type: Type.STRING, 
      description: "One of: smooth, jittery, stop_go, teleport, wander, bounce",
      enum: ["smooth", "jittery", "stop_go", "teleport", "wander", "bounce"]
    }
  },
  required: ["name", "emoji", "visualType", "color", "speed", "size", "movementStyle"]
};