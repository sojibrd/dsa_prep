'use client';

import type { MatrixScene as MatrixSceneData } from '../../lib/simulations/types';

/**
 * A 2D grid. `bounds` is drawn as a frame around the layer still in play —
 * for a spiral walk that shrinking frame IS the algorithm, and without it the
 * cursor looks like it is wandering arbitrarily.
 */
export default function MatrixScene({ scene }: { scene: MatrixSceneData }) {
  const { values, cursor, marks, bounds } = scene;

  const inBounds = (row: number, col: number) =>
    bounds
      ? row >= bounds.top && row <= bounds.bottom && col >= bounds.left && col <= bounds.right
      : true;

  return (
    <div className="flex flex-col gap-1 overflow-x-auto">
      {values.map((row, r) => (
        <div key={r} className="flex gap-1 min-w-min">
          {row.map((value, c) => (
            <div
              key={c}
              className="sim-cell"
              data-mark={marks?.[`${r},${c}`]}
              data-cursor={cursor?.row === r && cursor?.col === c}
              data-window={inBounds(r, c)}
            >
              {value}
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
