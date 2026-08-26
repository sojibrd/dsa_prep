'use client';

import { useEffect, useState } from 'react';
import type { PatternSimulation } from '../../lib/simulations/types';
import { usePatternSim } from '../../hooks/usePatternSim';
import SceneView from './SceneView';
import CodePane from './CodePane';
import ExplainPanel from './ExplainPanel';
import SimControls from './SimControls';

interface SimulationBlockProps {
  simulation: PatternSimulation;
  code: string;
}

/**
 * The whole simulation, folded away until asked for. It stays closed by
 * default because the panel's job is still the pattern and its drills; a
 * player that auto-expands would push the practice list below the fold on
 * every pattern the reader opens.
 */
export default function SimulationBlock({ simulation, code }: SimulationBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const sim = usePatternSim(simulation.steps);

  const { pause } = sim;

  // A closed player must not keep advancing in the background.
  useEffect(() => {
    if (!isOpen) pause();
  }, [isOpen, pause]);

  // Escape leaves the expanded view — the only way out without a mouse.
  useEffect(() => {
    if (!isWide) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsWide(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isWide]);

  const { step } = sim;

  return (
    <div className="seam-t pt-6 flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={`sim-${simulation.patternId}`}
          className="control px-3 py-1.5 text-xs"
        >
          {isOpen ? '🎬 Simulation ▲' : '🎬 Simulation ▼'}
        </button>
        <span className="t-caption">
          {simulation.steps.length} ধাপে কোডটা চলতে দেখুন
        </span>
      </div>

      {isOpen && step && (
        <div
          id={`sim-${simulation.patternId}`}
          className="sim-stage flex flex-col gap-4 p-3 sm:p-4"
          data-wide={isWide}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip chip--ok px-2 py-1">in: {simulation.input}</span>
            <span className="chip chip--accent px-2 py-1">out: {simulation.output}</span>
            <button
              type="button"
              onClick={() => setIsWide((wide) => !wide)}
              aria-pressed={isWide}
              className="control control--quiet px-2 py-1 text-[10px] ml-auto"
              aria-label={isWide ? 'ছোট করুন' : 'বড় করে দেখুন'}
            >
              {isWide ? '⤡ Exit' : '⤢ Expand'}
            </button>
          </div>

          <SimControls sim={sim} />

          <div className="surface-well p-3 sm:p-4 overflow-x-auto">
            <SceneView scene={step.scene} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <CodePane code={code} highlightLines={step.highlightLines} />
            <ExplainPanel step={step} />
          </div>
        </div>
      )}
    </div>
  );
}
