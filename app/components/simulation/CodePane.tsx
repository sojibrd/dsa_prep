'use client';

import { useEffect, useRef } from 'react';

interface CodePaneProps {
  code: string;
  /** 1-based line numbers executing right now. */
  activeLines: number[];
}

/**
 * The demo code with the live line lit.
 *
 * This is the same source the demo section already shows — repeated here on
 * purpose. The whole point of the simulation is that the picture and the code
 * move together; sending someone scrolling back up to find the line breaks
 * exactly the connection being taught.
 */
export default function CodePane({ code, activeLines }: CodePaneProps) {
  const lines = code.split('\n');
  const active = new Set(activeLines);
  const paneRef = useRef<HTMLPreElement>(null);

  // Long solutions outrun the pane, so the lit line is scrolled back into view
  // whenever it moves. `block: 'nearest'` keeps a line that is already visible
  // exactly where it is — otherwise every step would jerk the pane.
  const firstActive = activeLines[0];
  useEffect(() => {
    if (firstActive === undefined) return;
    const el = paneRef.current?.querySelector(`[data-line="${firstActive}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [firstActive]);

  return (
    <pre ref={paneRef} className="codeblock py-3 max-h-80 overflow-auto">
      <code className="block">
        {lines.map((line, index) => {
          const lineNo = index + 1;
          return (
            <span key={lineNo} className="codeline" data-line={lineNo} data-active={active.has(lineNo)}>
              <span className="codeline-no">{lineNo}</span>
              {line || ' '}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
