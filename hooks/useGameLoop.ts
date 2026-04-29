'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseGameLoopOptions {
  interval?: number;
  onTick?: () => void;
  enabled?: boolean;
}

export function useGameLoop({ interval = 1000, onTick, enabled = true }: UseGameLoopOptions) {
  const savedCallback = useRef(onTick);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = onTick;
  }, [onTick]);

  // Set up the timer
  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    timerRef.current = setInterval(tick, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [interval, enabled]);

  // Provide a way to trigger a tick manually
  const triggerTick = useCallback(() => {
    if (savedCallback.current) {
      savedCallback.current();
    }
  }, []);

  return { triggerTick };
}

export default useGameLoop;