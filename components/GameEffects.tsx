'use client';

import React, { useEffect, useRef } from 'react';
import { GameState } from '@/lib/gameState';
import { useGameContext } from '@/lib/gameContext';

interface GameEffectsProps {
  gameState: GameState;
}

// ============================================
// 1. BrainMeterEffect: Blur + flicker when brainMeter > 60
// ============================================
function BrainMeterEffect({ brainMeter }: { brainMeter: number }) {
  if (brainMeter <= 60) return null;
  
  const blurAmount = Math.min((brainMeter - 60) / 20, 4); // Scale 0-4px based on brainMeter
  const opacity = 0.3 + (brainMeter - 60) / 100; // Flicker between 0.3-0.7
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-40"
      style={{
        filter: `blur(${blurAmount}px)`,
        animation: 'brain-flicker 0.15s ease-in-out infinite',
        opacity,
      }}
    />
  );
}

// ============================================
// 2. JaundiceEffect: Sepia filter when JAUNDICE_EVENT active
// ============================================
function JaundiceEffect({ isActive }: { isActive: boolean }) {
  const [opacity, setOpacity] = React.useState(0);
  
  useEffect(() => {
    if (isActive) {
      // Fade in over 3 seconds
      const timer = setTimeout(() => setOpacity(0.8), 50);
      return () => clearTimeout(timer);
    } else {
      setOpacity(0);
    }
  }, [isActive]);
  
  if (opacity === 0) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-35"
      style={{
        filter: 'sepia(0.8) saturate(2) hue-rotate(10deg)',
        opacity,
        transition: 'opacity 3s ease-in-out',
        backgroundColor: 'rgba(255, 200, 100, 0.1)',
      }}
    />
  );
}

// ============================================
// 3. SepsisWarning: Red flash + Web Audio API beep
// ============================================
function SepsisWarning({ isActive }: { isActive: boolean }) {
  const audioRef = useRef<AudioContext | null>(null);
  
  useEffect(() => {
    if (isActive) {
      // Play beep at 440hz for 0.5 seconds
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioRef.current = new AudioContextClass();
          const oscillator = audioRef.current.createOscillator();
          const gainNode = audioRef.current.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioRef.current.destination);
          
          oscillator.frequency.value = 440;
          oscillator.type = 'square';
          
          gainNode.gain.setValueAtTime(0.3, audioRef.current.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioRef.current.currentTime + 0.5);
          
          oscillator.start(audioRef.current.currentTime);
          oscillator.stop(audioRef.current.currentTime + 0.5);
        }
      } catch (e) {
        console.log('Audio not supported');
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.close();
      }
    };
  }, [isActive]);
  
  if (!isActive) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-45"
      style={{
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
        animation: 'sepsis-flash 0.2s ease-out',
      }}
    />
  );
}

// ============================================
// 4. ToxinOverload: Visual indicator
// ============================================
function ToxinOverloadEffect({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30"
      style={{
        background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139, 19, 19, 0.1) 10px, rgba(139, 19, 19, 0.1) 20px)',
        animation: 'toxin-pulse 1s ease-in-out infinite',
      }}
    />
  );
}

// ============================================
// Existing overlay components (kept for reference)
// ============================================
function CirrhosisOverlay({ level }: { level: number }) {
  if (level < 30) return null;
  
  const opacity = Math.min(level / 200, 0.5);
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at center, transparent 30%, rgba(180, 83, 9, ${opacity}) 100%)`,
      }}
    />
  );
}

function ToxicOverlay({ health }: { health: number }) {
  if (health > 70) return null;
  
  const opacity = Math.max((70 - health) / 100, 0);
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none animate-pulse"
      style={{
        background: `radial-gradient(ellipse at center, transparent 40%, rgba(220, 38, 38, ${opacity}) 100%)`,
      }}
    />
  );
}

function FullAbdomenEffect({ fill }: { fill: number }) {
  if (fill < 50) return null;
  
  const opacity = Math.min((fill - 50) / 100, 0.3);
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at center, transparent 30%, rgba(234, 88, 12, ${opacity}) 100%)`,
      }}
    />
  );
}

// ============================================
// Main GameEffects component
// ============================================
export function GameEffects({ gameState }: GameEffectsProps) {
  const { isJaundiceActive, isSepsisActive, isToxinOverloadActive } = useGameContext();
  
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* BrainMeterEffect - blur + flicker when brainMeter > 60 */}
      <BrainMeterEffect brainMeter={gameState.brainMeter} />
      
      {/* JaundiceEffect - sepia filter when JAUNDICE_EVENT active */}
      <JaundiceEffect isActive={isJaundiceActive} />
      
      {/* SepsisWarning - red flash + beep when SEPSIS_WARNING active */}
      <SepsisWarning isActive={isSepsisActive} />
      
      {/* ToxinOverload - visual indicator when active */}
      <ToxinOverloadEffect isActive={isToxinOverloadActive} />
      
      {/* Cirrhosis - liver scarring effect */}
      <CirrhosisOverlay level={gameState.cirrhosisLevel} />
      
      {/* Toxicity - red overlay when health is low */}
      <ToxicOverlay health={gameState.health} />
      
      {/* Full abdomen - orange warning when fill is high */}
      <FullAbdomenEffect fill={gameState.abdomenFill} />
      
      {/* Game over overlay */}
      {gameState.gameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center animate-pulse">
            <div className="text-8xl mb-4">💀</div>
            <h2 className="text-4xl font-black text-red-500 mb-2">GAME OVER</h2>
            <p className="text-xl text-gray-300">
              Final Score: <span className="text-yellow-400 font-bold">{gameState.score}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Your liver has failed. Time to restart!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameEffects;