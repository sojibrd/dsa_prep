'use client';

import type { IntervalsScene as IntervalsSceneData } from '../../lib/simulations/types';

/**
 * Spans laid on one shared number line. Input spans on top, merged result
 * below, both measured against the SAME axis — that alignment is the whole
 * point: an overlap is something you see, not something you compute.
 */
export default function IntervalsScene({ scene }: { scene: IntervalsSceneData }) {
  const { intervals, cursor, result, axis } = scene;

  const all = [...intervals, ...(result ?? [])];
  const from = axis?.from ?? Math.min(...all.map((s) => s.start));
  const to = axis?.to ?? Math.max(...all.map((s) => s.end));
  const span = Math.max(to - from, 1);

  const geometry = (start: number, end: number) => ({
    marginLeft: `${((start - from) / span) * 100}%`,
    width: `${(Math.max(end - start, 0) / span) * 100}%`,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="t-label">Input</span>
        {intervals.map((interval, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="sim-index w-14">
              [{interval.start},{interval.end}]
            </span>
            <div className="flex-1">
              <div
                className="sim-span"
                data-mark={interval.mark}
                data-cursor={cursor === index}
                style={geometry(interval.start, interval.end)}
              />
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div className="seam-t pt-3 flex flex-col gap-1.5">
          <span className="t-label">Merged</span>
          {result.map((interval, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="sim-index w-14">
                [{interval.start},{interval.end}]
              </span>
              <div className="flex-1">
                <div
                  className="sim-span"
                  data-mark={interval.mark ?? 'done'}
                  style={geometry(interval.start, interval.end)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="sim-index w-14">axis</span>
        <div className="sim-axis flex-1">
          <span className="t-caption">{from}</span>
          <span className="t-caption">{to}</span>
        </div>
      </div>
    </div>
  );
}
