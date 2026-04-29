'use client';

import React, { useState } from 'react';

export type PlantType = 'urea' | 'bile' | 'cytochrome' | 'kupffer';

interface ProcessingPlantProps {
  type: PlantType;
  title: string;
  description: string;
  icon: string;
  onDrop: (itemType: string) => void;
  // Cirrhosis modifiers
  bgClass?: string;
  plantScale?: number;
  hasRoadblocks?: boolean;
  roadblocksBlockDrops?: boolean;
}

export function ProcessingPlant({ 
  type, 
  title, 
  description, 
  icon, 
  onDrop,
  bgClass = 'bg-slate-800/40',
  plantScale = 1,
  hasRoadblocks = false,
  roadblocksBlockDrops = false
}: ProcessingPlantProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const itemType = e.dataTransfer.getData('text/plain');
    if (itemType) {
      onDrop(itemType);
    }
  };

  // Dead zone handler to intercept drops on the roadblock
  const handleDeadZoneDragOver = (e: React.DragEvent) => {
    if (roadblocksBlockDrops) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDeadZoneDrop = (e: React.DragEvent) => {
    if (roadblocksBlockDrops) {
      e.preventDefault();
      e.stopPropagation(); // Rejects the drop
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ transform: `scale(${plantScale})` }}
      className={`
        ${bgClass} 
        ${isDragOver ? 'ring-4 ring-white ring-inset brightness-110' : 'border-slate-700'} 
        rounded-2xl border-2 p-6 flex flex-col items-center justify-center 
        transition-all duration-300 shadow-xl relative overflow-hidden text-slate-900
      `}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-xl font-black uppercase tracking-widest text-center">
        {title}
      </h3>
      <p className="mt-2 text-xs font-medium text-center opacity-70">
        {description}
      </p>

      {/* Floating Roadblocks */}
      {hasRoadblocks && [1, 2, 3].map((num) => (
        <div
          key={num}
          onDragOver={handleDeadZoneDragOver}
          onDrop={handleDeadZoneDrop}
          className={`absolute flex items-center justify-center z-20 
            ${roadblocksBlockDrops ? 'pointer-events-auto cursor-not-allowed' : 'pointer-events-none'}`}
          style={{
            width: '25%', height: '25%', // Roughly 10% of total area combined
            top: `${15 + num * 20}%`,
            left: `${num % 2 === 0 ? 20 : 60}%`,
            animation: `float-slow ${3 + num}s ease-in-out infinite alternate`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="red" className="w-8 h-8 opacity-90 drop-shadow-md">
            <path d="M12 2L2 9l3 10h14l3-10L12 2zm0 15a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm1-5h-2V7h2v5z"/>
          </svg>
        </div>
      ))}

      {/* Inline custom keyframe for floating if Tailwind arbitrary values aren't enough */}
      <style>{`
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(10px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
}