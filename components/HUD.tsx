'use client';

import React from 'react';
import { GameState } from '@/lib/gameState';

interface HUDProps {
  gameState: GameState;
}

interface MeterProps {
  label: string;
  value: number;
  color: string;
  icon: string;
  lowColor?: string;
}

function Meter({ label, value, color, icon, lowColor = 'bg-red-500' }: MeterProps) {
  const isLow = value < 20;
  const displayColor = isLow ? lowColor : color;
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-300 font-medium flex items-center gap-1">
          {icon} {label}
        </span>
        <span className={`font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
          {Math.round(value)}%
        </span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${displayColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function HUD({ gameState }: HUDProps) {
  return (
    <div className="bg-slate-900/95 border-b-4 border-slate-700 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Top row: Score and main stats */}
        <div className="flex items-center justify-between mb-4">
          {/* Score display */}
          <div className="flex items-center gap-4">
            <div className="bg-yellow-600/80 px-6 py-2 rounded-lg border-2 border-yellow-400">
              <span className="text-yellow-100 text-sm font-bold uppercase tracking-wider">
                Score
              </span>
              <div className="text-3xl font-black text-white text-center">
                {gameState.score.toLocaleString()}
              </div>
            </div>
            
            {/* Game status badges */}
            <div className="flex gap-2">
              {gameState.gameOver && (
                <div className="bg-red-600 px-4 py-2 rounded-lg border-2 border-red-400 animate-pulse">
                  <span className="text-white font-bold">GAME OVER</span>
                </div>
              )}
              {gameState.cirrhosisLevel > 50 && (
                <div className="bg-amber-600 px-3 py-2 rounded-lg border-2 border-amber-400">
                  <span className="text-white text-sm font-bold">⚠️ CIRRHOSIS</span>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
              LIVER TYCOON
            </h1>
            <p className="text-xs text-gray-400">Build your hepatic empire!</p>
          </div>

          {/* Health indicator */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            <div className="w-32">
              <Meter 
                label="Health" 
                value={gameState.health} 
                color="bg-green-500" 
                icon=""
                lowColor="bg-red-600"
              />
            </div>
          </div>
        </div>

        {/* Bottom row: All meters */}
        <div className="grid grid-cols-4 gap-4">
          <Meter 
            label="Brain Power" 
            value={gameState.brainMeter} 
            color="bg-purple-500" 
            icon="🧠"
          />
          <Meter 
            label="Abdomen Fill" 
            value={gameState.abdomenFill} 
            color="bg-orange-500" 
            icon="🍽️"
          />
          <Meter 
            label="Cirrhosis Level" 
            value={gameState.cirrhosisLevel} 
            color="bg-red-700" 
            icon="🔴"
            lowColor="bg-red-800"
          />
          <div className="flex items-center justify-center bg-slate-800/50 rounded-lg p-2">
            <div className="text-center">
              <div className="text-xs text-gray-400">Active Items</div>
              <div className="text-xl font-bold text-white">{gameState.activeItems.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HUD;