'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SimStep } from '../lib/simulations/types';

export type SimSpeed = 0.5 | 1 | 2;

/** How long one step holds the screen at 1x. */
const BASE_STEP_MS = 2600;

export interface UsePatternSimReturn {
  stepIndex: number;
  step: SimStep | null;
  totalSteps: number;
  isPlaying: boolean;
  isFinished: boolean;
  speed: SimSpeed;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: SimSpeed) => void;
}

/**
 * Drives one pattern's timeline: which step is on screen and whether the clock
 * is running. It knows nothing about arrays, trees, or code — only that there
 * are N steps and a person is walking through them.
 */
export function usePatternSim(steps: SimStep[]): UsePatternSimReturn {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimSpeed>(1);

  const totalSteps = steps.length;
  const step = steps[stepIndex] ?? null;
  const isFinished = totalSteps > 0 && stepIndex === totalSteps - 1;

  // Switching pattern starts a fresh run. Adjusted during render rather than in
  // an effect so the scene never paints one frame of the previous pattern's
  // state. The guard compares the ARRAY IDENTITY, not a length or an id —
  // step arrays are module constants, so identity is stable across renders and
  // unique across patterns, which a length check could never be.
  const [lastSteps, setLastSteps] = useState(steps);
  if (lastSteps !== steps) {
    setLastSteps(steps);
    setStepIndex(0);
    setIsPlaying(false);
  }

  // How much of the CURRENT step has already been watched. Without this the
  // timer below would restart from zero on every speed change or resume, and a
  // step you were most of the way through would begin again.
  //
  // `consumed` is time banked from earlier viewing spells of this step;
  // `runningSince` is when the spell now in progress began.
  const consumed = useRef(0);
  const runningSince = useRef(0);

  useEffect(() => {
    consumed.current = 0;
    runningSince.current = Date.now();
  }, [stepIndex]);

  useEffect(() => {
    if (isPlaying) {
      runningSince.current = Date.now();
    } else {
      consumed.current += Date.now() - runningSince.current;
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || totalSteps === 0) return;

    const elapsed = consumed.current + (Date.now() - runningSince.current);
    const delay = Math.max(0, BASE_STEP_MS / speed - elapsed);

    const timer = setTimeout(() => {
      setStepIndex((prev) => {
        if (prev + 1 < totalSteps) return prev + 1;
        // The run is over. Unlike the architecture simulator this does NOT
        // rewind: the last step of an algorithm holds the answer, and throwing
        // it away the instant it appears is the one thing a learner cannot
        // afford here.
        setIsPlaying(false);
        return prev;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, totalSteps, speed]);

  const play = useCallback(() => {
    if (totalSteps === 0) return;
    // Pressing play on the final step means "watch it again", so the clock and
    // the index both start over.
    setStepIndex((prev) => {
      if (prev >= totalSteps - 1) {
        consumed.current = 0;
        runningSince.current = Date.now();
        return 0;
      }
      return prev;
    });
    setIsPlaying(true);
  }, [totalSteps]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const next = useCallback(() => {
    setIsPlaying(false);
    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prev = useCallback(() => {
    setIsPlaying(false);
    setStepIndex((p) => Math.max(p - 1, 0));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setIsPlaying(false);
      if (index >= 0 && index < totalSteps) setStepIndex(index);
    },
    [totalSteps]
  );

  const reset = useCallback(() => {
    setIsPlaying(false);
    setStepIndex(0);
  }, []);

  return {
    stepIndex,
    step,
    totalSteps,
    isPlaying,
    isFinished,
    speed,
    play,
    pause,
    next,
    prev,
    goTo,
    reset,
    setSpeed,
  };
}
