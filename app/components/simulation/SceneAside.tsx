'use client';

import type { Scene } from '../../lib/simulations/types';

interface SceneAsideProps {
  table?: Scene['table'];
  output?: Scene['output'];
}

/**
 * The second structure standing beside the main picture: a hashmap, a Set, the
 * result built so far.
 *
 * Rendered once here rather than inside each scene, so every shape gets the
 * same companions and a data file never has to ask which renderer supports
 * what. Returns nothing when there is nothing to show, so the layout does not
 * reserve an empty column.
 */
export default function SceneAside({ table, output }: SceneAsideProps) {
  if (!table && !output) return null;

  return (
    <div className="flex flex-col gap-3 min-w-40">
      {table && (
        <div className="flex flex-col gap-1.5">
          <span className="t-label">{table.title}</span>
          {table.entries.length === 0 ? (
            <span className="t-caption">{table.emptyLabel ?? 'খালি'}</span>
          ) : (
            <div className="flex flex-col gap-1">
              {table.entries.map((entry) => (
                <div key={entry.key} className="flex items-center gap-1">
                  <span className="sim-cell px-2" data-mark={entry.mark}>
                    {entry.key}
                  </span>
                  {entry.value !== undefined && (
                    <>
                      <span className="sim-index">→</span>
                      <span className="sim-cell px-2" data-mark={entry.mark}>
                        {entry.value}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {output && (
        <div className="flex flex-col gap-1.5">
          <span className="t-label">{output.title}</span>
          {output.values.length === 0 ? (
            <span className="t-caption">এখনো কিছু নেই</span>
          ) : (
            <div className="flex items-center gap-1 flex-wrap">
              {output.values.map((value, index) => (
                <span key={index} className="sim-cell px-2" data-mark="done">
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
