'use client';

import type { PatternSim, SimSpeed } from '../../hooks/usePatternSim';

const SPEEDS: SimSpeed[] = [0.5, 1, 2];

/** Transport for the timeline: play/pause, single steps, reset, speed, scrub. */
export default function SimControls({ sim }: { sim: PatternSim }) {
  const {
    stepIndex,
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
  } = sim;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={isPlaying ? pause : play}
          className="control control--primary px-4 py-1.5 text-xs"
          aria-label={isPlaying ? 'থামান' : isFinished ? 'আবার চালান' : 'চালান'}
        >
          {isPlaying ? '❚❚ Pause' : isFinished ? '↻ Replay' : '▶ Play'}
        </button>

        <button
          type="button"
          onClick={prev}
          disabled={stepIndex === 0}
          className="control px-3 py-1.5 text-xs"
          aria-label="আগের ধাপ"
        >
          ◀ Prev
        </button>

        <button
          type="button"
          onClick={next}
          disabled={isFinished}
          className="control px-3 py-1.5 text-xs"
          aria-label="পরের ধাপ"
        >
          Next ▶
        </button>

        <button
          type="button"
          onClick={reset}
          className="control control--quiet px-3 py-1.5 text-xs"
          aria-label="শুরু থেকে"
        >
          ↺ Reset
        </button>

        <div className="flex items-center gap-1 ml-auto">
          <span className="t-label">Speed</span>
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              aria-pressed={speed === value}
              className="control px-2 py-1 text-[10px]"
              aria-label={`গতি ${value} গুণ`}
            >
              {value}×
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={stepIndex}
          onChange={(event) => goTo(Number(event.target.value))}
          className="sim-scrub flex-1"
          aria-label="ধাপ বাছুন"
        />
        <span className="t-mono t-accent text-xs">
          {stepIndex + 1} / {totalSteps}
        </span>
      </div>
    </div>
  );
}
