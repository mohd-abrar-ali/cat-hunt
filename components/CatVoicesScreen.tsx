import React from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { CAT_PROFILES } from '../constants';
import { playCatVoice, playUISound } from '../services/audioService';
import { CatVoiceProfile } from '../types';

interface CatVoicesScreenProps {
  onBack: () => void;
}

export const CatVoicesScreen: React.FC<CatVoicesScreenProps> = ({ onBack }) => {

  const handleProfileClick = (profile: CatVoiceProfile) => {
    // Add visual feedback or animation here if needed
    playCatVoice(profile.voiceType);
  };

  const handleBack = () => {
    playUISound('click');
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-4 z-10">
        <button 
          onClick={handleBack}
          className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight" style={{ fontFamily: '"Fredoka One", sans-serif' }}>
          Cat Voices
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {CAT_PROFILES.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleProfileClick(profile)}
              className="group relative bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left border border-transparent hover:border-indigo-100"
            >
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-5xl shadow-inner"
                  style={{ backgroundColor: `${profile.color}20` }}
                >
                  <span className="transform group-hover:scale-110 transition-transform duration-300 group-active:scale-90">
                    {profile.avatarEmoji}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-tight">{profile.description}</p>
                </div>

                {/* Play Icon */}
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Volume2 size={20} />
                </div>
              </div>
              
              {/* Click Ripple Effect container (could be enhanced) */}
              <div className="absolute inset-0 rounded-3xl ring-2 ring-indigo-500 opacity-0 group-active:opacity-20 transition-opacity"></div>
            </button>
          ))}
        </div>
        
        <div className="mt-8 text-center text-gray-400 text-sm">
          Tap a cat to hear them speak!
        </div>
      </div>
    </div>
  );
};