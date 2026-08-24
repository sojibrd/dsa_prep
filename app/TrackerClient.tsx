'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Topic, Pattern, PracticeProblem } from './utils/dsaParser';
import { useLocalStorage } from './hooks/useLocalStorage';

interface TrackerClientProps {
  topics: Topic[];
}

interface ProblemNote {
  solution: string;
  obstacle: string;
}

/** One row as the Apps Script endpoint returns it. */
interface SheetRow {
  id: string;
  name?: string;
  solved?: boolean;
  noteIdea?: string;
  noteObstacle?: string;
}

/**
 * How long typing must pause before a note is pushed to the sheet. Without
 * this every keystroke fired its own POST, and Apps Script answers far slower
 * than a person types — the queue only ever grew.
 */
const NOTE_SYNC_DEBOUNCE_MS = 900;

/**
 * The overall completion readout, shared by the drawer and the desktop rail.
 *
 * Declared at module scope on purpose: a component defined inside the parent
 * gets a new function identity every render, and React treats a new identity
 * as a different component — unmounting and rebuilding the whole subtree
 * instead of updating it.
 */
function ProgressReadout({
  solved,
  total,
  percent,
}: {
  solved: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="t-label">সর্বমোট অগ্রগতি</span>
          <span className="t-title text-xl">
            {solved} / {total} Solved
          </span>
        </div>
        <span className="t-mono t-accent text-lg">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="সার্বিক সম্পূর্ণতা"
        className="gauge h-2.5 w-full"
      >
        <div className="gauge-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// Parse statement text into description, example parts, and constraint
function parseStatement(raw: string): {
  description: string;
  input: string;
  output: string;
  constraint: string;
} {
  const lines = raw.split('\n');
  const description = lines[0].trim();
  let input = '', output = '', constraint = '';

  if (lines.length > 1) {
    // e.g. "উদাহরণ: `[-1,0,1,2,-1,-4]` → `[[-1,-1,2],[-1,0,1]]` | ⚡ `n ≤ 3000`"
    const exampleLine = lines[1].replace('উদাহরণ:', '').trim();
    // Split by " | ⚡ " to get example and constraint
    const [examplePart, constraintPart] = exampleLine.split(' | ⚡ ');
    constraint = constraintPart ? constraintPart.trim() : '';
    // Split example by " → " to get input and output
    const arrowIdx = examplePart.indexOf(' → ');
    if (arrowIdx !== -1) {
      input = examplePart.slice(0, arrowIdx).trim();
      output = examplePart.slice(arrowIdx + 3).trim();
    } else {
      input = examplePart.trim();
    }
  }

  return { description, input, output, constraint };
}

// Styled statement display component
function StatementBox({ raw }: { raw: string }) {
  const { description, input, output, constraint } = parseStatement(raw);
  return (
    <div className="flex flex-col gap-3">
      <p className="t-body text-sm">{description}</p>
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
      {constraint && (
        <div className="t-mono t-muted text-[11px]">⚡ {constraint}</div>
      )}
    </div>
  );
}

export default function TrackerClient({ topics }: TrackerClientProps) {
  const [selectedPatternId, setSelectedPatternId] = useLocalStorage<string>('dsa_selected_pattern_id', '1.1');
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, ProblemNote>>({});
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);
  const [expandedStatementId, setExpandedStatementId] = useState<string | null>(null);
  const [demoStatementOpen, setDemoStatementOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Google Sheets integration state
  const [sheetUrl, setSheetUrl] = useLocalStorage<string>('dsa_sheet_script_url', '');
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Nothing resets these panels except picking a pattern, so the reset lives
  // in the click handler. As an effect it caused a second render on every
  // pattern change purely to undo state React had just committed.

  // Sync selectedPatternId with URL query param (?pattern=X.X)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const patternFromUrl = params.get('pattern');
    const activePatternId = patternFromUrl || null;

    if (patternFromUrl) {
      setSelectedPatternId(patternFromUrl);
    }

    // On initial load, scroll the sidebar to show the active pattern button
    const timer = setTimeout(() => {
      const targetId = activePatternId || selectedPatternId;
      const activeBtn = document.getElementById(`pattern-btn-${targetId}`);
      if (activeBtn) {
        const scrollContainer = activeBtn.closest('.overflow-y-auto');
        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elemRect = activeBtn.getBoundingClientRect();
          const isAbove = elemRect.top < containerRect.top;
          const isBelow = elemRect.bottom > containerRect.bottom;
          if (isAbove || isBelow) {
            const relativeTop = elemRect.top - containerRect.top;
            let targetScrollTop = scrollContainer.scrollTop + relativeTop;
            if (isBelow) {
              targetScrollTop = targetScrollTop - containerRect.height + elemRect.height;
            }
            scrollContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
          }
        }
      }
    }, 100);

    // Handle browser back/forward button
    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const pid = p.get('pattern');
      if (pid) {
        setSelectedPatternId(pid);
        setDemoStatementOpen(false);
        setExpandedStatementId(null);
        setExpandedProblemId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', handlePopState);
    };
    // Runs once: this reads the URL as it was on arrival and installs the
    // popstate listener. Re-running it on every pattern change would fight
    // the very state it sets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Flat problem list + id index. Derived from `topics`, which never changes
  // after the server hands it over, so this runs once rather than per render.
  const { allProblems, problemsById } = useMemo(() => {
    const flat: PracticeProblem[] = [];
    const index = new Map<string, PracticeProblem>();
    topics.forEach((t) => {
      t.patterns.forEach((p) => {
        p.problems.forEach((prob) => {
          flat.push(prob);
          index.set(prob.id, prob);
        });
      });
    });
    return { allProblems: flat, problemsById: index };
  }, [topics]);

  // Membership is checked once per problem per render across the sidebar and
  // the list; a Set turns each of those from a scan into a lookup.
  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);

  const totalProblems = allProblems.length;

  const solvedProblemsCount = useMemo(
    () => solvedIds.reduce((n, id) => (problemsById.has(id) ? n + 1 : n), 0),
    [solvedIds, problemsById]
  );

  const progressPercent = totalProblems > 0 ? Math.round((solvedProblemsCount / totalProblems) * 100) : 0;

  // Per-topic and per-pattern counters for the sidebar, computed in one pass
  // instead of re-scanning every problem for every row on every render.
  const topicProgress = useMemo(() => {
    const byTopic = new Map<number, { solved: number; total: number }>();
    const byPattern = new Map<string, { solved: number; total: number }>();

    topics.forEach((topic) => {
      let topicSolved = 0;
      let topicTotal = 0;

      topic.patterns.forEach((pattern) => {
        let patternSolved = 0;
        pattern.problems.forEach((prob) => {
          if (solvedSet.has(prob.id)) patternSolved++;
        });
        byPattern.set(pattern.id, { solved: patternSolved, total: pattern.problems.length });
        topicSolved += patternSolved;
        topicTotal += pattern.problems.length;
      });

      byTopic.set(topic.id, { solved: topicSolved, total: topicTotal });
    });

    return { byTopic, byPattern };
  }, [topics, solvedSet]);

  // Load Data from Google Sheets on Mount or when URL changes
  useEffect(() => {
    if (!sheetUrl.trim()) return;

    const loadData = async () => {
      setInitialLoading(true);
      try {
        const res = await fetch(sheetUrl, {
          method: 'GET',
          mode: 'cors'
        });
        const resData = await res.json();

        // If sheet is empty/new, initialize it with current problems database structure
        if (resData.status === 'success' && resData.isNew) {
          const initPayload = {
            action: 'init_sheet',
            problems: allProblems.map((prob) => ({
              id: prob.id,
              name: prob.name,
              solved: false,
              noteIdea: '',
              noteObstacle: ''
            }))
          };
          await fetch(sheetUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(initPayload)
          });
          setSolvedIds([]);
          setNotes({});
        } else if (resData.status === 'success' && Array.isArray(resData.data)) {
          const restoredSolvedIds: string[] = [];
          const restoredNotes: Record<string, ProblemNote> = {};

          resData.data.forEach((item: SheetRow) => {
            if (item.solved) {
              restoredSolvedIds.push(item.id);
            }
            if (item.noteIdea || item.noteObstacle) {
              restoredNotes[item.id] = {
                solution: item.noteIdea || '',
                obstacle: item.noteObstacle || ''
              };
            }
          });

          setSolvedIds(restoredSolvedIds);
          setNotes(restoredNotes);
        }
      } catch (err) {
        // Loading is where silence is most dangerous: an empty tracker looks
        // exactly like a tracker with nothing solved yet, and the next tick
        // would then overwrite the sheet from that empty state.
        console.error('Failed to load initial data from Sheet:', err);
        setSyncStatus({
          type: 'error',
          message: 'গুগল শিট থেকে ডাটা লোড হয়নি। এই অবস্থায় টিক দিলে শিটের ডাটা মুছে যেতে পারে — আগে কানেকশন ঠিক করুন।',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [sheetUrl, allProblems]);

  /**
   * How many pushes are in flight. A single boolean could not describe N
   * overlapping requests: whichever finished first cleared it while the rest
   * were still running, so the indicator lied.
   */
  const inFlightRef = useRef(0);

  /** One pending debounce timer per problem id. */
  const pendingSyncRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // Push one row to the sheet. Never called directly from a keystroke —
  // `queueRowSync` decides when.
  const syncRowToCloud = useCallback(
    async (problemId: string, isSolved: boolean, note: ProblemNote) => {
      if (!sheetUrl.trim()) return;

      const problemObj = problemsById.get(problemId);
      if (!problemObj) return;

      inFlightRef.current += 1;
      setSyncLoading(true);

      const payload = {
        action: 'update_row',
        problem: {
          id: problemObj.id,
          name: problemObj.name,
          solved: isSolved,
          noteIdea: note.solution || '',
          noteObstacle: note.obstacle || '',
        },
      };

      try {
        await fetch(sheetUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        // A failed push means the note exists only in this tab. Say so —
        // silence here reads as "saved" and the work is lost on reload.
        console.error('Row auto-sync failed:', err);
        setSyncStatus({
          type: 'error',
          message: `"${problemObj.name}" শিটে সেভ হয়নি — ইন্টারনেট বা Apps Script URL যাচাই করুন।`,
        });
      } finally {
        inFlightRef.current -= 1;
        if (inFlightRef.current === 0) setSyncLoading(false);
      }
    },
    [sheetUrl, problemsById]
  );

  /**
   * Coalesce rapid edits to one row into a single push. A checkbox passes
   * `immediate` — it is one deliberate act, not a stream of them.
   */
  const queueRowSync = useCallback(
    (problemId: string, isSolved: boolean, note: ProblemNote, immediate = false) => {
      const pending = pendingSyncRef.current;
      const existing = pending.get(problemId);
      if (existing) clearTimeout(existing);

      if (immediate) {
        pending.delete(problemId);
        void syncRowToCloud(problemId, isSolved, note);
        return;
      }

      pending.set(
        problemId,
        setTimeout(() => {
          pending.delete(problemId);
          void syncRowToCloud(problemId, isSolved, note);
        }, NOTE_SYNC_DEBOUNCE_MS)
      );
    },
    [syncRowToCloud]
  );

  // Flush nothing on unmount, but do not leave timers behind either.
  useEffect(() => {
    const pending = pendingSyncRef.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  // Find currently selected pattern
  let selectedPattern: Pattern | null = null;
  let selectedTopicName = '';
  for (const t of topics) {
    const found = t.patterns.find((p) => p.id === selectedPatternId);
    if (found) {
      selectedPattern = found;
      selectedTopicName = t.name;
      break;
    }
  }

  // Fallback if not found
  if (!selectedPattern && topics.length > 0 && topics[0].patterns.length > 0) {
    selectedPattern = topics[0].patterns[0];
    selectedTopicName = topics[0].name;
  }

  const toggleSolved = (id: string) => {
    const willBeSolved = !solvedSet.has(id);
    const updatedSolvedIds = willBeSolved
      ? [...solvedIds, id]
      : solvedIds.filter((x) => x !== id);
    setSolvedIds(updatedSolvedIds);

    // A tick is one deliberate act — push it straight away.
    const problemNote = notes[id] || { solution: '', obstacle: '' };
    queueRowSync(id, willBeSolved, problemNote, true);
  };

  const handleNoteChange = (problemId: string, field: keyof ProblemNote, value: string) => {
    const updatedProblemNote = {
      ...((notes && notes[problemId]) || { solution: '', obstacle: '' }),
      [field]: value,
    };

    const updatedNotes = {
      ...notes,
      [problemId]: updatedProblemNote,
    };
    setNotes(updatedNotes);

    // Typing is a stream — wait for the pause, then push once.
    queueRowSync(problemId, solvedSet.has(problemId), updatedProblemNote);
  };

  const getClueMatches = (clue: string, problems: PracticeProblem[]) => {
    const normalizedClue = clue.toLowerCase();
    const searchTerms: string[] = [];

    // Extract quoted strings
    const quotedMatches = normalizedClue.match(/"([^"]+)"/g);
    if (quotedMatches) {
      quotedMatches.forEach(q => {
        searchTerms.push(q.replace(/"/g, ''));
      });
    }

    const cleanedClue = normalizedClue.replace(/"/g, ' ');
    const words = cleanedClue.split(/[\s/,\-\(\)]+/);

    const stopwords = new Set([
      'with', 'from', 'to', 'or', 'in', 'a', 'an', 'the', 'x', 'of', 'at', 'most', 'least', 'size',
      'থেকে', 'এবং', 'ও', 'করে', 'হলে', 'দিয়ে', 'থাকা', 'করা', 'জন্য', 'বা', 'কে', 'একটি'
    ]);

    words.forEach(w => {
      const cleaned = w.trim().replace(/[.,;:??"']/g, '');
      if (cleaned && cleaned.length > 1 && !stopwords.has(cleaned)) {
        searchTerms.push(cleaned);
      }
    });

    return problems.filter(prob => {
      if (!prob.statement) return false;
      const probName = prob.name.toLowerCase();
      const probStmt = prob.statement.toLowerCase();
      const probLabel = (prob.notesLabel || '').toLowerCase();
      const combinedText = `${probName} ${probStmt} ${probLabel}`;

      return searchTerms.some(term => {
        if (term === 'palindrome' || term === 'প্যালিনড্রোম') {
          return combinedText.includes('palindrome') || combinedText.includes('প্যালিনড্রোম');
        }
        if (term === 'sum' || term === 'যোগফল') {
          return combinedText.includes('sum') || combinedText.includes('যোগফল') || combinedText.includes('triplet');
        }
        if (term === 'duplicate' || term === 'duplicates' || term === 'ডুপ্লিকেট') {
          return combinedText.includes('duplicate') || combinedText.includes('duplicates') || combinedText.includes('ডুপ্লিকেট') || combinedText.includes('unique');
        }
        if (term === 'sorted' || term === 'সর্টেড') {
          return combinedText.includes('sorted') || combinedText.includes('সর্টেড') || combinedText.includes('sort') || combinedText.includes('ক্রমবর্ধমান');
        }
        if (term === 'in-place' || term === 'inplace') {
          return combinedText.includes('in-place') || combinedText.includes('inplace') || combinedText.includes('extra space') || combinedText.includes('o(1)');
        }
        if (term === 'partition') {
          return combinedText.includes('partition') || combinedText.includes('sort colors') || combinedText.includes('colors');
        }
        if (term === 'তুলনা' || term === 'প্রান্ত') {
          return combinedText.includes('water') || combinedText.includes('পানি') || combinedText.includes('reverse') || combinedText.includes('compare') || combinedText.includes('দিক') || combinedText.includes('উল্লম্ব') || combinedText.includes('রেখা');
        }
        return combinedText.includes(term);
      });
    });
  };

  /**
   * Clue → matching problems for the pattern on screen.
   *
   * The JSX used to call `getClueMatches` twice for every clue — once to ask
   * whether anything matched, then again to render it — on every render. It
   * only depends on the selected pattern, which changes when the user picks
   * one, not when they type.
   */
  const clueMatches = useMemo(() => {
    if (!selectedPattern?.recognize) return [];
    return selectedPattern.recognize
      .split(',')
      .map((clueItem) => {
        const clue = clueItem.trim();
        return { clue, problems: getClueMatches(clue, selectedPattern.problems) };
      })
      .filter((entry) => entry.problems.length > 0);
  }, [selectedPattern]);

  const handlePatternSelect = (patternId: string) => {
    setSelectedPatternId(patternId);
    setSidebarOpen(false); // close drawer on mobile after selection
    // Collapse whatever the previous pattern had open.
    setDemoStatementOpen(false);
    setExpandedStatementId(null);
    setExpandedProblemId(null);
    // Update URL with query param without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('pattern', patternId);
    window.history.pushState(null, '', url.toString());
  };

  // Sidebar content (shared between desktop sidebar and mobile drawer)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Mobile drawer header */}
      <div className="lg:hidden seam-b flex items-center justify-between px-5 py-4 shrink-0">
        <span className="t-label">টপিক ও প্যাটার্নসমূহ</span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="control control--quiet p-2"
          aria-label="সাইডবার বন্ধ করুন"
        >
          ✕
        </button>
      </div>

      {/* Progress summary — mobile only (inside drawer) */}
      <div className="lg:hidden px-4 pt-4 pb-2 shrink-0">
        <div className="surface-panel p-4">
          <ProgressReadout solved={solvedProblemsCount} total={totalProblems} percent={progressPercent} />
        </div>
      </div>

      {/* Topic/pattern list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 lg:py-0 lg:px-0">
        {/* Desktop heading */}
        <h3 className="hidden lg:block t-label mb-4">টপিক ও প্যাটার্নসমূহ</h3>

        <div className="flex flex-col gap-5">
          {topics.map((topic) => {
            const { solved, total } = topicProgress.byTopic.get(topic.id) ?? { solved: 0, total: 0 };

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
                      topicProgress.byPattern.get(pattern.id) ?? { solved: 0, total: 0 };

                    return (
                      <button
                        key={pattern.id}
                        id={`pattern-btn-${pattern.id}`}
                        onClick={() => handlePatternSelect(pattern.id)}
                        aria-current={isSelected}
                        className="row w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{pattern.id} {pattern.name}</span>
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
      </div>
    </div>
  );

  return (
    <div className="surface-app min-h-screen flex flex-col">

      {/* ── Top Navbar ── */}
      <header className="surface-app seam-b sticky top-0 z-40 w-full py-3 px-4 sm:px-6 md:px-12 flex items-center justify-between gap-3">

        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden control control--quiet p-2 shrink-0"
            aria-label="নেভিগেশন খুলুন"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <span className="text-2xl shrink-0">📚</span>
          <div className="min-w-0">
            <h1 className="t-title text-base sm:text-xl truncate">
              DSA Practice Workbook
            </h1>
            <p className="t-caption hidden sm:block">Spot → Solve → Revise</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Progress Pill — hidden on small mobile */}
          <div className="surface-raised hidden sm:flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5">
            <span className="t-label hidden md:inline">Progress</span>
            <span className="t-mono t-accent text-xs sm:text-sm">
              {solvedProblemsCount}/{totalProblems}
              <span className="hidden md:inline"> ({progressPercent}%)</span>
            </span>
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="সার্বিক সম্পূর্ণতা"
              className="gauge h-2 w-16 sm:w-20"
            >
              <div className="gauge-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Sync indicator */}
          {syncLoading && (
            <span className="t-label animate-pulse">Saving…</span>
          )}

          {/* Cloud Sync Button */}
          <button
            onClick={() => setShowSyncModal(true)}
            className="control control--quiet p-2"
            title="Cloud Sync settings"
            aria-label="ক্লাউড সিঙ্ক সেটিংস"
          >
            ☁️
          </button>
        </div>
      </header>

      {/* ── Sync status banner ──
           Sync failures used to reach the console only, so a lost note looked
           exactly like a saved one. */}
      {syncStatus && (
        <div
          role="status"
          aria-live="polite"
          className="px-4 sm:px-6 md:px-12 pt-3 flex justify-center"
        >
          <div
            className={`${
              syncStatus.type === 'error' ? 'callout callout--alert' : 'callout callout--accent'
            } flex items-start justify-between gap-3 w-full max-w-3xl`}
          >
            <span className="t-body text-xs">{syncStatus.message}</span>
            <button
              type="button"
              onClick={() => setSyncStatus(null)}
              className="control control--quiet px-2 py-1 text-[10px] shrink-0"
              aria-label="বার্তা বন্ধ করুন"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Google Sheets Sync Modal ── */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="ক্লাউড সিঙ্ক সেটিংস">
          <div className="overlay absolute inset-0" onClick={() => setShowSyncModal(false)} />
          <div className="surface-panel max-w-md w-full p-6 relative z-10">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="t-title text-lg">Cloud Sync Settings</h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="control control--quiet p-2"
                aria-label="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <p className="t-caption mb-4">
              আপনার গুগল শিটের Apps Script Web App URL টি এখানে ইনপুট দিন। এর ফলে আপনার প্রগ্রেস এবং নোটসমূহ সরাসরি গুগল শিটে রিয়েলটাইমে অটো-সেভ হবে এবং অ্যাপ ওপেন করার সময় সেখান থেকে লোড হবে।
            </p>

            <div className="flex flex-col gap-2 mb-4">
              <label htmlFor="sheet-url-input" className="t-label">
                Google Apps Script URL
              </label>
              <input
                id="sheet-url-input"
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="surface-well t-mono w-full text-xs p-3"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowSyncModal(false)}
                className="control control--primary py-2.5 px-6 text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Drawer Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true">
          {/* Backdrop */}
          <div
            className="overlay absolute inset-0"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer panel */}
          <aside className="surface-panel absolute left-0 top-0 h-full w-[300px] sm:w-[340px] flex flex-col animate-slide-in-left">
            {SidebarContent()}
          </aside>
        </div>
      )}

      {/* ── Main Body ── */}
      <div className="flex-1 flex flex-row max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 gap-6">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex w-[360px] flex-col gap-4 shrink-0">
          {/* Desktop progress dashboard */}
          <div className="surface-panel p-5">
            <ProgressReadout solved={solvedProblemsCount} total={totalProblems} percent={progressPercent} />
          </div>

          <div className="surface-panel p-5 flex-1 flex flex-col max-h-[calc(100vh-220px)] overflow-y-auto">
            {SidebarContent()}
          </div>
        </aside>

        {/* ── Content Area ── */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {!sheetUrl.trim() ? (
            <div className="surface-panel p-8 text-center flex flex-col items-center justify-center gap-4">
              <span className="text-4xl">☁️</span>
              <h3 className="t-title text-lg">গুগল শিট কানেকশন প্রয়োজন</h3>
              <p className="t-body max-w-md text-sm">
                অ্যাপের ডাটা সরাসরি ক্লাউডে সেভ করার জন্য প্রথমে আপনার Google Apps Script URL-টি দিতে হবে। উপরে ডানদিকের মেঘ (☁️) আইকন বাটনে ক্লিক করে URL টি পেস্ট করুন।
              </p>
              <button
                onClick={() => setShowSyncModal(true)}
                className="control control--primary mt-2 py-2 px-6 text-xs"
              >
                Set App Script URL
              </button>
            </div>
          ) : initialLoading ? (
            <div className="surface-panel p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="spinner t-accent w-8 h-8" />
              <p className="t-caption">গুগল শিট থেকে প্রগ্রেস ডাটা লোড হচ্ছে...</p>
            </div>
          ) : selectedPattern ? (
            <div className="surface-panel p-4 sm:p-6 md:p-8 flex flex-col gap-6">
              {/* Pattern Header */}
              <div className="flex flex-col gap-1">
                <div className="t-label flex items-center gap-2 flex-wrap">
                  <span>{selectedTopicName}</span>
                  <span>•</span>
                  <span>Pattern {selectedPattern.id}</span>
                </div>
                <h2 className="t-title text-xl sm:text-2xl md:text-3xl">
                  {selectedPattern.name}
                </h2>
              </div>

              {/* Recognize / চিনবেন কীভাবে */}
              {selectedPattern.recognize && (
                <div className="callout callout--accent p-4">
                  <h4 className="t-label mb-2">🔎 চিনবেন কীভাবে</h4>
                  <ul className="t-body list-disc pl-5 space-y-1 text-sm">
                    {selectedPattern.recognize.split(',').map((item, idx) => (
                      <li key={idx}>{item.trim()}</li>
                    ))}
                  </ul>

                  {/* Examples from problems to understand the pattern */}
                  {clueMatches.length > 0 && (
                    <div className="seam-t mt-4 pt-4">
                      <h5 className="t-label mb-3">Example</h5>
                      <div className="flex flex-col gap-4">
                        {clueMatches.map(({ clue, problems }) => (
                          <div key={clue} className="option flex flex-col gap-1.5 pl-3" data-chosen="true">
                            <span className="t-strong text-xs">{clue} :</span>
                            <ol className="t-body list-decimal pl-5 space-y-1 text-xs">
                              {problems.map((prob) => (
                                <li key={prob.id} title={prob.name}>
                                  <span className="t-strong">{prob.name}: </span>
                                  {prob.statement!.split('\n')[0].trim()}
                                </li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Demo Section */}
              {selectedPattern.demoName && (
                <div className="seam-t flex flex-col gap-4 pt-6">
                  <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="t-title text-base sm:text-lg">
                        Demo: {selectedPattern.demoName}
                      </h3>
                      {selectedPattern.demoStatement && (
                        <button
                          onClick={() => setDemoStatementOpen(!demoStatementOpen)}
                          aria-expanded={demoStatementOpen}
                          className="control control--quiet px-2 py-1 text-[10px]"
                        >
                          {demoStatementOpen ? '📋 Statement ▲' : '📋 Statement ▼'}
                        </button>
                      )}
                    </div>
                    {selectedPattern.demoLink && (
                      <a
                        href={selectedPattern.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chip chip--accent px-2.5 py-1 self-start sm:self-auto"
                      >
                        LeetCode Link ↗
                      </a>
                    )}
                  </div>

                  {/* Demo Statement (expandable) */}
                  {demoStatementOpen && selectedPattern.demoStatement && (
                    <div className="callout p-4">
                      <h4 className="t-label mb-3">📋 সমস্যার বিবরণ</h4>
                      <StatementBox raw={selectedPattern.demoStatement} />
                    </div>
                  )}

                  {selectedPattern.approach && (
                    <div className="surface-well p-4">
                      <span className="t-label mb-1 block">Approach</span>
                      <p className="t-body text-sm">{selectedPattern.approach}</p>
                    </div>
                  )}

                  {selectedPattern.demoCode && (
                    <div className="relative group">
                      <div className="codeblock-copy absolute right-3 top-3 z-10">
                        <button
                          onClick={() => {
                            if (selectedPattern) {
                              navigator.clipboard.writeText(selectedPattern.demoCode);
                            }
                          }}
                          className="control px-3 py-1.5 text-xs"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="codeblock">
                        <code className="block">{selectedPattern.demoCode}</code>
                      </pre>
                    </div>
                  )}

                  {selectedPattern.complexity && (
                    <div className="flex items-center gap-2">
                      <span className="chip px-3 py-1.5">
                        ⚡ Complexity: {selectedPattern.complexity}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Practice Problems */}
              <div className="seam-t pt-6 flex flex-col gap-4">
                <h3 className="t-title text-base sm:text-lg">
                  Practice Problems ({selectedPattern.problems.length})
                </h3>

                <div className="flex flex-col gap-3">
                  {selectedPattern.problems.map((problem) => {
                    const isSolved = solvedSet.has(problem.id);
                    const note = notes[problem.id] || { solution: '', obstacle: '' };
                    const isExpanded = expandedProblemId === problem.id;
                    const isStatementOpen = expandedStatementId === problem.id;

                    return (
                      <div
                        key={problem.id}
                        data-solved={isSolved}
                        className="surface-raised"
                      >
                        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                          {/* Left: checkbox + name */}
                          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSolved}
                              onChange={() => toggleSolved(problem.id)}
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
                                <span className="t-caption t-quote block mt-0.5">
                                  {problem.notesLabel}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: badge + toggles */}
                          <div className="flex items-center gap-2 sm:gap-3 pl-8 sm:pl-0 shrink-0 flex-wrap justify-end">
                            {problem.isMustDo ? (
                              <span className="chip chip--accent">🔥 Must-do</span>
                            ) : (
                              <span className="chip">⚪ Bonus</span>
                            )}

                            {problem.statement && (
                              <button
                                onClick={() => setExpandedStatementId(isStatementOpen ? null : problem.id)}
                                aria-expanded={isStatementOpen}
                                aria-label="সমস্যার বিবরণ"
                                className="control control--quiet px-2 py-1 text-[10px]"
                              >
                                {isStatementOpen ? '📋 ▲' : '📋 ▼'}
                              </button>
                            )}

                            <button
                              onClick={() => setExpandedProblemId(isExpanded ? null : problem.id)}
                              aria-expanded={isExpanded}
                              className="control control--quiet px-2 py-1 text-xs whitespace-nowrap"
                            >
                              {isExpanded ? 'Collapse ▲' : 'Notes ▼'}
                            </button>
                          </div>
                        </div>

                        {/* Inline Statement (expandable) */}
                        {isStatementOpen && problem.statement && (
                          <div className="seam-t px-4 pb-4 pt-3">
                            <h4 className="t-label mb-3">📋 সমস্যার বিবরণ</h4>
                            <StatementBox raw={problem.statement} />
                          </div>
                        )}

                        {/* Expanded Notes Section */}
                        {isExpanded && (
                          <div className="seam-t px-4 pb-5 pt-4 flex flex-col gap-4">
                            <div>
                              <label htmlFor={`note-solution-${problem.id}`} className="t-label mb-2 block">
                                আমার সমাধান (মূল আইডিয়া ২–৩ লাইনে)
                              </label>
                              <textarea
                                id={`note-solution-${problem.id}`}
                                value={note.solution}
                                onChange={(e) => handleNoteChange(problem.id, 'solution', e.target.value)}
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
                                onChange={(e) => handleNoteChange(problem.id, 'obstacle', e.target.value)}
                                placeholder="কোন edge case বা লজিকাল ভুলের কারণে আটকেছিলেন..."
                                className="surface-well t-body w-full text-sm p-3 resize-y"
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="surface-panel t-caption p-8 text-center">
              কোনো প্যাটার্ন সিলেক্ট করা নেই।
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
