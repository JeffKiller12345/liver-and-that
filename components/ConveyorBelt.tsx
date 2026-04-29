import React, { useEffect } from 'react';
import { GameItem } from '@/lib/items';
import { useGameContext } from '@/lib/gameContext';

interface ConveyorBeltProps {
  onItemSpawn: (item: any) => void;
  onItemTimeout: (item: any) => void;
  spawnInterval: number;
  speedMultiplier?: number;
  isFrozen?: boolean;
}

export function ConveyorBelt({ 
  onItemSpawn, 
  onItemTimeout, 
  spawnInterval, 
  speedMultiplier = 1,
  isFrozen = false 
}: ConveyorBeltProps) {
  const { gameState } = useGameContext();

  // Spawner logic (paused if frozen)
  useEffect(() => {
    if (isFrozen) return;

    const interval = setInterval(() => {
      // Your item generation logic here
      const newItem = {
         id: `item-${Date.now()}`,
         type: ['ammonia', 'toxin', 'bilirubin', 'dead_cell'][Math.floor(Math.random() * 4)],
         createdAt: Date.now()
      };
      onItemSpawn(newItem);
    }, spawnInterval);

    return () => clearInterval(interval);
  }, [spawnInterval, onItemSpawn, isFrozen]);

  const handleDragStart = (e: React.DragEvent, itemType: string) => {
    if (isFrozen) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', itemType);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Base travel time in seconds, reduced by the multiplier
  const baseTravelTime = 8; 
  const currentTravelTime = baseTravelTime / speedMultiplier;

  return (
    <div className="h-32 bg-red-950 border-b-4 border-red-900 flex flex-col relative overflow-hidden shadow-inner">
      <div className="text-xs uppercase font-bold text-red-400/50 p-2 absolute top-0 left-0 tracking-widest z-20">
        Portal Vein Express
      </div>
      
      <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30 ${isFrozen ? '' : 'animate-[slide_10s_linear_infinite]'}`} />
      
      <div className="flex-1 flex items-center w-full relative z-10 overflow-hidden">
        {gameState.activeItems.map((item) => (
          <div
            key={item.id}
            draggable={!isFrozen}
            onDragStart={(e) => handleDragStart(e, item.type)}
            className={`w-16 h-16 rounded-full bg-slate-200 border-4 border-white/20 shadow-lg 
              flex items-center justify-center text-slate-900 font-bold text-xs uppercase
              ${isFrozen ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:scale-110'} 
              absolute transition-transform`}
            style={{
              // CSS animation for horizontal movement
              animation: `moveRight ${currentTravelTime}s linear forwards`,
              animationPlayState: isFrozen ? 'paused' : 'running',
            }}
            onAnimationEnd={() => onItemTimeout(item)}
          >
            {item.type.split('_')[0]}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes moveRight {
          0% { left: -100px; }
          100% { left: 110%; }
        }
        @keyframes slide {
          0% { background-position: 0 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>
    </div>
  );
}