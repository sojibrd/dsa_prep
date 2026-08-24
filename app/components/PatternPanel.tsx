'use client';

import { Pattern } from '../utils/dsaParser';
import { ClueMatch, ProblemNote } from '../types';
import StatementBox from './StatementBox';
import ProblemCard from './ProblemCard';
import SimulationBlock from './simulation/SimulationBlock';
import { getSimulation } from '../lib/simulations';

interface PatternPanelProps {
  pattern: Pattern;
  topicName: string;
  clueMatches: ClueMatch[];
  clueExamplesOpen: boolean;
  demoStatementOpen: boolean;
  expandedProblemId: string | null;
  expandedStatementId: string | null;
  solvedSet: Set<string>;
  notes: Record<string, ProblemNote>;
  onToggleClueExamples: () => void;
  onToggleDemoStatement: () => void;
  onToggleSolved: (id: string) => void;
  onToggleNotes: (id: string) => void;
  onToggleStatement: (id: string) => void;
  onNoteChange: (id: string, field: keyof ProblemNote, value: string) => void;
}

/** Everything about the pattern on screen: how to spot it, a demo, the drills. */
export default function PatternPanel({
  pattern,
  topicName,
  clueMatches,
  clueExamplesOpen,
  demoStatementOpen,
  expandedProblemId,
  expandedStatementId,
  solvedSet,
  notes,
  onToggleClueExamples,
  onToggleDemoStatement,
  onToggleSolved,
  onToggleNotes,
  onToggleStatement,
  onNoteChange,
}: PatternPanelProps) {
  // Sparse by design: most patterns have no timeline yet, and the block simply
  // does not appear for them.
  const simulation = getSimulation(pattern.id);

  return (
    <div className="surface-panel p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="t-label flex items-center gap-2 flex-wrap">
          <span>{topicName}</span>
          <span>•</span>
          <span>Pattern {pattern.id}</span>
        </div>
        <h2 className="t-title text-xl sm:text-2xl md:text-3xl">{pattern.name}</h2>
      </div>

      {pattern.recognize && (
        <div className="callout callout--accent p-4 flex flex-col gap-3">
          <h4 className="t-label">🔎 চিনবেন কীভাবে</h4>
          <ul className="t-body measure list-disc pl-5 space-y-1 text-sm">
            {pattern.recognize.split(',').map((item, idx) => (
              <li key={idx}>{item.trim()}</li>
            ))}
          </ul>

          {/* Clue examples: first-visit material, folded until asked for */}
          {clueMatches.length > 0 && (
            <>
              <button
                type="button"
                onClick={onToggleClueExamples}
                aria-expanded={clueExamplesOpen}
                aria-controls="clue-examples"
                className="control control--quiet self-start px-3 py-1.5 text-xs"
              >
                {clueExamplesOpen
                  ? `উদাহরণ লুকান (${clueMatches.length})`
                  : `উদাহরণ দেখুন (${clueMatches.length})`}
              </button>

              {clueExamplesOpen && (
                <div id="clue-examples" className="seam-t pt-4 flex flex-col gap-3">
                  {clueMatches.map(({ problem, clues }) => (
                    <div
                      key={problem.id}
                      className="option flex flex-col gap-1.5 pl-3"
                      data-chosen="true"
                    >
                      <span className="t-strong text-xs">{problem.name}</span>
                      <span className="t-caption t-quote measure">
                        {clues.map((clue) => `↳ ${clue}`).join('  ')}
                      </span>
                      <p className="t-body measure text-xs">
                        {problem.statement!.split('\n')[0].trim()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {pattern.demoName && (
        <div className="seam-t flex flex-col gap-4 pt-6">
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="t-title text-base sm:text-lg">Demo: {pattern.demoName}</h3>
              {pattern.demoStatement && (
                <button
                  onClick={onToggleDemoStatement}
                  aria-expanded={demoStatementOpen}
                  className="control control--quiet px-2 py-1 text-[10px]"
                >
                  {demoStatementOpen ? '📋 Statement ▲' : '📋 Statement ▼'}
                </button>
              )}
            </div>
            {pattern.demoLink && (
              <a
                href={pattern.demoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="chip chip--accent px-2.5 py-1 self-start sm:self-auto"
              >
                LeetCode Link ↗
              </a>
            )}
          </div>

          {demoStatementOpen && pattern.demoStatement && (
            <div className="callout p-4">
              <h4 className="t-label mb-3">📋 সমস্যার বিবরণ</h4>
              <StatementBox raw={pattern.demoStatement} />
            </div>
          )}

          {pattern.approach && (
            <div className="surface-well p-4">
              <span className="t-label mb-1 block">Approach</span>
              <p className="t-body measure text-sm">{pattern.approach}</p>
            </div>
          )}

          {pattern.demoCode && (
            <div className="relative group">
              <div className="codeblock-copy absolute right-3 top-3 z-10">
                <button
                  onClick={() => navigator.clipboard.writeText(pattern.demoCode)}
                  className="control px-3 py-1.5 text-xs"
                >
                  Copy
                </button>
              </div>
              <pre className="codeblock">
                <code className="block">{pattern.demoCode}</code>
              </pre>
            </div>
          )}

          {pattern.complexity && (
            <div className="flex items-center gap-2">
              <span className="chip px-3 py-1.5">⚡ Complexity: {pattern.complexity}</span>
            </div>
          )}

          {/* The run of that same code, step by step. It sits after the code
              rather than replacing it: reading the solution and watching it
              move are two different acts, and the second only helps once the
              first has been attempted. */}
          {simulation && pattern.demoCode && (
            <SimulationBlock simulation={simulation} code={pattern.demoCode} />
          )}
        </div>
      )}

      <div className="seam-t pt-6 flex flex-col gap-4">
        <h3 className="t-title text-base sm:text-lg">
          Practice Problems ({pattern.problems.length})
        </h3>
        <div className="flex flex-col gap-3">
          {pattern.problems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              isSolved={solvedSet.has(problem.id)}
              note={notes[problem.id] || { solution: '', obstacle: '' }}
              isNotesOpen={expandedProblemId === problem.id}
              isStatementOpen={expandedStatementId === problem.id}
              onToggleSolved={onToggleSolved}
              onToggleNotes={onToggleNotes}
              onToggleStatement={onToggleStatement}
              onNoteChange={onNoteChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
