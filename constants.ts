import { CatVoiceProfile, MovementStyle, ToyConfig, VisualType, VoiceType } from "./types";

export const DEFAULT_TOYS: ToyConfig[] = [
  {
    id: 'mouse_grey',
    name: 'Squeaky',
    emoji: '🐭',
    visualType: VisualType.MOUSE,
    color: '#52525b', // Darker grey (Zinc-600) for visibility on white
    speed: 10, // Slightly faster for continuous run
    size: 70,
    movementStyle: MovementStyle.WANDER, // Changed from STOP_GO to WANDER
    isSystem: true
  },
  {
    id: 'fly_blue',
    name: 'Buzzy',
    emoji: '🪰',
    visualType: VisualType.FLY,
    color: '#0369a1', // Darker blue (Sky-700)
    speed: 16,
    size: 35,
    movementStyle: MovementStyle.JITTERY,
    isSystem: true
  },
  {
    id: 'butterfly_orange',
    name: 'Flutter',
    emoji: '🦋',
    visualType: VisualType.BUTTERFLY,
    color: '#ea580c', // Darker orange (Orange-600)
    speed: 5,
    size: 60,
    movementStyle: MovementStyle.SMOOTH,
    isSystem: true
  },
  {
    id: 'beetle_green',
    name: 'Scuttle',
    emoji: '🪲',
    visualType: VisualType.BEETLE,
    color: '#15803d', // Darker green (Green-700)
    speed: 7,
    size: 45,
    movementStyle: MovementStyle.SMOOTH,
    isSystem: true
  },
  {
    id: 'snake_green',
    name: 'Hiss',
    emoji: '🐍',
    visualType: VisualType.SNAKE,
    color: '#65a30d', // Lime-600
    speed: 7,
    size: 50,
    movementStyle: MovementStyle.WANDER,
    isSystem: true
  },
  {
    id: 'fish_orange',
    name: 'Finny',
    emoji: '🐟',
    visualType: VisualType.FISH,
    color: '#f97316', // Orange-500
    speed: 8,
    size: 65,
    movementStyle: MovementStyle.WANDER,
    isSystem: true
  }
];

export const CAT_PROFILES: CatVoiceProfile[] = [
  {
    id: 'cat_luna',
    name: 'Luna',
    description: 'A sweet and standard meow.',
    avatarEmoji: '😺',
    voiceType: VoiceType.MEOW,
    color: '#f472b6' // Pink
  },
  {
    id: 'cat_simba',
    name: 'Simba',
    description: 'Loud and demanding!',
    avatarEmoji: '😼',
    voiceType: VoiceType.GROWL,
    color: '#facc15' // Yellow
  },
  {
    id: 'cat_oliver',
    name: 'Oliver',
    description: 'Tiny kitten mew.',
    avatarEmoji: '😽',
    voiceType: VoiceType.KITTEN,
    color: '#60a5fa' // Blue
  },
  {
    id: 'cat_bella',
    name: 'Bella',
    description: 'Deep and happy purring.',
    avatarEmoji: '😸',
    voiceType: VoiceType.PURR,
    color: '#a78bfa' // Purple
  },
  {
    id: 'cat_charlie',
    name: 'Charlie',
    description: 'Quick chirps and trills.',
    avatarEmoji: '😻',
    voiceType: VoiceType.CHIRP,
    color: '#fb7185' // Rose
  }
];

export const PARTICLE_COUNT = 12;
export const CATCH_RADIUS_MULTIPLIER = 1.3; 
export const MAX_TRAIL_LENGTH = 35; // Increased to support snake bodies