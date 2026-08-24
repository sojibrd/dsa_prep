'use client';

import { parseStatement } from '../lib/parseStatement';

/** A workbook statement, laid out as description + worked example + constraint. */
export default function StatementBox({ raw }: { raw: string }) {
  const { description, input, output, constraint } = parseStatement(raw);

  return (
    <div className="flex flex-col gap-3">
      <p className="t-body measure text-sm">{description}</p>
      {(input || output) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {input && (
            <div className="surface-well p-3 flex flex-col gap-1">
              <span className="t-label">Input</span>
              <code className="code-inline t-ok break-all">{input}</code>
            </div>
          )}
          {output && (
            <div className="surface-well p-3 flex flex-col gap-1">
              <span className="t-label">Output</span>
              <code className="code-inline t-accent break-all">{output}</code>
            </div>
          )}
        </div>
      )}
      {constraint && <div className="t-mono t-muted text-[11px]">⚡ {constraint}</div>}
    </div>
  );
}
