'use client';

import { useEffect, useState } from 'react';
import type { PatternSimulation } from '../../lib/simulations/types';
import { usePatternSim } from '../../hooks/usePatternSim';
import CodePane from './CodePane';
import SceneView from './SceneView';
import ExplainPanel from './ExplainPanel';
import SimControls from './SimControls';

interface SimulationBlockProps {
  simulation: PatternSimulation;
  /** The pattern's demo code — the same source the demo section prints. */
  code: string;
}

/**
 * One pattern's run, assembled: code on the left, the data on the right, the
 * reasoning underneath, the transport at the bottom.
 *
 * It lives inside the pattern panel rather than at a route of its own, because
 * the learning loop is spot → approach → code → drill and the simulation is a
 * step in that sequence, not a destination. Fullscreen is the escape hatch for
 * scenes that need room; it is the same component, just given the viewport.
 */
export default function SimulationBlock({ simulation, code }: SimulationBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sim = usePatternSim(simulation.steps);

  // A fullscreen scene covers the page, so Escape has to get back out — and
  // the page behind it must not scroll while it is covered.
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Folding the block away must not leave a timer running behind it, and must
  // not leave a fullscreen state armed for the next time it opens. This is the
  // event's own consequence, not something to synchronise in an effect.
  const toggleOpen = () => {
    if (isOpen) {
      sim.pause();
      setIsFullscreen(false);
    }
    setIsOpen(!isOpen);
  };

  if (!sim.step) return null;

  const body = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="t-label">Input</span>
        <code className="code-inline t-ok">{simulation.input}</code>
        <span className="t-label">→</span>
        {/* The answer is a spoiler until the run reaches it. */}
        <code className="code-inline t-accent">
          {sim.isFinished ? simulation.output : '?'}
        </code>
        <button
          type="button"
          onClick={() => setIsFullscreen((open) => !open)}
          className="control control--quiet px-3 py-1.5 text-xs ml-auto"
          aria-label={isFullscreen ? 'ছোট করুন' : 'পূর্ণ স্ক্রিনে দেখুন'}
        >
          {isFullscreen ? '⤡ ছোট করুন' : '⤢ পূর্ণ স্ক্রিন'}
        </button>
      </div>

      <div className={`grid gap-4 ${isFullscreen ? 'lg:grid-cols-2' : 'xl:grid-cols-2'}`}>
        <CodePane code={code} activeLines={sim.step.highlightLines ?? []} />
        <div className="surface-well p-4 flex items-center overflow-x-auto">
          <SceneView scene={sim.step.scene} />
        </div>
      </div>

      <ExplainPanel step={sim.step} />

      <SimControls
        stepIndex={sim.stepIndex}
        totalSteps={sim.totalSteps}
        isPlaying={sim.isPlaying}
        isFinished={sim.isFinished}
        speed={sim.speed}
        onPlay={sim.play}
        onPause={sim.pause}
        onNext={sim.next}
        onPrev={sim.prev}
        onReset={sim.reset}
        onGoTo={sim.goTo}
        onSpeedChange={sim.setSpeed}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls={`sim-${simulation.patternId}`}
        className="control px-4 py-2 text-xs self-start"
      >
        {isOpen ? '🎬 সিমুলেশন লুকান' : `🎬 সিমুলেশন দেখুন (${simulation.steps.length} ধাপ)`}
      </button>

      {isOpen &&
        (isFullscreen ? (
          <div className="sim-fullscreen p-4 sm:p-6" role="dialog" aria-modal="true" aria-label="সিমুলেশন">
            <div id={`sim-${simulation.patternId}`}>{body}</div>
          </div>
        ) : (
          <div id={`sim-${simulation.patternId}`}>{body}</div>
        ))}
    </div>
  );
}
