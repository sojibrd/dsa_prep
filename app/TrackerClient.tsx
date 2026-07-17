'use client';

import React, { useState, useEffect } from 'react';
import { Topic, Pattern, PracticeProblem } from './utils/dsaParser';
import { useLocalStorage } from './hooks/useLocalStorage';

interface TrackerClientProps {
  topics: Topic[];
}

interface ProblemNote {
  solution: string;
  obstacle: string;
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
      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {description}
      </p>
      {(input || output) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {input && (
            <div className="bg-zinc-900 dark:bg-black rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Input</span>
              <code className="text-xs text-emerald-400 font-mono break-all">{input}</code>
            </div>
          )}
          {output && (
            <div className="bg-zinc-900 dark:bg-black rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Output</span>
              <code className="text-xs text-cyan-400 font-mono break-all">{output}</code>
            </div>
          )}
        </div>
      )}
      {constraint && (
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
          ⚡ {constraint}
        </div>
      )}
    </div>
  );
}

export default function TrackerClient({ topics }: TrackerClientProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string>('1.1');
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, ProblemNote>>({});
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('dsa_dark_mode', false);
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

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  // Close demo statement when pattern changes
  useEffect(() => {
    setDemoStatementOpen(false);
    setExpandedStatementId(null);
  }, [selectedPatternId]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Find all patterns for easy flat searching/stats
  const allProblems: PracticeProblem[] = [];
  topics.forEach((t) => {
    t.patterns.forEach((p) => {
      p.problems.forEach((prob) => {
        allProblems.push(prob);
      });
    });
  });

  const totalProblems = allProblems.length;
  const solvedProblemsCount = solvedIds.filter((id) =>
    allProblems.some((p) => p.id === id)
  ).length;

  const progressPercent = totalProblems > 0 ? Math.round((solvedProblemsCount / totalProblems) * 100) : 0;

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

          resData.data.forEach((item: any) => {
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
        console.error('Failed to load initial data from Sheet:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [sheetUrl]);

  // Auto-sync row-level helper
  const syncRowToCloud = async (problemId: string, isSolved: boolean, note: ProblemNote) => {
    if (!sheetUrl.trim()) return;
    setSyncLoading(true);

    const problemObj = allProblems.find(p => p.id === problemId);
    if (!problemObj) {
      setSyncLoading(false);
      return;
    }

    const payload = {
      action: 'update_row',
      problem: {
        id: problemObj.id,
        name: problemObj.name,
        solved: isSolved,
        noteIdea: note.solution || '',
        noteObstacle: note.obstacle || ''
      }
    };

    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Row auto-sync failed:', err);
    } finally {
      setSyncLoading(false);
    }
  };

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
    const willBeSolved = !solvedIds.includes(id);
    let updatedSolvedIds: string[];
    if (solvedIds.includes(id)) {
      updatedSolvedIds = solvedIds.filter((x) => x !== id);
    } else {
      updatedSolvedIds = [...solvedIds, id];
    }
    setSolvedIds(updatedSolvedIds);
    
    // Sync specific row only
    const problemNote = notes[id] || { solution: '', obstacle: '' };
    syncRowToCloud(id, willBeSolved, problemNote);
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
    
    // Sync specific row only
    const isSolved = solvedIds.includes(problemId);
    syncRowToCloud(problemId, isSolved, updatedProblemNote);
  };

  const getTopicProgress = (topic: Topic) => {
    let total = 0;
    let solved = 0;
    topic.patterns.forEach((p) => {
      p.problems.forEach((prob) => {
        total++;
        if (solvedIds.includes(prob.id)) {
          solved++;
        }
      });
    });
    return { solved, total };
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
      'থেকে', 'এবং', 'ও', 'করে', 'হলে', 'দিয়ে', 'থাকা', 'করা', 'জন্য', 'বা', 'কে', 'একটি'
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

  const handlePatternSelect = (patternId: string) => {
    setSelectedPatternId(patternId);
    setSidebarOpen(false); // close drawer on mobile after selection
  };

  // Sidebar content (shared between desktop sidebar and mobile drawer)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Mobile drawer header */}
      <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 shrink-0">
        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
          টপিক ও প্যাটার্নসমূহ
        </span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Progress dashboard summary — mobile only (inside drawer) */}
      <div className="lg:hidden px-4 pt-4 pb-2 shrink-0">
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">সর্বমোট অগ্রগতি</span>
            <h2 className="text-xl font-bold mt-0.5 text-indigo-600 dark:text-indigo-400">
              {solvedProblemsCount} / {totalProblems} Solved
            </h2>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center font-bold text-xs">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="24" stroke="currentColor" className="text-indigo-500" strokeWidth="4" fill="transparent"
                strokeDasharray={150}
                strokeDashoffset={150 - (150 * progressPercent) / 100}
              />
            </svg>
            <span className="absolute">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Topic/pattern list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 lg:py-0 lg:px-0">
        {/* Desktop heading */}
        <h3 className="hidden lg:block text-sm font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mb-4">
          টপিক ও প্যাটার্নসমূহ
        </h3>

        <div className="flex flex-col gap-5">
          {topics.map((topic) => {
            const { solved, total } = getTopicProgress(topic);

            return (
              <div key={topic.id} className="border-b border-zinc-100 dark:border-zinc-900 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                    {topic.id}. {topic.name}
                  </h4>
                  <span className="text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    {solved}/{total}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 pl-2 border-l border-zinc-200 dark:border-zinc-800 ml-1">
                  {topic.patterns.map((pattern) => {
                    const isSelected = pattern.id === selectedPatternId;
                    const patternSolved = pattern.problems.filter(p => solvedIds.includes(p.id)).length;
                    const patternTotal = pattern.problems.length;

                    return (
                      <button
                        key={pattern.id}
                        onClick={() => handlePatternSelect(pattern.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-500 pl-2'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        }`}
                      >
                        <span className="truncate mr-2">{pattern.id} {pattern.name}</span>
                        <span className="text-[10px] text-zinc-400 shrink-0">
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
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">

      {/* ── Top Navbar ── */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-200/80 dark:border-zinc-800/80 py-3 px-4 sm:px-6 md:px-12 flex items-center justify-between gap-3">

        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg glass-panel hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            aria-label="Open navigation"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <span className="text-2xl shrink-0">📚</span>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent truncate">
              DSA Practice Workbook
            </h1>
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">Spot → Solve → Revise</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Progress Pill — hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 glass-panel px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium hidden md:inline">Progress:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {solvedProblemsCount}/{totalProblems}
              <span className="hidden md:inline"> ({progressPercent}%)</span>
            </span>
            <div className="w-16 sm:w-20 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Sync indicator */}
          {syncLoading && (
            <span className="text-xs text-zinc-400 animate-pulse">Saving... 🔄</span>
          )}

          {/* Cloud Sync Button */}
          <button
            onClick={() => setShowSyncModal(true)}
            className="p-2 rounded-lg glass-panel hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm"
            title="Cloud Sync settings"
          >
            ☁️
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg glass-panel hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm"
            title="Toggle theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* ── Google Sheets Sync Modal ── */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSyncModal(false)} />
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 relative z-10 animate-fade-in text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Cloud Sync Settings ☁️</h3>
              <button onClick={() => setShowSyncModal(false)} className="text-zinc-400 hover:text-zinc-200">✕</button>
            </div>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              আপনার গুগল শিটের Apps Script Web App URL টি এখানে ইনপুট দিন। এর ফলে আপনার প্রগ্রেস এবং নোটসমূহ সরাসরি গুগল শিটে রিয়েলটাইমে অটো-সেভ হবে এবং অ্যাপ ওপেন করার সময় সেখান থেকে লোড হবে।
            </p>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-semibold">Google Apps Script URL:</label>
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowSyncModal(false)}
                className="py-2.5 px-6 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Drawer Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer panel */}
          <aside className="absolute left-0 top-0 h-full w-[300px] sm:w-[340px] bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col shadow-2xl animate-slide-in-left">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Body ── */}
      <div className="flex-1 flex flex-row max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 gap-6">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex w-[360px] flex-col gap-4 shrink-0">
          {/* Desktop progress dashboard */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">সর্বমোট অগ্রগতি</span>
              <h2 className="text-2xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">
                {solvedProblemsCount} / {totalProblems} Solved
              </h2>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center font-bold text-sm">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="4" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-indigo-500" strokeWidth="4" fill="transparent"
                  strokeDasharray={175}
                  strokeDashoffset={175 - (175 * progressPercent) / 100}
                />
              </svg>
              <span className="absolute">{progressPercent}%</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex-1 flex flex-col max-h-[calc(100vh-220px)] overflow-y-auto">
            <SidebarContent />
          </div>
        </aside>

        {/* ── Content Area ── */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {!sheetUrl.trim() ? (
            <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center gap-4">
              <span className="text-4xl">☁️</span>
              <h3 className="text-lg font-bold">গুগল শিট কানেকশন প্রয়োজন</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                অ্যাপের ডাটা সরাসরি ক্লাউডে সেভ করার জন্য প্রথমে আপনার Google Apps Script URL-টি দিতে হবে। উপরে ডানদিকের মেঘ (☁️) আইকন বাটনে ক্লিক করে URL টি পেস্ট করুন।
              </p>
              <button
                onClick={() => setShowSyncModal(true)}
                className="mt-2 py-2 px-6 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Set App Script URL
              </button>
            </div>
          ) : initialLoading ? (
            <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">গুগল শিট থেকে প্রগ্রেস ডাটা লোড হচ্ছে...</p>
            </div>
          ) : selectedPattern ? (
            <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-3xl flex flex-col gap-6">
              {/* Pattern Header */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex-wrap">
                  <span>{selectedTopicName}</span>
                  <span>•</span>
                  <span>Pattern {selectedPattern.id}</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-1 text-zinc-900 dark:text-white">
                  {selectedPattern.name}
                </h2>
              </div>

              {/* Recognize / চিনবেন কীভাবে */}
              {selectedPattern.recognize && (
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-sm">
                  <h4 className="font-bold text-cyan-600 dark:text-cyan-400 mb-2 flex items-center gap-1.5">
                    🔎 চিনবেন কীভাবে:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {selectedPattern.recognize.split(',').map((item, idx) => (
                      <li key={idx}>
                        {item.trim()}
                      </li>
                    ))}
                  </ul>

                  {/* Examples from problems to understand the pattern */}
                  <div className="mt-4 pt-4 border-t border-cyan-500/10">
                    <h5 className="font-bold text-cyan-600 dark:text-cyan-400 mb-3 text-xs uppercase tracking-wider">
                      Example:
                    </h5>
                    <div className="flex flex-col gap-4">
                      {selectedPattern.recognize.split(',').map((clueItem, cIdx) => {
                        const trimmedClue = clueItem.trim();
                        const matchingProbs = getClueMatches(trimmedClue, selectedPattern!.problems);
                        if (matchingProbs.length === 0) return null;
                        
                        return (
                          <div key={cIdx} className="flex flex-col gap-1.5 pl-3 border-l-2 border-cyan-500/20">
                            <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                              {trimmedClue} :
                            </span>
                            <ol className="list-decimal pl-5 space-y-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              {matchingProbs.map((prob) => {
                                const desc = prob.statement!.split('\n')[0].trim();
                                return (
                                  <li key={prob.id} title={prob.name}>
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{prob.name}: </span>
                                    {desc}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Demo Section */}
              {selectedPattern.demoName && (
                <div className="flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-200">
                        Demo: {selectedPattern.demoName}
                      </h3>
                      {selectedPattern.demoStatement && (
                        <button
                          onClick={() => setDemoStatementOpen(!demoStatementOpen)}
                          className="text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
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
                        className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-indigo-500/5 px-2.5 py-1 rounded-full border border-indigo-500/10 self-start sm:self-auto"
                      >
                        LeetCode Link ↗
                      </a>
                    )}
                  </div>

                  {/* Demo Statement (expandable) */}
                  {demoStatementOpen && selectedPattern.demoStatement && (
                    <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                      <h4 className="font-bold text-violet-600 dark:text-violet-400 mb-3 flex items-center gap-1.5 text-sm">
                        📋 সমস্যার বিবরণ
                      </h4>
                      <StatementBox raw={selectedPattern.demoStatement} />
                    </div>
                  )}

                  {selectedPattern.approach && (
                    <div className="text-sm bg-zinc-100/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                      <strong className="text-zinc-800 dark:text-zinc-200 block mb-1">Approach:</strong>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {selectedPattern.approach}
                      </p>
                    </div>
                  )}

                  {selectedPattern.demoCode && (
                    <div className="relative group">
                      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => {
                            if (selectedPattern) {
                              navigator.clipboard.writeText(selectedPattern.demoCode);
                            }
                          }}
                          className="bg-zinc-800 text-white dark:bg-zinc-100 dark:text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:scale-105 transition-transform"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="bg-zinc-900 text-zinc-100 dark:bg-black border border-zinc-800 p-4 sm:p-5 rounded-2xl overflow-x-auto">
                        <code className="text-xs sm:text-sm font-mono block">
                          {selectedPattern.demoCode}
                        </code>
                      </pre>
                    </div>
                  )}

                  {selectedPattern.complexity && (
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <span className="bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40">
                        ⚡ Complexity: {selectedPattern.complexity}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Practice Problems */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 flex flex-col gap-4">
                <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  Practice Problems ({selectedPattern.problems.length})
                </h3>

                <div className="flex flex-col gap-3">
                  {selectedPattern.problems.map((problem) => {
                    const isSolved = solvedIds.includes(problem.id);
                    const note = notes[problem.id] || { solution: '', obstacle: '' };
                    const isExpanded = expandedProblemId === problem.id;

                    return (
                      <div
                        key={problem.id}
                        className={`border rounded-2xl transition-all ${
                          isSolved
                            ? 'bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/10'
                            : 'bg-zinc-100/30 border-zinc-200/60 dark:bg-zinc-900/30 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                          {/* Left: checkbox + name */}
                          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSolved}
                              onChange={() => toggleSolved(problem.id)}
                              className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                            />
                            <div className="min-w-0">
                              <a
                                href={problem.leetcodeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`font-semibold text-sm hover:underline flex items-center gap-1 ${
                                  isSolved ? 'text-zinc-500 line-through' : 'text-zinc-800 dark:text-zinc-200'
                                }`}
                              >
                                <span className="truncate">{problem.name}</span>
                                <span className="text-[10px] text-zinc-400 font-normal shrink-0">↗</span>
                              </a>
                              {problem.notesLabel && (
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block italic mt-0.5">
                                  {problem.notesLabel}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: badge + toggles */}
                          <div className="flex items-center gap-2 sm:gap-3 pl-8 sm:pl-0 shrink-0 flex-wrap justify-end">
                            {problem.isMustDo ? (
                              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/10 flex items-center gap-0.5">
                                🔥 Must-do
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                                ⚪ Bonus
                              </span>
                            )}

                            {problem.statement && (
                              <button
                                onClick={() => setExpandedStatementId(expandedStatementId === problem.id ? null : problem.id)}
                                className="text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
                              >
                                {expandedStatementId === problem.id ? '📋 ▲' : '📋 ▼'}
                              </button>
                            )}

                            <button
                              onClick={() => setExpandedProblemId(isExpanded ? null : problem.id)}
                              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-0.5 whitespace-nowrap"
                            >
                              {isExpanded ? 'Collapse ▲' : 'Notes ▼'}
                            </button>
                          </div>
                        </div>

                        {/* Inline Statement (expandable) */}
                        {expandedStatementId === problem.id && problem.statement && (
                          <div className="px-4 pb-4 border-t border-violet-200/40 dark:border-violet-800/30 pt-3 bg-violet-500/5 rounded-b-2xl">
                            <h4 className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3">📋 সমস্যার বিবরণ</h4>
                            <StatementBox raw={problem.statement} />
                          </div>
                        )}

                        {/* Expanded Notes Section */}
                        {isExpanded && (
                          <div className="px-4 pb-5 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-4 flex flex-col gap-4 bg-zinc-100/20 dark:bg-zinc-900/10 rounded-b-2xl">
                            <div>
                              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                                আমার সমাধান (মূল আইডিয়া ২–৩ লাইনে):
                              </label>
                              <textarea
                                value={note.solution}
                                onChange={(e) => handleNoteChange(problem.id, 'solution', e.target.value)}
                                placeholder="কোন আইডিয়া দিয়ে সলভ করেছেন বা মূল ট্রিক..."
                                className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all resize-y"
                                rows={2}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                                যে সমস্যা হয়েছিল (trap / edge cases):
                              </label>
                              <textarea
                                value={note.obstacle}
                                onChange={(e) => handleNoteChange(problem.id, 'obstacle', e.target.value)}
                                placeholder="কোন edge case বা লজিকাল ভুলের কারণে আটকেছিলেন..."
                                className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all resize-y"
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
            <div className="glass-panel p-8 rounded-3xl text-center text-zinc-500">
              কোনো প্যাটার্ন সিলেক্ট করা নেই।
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
