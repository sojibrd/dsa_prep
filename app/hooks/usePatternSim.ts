'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SimStep } from '../lib/simulations/types';

/** Milliseconds one step is held at 1× speed. */
const BASE_DWELL_MS = 2600;

export type SimSpeed = 0.5 | 1 | 2;

export interface PatternSim {
  stepIndex: number;
  step: SimStep | undefined;
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
 * Drives a `SimStep[]` as a scrubbable timeline.
 *
 * Two details are load-bearing:
 *
 * 1. It stops on the last step rather than rewinding. For a DP table or a
 *    backtracking tree the answer only exists at the end; looping would throw
 *    away the very frame the viewer came for.
 * 2. Pause/resume banks the time already spent on the current step. Without
 *    that, changing speed or pausing restarts the step's dwell from zero and
 *    a step you had nearly finished watching plays again from the top.
 */
export function usePatternSim(steps: SimStep[]): PatternSim {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimSpeed>(1);

  /**
   * Reset on a pattern switch DURING render, not in an effect. An effect runs
   * after paint, so the viewer would see one frame of the previous pattern's
   * step index against the new pattern's code.
   */
  const [seenSteps, setSeenSteps] = useState(steps);
  if (seenSteps !== steps) {
    setSeenSteps(steps);
    setStepIndex(0);
    setIsPlaying(false);
  }

  const total = steps.length;
  const isFinished = stepIndex >= total - 1;

  /** Milliseconds of the current step already watched. */
  const consumed = useRef(0);
  /** `performance.now()` at which the current run of this step began. */
  const runningSince = useRef<number | null>(null);

  const clearBank = useCallback(() => {
    consumed.current = 0;
    runningSince.current = null;
  }, []);

  const play = useCallback(() => {
    // A one-step timeline has nothing to advance to. Starting playback would
    // schedule no timer and leave the transport stuck reading "Pause".
    if (total <= 1) return;

    // Pressing play at the end means starting over, so drop the bank too.
    if (stepIndex >= total - 1) {
      clearBank();
      setStepIndex(0);
    }
    setIsPlaying(true);
  }, [stepIndex, total, clearBank]);

  const pause = useCallback(() => {
    if (runningSince.current !== null) {
      consumed.current += performance.now() - runningSince.current;
      runningSince.current = null;
    }
    setIsPlaying(false);
  }, []);

  const next = useCallback(() => {
    clearBank();
    setStepIndex((i) => Math.min(i + 1, total - 1));
  }, [total, clearBank]);

  const prev = useCallback(() => {
    clearBank();
    setStepIndex((i) => Math.max(i - 1, 0));
  }, [clearBank]);

  const goTo = useCallback(
    (index: number) => {
      clearBank();
      setStepIndex(Math.min(Math.max(index, 0), total - 1));
    },
    [total, clearBank]
  );

  const reset = useCallback(() => {
    clearBank();
    setIsPlaying(false);
    setStepIndex(0);
  }, [clearBank]);

  const changeSpeed = useCallback((value: SimSpeed) => {
    // The bank is in real milliseconds, so a speed change mid-step keeps
    // whatever has already been watched and only re-scales what is left.
    if (runningSince.current !== null) {
      consumed.current += performance.now() - runningSince.current;
      runningSince.current = performance.now();
    }
    setSpeed(value);
  }, []);

  useEffect(() => {
    // Nothing to schedule once the last step is on screen; the run simply
    // ends there, and the timer callback below is what turns playback off.
    if (!isPlaying || stepIndex >= total - 1) return;

    const dwell = BASE_DWELL_MS / speed;
    const remaining = Math.max(dwell - consumed.current, 0);
    runningSince.current = performance.now();

    const timer = window.setTimeout(() => {
      consumed.current = 0;
      runningSince.current = null;
      const nextIndex = Math.min(stepIndex + 1, total - 1);
      setStepIndex(nextIndex);
      if (nextIndex >= total - 1) setIsPlaying(false);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [isPlaying, stepIndex, speed, total]);

  return {
    stepIndex,
    step: steps[stepIndex],
    totalSteps: total,
    isPlaying,
    isFinished,
    speed,
    play,
    pause,
    next,
    prev,
    goTo,
    reset,
    setSpeed: changeSpeed,
  };
}
