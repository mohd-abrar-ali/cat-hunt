import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  
  // Auto-transition after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-6 text-white">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s'}}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-1000">
        
        {/* Logo / Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-white p-4 rounded-full shadow-2xl">
             {/* Uses logo.png if available, otherwise falls back to emoji */}
             <img 
               src="logo.png" 
               alt="Cat Hunt Logo" 
               className="w-32 h-32 object-contain rounded-full"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.nextElementSibling!.classList.remove('hidden');
               }}
             />
             <span className="hidden text-7xl">🐱</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight drop-shadow-lg" style={{ fontFamily: '"Fredoka One", sans-serif' }}>
            Cat Hunt
          </h1>
          <div className="h-1 w-24 bg-white/50 mx-auto rounded-full"></div>
        </div>

        <div className="absolute bottom-10 text-sm text-white/80 flex items-center gap-2 animate-bounce">
          <Sparkles size={16} />
          <span>Loading Purrfect Experience...</span>
          <Sparkles size={16} />
        </div>

      </div>
    </div>
  );
};