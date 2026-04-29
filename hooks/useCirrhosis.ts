'use client';

import { useMemo } from 'react';

export function useCirrhosis(cirrhosisLevel: number) {
  return useMemo(() => {
    const isHealthy = cirrhosisLevel < 50;
    const isFibrotic = cirrhosisLevel >= 50 && cirrhosisLevel < 80;
    const isDangerous = cirrhosisLevel >= 80 && cirrhosisLevel < 100;
    const isFailing = cirrhosisLevel >= 100;

    // Visual background classes
    let bgClass = 'bg-pink-200'; // 0-49%
    if (isFibrotic || isDangerous || isFailing) {
      bgClass = 'bg-gray-400'; // 50-100%
    }

    return {
      bgClass,
      hasRoadblocks: cirrhosisLevel >= 50,
      roadblocksBlockDrops: cirrhosisLevel >= 80,
      conveyorSpeedMultiplier: cirrhosisLevel >= 50 ? 1.3 : 1,
      plantScale: cirrhosisLevel >= 50 ? 0.85 : 1,
      isFailing,
    };
  }, [cirrhosisLevel]);
}

export default useCirrhosis;