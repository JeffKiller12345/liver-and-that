// filepath: lib/gameContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { GameState } from './gameState';

interface GameContextType {
  gameState: GameState;
  isJaundiceActive: boolean;
  isSepsisActive: boolean;
  isToxinOverloadActive: boolean;
  toxinOverloadEndTime: number | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
  gameState: GameState;
  isJaundiceActive?: boolean;
  isSepsisActive?: boolean;
  isToxinOverloadActive?: boolean;
  toxinOverloadEndTime?: number | null;
}

export function GameProvider({ 
  children, 
  gameState,
  isJaundiceActive = false,
  isSepsisActive = false,
  isToxinOverloadActive = false,
  toxinOverloadEndTime = null,
}: GameProviderProps) {
  return (
    <GameContext.Provider value={{
      gameState,
      isJaundiceActive,
      isSepsisActive,
      isToxinOverloadActive,
      toxinOverloadEndTime,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

export default GameContext;