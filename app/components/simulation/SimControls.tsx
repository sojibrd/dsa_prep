'use client';

import type { SimSpeed } from '../../hooks/usePatternSim';

interface SimControlsProps {
  stepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  isFinished: boolean;
  speed: SimSpeed;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onGoTo: (index: number) => void;
  onSpeedChange: (speed: SimSpeed) => void;
}

const SPEEDS: SimSpeed[] = [0.5, 1, 2];

/** Transport for the run: play, step, scrub, speed. */
export default function SimControls({
  stepIndex,
  totalSteps,
  isPlaying,
  isFinished,
  speed,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  onGoTo,
  onSpeedChange,
}: SimControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          className="control control--primary px-4 py-1.5 text-xs"
          aria-label={isPlaying ? 'সিমুলেশন থামান' : 'সিমুলেশন চালান'}
        >
          {isPlaying ? '⏸ থামান' : isFinished ? '↻ আবার চালান' : '▶ চালান'}
        </button>

        <button
          type="button"
          onClick={onPrev}
          disabled={stepIndex === 0}
          className="control px-3 py-1.5 text-xs"
          aria-label="আগের ধাপ"
        >
          ‹ আগের
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={stepIndex >= totalSteps - 1}
          className="control px-3 py-1.5 text-xs"
          aria-label="পরের ধাপ"
        >
          পরের ›
        </button>

        <button
          type="button"
          onClick={onReset}
          className="control control--quiet px-3 py-1.5 text-xs"
          aria-label="শুরু থেকে"
        >
          ↺ রিসেট
        </button>

        <div className="flex items-center gap-1 ml-auto">
          <span className="t-label">গতি</span>
          {SPEEDS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSpeedChange(option)}
              aria-pressed={speed === option}
              className="chip px-2 py-1"
            >
              {option}×
            </button>
          ))}
        </div>
      </div>

      {/* Scrubbing matters more here than in an architecture walkthrough: the
          step you want to re-read is usually the one just before the pointer
          moved, and hunting for it with the prev key is tedious. */}
      <div className="flex items-center gap-3">
        <span className="t-mono t-accent text-xs whitespace-nowrap">
          {stepIndex + 1} / {totalSteps}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={stepIndex}
          onChange={(event) => onGoTo(Number(event.target.value))}
          aria-label="ধাপ নির্বাচন"
          className="sim-scrub w-full"
        />
      </div>
    </div>
  );
}
