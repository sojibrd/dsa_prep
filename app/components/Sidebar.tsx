'use client';

import { useMemo, useState, type RefObject } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Topic } from '../utils/dsaParser';
import { PanelLeftClose, Search, X } from './icons';
import ProgressReadout from './ProgressReadout';

interface PatternCount {
  solved: number;
  total: number;
}

/** One practice problem with the pattern it belongs to, for search results. */
export interface ProblemIndexEntry {
  id: string;
  name: string;
  patternId: string;
  patternName: string;
}

interface SidebarProps {
  topics: Topic[];
  problemIndex: ProblemIndexEntry[];
  selectedPatternId: string;
  byTopic: Map<number, PatternCount>;
  byPattern: Map<string, PatternCount>;
  solvedSet: Set<string>;
  onSelect: (patternId: string) => void;
  onSelectProblem: (patternId: string, problemId: string) => void;
  /** Supplied only in the drawer, where the list needs a way out. */
  onClose?: () => void;
  /** Supplied only on the rail, where the list can be folded away. */
  onCollapse?: () => void;
  progressPercent: number;
  /** The rail's input, so `/` and Ctrl+K can reach it from anywhere. */
  searchRef?: RefObject<HTMLInputElement | null>;
}

/**
 * Topic → pattern navigation, plus search.
 *
 * One component serves both mounts: the permanent `lg:` rail and the drawer
 * below it. They differ only in the way out; a second component would have
 * meant two lists drifting apart. The rail was dropped once for stranding
 * empty chassis under a short list — it earns the column back now that it
 * carries the search box, and it folds away when it is not wanted.
 */
export default function Sidebar({
  topics,
  problemIndex,
  selectedPatternId,
  byTopic,
  byPattern,
  solvedSet,
  onSelect,
  onSelectProblem,
  onClose,
  onCollapse,
  progressPercent,
  searchRef,
}: SidebarProps) {
  const pathname = usePathname();
  const onProgressPage = pathname.replace(/\/$/, '').endsWith('/progress');
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const searching = query.length > 0;

  /* While searching the topics are dropped and the matches shown flat.
     Keeping the grouping would leave empty topic blocks standing over
     nothing, which reads as broken rather than as "no matches here". */
  const { patternMatches, problemMatches } = useMemo(() => {
    if (!searching) return { patternMatches: [], problemMatches: [] };

    const patterns = topics
      .flatMap((topic) => topic.patterns)
      .filter((pattern) => `${pattern.id} ${pattern.name}`.toLowerCase().includes(query));

    const problems = problemIndex.filter((entry) => entry.name.toLowerCase().includes(query));

    return { patternMatches: patterns, problemMatches: problems };
  }, [topics, problemIndex, query, searching]);

  const noMatches = searching && patternMatches.length === 0 && problemMatches.length === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="seam-b flex items-center justify-between gap-2 px-4 py-3 shrink-0">
        <Link href="/" onClick={onClose} className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">📚</span>
          <span className="t-title text-sm truncate">DSA Workbook</span>
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/progress/"
            onClick={onClose}
            className={`control px-2.5 py-1 text-[11px] ${
              onProgressPage ? 'control--primary' : ''
            }`}
          >
            Progress
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="control control--quiet p-1.5"
              aria-label="সাইডবার বন্ধ করুন"
            >
              <X />
            </button>
          )}

          {onCollapse && (
            <button
              onClick={onCollapse}
              className="control control--quiet p-1.5"
              aria-label="সূচিপত্র লুকান"
              aria-expanded
              aria-controls="site-sidebar"
            >
              <PanelLeftClose />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 shrink-0 flex flex-col gap-4">
        <ProgressReadout percent={progressPercent} />

        <div className="relative">
          <span className="t-muted absolute left-2.5 top-2.5 flex pointer-events-none">
            <Search />
          </span>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Escape') return;
              if (search) setSearch('');
              else event.currentTarget.blur();
            }}
            placeholder="প্যাটার্ন বা প্রবলেম খুঁজুন..."
            aria-label="প্যাটার্ন বা প্রবলেম খুঁজুন (শর্টকাট: / বা Ctrl+K)"
            className="surface-well t-body w-full pl-8 pr-8 py-2 text-sm"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="control control--quiet absolute right-1.5 top-1.5 px-1.5 py-1"
              aria-label="খোঁজা বাতিল"
            >
              <X />
            </button>
          ) : (
            <span
              className="t-caption t-mono hidden lg:inline absolute right-2.5 top-2 pointer-events-none select-none text-[11px]"
              title="শর্টকাট: / অথবা Ctrl+K"
            >
              /
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {searching ? (
          <div className="flex flex-col gap-5">
            {noMatches && (
              <div className="surface-well t-caption p-4 text-center">
                &ldquo;{search}&rdquo; দিয়ে কিছু পাওয়া যায়নি।
              </div>
            )}

            {patternMatches.length > 0 && (
              <div className="topic-group pb-4 flex flex-col gap-1.5">
                <span className="t-label">প্যাটার্ন ({patternMatches.length})</span>
                {patternMatches.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => onSelect(pattern.id)}
                    aria-current={pattern.id === selectedPatternId}
                    className="row w-full text-left px-3 py-2 text-xs truncate"
                  >
                    {pattern.id} {pattern.name}
                  </button>
                ))}
              </div>
            )}

            {problemMatches.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="t-label">প্রবলেম ({problemMatches.length})</span>
                {problemMatches.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => onSelectProblem(entry.patternId, entry.id)}
                    className="row w-full text-left px-3 py-2 flex flex-col gap-0.5"
                  >
                    <span className="text-xs flex items-center gap-1.5 min-w-0">
                      {solvedSet.has(entry.id) && <span className="t-ok shrink-0">✓</span>}
                      <span className="truncate">{entry.name}</span>
                    </span>
                    <span className="t-caption truncate">
                      {entry.patternId} {entry.patternName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {topics.map((topic) => {
              const { solved, total } = byTopic.get(topic.id) ?? { solved: 0, total: 0 };

              return (
                <div key={topic.id} className="topic-group pb-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="t-strong text-sm min-w-0 truncate">
                      {topic.id}. {topic.name}
                    </h4>
                    <span className="chip shrink-0">
                      {solved}/{total}
                    </span>
                  </div>

                  <div className="seam-l flex flex-col gap-1.5 pl-2 ml-1">
                    {topic.patterns.map((pattern) => {
                      const isSelected = pattern.id === selectedPatternId;
                      const { solved: patternSolved, total: patternTotal } =
                        byPattern.get(pattern.id) ?? { solved: 0, total: 0 };

                      return (
                        <button
                          key={pattern.id}
                          id={`pattern-btn-${pattern.id}`}
                          onClick={() => onSelect(pattern.id)}
                          aria-current={isSelected}
                          className="row w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2"
                        >
                          <span className="truncate">
                            {pattern.id} {pattern.name}
                          </span>
                          <span className="text-[10px] shrink-0">
                            ({patternSolved}/{patternTotal})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
