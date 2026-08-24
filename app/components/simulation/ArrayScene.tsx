'use client';

import type { ArrayScene as ArraySceneData } from '../../lib/simulations/types';
import SceneAside from './SceneAside';

interface ArraySceneProps {
  scene: ArraySceneData;
}

/**
 * A row of values with named cursors over it.
 *
 * Two modes, one layout: boxes when the values are just values, bars when
 * their MAGNITUDE is the point (heights, sums). Bar mode also stacks whatever
 * has accumulated on top of each column, which is the only way "trapped water"
 * or "running total" reads as a quantity rather than a number in a table.
 */
export default function ArrayScene({ scene }: ArraySceneProps) {
  const {
    values,
    pointers = [],
    marks = {},
    window: win,
    fills = {},
    subValues,
    subLabel,
    asBars,
    table,
    output,
    caption,
  } = scene;

  // Bars are drawn against the tallest thing on screen — the value plus
  // whatever rests on it — so a full column never overflows its track.
  const peak = asBars
    ? Math.max(1, ...values.map((v, i) => (typeof v === 'number' ? v : 0) + (fills[i] ?? 0)))
    : 1;

  // Which cursors sit on each index. Several can share one cell (`l` and `r`
  // meeting is the moment a two-pointer run ends), so they stack.
  const pointersAt = (index: number) => pointers.filter((p) => p.index === index);

  return (
    <div className="flex items-start gap-6">
      <div className="flex flex-col gap-2 overflow-x-auto">
        <div className="flex items-end gap-1 min-w-max px-1 pb-1">
          {values.map((value, index) => {
            const mark = marks[index];
            const here = pointersAt(index);
            const fill = fills[index] ?? 0;
            const numeric = typeof value === 'number' ? value : 0;

            return (
              <div key={index} className="flex flex-col items-center gap-1">
                {/* Cursor labels ride above the cell they point at. A fixed-height
                    rail keeps the row from jumping as pointers move. */}
                <div className="flex flex-col items-center justify-end gap-0.5 h-8">
                  {here.map((p) => (
                    <span key={p.name} className="sim-pointer">
                      {p.name} ▼
                    </span>
                  ))}
                </div>

                {asBars ? (
                  <div className="flex flex-col justify-end h-32 w-8">
                    {fill > 0 && (
                      <div
                        className="sim-bar-fill w-full"
                        style={{ height: `${(fill / peak) * 100}%` }}
                        aria-hidden="true"
                      />
                    )}
                    <div
                      className="sim-bar w-full"
                      data-mark={mark}
                      style={{ height: `${(numeric / peak) * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <div className="sim-cell px-2" data-mark={mark}>
                    {value}
                  </div>
                )}

                <span className="sim-index">{index}</span>

                {/* A second row of running numbers under the index — Kadane's
                    "cur", a rolling sum. Absent for indices not yet reached. */}
                {subValues?.[index] !== undefined && (
                  <span className="sim-pointer">{subValues[index]}</span>
                )}
              </div>
            );
          })}
        </div>

        {subLabel && subValues && (
          <span className="t-caption">{subLabel} = চলমান মান, নিচে</span>
        )}

        {win && (
          <div className="flex min-w-max px-1">
            {/* The span is drawn as an offset bracket rather than a tint on the
                cells, so it can coexist with per-cell marks instead of fighting
                them for the same surface. */}
            <div
              aria-hidden="true"
              style={{ width: `calc(${win.from} * (var(--t-sim-cell-size) + 0.25rem))` }}
            />
            <div
              className="sim-window flex items-center justify-center h-5"
              style={{
                width: `calc(${win.to - win.from + 1} * (var(--t-sim-cell-size) + 0.25rem))`,
              }}
            >
              {win.label}
            </div>
          </div>
        )}

        {caption && <p className="t-caption measure">{caption}</p>}
      </div>

      <SceneAside table={table} output={output} />
    </div>
  );
}
