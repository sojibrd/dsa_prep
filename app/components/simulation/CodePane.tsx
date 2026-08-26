'use client';

import { useEffect, useRef } from 'react';

interface CodePaneProps {
  code: string;
  /** 1-based line numbers currently executing. */
  highlightLines?: number[];
}

/**
 * The demo code with the executing lines lit. Scrolls the first lit line into
 * view so a long function does not leave the action off-screen — but only
 * within this pane, never the page (`block: 'nearest'`).
 */
export default function CodePane({ code, highlightLines }: CodePaneProps) {
  const lines = code.split('\n');
  const activeRef = useRef<HTMLDivElement | null>(null);
  const firstActive = highlightLines?.[0];

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [firstActive]);

  const lit = new Set(highlightLines ?? []);

  return (
    <pre className="codeblock p-3 max-h-80 overflow-auto">
      <code className="block">
        {lines.map((line, index) => {
          const lineNo = index + 1;
          const isActive = lit.has(lineNo);
          return (
            <div
              key={lineNo}
              ref={isActive && lineNo === firstActive ? activeRef : undefined}
              className="codeline"
              data-active={isActive}
            >
              <span className="codeline-no">{lineNo}</span>
              <span>{line || ' '}</span>
            </div>
          );
        })}
      </code>
    </pre>
  );
}
