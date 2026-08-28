'use client';

import { PracticeProblem } from '../utils/dsaParser';
import { ProblemNote } from '../types';
import StatementBox from './StatementBox';
import { RotateCcw } from './icons';

interface ProblemCardProps {
  problem: PracticeProblem;
  isSolved: boolean;
  needsRevise: boolean;
  note: ProblemNote;
  isNotesOpen: boolean;
  isStatementOpen: boolean;
  onToggleSolved: (id: string) => void;
  onToggleRevise: (id: string) => void;
  onToggleNotes: (id: string) => void;
  onToggleStatement: (id: string) => void;
  onNoteChange: (id: string, field: keyof ProblemNote, value: string) => void;
}

/**
 * One practice problem: the solve toggle, the link out, and two drawers.
 *
 * The right-hand cluster sits in fixed-width slots so the badges and toggles
 * stand on the same axes down the list instead of drifting with each
 * problem's name length.
 */
export default function ProblemCard({
  problem,
  isSolved,
  needsRevise,
  note,
  isNotesOpen,
  isStatementOpen,
  onToggleSolved,
  onToggleRevise,
  onToggleNotes,
  onToggleStatement,
  onNoteChange,
}: ProblemCardProps) {
  return (
    <div id={`problem-${problem.id}`} data-solved={isSolved} className="surface-raised scroll-mt-4">
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSolved}
            onChange={() => onToggleSolved(problem.id)}
            aria-label={`${problem.name} — সলভ হয়েছে`}
            className="check mt-0.5 sm:mt-0"
          />
          <div className="min-w-0">
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-name text-sm flex items-center gap-1"
            >
              <span className="truncate">{problem.name}</span>
              <span className="t-faint text-[10px] shrink-0">↗</span>
            </a>
            {problem.notesLabel && (
              <span className="t-caption t-quote block mt-0.5">{problem.notesLabel}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 pl-8 sm:pl-0 shrink-0 justify-end">
          <span className="flex sm:w-[104px] justify-end">
            {problem.isMustDo ? (
              <span className="chip chip--accent">🔥 Must-do</span>
            ) : (
              <span className="chip">⚪ Bonus</span>
            )}
          </span>

          <span className="flex justify-center sm:w-9 empty:hidden">
            {problem.statement && (
              <button
                onClick={() => onToggleStatement(problem.id)}
                aria-expanded={isStatementOpen}
                aria-label="সমস্যার বিবরণ"
                className="control control--quiet px-2 py-1 text-[10px]"
              >
                {isStatementOpen ? '📋 ▲' : '📋 ▼'}
              </button>
            )}
          </span>

          <button
            onClick={() => onToggleRevise(problem.id)}
            aria-pressed={needsRevise}
            aria-label={`${problem.name} — রিভাইজ দরকার`}
            title="রিভাইজ দরকার"
            className={`control px-2 py-1 text-[10px] ${
              needsRevise ? 'control--alert' : 'control--quiet'
            }`}
          >
            <RotateCcw />
          </button>

          <button
            onClick={() => onToggleNotes(problem.id)}
            aria-expanded={isNotesOpen}
            className="control control--quiet min-w-[92px] px-2 py-1 text-xs whitespace-nowrap"
          >
            {isNotesOpen ? 'Collapse ▲' : 'Notes ▼'}
          </button>
        </div>
      </div>

      {isStatementOpen && problem.statement && (
        <div className="seam-t px-4 pb-4 pt-3">
          <h4 className="t-label mb-3">📋 সমস্যার বিবরণ</h4>
          <StatementBox raw={problem.statement} />
        </div>
      )}

      {isNotesOpen && (
        <div className="seam-t px-4 pb-5 pt-4 flex flex-col gap-4">
          <div>
            <label htmlFor={`note-solution-${problem.id}`} className="t-label mb-2 block">
              আমার সমাধান (মূল আইডিয়া ২–৩ লাইনে)
            </label>
            <textarea
              id={`note-solution-${problem.id}`}
              value={note.solution}
              onChange={(e) => onNoteChange(problem.id, 'solution', e.target.value)}
              placeholder="কোন আইডিয়া দিয়ে সলভ করেছেন বা মূল ট্রিক..."
              className="surface-well t-body w-full text-sm p-3 resize-y"
              rows={2}
            />
          </div>
          <div>
            <label htmlFor={`note-obstacle-${problem.id}`} className="t-label mb-2 block">
              যে সমস্যা হয়েছিল (trap / edge cases)
            </label>
            <textarea
              id={`note-obstacle-${problem.id}`}
              value={note.obstacle}
              onChange={(e) => onNoteChange(problem.id, 'obstacle', e.target.value)}
              placeholder="কোন edge case বা লজিকাল ভুলের কারণে আটকেছিলেন..."
              className="surface-well t-body w-full text-sm p-3 resize-y"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}
