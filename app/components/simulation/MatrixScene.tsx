'use client';

import type { MatrixScene as MatrixSceneData } from '../../lib/simulations/types';

/**
 * A 2D grid. `bounds` is drawn as a frame around the layer still in play —
 * for a spiral walk that shrinking frame IS the algorithm, and without it the
 * cursor looks like it is wandering arbitrarily.
 *
 * `cursor` marks one unnamed position and covers most patterns. `pointers`
 * exists for the case where several named positions matter at once — interval
 * DP needs `l`, `r` and `k` visible together, and a single cursor cannot say
 * which of the three it is.
 */
export default function MatrixScene({ scene }: { scene: MatrixSceneData }) {
  const { values, cursor, pointers, marks, bounds } = scene;

  /**
   * `undefined` — not `true` — when there are no bounds. `data-window` is
   * shared with `ArrayScene`, where "true" paints the window rail; saying
   * "true" for every cell of a boundless grid would underline the whole DP
   * table in amber and claim a window that does not exist.
   */
  const windowState = (row: number, col: number) =>
    bounds
      ? row >= bounds.top && row <= bounds.bottom && col >= bounds.left && col <= bounds.right
      : undefined;

  const pointersAt = (row: number, col: number) =>
    (pointers ?? []).filter((p) => p.row === row && p.col === col);

  return (
    <div className="flex flex-col gap-1 overflow-x-auto">
      {values.map((row, r) => (
        <div key={r} className="flex gap-1 min-w-min">
          {row.map((value, c) => (
            <div key={c} className="flex flex-col items-center">
              {/* Only claim vertical space when there is something to label. */}
              {pointers && (
                <div className="flex h-4 items-end gap-1">
                  {pointersAt(r, c).map((pointer) => (
                    <span key={pointer.name} className="sim-pointer">
                      {pointer.name}
                    </span>
                  ))}
                </div>
              )}
              <div
                className="sim-cell"
                data-mark={marks?.[`${r},${c}`]}
                data-cursor={cursor?.row === r && cursor?.col === c}
                data-window={windowState(r, c)}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      ))}

      {bounds && (
        <span className="t-caption">
          সীমানা — top {bounds.top} · bottom {bounds.bottom} · left {bounds.left} · right{' '}
          {bounds.right}
        </span>
      )}
    </div>
  );
}
