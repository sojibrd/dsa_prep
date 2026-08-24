'use client';

import type { IntervalsScene as IntervalsSceneData } from '../../lib/simulations/types';
import SceneAside from './SceneAside';

interface IntervalsSceneProps {
  scene: IntervalsSceneData;
}

/**
 * Spans laid on a shared axis — the input row on top, the merged/kept result
 * building underneath. Position and width are both proportional to the axis,
 * which is the only way "these two overlap" reads as a fact rather than a
 * pair of numbers to compare by hand.
 */
export default function IntervalsScene({ scene }: IntervalsSceneProps) {
  const { intervals, cursor, result, axis, table, output, caption } = scene;

  const from = axis?.from ?? Math.min(...intervals.map((i) => i.start), ...(result ?? []).map((i) => i.start));
  const to = axis?.to ?? Math.max(...intervals.map((i) => i.end), ...(result ?? []).map((i) => i.end));
  const span = Math.max(1, to - from);

  const bar = (start: number, end: number) => ({
    left: `${((start - from) / span) * 100}%`,
    width: `${Math.max(((end - start) / span) * 100, 4)}%`,
  });

  return (
    <div className="flex items-start gap-6">
      <div className="flex flex-col gap-4 w-full min-w-72">
        <div className="flex flex-col gap-2">
          <span className="t-label">Input</span>
          <div className="flex flex-col gap-1.5">
            {intervals.map((interval, index) => (
              <div key={index} className="relative h-6" style={{ minWidth: '16rem' }}>
                <div
                  className="sim-cell absolute h-6 px-2 flex items-center"
                  data-mark={index === cursor ? 'active' : interval.mark}
                  style={bar(interval.start, interval.end)}
                >
                  {interval.label ?? `[${interval.start}, ${interval.end}]`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {result && result.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="t-label">ফলাফল (এখন পর্যন্ত)</span>
            <div className="flex flex-col gap-1.5">
              {result.map((interval, index) => (
                <div key={index} className="relative h-6" style={{ minWidth: '16rem' }}>
                  <div
                    className="sim-cell absolute h-6 px-2 flex items-center"
                    data-mark={interval.mark ?? 'done'}
                    style={bar(interval.start, interval.end)}
                  >
                    [{interval.start}, {interval.end}]
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {caption && <p className="t-caption measure">{caption}</p>}
      </div>

      <SceneAside table={table} output={output} />
    </div>
  );
}
