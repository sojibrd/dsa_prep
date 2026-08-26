'use client';

import type { Scene } from '../../lib/simulations/types';

/**
 * The panels that hang beside any scene: a hashmap/Set being built, and the
 * output collected so far. Shared across every scene kind so a new kind gets
 * them without reimplementing the layout.
 */
export default function SceneAside({ scene }: { scene: Scene }) {
  const { table, output } = scene;
  if (!table && !output) return null;

  return (
    <div className="flex flex-col gap-3 min-w-0 sm:min-w-[10rem]">
      {table && (
        <div className="surface-well p-3 flex flex-col gap-2">
          <span className="t-label">{table.title}</span>
          {table.entries.length === 0 ? (
            <span className="t-caption">{table.emptyLabel ?? 'খালি'}</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {table.entries.map((entry) => (
                <span key={entry.key} className="sim-entry" data-mark={entry.mark}>
                  <span className="sim-entry-key">{entry.key}</span>
                  {entry.value !== undefined && (
                    <span className="sim-entry-value">{entry.value}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {output && (
        <div className="surface-well p-3 flex flex-col gap-2">
          <span className="t-label">{output.title}</span>
          {output.values.length === 0 ? (
            <span className="t-caption">এখনো কিছু নেই</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {output.values.map((value, idx) => (
                <span key={idx} className="sim-out">
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
