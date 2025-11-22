import React, { useState, useCallback, useEffect } from 'react';
import { GameArea } from './components/GameArea';
import { Controls } from './components/Controls';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { CatVoicesScreen } from './components/CatVoicesScreen';
import { DEFAULT_TOYS } from './constants';
import { ToyConfig } from './types';
import { startToySound, stopBackgroundAmbience, setMasterVolume } from './services/audioService';

type AppState = 'SPLASH' | 'HOME' | 'GAME' | 'VOICES';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('SPLASH');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [currentToy, setCurrentToy] = useState<ToyConfig>(DEFAULT_TOYS[0]);
  const [customToys, setCustomToys] = useState<ToyConfig[]>([]);
  const [volume, setVolume] = useState(0.5);
  const [toyCount, setToyCount] = useState(1);

  // Initialize volume
  useEffect(() => {
    setMasterVolume(volume);
  }, [volume]);

  // Handle Splash finish
  const handleSplashFinish = () => {
    setAppState('HOME');
  };

  // Handle Start from Home
  const handleStartGame = () => {
    setAppState('GAME');
    setIsPlaying(true);
    setMultiplier(1); // Reset streak on start
  };

  const handleOpenVoices = () => {
    setAppState('VOICES');
  };

  const handleBackToHome = () => {
    setAppState('HOME');
  };

  const handleExitGame = () => {
    setAppState('HOME');
    setIsPlaying(false);
    setScore(0);
    setMultiplier(1);
  };

  // Manage Continuous Toy Audio
  useEffect(() => {
    if (appState === 'GAME' && isPlaying && volume > 0) {
      startToySound(currentToy.visualType);
    } else {
      stopBackgroundAmbience();
    }

    return () => {
      stopBackgroundAmbience();
    };
  }, [appState, isPlaying, volume, currentToy]);

  const handleCatch = useCallback(() => {
    setScore(prev => prev + (1 * multiplier));
    setMultiplier(prev => Math.min(prev + 1, 10)); // Cap multiplier at 10x
  }, [multiplier]);

  const handleMiss = useCallback(() => {
    setMultiplier(1);
  }, []);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSelectToy = (toy: ToyConfig) => {
    setCurrentToy(toy);
  };

  const handleResetScore = () => {
    setScore(0);
    setMultiplier(1);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-gray-800 select-none">
      
      {appState === 'SPLASH' && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}

      {appState === 'HOME' && (
        <HomeScreen 
          onStartGame={handleStartGame}
          onOpenVoices={handleOpenVoices}
          currentToy={currentToy}
          onSelectToy={handleSelectToy}
          customToys={customToys}
        />
      )}

      {appState === 'VOICES' && (
        <CatVoicesScreen onBack={handleBackToHome} />
      )}

      {appState === 'GAME' && (
        <>
          {/* Game Layer */}
          <GameArea 
            toy={currentToy} 
            toyCount={toyCount}
            isPlaying={isPlaying} 
            onCatch={handleCatch} 
            onMiss={handleMiss}
            isSoundEnabled={volume > 0}
          />

          {/* UI Layer */}
          <Controls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            score={score}
            multiplier={multiplier}
            onResetScore={handleResetScore}
            volume={volume}
            onVolumeChange={setVolume}
            toyCount={toyCount}
            onSetToyCount={setToyCount}
            onExitGame={handleExitGame}
          />
        </>
      )}
    </div>
  );
};

export default App;