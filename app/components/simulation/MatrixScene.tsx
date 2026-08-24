'use client';

import type { MatrixScene as MatrixSceneData } from '../../lib/simulations/types';
import SceneAside from './SceneAside';

interface MatrixSceneProps {
  scene: MatrixSceneData;
}

/** A 2D grid — spiral order, grid BFS, a DP table — with the active cell and
 * the walk's live boundary frame drawn over it. */
export default function MatrixScene({ scene }: MatrixSceneProps) {
  const { values, cursor, marks = {}, bounds, table, output, caption } = scene;

  const inBounds = (row: number, col: number) =>
    !!bounds && row >= bounds.top && row <= bounds.bottom && col >= bounds.left && col <= bounds.right;

  return (
    <div className="flex items-start gap-6">
      <div className="flex flex-col gap-2 overflow-x-auto">
        <div className="flex flex-col gap-1 min-w-max px-1 pb-1">
          {values.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.map((value, c) => {
                const key = `${r},${c}`;
                const isCursor = cursor?.row === r && cursor?.col === c;
                const mark = isCursor ? 'active' : marks[key];
                return (
                  <div
                    key={c}
                    className="sim-cell px-2"
                    data-mark={mark}
                    // The layer still being walked gets the window frame's
                    // border; everything else keeps the plain cell border.
                    data-in-bounds={bounds ? inBounds(r, c) : undefined}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {caption && <p className="t-caption measure">{caption}</p>}
      </div>

      <SceneAside table={table} output={output} />
    </div>
  );
}
