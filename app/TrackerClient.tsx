'use client';

import { useState, useEffect, useMemo } from 'react';
import { Topic, Pattern, PracticeProblem } from './utils/dsaParser';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSheetSync } from './hooks/useSheetSync';
import { buildClueMatches } from './lib/clueMatch';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SyncModal from './components/SyncModal';
import PatternPanel from './components/PatternPanel';

interface TrackerClientProps {
  topics: Topic[];
}

/**
 * The tracker shell: which pattern is on screen, which panels are open, and
 * where each piece of the page goes.
 *
 * It deliberately holds no sheet logic and no markup beyond composition —
 * `useSheetSync` owns the cloud, and the components own their own looks.
 */
export default function TrackerClient({ topics }: TrackerClientProps) {
  const [selectedPatternId, setSelectedPatternId] = useLocalStorage<string>(
    'dsa_selected_pattern_id',
    '1.1'
  );

  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);
  const [expandedStatementId, setExpandedStatementId] = useState<string | null>(null);
  const [demoStatementOpen, setDemoStatementOpen] = useState(false);
  // The clue examples are first-visit material, not every-visit material, so
  // they stay folded away until asked for.
  const [clueExamplesOpen, setClueExamplesOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const [sheetUrl, setSheetUrl] = useLocalStorage<string>('dsa_sheet_script_url', '');

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

  const {
    solvedSet,
    solvedCount,
    notes,
    initialLoading,
    syncing,
    syncStatus,
    setSyncStatus,
    toggleSolved,
    changeNote,
  } = useSheetSync({ sheetUrl, allProblems, problemsById });

  const totalProblems = allProblems.length;
  const progressPercent = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Per-topic and per-pattern counters for the drawer, computed in one pass
  // instead of re-scanning every problem for every row on every render.
  const { byTopic, byPattern } = useMemo(() => {
    const topicCounts = new Map<number, { solved: number; total: number }>();
    const patternCounts = new Map<string, { solved: number; total: number }>();

    topics.forEach((topic) => {
      let topicSolved = 0;
      let topicTotal = 0;

      topic.patterns.forEach((pattern) => {
        let patternSolved = 0;
        pattern.problems.forEach((prob) => {
          if (solvedSet.has(prob.id)) patternSolved++;
        });
        patternCounts.set(pattern.id, { solved: patternSolved, total: pattern.problems.length });
        topicSolved += patternSolved;
        topicTotal += pattern.problems.length;
      });

      topicCounts.set(topic.id, { solved: topicSolved, total: topicTotal });
    });

    return { byTopic: topicCounts, byPattern: patternCounts };
  }, [topics, solvedSet]);

  // Which pattern is on screen, and the topic it belongs to. Falls back to
  // the very first pattern when the stored id names one that no longer exists.
  const { selectedPattern, selectedTopicName } = useMemo(() => {
    let pattern: Pattern | null = null;
    let topicName = '';

    topics.forEach((t) => {
      if (pattern) return;
      const found = t.patterns.find((p) => p.id === selectedPatternId);
      if (found) {
        pattern = found;
        topicName = t.name;
      }
    });

    if (!pattern && topics.length > 0 && topics[0].patterns.length > 0) {
      pattern = topics[0].patterns[0];
      topicName = topics[0].name;
    }

    return { selectedPattern: pattern as Pattern | null, selectedTopicName: topicName };
  }, [topics, selectedPatternId]);

  const clueMatches = useMemo(() => buildClueMatches(selectedPattern), [selectedPattern]);

  /** Fold every panel the previous pattern had open. */
  const collapseAllPanels = () => {
    setDemoStatementOpen(false);
    setClueExamplesOpen(false);
    setExpandedStatementId(null);
    setExpandedProblemId(null);
  };

  // Read the pattern from the URL on arrival, and follow back/forward after.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const patternFromUrl = params.get('pattern');
    if (patternFromUrl) setSelectedPatternId(patternFromUrl);

    const handlePopState = () => {
      const pid = new URLSearchParams(window.location.search).get('pattern');
      if (pid) {
        setSelectedPatternId(pid);
        collapseAllPanels();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // Runs once: this reads the URL as it was on arrival and installs the
    // popstate listener. Re-running it on every pattern change would fight
    // the very state it sets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The drawer covers the page; the page behind it must not scroll.
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // With the drawer open, bring the active pattern into view.
  useEffect(() => {
    if (!sidebarOpen) return;
    const timer = setTimeout(() => {
      document
        .getElementById(`pattern-btn-${selectedPatternId}`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [sidebarOpen, selectedPatternId]);

  const handlePatternSelect = (patternId: string) => {
    setSelectedPatternId(patternId);
    setSidebarOpen(false);
    collapseAllPanels();

    const url = new URL(window.location.href);
    url.searchParams.set('pattern', patternId);
    window.history.pushState(null, '', url.toString());
  };

  return (
    <div className="surface-app min-h-screen flex flex-col">
      <Navbar
        solved={solvedCount}
        total={totalProblems}
        percent={progressPercent}
        syncing={syncing}
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenSyncSettings={() => setShowSyncModal(true)}
      />

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

      {showSyncModal && (
        <SyncModal
          sheetUrl={sheetUrl}
          onChange={setSheetUrl}
          onClose={() => setShowSyncModal(false)}
        />
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 z-50" aria-modal="true">
          <div className="overlay absolute inset-0" onClick={() => setSidebarOpen(false)} />
          <aside className="surface-panel absolute left-0 top-0 h-full w-[300px] sm:w-[360px] flex flex-col animate-slide-in-left">
            <Sidebar
              topics={topics}
              selectedPatternId={selectedPatternId}
              byTopic={byTopic}
              byPattern={byPattern}
              onSelect={handlePatternSelect}
              onClose={() => setSidebarOpen(false)}
              solvedCount={solvedCount}
              totalProblems={totalProblems}
              progressPercent={progressPercent}
            />
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col gap-6 max-w-[1100px] w-full mx-auto p-4 md:p-6 lg:p-8">
        {!sheetUrl.trim() ? (
          <div className="surface-panel p-8 text-center flex flex-col items-center justify-center gap-4">
            <span className="text-4xl">☁️</span>
            <h3 className="t-title text-lg">গুগল শিট কানেকশন প্রয়োজন</h3>
            <p className="t-body measure text-sm">
              অ্যাপের ডাটা সরাসরি ক্লাউডে সেভ করার জন্য প্রথমে আপনার Google Apps Script URL-টি দিতে
              হবে। উপরে ডানদিকের মেঘ (☁️) আইকন বাটনে ক্লিক করে URL টি পেস্ট করুন।
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
          <PatternPanel
            pattern={selectedPattern}
            topicName={selectedTopicName}
            clueMatches={clueMatches}
            clueExamplesOpen={clueExamplesOpen}
            demoStatementOpen={demoStatementOpen}
            expandedProblemId={expandedProblemId}
            expandedStatementId={expandedStatementId}
            solvedSet={solvedSet}
            notes={notes}
            onToggleClueExamples={() => setClueExamplesOpen((open) => !open)}
            onToggleDemoStatement={() => setDemoStatementOpen((open) => !open)}
            onToggleSolved={toggleSolved}
            onToggleNotes={(id) => setExpandedProblemId(expandedProblemId === id ? null : id)}
            onToggleStatement={(id) => setExpandedStatementId(expandedStatementId === id ? null : id)}
            onNoteChange={changeNote}
          />
        ) : (
          <div className="surface-panel t-caption p-8 text-center">
            কোনো প্যাটার্ন সিলেক্ট করা নেই।
          </div>
        )}
      </main>
    </div>
  );
}
