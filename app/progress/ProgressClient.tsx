'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { hasNote, useProgress } from '../hooks/useProgress';
import { ProblemNote } from '../types';
import ProgressReadout from '../components/ProgressReadout';
import { ArrowRight, Check, Circle, RotateCcw } from '../components/icons';

export interface ProgressProblem {
  id: string;
  name: string;
  leetcodeUrl: string;
  isMustDo: boolean;
  patternId: string;
  patternName: string;
  topicName: string;
}

type Filter = 'all' | 'unsolved' | 'revise' | 'notes' | 'mustdo';

/** The shape written by Export and accepted by Import. */
interface Backup {
  version: 1;
  exportedAt: string;
  solved: string[];
  revise: string[];
  notes: Record<string, ProblemNote>;
}

export default function ProgressClient({ problems }: { problems: ProgressProblem[] }) {
  const router = useRouter();
  const {
    solvedSet,
    reviseSet,
    notes,
    toggleSolved,
    toggleRevise,
    setSolvedIds,
    setReviseIds,
    setNotes,
  } = useProgress();
  const [, setSelectedPatternId] = useLocalStorage<string>('dsa_selected_pattern_id', '1.1');

  const [filter, setFilter] = useState<Filter>('all');
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* A renamed or deleted problem can leave its id behind in storage. Counts
     come from `problems`, so the numbers stay right either way, but there is
     no reason to keep dead entries. Nothing is written when there is nothing
     to prune, so this does not touch storage on every mount. */
  useEffect(() => {
    const live = new Set(problems.map((problem) => problem.id));
    const prune = (ids: Set<string>, setter: (fn: (prev: string[]) => string[]) => void) => {
      if ([...ids].every((id) => live.has(id))) return;
      setter((prev) => prev.filter((id) => live.has(id)));
    };
    prune(solvedSet, setSolvedIds);
    prune(reviseSet, setReviseIds);
  }, [problems, solvedSet, reviseSet, setSolvedIds, setReviseIds]);

  const total = problems.length;
  const solvedCount = problems.filter((problem) => solvedSet.has(problem.id)).length;
  const reviseCount = problems.filter((problem) => reviseSet.has(problem.id)).length;
  const notesCount = problems.filter((problem) => hasNote(notes[problem.id])).length;
  const mustDoLeft = problems.filter(
    (problem) => problem.isMustDo && !solvedSet.has(problem.id)
  ).length;
  const percent = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

  const visible = useMemo(
    () =>
      problems.filter((problem) => {
        if (filter === 'unsolved') return !solvedSet.has(problem.id);
        if (filter === 'revise') return reviseSet.has(problem.id);
        if (filter === 'notes') return hasNote(notes[problem.id]);
        if (filter === 'mustdo') return problem.isMustDo && !solvedSet.has(problem.id);
        return true;
      }),
    [problems, filter, solvedSet, reviseSet, notes]
  );

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'সব প্রবলেম', count: total },
    { id: 'unsolved', label: 'অসমাধিত', count: total - solvedCount },
    { id: 'revise', label: 'রিভাইজ দরকার', count: reviseCount },
    { id: 'notes', label: 'নোটযুক্ত', count: notesCount },
    { id: 'mustdo', label: '🔥 Must-do বাকি', count: mustDoLeft },
  ];

  /** Open a problem where it lives: its pattern, scrolled to its card. */
  function openProblem(problem: ProgressProblem) {
    setSelectedPatternId(problem.patternId);
    router.push(`/?pattern=${problem.patternId}#problem-${problem.id}`);
  }

  function exportBackup() {
    const backup: Backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      solved: [...solvedSet],
      revise: [...reviseSet],
      notes,
    };

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `dsa-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /* Import replaces rather than merges. Merging two histories silently is
     the kind of thing nobody can undo; a file is always re-importable. */
  async function importBackup(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<Backup>;
      if (!Array.isArray(parsed.solved)) throw new Error('solved missing');

      setSolvedIds(parsed.solved.filter((id): id is string => typeof id === 'string'));
      setReviseIds(
        Array.isArray(parsed.revise)
          ? parsed.revise.filter((id): id is string => typeof id === 'string')
          : []
      );
      setNotes(parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {});
      setMessage(`${parsed.solved.length}টি সমাধানের রেকর্ড ফিরিয়ে আনা হয়েছে।`);
    } catch {
      setMessage('ফাইলটি পড়া গেল না — এটি কি এই অ্যাপের এক্সপোর্ট করা JSON?');
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="t-title text-2xl sm:text-3xl">Progress Tracker</h1>
        <p className="t-body text-sm">
          কোন প্রবলেমগুলো সলভ হয়েছে, কোনগুলো আবার দেখতে হবে — এক জায়গায়।
        </p>
      </header>

      <div className="surface-panel flex flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <span className="t-label">সলভড</span>
          <span className="t-mono t-accent text-sm">
            {solvedCount}/{total} ({percent}%)
          </span>
        </div>
        <ProgressReadout percent={percent} />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            aria-pressed={filter === item.id}
            className="tab px-3.5 py-2 text-xs"
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="surface-well t-caption p-8 text-center">এই ফিল্টারে কিছু নেই।</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((problem) => {
            const isSolved = solvedSet.has(problem.id);
            const needsRevise = reviseSet.has(problem.id);

            return (
              <li
                key={problem.id}
                data-solved={isSolved}
                className="surface-raised flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex flex-col gap-1">
                  <span className="t-label truncate">
                    {problem.topicName} • {problem.patternId} {problem.patternName}
                  </span>
                  <button
                    type="button"
                    onClick={() => openProblem(problem)}
                    className="card-name flex items-center gap-1.5 text-sm min-w-0 text-left"
                  >
                    <span className="truncate">{problem.name}</span>
                    <ArrowRight />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {problem.isMustDo && <span className="chip chip--accent">🔥 Must-do</span>}
                  {hasNote(notes[problem.id]) && <span className="chip">নোট</span>}

                  <button
                    type="button"
                    onClick={() => toggleSolved(problem.id)}
                    aria-pressed={isSolved}
                    className={`control px-3 py-1.5 text-xs ${isSolved ? 'control--primary' : ''}`}
                  >
                    {isSolved ? <Check /> : <Circle />}
                    {isSolved ? 'সলভড' : 'বাকি'}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleRevise(problem.id)}
                    aria-pressed={needsRevise}
                    className={`control px-3 py-1.5 text-xs ${
                      needsRevise ? 'control--alert' : ''
                    }`}
                  >
                    <RotateCcw />
                    রিভাইজ
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="surface-panel seam-t flex flex-col gap-3 p-5 sm:p-6">
        <div>
          <h2 className="t-title text-sm">ব্যাকআপ</h2>
          <p className="t-caption mt-1">
            অগ্রগতি এই ব্রাউজারে জমা থাকে। ব্রাউজার বদলালে বা ডেটা মুছলে এই ফাইলটিই ফেরার পথ।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={exportBackup} className="control px-3.5 py-2 text-xs">
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="control px-3.5 py-2 text-xs"
          >
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) importBackup(file);
              event.target.value = '';
            }}
          />
        </div>

        {message && (
          <p role="status" aria-live="polite" className="t-caption">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
