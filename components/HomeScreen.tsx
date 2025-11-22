import React from 'react';
import { Play, Music } from 'lucide-react';
import { DEFAULT_TOYS } from '../constants';
import { ToyConfig } from '../types';
import { playUISound } from '../services/audioService';

interface HomeScreenProps {
  onStartGame: () => void;
  onOpenVoices: () => void;
  currentToy: ToyConfig;
  onSelectToy: (toy: ToyConfig) => void;
  customToys: ToyConfig[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onStartGame, 
  onOpenVoices,
  currentToy, 
  onSelectToy,
  customToys 
}) => {
  
  const handleStart = () => {
    playUISound('start');
    onStartGame();
  };

  const handleVoices = () => {
    playUISound('click');
    onOpenVoices();
  };

  const handleToySelect = (toy: ToyConfig) => {
    playUISound('click');
    onSelectToy(toy);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-indigo-600 rounded-b-[60px] shadow-xl z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full h-full max-w-lg p-6 pt-10">
        
        {/* Header & Logo */}
        <div className="flex flex-col items-center space-y-2 mb-8">
            <div className="relative w-28 h-28 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-indigo-100">
               <img 
                 src="logo.png" 
                 alt="Logo" 
                 className="w-24 h-24 object-contain rounded-full"
                 onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                 }}
               />
               <span className="hidden text-5xl">🐭</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-wide drop-shadow-md" style={{ fontFamily: '"Fredoka One", sans-serif' }}>
              Cat Hunt
            </h1>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 w-full flex flex-col items-center bg-white rounded-3xl shadow-2xl border border-indigo-50 overflow-hidden">
           
           {/* Toy Selection Grid */}
           <div className="flex-1 w-full p-6 overflow-y-auto">
             <h2 className="text-center text-indigo-900 font-bold uppercase tracking-widest text-sm mb-4">Choose Prey</h2>
             <div className="grid grid-cols-3 gap-4">
               {[...DEFAULT_TOYS, ...customToys].map(toy => (
                  <button
                    key={toy.id}
                    onClick={() => handleToySelect(toy)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                      currentToy.id === toy.id 
                        ? 'bg-indigo-600 text-white shadow-lg scale-105 ring-4 ring-indigo-200' 
                        : 'bg-slate-100 text-gray-600 hover:bg-indigo-50 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-4xl mb-1 filter drop-shadow-sm">{toy.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide w-full text-center px-1 truncate">
                      {toy.name}
                    </span>
                  </button>
               ))}
             </div>
           </div>

           {/* Main Action Buttons */}
           <div className="w-full p-6 border-t border-slate-100 bg-slate-50 space-y-3">
             <button 
                onClick={handleStart}
                className="w-full group relative px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center gap-3">
                  <Play className="fill-current w-6 h-6" />
                  <span className="text-xl font-black tracking-wide" style={{ fontFamily: '"Fredoka One", sans-serif' }}>START GAME</span>
                </div>
              </button>

              <button 
                onClick={handleVoices}
                className="w-full group relative px-6 py-3 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-2xl shadow-sm transform transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center gap-3">
                  <Music className="w-5 h-5" />
                  <span className="text-lg font-bold tracking-wide">Cat Voices</span>
                </div>
              </button>
           </div>
        </div>

        <div className="text-center text-slate-400 font-medium text-xs mt-4">
            Select a toy and tap start!
        </div>

      </div>
    </div>
  );
};