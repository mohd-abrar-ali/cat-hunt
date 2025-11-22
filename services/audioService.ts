import { VisualType, VoiceType } from '../types';

let audioCtx: AudioContext | null = null;
let activeNodes: { stop: () => void } | null = null;
let globalVolume = 0.5; // Default 50%

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const setMasterVolume = (vol: number) => {
  globalVolume = Math.max(0, Math.min(1, vol));
  // If we wanted real-time volume adjustment of currently playing sounds, 
  // we would need to store a reference to the active masterGain. 
  // For now, this applies to new sounds or requires a restart of the loop.
};

export const stopBackgroundAmbience = () => {
  if (activeNodes) {
    try {
      activeNodes.stop();
    } catch (e) {
      // Ignore errors if already stopped
    }
    activeNodes = null;
  }
};

export const playTapSound = () => {
  if (globalVolume <= 0) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  // Soft "water drop" or tap sound
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

  gain.gain.setValueAtTime(0.1 * globalVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  osc.start(t);
  osc.stop(t + 0.1);
};

export const playUISound = (type: 'click' | 'start' | 'toggle') => {
  if (globalVolume <= 0) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'click') {
    // Sharp, high-tech click
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
    
    gain.gain.setValueAtTime(0.05 * globalVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    
    osc.start(t);
    osc.stop(t + 0.05);
  } 
  else if (type === 'toggle') {
    // Soft blip
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.1);
    
    gain.gain.setValueAtTime(0.05 * globalVolume, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.1);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }
  else if (type === 'start') {
    // Cheerful ascending major triad
    const now = t;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      
      o.type = 'sine';
      o.frequency.value = freq;
      
      const startTime = now + i * 0.05;
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.1 * globalVolume, startTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      o.start(startTime);
      o.stop(startTime + 0.5);
    });
    return; // osc/gain handled in loop
  }
};

export const playCatVoice = (voiceType: VoiceType) => {
  if (globalVolume <= 0) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  const t = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = 1.0 * globalVolume;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);

  if (voiceType === VoiceType.MEOW) {
    // Standard Meow (Up then down)
    osc.type = 'triangle'; // Richer sound than sine
    
    // Pitch envelope
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.1); // Attack up
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.6); // Decay down

    // Amplitude envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.start(t);
    osc.stop(t + 0.6);
  } 
  else if (voiceType === VoiceType.KITTEN) {
    // Higher pitch, shorter
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.start(t);
    osc.stop(t + 0.3);
  }
  else if (voiceType === VoiceType.PURR) {
    // Purr (Low frequency sawtooth with heavy tremolo)
    osc.type = 'sawtooth';
    osc.frequency.value = 25; // Base low rumble

    // Tremolo (Amplitude Modulation)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 25; // Rattle speed
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5; // Depth
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    gain.gain.value = 0.3;
    
    // Envelope for the whole purr session
    const masterEnv = ctx.createGain();
    gain.disconnect();
    gain.connect(masterEnv);
    masterEnv.connect(masterGain);
    
    masterEnv.gain.setValueAtTime(0, t);
    masterEnv.gain.linearRampToValueAtTime(1, t + 0.2);
    masterEnv.gain.linearRampToValueAtTime(0, t + 2.0);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 2.0);
    lfo.stop(t + 2.0);
  }
  else if (voiceType === VoiceType.GROWL) {
    // Growl/Hiss (Low bandpass noise)
    // Noise buffer
    const bufferSize = ctx.sampleRate * 1.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(100, t + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.8);

    noise.start(t);
    noise.stop(t + 0.9);
  }
  else if (voiceType === VoiceType.CHIRP) {
    // Quick upward rip
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.linearRampToValueAtTime(1000, t + 0.1);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + 0.15);
    
    osc.start(t);
    osc.stop(t + 0.15);
  }
};

