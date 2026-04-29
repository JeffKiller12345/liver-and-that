'use client';

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { gameReducer, initialGameState } from '@/lib/gameState';
import { ProcessingPlant, PlantType } from './ProcessingPlant';
import { ConveyorBelt } from './ConveyorBelt';
import { HUD } from './HUD';
import { GameEffects } from './GameEffects';
import { GameProvider } from '@/lib/gameContext';
import { ItemType } from '@/lib/items';
import { GameItem } from '@/lib/items';
import { useCirrhosis } from '@/hooks/useCirrhosis';

// Correct matches: item type -> plant type
const CORRECT_MATCHES: Record<ItemType, PlantType> = {
  ammonia: 'urea',
  bilirubin: 'bile',
  toxin: 'cytochrome',
  dead_cell: 'kupffer',
  glucose: 'urea',
  urea: 'urea',
  bile: 'bile',
};

export function GameCanvas() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect state tracking
  const [isJaundiceActive, setIsJaundiceActive] = useState(false);
  const [isSepsisActive, setIsSepsisActive] = useState(false);
  const [isToxinOverloadActive, setIsToxinOverloadActive] = useState(false);
  const [toxinOverloadEndTime, setToxinOverloadEndTime] = useState<number | null>(null);
  const [baseSpawnInterval, setBaseSpawnInterval] = useState(4000);

  // Use the custom hook to derive active modifiers
  const cirrhosisModifiers = useCirrhosis(gameState.cirrhosisLevel);

  // TICK interval - increments cirrhosis every second
  useEffect(() => {
    if (gameState.gameOver || cirrhosisModifiers.isFailing) return;

    tickIntervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, [gameState.gameOver, cirrhosisModifiers.isFailing]);

  // Check for game over
  useEffect(() => {
    if ((gameState.health <= 0 || cirrhosisModifiers.isFailing) && !gameState.gameOver) {
      dispatch({ type: 'SET_GAME_OVER', payload: true });
    }
  }, [gameState.health, cirrhosisModifiers.isFailing, gameState.gameOver]);

  // Handle toxin overload timing
  useEffect(() => {
    if (isToxinOverloadActive && toxinOverloadEndTime) {
      const remaining = toxinOverloadEndTime - Date.now();
      if (remaining <= 0) {
        setIsToxinOverloadActive(false);
        setToxinOverloadEndTime(null);
        setBaseSpawnInterval(4000);
      }
    }
  }, [isToxinOverloadActive, toxinOverloadEndTime]);

  const handleItemSpawn = useCallback((item: GameItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const handleItemTimeout = useCallback((item: GameItem) => {
    dispatch({ type: 'REMOVE_ITEM', payload: item.id });
    
    switch (item.type) {
      case 'ammonia':
        dispatch({ type: 'UPDATE_METER', payload: { meter: 'brainMeter', value: gameState.brainMeter + 20 } });
        break;
      case 'bilirubin':
        dispatch({ type: 'JAUNDICE_EVENT' });
        setIsJaundiceActive(true);
        setTimeout(() => setIsJaundiceActive(false), 5000);
        break;
      case 'toxin':
        dispatch({ type: 'TOXIN_OVERLOAD' });
        setIsToxinOverloadActive(true);
        setToxinOverloadEndTime(Date.now() + 10000);
        setBaseSpawnInterval(2000);
        break;
      case 'dead_cell':
        dispatch({ type: 'SEPSIS_WARNING' });
        setIsSepsisActive(true);
        setTimeout(() => setIsSepsisActive(false), 1000);
        break;
      default:
        break;
    }
  }, [gameState.brainMeter]);

  const handlePlantDrop = useCallback((plantType: string, itemType: string) => {
    const plant = plantType as PlantType;
    const item = itemType as ItemType;
    
    if (CORRECT_MATCHES[item] === plant) {
      dispatch({ type: 'ADD_SCORE', payload: 10 });
      dispatch({ type: 'CORRECT_MATCH' });
    } else {
      dispatch({ type: 'WRONG_MATCH' });
    }
  }, []);

  // Calculate actual spawn interval based on modifiers
  const currentSpawnInterval = baseSpawnInterval / cirrhosisModifiers.conveyorSpeedMultiplier;

  return (
    <GameProvider 
      gameState={gameState}
      isJaundiceActive={isJaundiceActive}
      isSepsisActive={isSepsisActive}
      isToxinOverloadActive={isToxinOverloadActive}
      toxinOverloadEndTime={toxinOverloadEndTime}
    >
      <div className="min-h-screen bg-slate-950 flex flex-col relative">
        <HUD gameState={gameState} />

        <ConveyorBelt 
          onItemSpawn={handleItemSpawn} 
          onItemTimeout={handleItemTimeout}
          spawnInterval={currentSpawnInterval} 
          speedMultiplier={cirrhosisModifiers.conveyorSpeedMultiplier}
          isFrozen={gameState.gameOver}
        />

        <div className="flex-1 p-4 relative">
          <div className="grid grid-cols-2 gap-4 h-full max-w-4xl mx-auto relative z-10">
            <ProcessingPlant
              type="urea"
              title="Urea Plant"
              description="Converts ammonia to urea"
              icon="🧪"
              onDrop={(itemType) => handlePlantDrop('urea', itemType)}
              bgClass={cirrhosisModifiers.bgClass}
              plantScale={cirrhosisModifiers.plantScale}
              hasRoadblocks={cirrhosisModifiers.hasRoadblocks}
              roadblocksBlockDrops={cirrhosisModifiers.roadblocksBlockDrops}
            />
            <ProcessingPlant
              type="bile"
              title="Bile Duct"
              description="Produces bile for digestion"
              icon="🫗"
              onDrop={(itemType) => handlePlantDrop('bile', itemType)}
              bgClass={cirrhosisModifiers.bgClass}
              plantScale={cirrhosisModifiers.plantScale}
              hasRoadblocks={cirrhosisModifiers.hasRoadblocks}
              roadblocksBlockDrops={cirrhosisModifiers.roadblocksBlockDrops}
            />
            <ProcessingPlant
              type="cytochrome"
              title="Cytochrome P450"
              description="Detoxifies drugs and toxins"
              icon="⚗️"
              onDrop={(itemType) => handlePlantDrop('cytochrome', itemType)}
              bgClass={cirrhosisModifiers.bgClass}
              plantScale={cirrhosisModifiers.plantScale}
              hasRoadblocks={cirrhosisModifiers.hasRoadblocks}
              roadblocksBlockDrops={cirrhosisModifiers.roadblocksBlockDrops}
            />
            <ProcessingPlant
              type="kupffer"
              title="Kupffer Cell"
              description="Clears bacteria and dead cells"
              icon="🦠"
              onDrop={(itemType) => handlePlantDrop('kupffer', itemType)}
              bgClass={cirrhosisModifiers.bgClass}
              plantScale={cirrhosisModifiers.plantScale}
              hasRoadblocks={cirrhosisModifiers.hasRoadblocks}
              roadblocksBlockDrops={cirrhosisModifiers.roadblocksBlockDrops}
            />
          </div>
          <GameEffects gameState={gameState} />
        </div>

        {/* Liver Failure Modal */}
        {gameState.gameOver && (
          <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border-2 border-red-500 rounded-2xl p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
              <h2 className="text-5xl font-black text-red-500 mb-2 uppercase tracking-widest">Liver Failure</h2>
              <p className="text-xl text-white mb-6">Final Score: <span className="font-mono text-cyan-400">{gameState.score}</span></p>
              
              <div className="bg-slate-800 rounded-lg p-4 text-left grid grid-cols-2 gap-4 mb-6 text-sm text-slate-300">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span>Encephalopathy:</span> 
                  <span className="font-bold text-white">{gameState.stats.encephalopathyEvents}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span>Jaundice Events:</span> 
                  <span className="font-bold text-white">{gameState.stats.jaundiceEvents}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span>Toxin Overloads:</span> 
                  <span className="font-bold text-white">{gameState.stats.toxinOverloads}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span>Sepsis Warnings:</span> 
                  <span className="font-bold text-white">{gameState.stats.sepsisWarnings}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span>Correct Matches:</span> 
                  <span className="font-bold text-emerald-400">{gameState.stats.correctMatches}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span>Wrong Matches:</span> 
                  <span className="font-bold text-red-400">{gameState.stats.wrongMatches}</span>
                </div>
              </div>

              <button 
                onClick={() => dispatch({ type: 'RESET' })}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full transition-colors uppercase tracking-widest"
              >
                Attempt Transplant (Restart)
              </button>
            </div>
          </div>
        )}
      </div>
    </GameProvider>
  );
}

export default GameCanvas;