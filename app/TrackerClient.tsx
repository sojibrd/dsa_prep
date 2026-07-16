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

export default function TrackerClient({ topics }: TrackerClientProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string>('1.1');
  const [solvedIds, setSolvedIds] = useLocalStorage<string[]>('dsa_solved_ids', []);
  const [notes, setNotes] = useLocalStorage<Record<string, ProblemNote>>('dsa_problem_notes', {});
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('dsa_dark_mode', false);
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

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
    if (solvedIds.includes(id)) {
      setSolvedIds(solvedIds.filter((x) => x !== id));
    } else {
      setSolvedIds([...solvedIds, id]);
    }
  };

  const handleNoteChange = (problemId: string, field: keyof ProblemNote, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [problemId]: {
        ...((prev && prev[problemId]) || { solution: '', obstacle: '' }),
        [field]: value,
      },
    }));
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
          {selectedPattern ? (
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
                  <h4 className="font-bold text-cyan-600 dark:text-cyan-400 mb-1 flex items-center gap-1.5">
                    🔎 চিনবেন কীভাবে:
                  </h4>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {selectedPattern.recognize}
                  </p>
                </div>
              )}

              {/* Demo Section */}
              {selectedPattern.demoName && (
                <div className="flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-200">
                      Demo: {selectedPattern.demoName}
                    </h3>
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

                          {/* Right: badge + notes toggle */}
                          <div className="flex items-center gap-2 sm:gap-3 pl-8 sm:pl-0 shrink-0">
                            {problem.isMustDo ? (
                              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/10 flex items-center gap-0.5">
                                🔥 Must-do
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                                ⚪ Bonus
                              </span>
                            )}

                            <button
                              onClick={() => setExpandedProblemId(isExpanded ? null : problem.id)}
                              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-0.5 whitespace-nowrap"
                            >
                              {isExpanded ? 'Collapse ▲' : 'Notes ▼'}
                            </button>
                          </div>
                        </div>

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