export const startToySound = (type: VisualType) => {
  stopBackgroundAmbience(); // Stop existing sounds
  if (globalVolume <= 0) return;

  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = 0.6 * globalVolume; // Apply global volume

  // --- REALISTIC MOUSE SQUEAKS ---
  if (type === VisualType.MOUSE) {
    let isRunning = true;
    let timeoutId: any;

    const playSqueak = () => {
      if (!isRunning) return;
      
      const t = ctx.currentTime;
      
      // Create a complex chirp (Sequence of quick frequency ramps)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(masterGain);

      // Squeak pitch: Triangle wave for a slightly hollow sound
      // Randomize pitch slightly for realism
      const baseFreq = 2000 + Math.random() * 800; 
      osc.type = 'triangle';
      
      // Frequency Envelope: Quick Chirp Up-Down
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.linearRampToValueAtTime(baseFreq + 600, t + 0.05);
      osc.frequency.linearRampToValueAtTime(baseFreq, t + 0.1);

      // Volume Envelope: Sharp attack, quick decay
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.01); 
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.start(t);
      osc.stop(t + 0.2);

      // Schedule next squeak: Random interval between 1s and 3s
      // Cats prefer intermittent sounds over constant drones
      const nextDelay = 1000 + Math.random() * 2000; 
      timeoutId = setTimeout(playSqueak, nextDelay);
    };

    // Start the sequence
    playSqueak();

    activeNodes = {
      stop: () => {
        isRunning = false;
        clearTimeout(timeoutId);
        masterGain.disconnect();
      }
    };
  } 
  
  // --- REALISTIC INSECT BUZZING ---
  else if (type === VisualType.FLY || type === VisualType.BEETLE || type === VisualType.BUTTERFLY) {
    const t = ctx.currentTime;
    
    // Main Tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Vibrato/Flutter Modulator (Simulates wings beating)
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    
    // Drift Modulator (Simulates movement/Doppler effect)
    const drift = ctx.createOscillator();
    const driftGain = ctx.createGain();

    // Connections
    osc.connect(gain);
    gain.connect(masterGain);

    mod.connect(modGain);
    modGain.connect(osc.frequency);

    drift.connect(driftGain);
    driftGain.connect(osc.frequency);

    if (type === VisualType.FLY) {
      // Annoying high pitch buzz
      osc.type = 'sawtooth';
      osc.frequency.value = 240; 
      gain.gain.value = 0.2;

      // Fast wing flutter
      mod.type = 'square'; // Square wave makes it sound "rougher"
      mod.frequency.value = 50;
      modGain.gain.value = 25; 

      // Erratic movement pitch shift
      drift.frequency.value = 0.5;
      driftGain.gain.value = 40; 

    } else if (type === VisualType.BEETLE) {
      // Lower, heavier drone
      osc.type = 'sawtooth';
      osc.frequency.value = 110; 
      gain.gain.value = 0.3;

      // Slower, heavy wings
      mod.type = 'sine';
      mod.frequency.value = 30;
      modGain.gain.value = 15;

      drift.frequency.value = 0.2;
      driftGain.gain.value = 20;

    } else {
      // Butterfly: Very subtle low frequency flutter (almost silent)
      osc.type = 'triangle';
      osc.frequency.value = 60;
      gain.gain.value = 0.1; // Very quiet

      mod.type = 'sine';
      mod.frequency.value = 10;
      modGain.gain.value = 5;

      drift.frequency.value = 0.1;
      driftGain.gain.value = 5;
    }

    osc.start(t);
    mod.start(t);
    drift.start(t);

    activeNodes = {
      stop: () => {
        osc.stop();
        mod.stop();
        drift.stop();
        masterGain.disconnect();
      }
    };
  } 
  // --- UNDERWATER AMBIENCE (FISH) ---
  else if (type === VisualType.FISH) {
    let isRunning = true;
    let timeoutId: any;
    const t = ctx.currentTime;

    // 1. Underwater Rumble (Pink/Brown Noise)
    const bufferSize = ctx.sampleRate * 5; // 5 seconds loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02; // Simple Brownian noise approx
      lastOut = data[i];
      data[i] *= 3.5; 
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 400; // Muffled sound
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.3;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(t);

    // 2. Random Bubbles
    const playBubble = () => {
      if (!isRunning) return;
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      osc.connect(g);
      g.connect(masterGain);
      
      osc.type = 'sine';
      const freq = 400 + Math.random() * 600;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.1); // Pitch up pop
      
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.3, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      osc.start(now);
      osc.stop(now + 0.2);

      const next = 500 + Math.random() * 2000;
      timeoutId = setTimeout(playBubble, next);
    };
    
    playBubble();

    activeNodes = {
      stop: () => {
        isRunning = false;
        clearTimeout(timeoutId);
        noise.stop();
        masterGain.disconnect();
      }
    };
  }
  // --- SNAKE HISS ---
  else if (type === VisualType.SNAKE) {
    const t = ctx.currentTime;

    // Hissing Noise (Filtered White Noise)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Bandpass to isolate high frequencies for "ssss" sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 6000;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    
    // Modulate volume to sound like slithering/breathing
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.5; // Slow breath
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.1;
    
    // Base volume + LFO modulation
    gain.gain.value = 0.15;
    
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(t);
    lfo.start(t);

    activeNodes = {
      stop: () => {
        noise.stop();
        lfo.stop();
        masterGain.disconnect();
      }
    };
  }
};

export const playCatchSound = (type: VisualType) => {
  if (globalVolume <= 0) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  
  const t = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = 1.0 * globalVolume;
  
  // --- LAYER 1: BLAST EFFECT (Explosion) ---
  
  // White Noise Burst (The "Crack")
  const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Filter noise to sound like an explosion
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(1500, t);
  noiseFilter.frequency.exponentialRampToValueAtTime(50, t + 0.4);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.8, t); 
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noise.start(t);

  // Sub-Bass Kick (The "Boom")
  const kick = ctx.createOscillator();
  kick.type = 'sine';
  kick.frequency.setValueAtTime(150, t);
  kick.frequency.exponentialRampToValueAtTime(40, t + 0.3);
  
  const kickGain = ctx.createGain();
  kickGain.gain.setValueAtTime(1.0, t);
  kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
  
  kick.connect(kickGain);
  kickGain.connect(masterGain);
  
  kick.start(t);
  kick.stop(t + 0.4);

  // --- LAYER 2: HIGH PITCH PING (Gratification) ---
  const ping = ctx.createOscillator();
  const pingGain = ctx.createGain();
  
  ping.connect(pingGain);
  pingGain.connect(masterGain);
  
  ping.type = 'sine';
  ping.frequency.setValueAtTime(800, t);
  ping.frequency.exponentialRampToValueAtTime(1600, t + 0.1);
  
  pingGain.gain.setValueAtTime(0.3, t);
  pingGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  
  ping.start(t);
  ping.stop(t + 0.15);
};