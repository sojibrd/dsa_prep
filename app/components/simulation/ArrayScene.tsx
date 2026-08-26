'use client';

import type { ArrayScene as ArraySceneData } from '../../lib/simulations/types';

/** Tallest column drawn in bar mode, in rem. */
const BAR_TRACK_REM = 7;

/**
 * A row of values with cursors over it. Two shapes, one component:
 *
 * - cells (default) — a boxed value per index; how two-pointer, prefix sum
 *   and sliding window all want to be read.
 * - bars (`asBars`) — the value as a column height, with `fills` stacked on
 *   top. Trapping Rain Water only makes sense this way: water sits ABOVE a
 *   bar, and a row of numbered boxes has no "above".
 */
export default function ArrayScene({ scene }: { scene: ArraySceneData }) {
  const { values, pointers, window: win, marks, fills, subValues, subLabel, asBars } = scene;

  const numeric = values.map((v) => (typeof v === 'number' ? v : 0));
  const peak = Math.max(
    1,
    ...values.map((v, i) => (typeof v === 'number' ? v : 0) + (fills?.[i] ?? 0))
  );

  /** Cursors sitting on one index, so several can share a cell. */
  const pointersAt = (index: number) => (pointers ?? []).filter((p) => p.index === index);

  return (
    <div className="flex flex-col gap-2 overflow-x-auto">
      <div className="flex items-end gap-1 min-w-min">
        {values.map((value, index) => {
          const inWindow = win ? index >= win.from && index <= win.to : false;
          const here = pointersAt(index);
          const fill = fills?.[index] ?? 0;

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              {/* Cursor labels ride above the cell they point at. */}
              <div className="flex h-4 items-end gap-1">
                {here.map((pointer) => (
                  <span key={pointer.name} className="sim-pointer">
                    {pointer.name}
                  </span>
                ))}
              </div>

              {asBars ? (
                <div
                  className="sim-bar-track flex flex-col justify-end"
                  style={{ height: `${BAR_TRACK_REM}rem` }}
                >
                  {fill > 0 && (
                    <div
                      className="sim-bar-fill"
                      style={{ height: `${(fill / peak) * 100}%` }}
                      aria-label={`${fill} একক জমা`}
                    />
                  )}
                  <div
                    className="sim-bar"
                    data-mark={marks?.[index]}
                    style={{ height: `${(numeric[index] / peak) * 100}%` }}
                  />
                </div>
              ) : (
                <div className="sim-cell" data-mark={marks?.[index]} data-window={inWindow}>
                  {value}
                </div>
              )}

              {asBars && <span className="sim-cell-value">{value}</span>}

              {subValues && (
                <span className="sim-subvalue">{subValues[index] ?? '·'}</span>
              )}

              <span className="sim-index">{index}</span>
            </div>
          );
        })}
      </div>

      {subLabel && <span className="t-label">↑ {subLabel}</span>}

      {win && (
        <span className="t-caption">
          <span className="sim-window-tag">window</span> [{win.from}‥{win.to}]
          {win.label ? ` — ${win.label}` : ''}
        </span>
      )}
    </div>
  );
}
