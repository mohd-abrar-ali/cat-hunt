import React, { useState } from 'react';
import { Button } from './Button';
import { Play, RotateCcw, Volume2, Volume1, VolumeX, Settings, Minus, Plus, Home } from 'lucide-react';
import { playUISound } from '../services/audioService';

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  score: number;
  multiplier: number;
  onResetScore: () => void;
  volume: number; // 0 to 1
  onVolumeChange: (val: number) => void;
  toyCount: number;
  onSetToyCount: (count: number) => void;
  onExitGame: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onTogglePlay,
  score,
  multiplier,
  onResetScore,
  volume,
  onVolumeChange,
  toyCount,
  onSetToyCount,
  onExitGame
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    playUISound('click');
    setIsMenuOpen(!isMenuOpen);
  };

  const handleReset = () => {
    playUISound('click');
    onResetScore();
    setIsMenuOpen(false);
  };

  const handleExit = () => {
    playUISound('click');
    onExitGame();
  };
  
  const handleCountChange = (increment: boolean) => {
    playUISound('click');
    if (increment) {
      onSetToyCount(Math.min(8, toyCount + 1));
    } else {
      onSetToyCount(Math.max(1, toyCount - 1));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  // When menu is closed
  if (!isMenuOpen) {
    return (
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col pointer-events-auto">
          <Button 
            variant="ghost" 
            onClick={handleToggleMenu}
            className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center !p-0 shadow-sm border border-white/10 hover:bg-white/40 text-gray-800"
          >
            <Settings size={24} />
          </Button>
        </div>
        <div className="flex items-baseline gap-2 pointer-events-none select-none drop-shadow-lg">
          <span className="text-6xl font-black text-gray-400/30">{score}</span>
          {multiplier > 1 && (
             <span className="text-3xl font-black text-indigo-400/50 animate-pulse">x{multiplier}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Menu Header */}
        <div className="bg-indigo-600 p-6 text-center">
           <h2 className="text-3xl font-black text-white tracking-tight">PAUSED</h2>
           <div className="text-indigo-200 font-medium mt-1">
             Score: {score} 
             {multiplier > 1 && <span className="ml-2 text-yellow-300 font-bold">(x{multiplier})</span>}
           </div>
        </div>
        
        <div className="p-8 space-y-8">
          
          {/* 1. Volume Control */}
          <div className="space-y-3">
             <div className="flex items-center justify-between text-gray-600">
                <span className="font-bold uppercase text-xs tracking-wider">Volume</span>
                {volume === 0 ? <VolumeX size={20} /> : volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />}
             </div>
             <input 
               type="range" 
               min="0" 
               max="1" 
               step="0.1" 
               value={volume}
               onChange={handleVolumeChange}
               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
             />
          </div>

          {/* 2. Toy Count */}
          <div className="space-y-3">
             <div className="flex items-center justify-between text-gray-600">
                <span className="font-bold uppercase text-xs tracking-wider">Number of Prey</span>
             </div>
             <div className="flex items-center justify-between bg-slate-100 rounded-xl p-2">
                <button 
                  onClick={() => handleCountChange(false)}
                  className="w-12 h-12 bg-white rounded-lg shadow-sm text-indigo-600 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                  disabled={toyCount <= 1}
                >
                  <Minus size={20} />
                </button>
                <span className="text-2xl font-black text-indigo-900">{toyCount}</span>
                <button 
                  onClick={() => handleCountChange(true)}
                  className="w-12 h-12 bg-white rounded-lg shadow-sm text-indigo-600 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                  disabled={toyCount >= 8}
                >
                  <Plus size={20} />
                </button>
             </div>
          </div>

          {/* 3. Actions */}
          <div className="grid grid-cols-2 gap-4 pt-2">
             <Button 
                variant="secondary" 
                onClick={handleReset}
                className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0"
              >
                <RotateCcw size={18} className="mr-2" /> Reset
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleExit}
                className="bg-red-50 text-red-600 hover:bg-red-100 border-0"
              >
                <Home size={18} className="mr-2" /> Exit
              </Button>
          </div>
          
          <Button 
            onClick={() => { 
              playUISound('start'); 
              setIsMenuOpen(false); 
            }} 
            className="w-full py-4 text-lg shadow-xl shadow-indigo-200"
          >
            <Play className="mr-2 fill-current" /> Resume Game
          </Button>

        </div>
      </div>
    </div>
  );
};