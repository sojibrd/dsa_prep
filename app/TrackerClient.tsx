'use client';

import { useState, useEffect, useMemo } from 'react';
import { Topic, Pattern } from './utils/dsaParser';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProgress } from './hooks/useProgress';
import { buildClueMatches } from './lib/clueMatch';
import { getSimulation } from './lib/simulations';
import PatternPanel from './components/PatternPanel';
import PatternToc from './components/PatternToc';

interface TrackerClientProps {
  topics: Topic[];
}

/**
 * The workbook page: which pattern is on screen and which panels are open.
 *
 * The rail, the drawer and the search live in `Shell` (the layout), because
 * the progress route needs them too. The selected pattern is shared with the
 * rail through localStorage rather than props, so nothing has to be threaded
 * across the route boundary.
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

  const { solvedSet, reviseSet, notes, toggleSolved, toggleRevise, changeNote } = useProgress();

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
  // Sparse: most patterns have none yet, and those render nothing at all.
  const hasSimulation = Boolean(
    selectedPattern && getSimulation(selectedPattern.id) && selectedPattern.demoCode
  );

  // Read the pattern from the URL on arrival, and follow back/forward after.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const patternFromUrl = params.get('pattern');
    if (patternFromUrl) setSelectedPatternId(patternFromUrl);

    // Arriving with `#problem-…` means a search result sent us here.
    const hash = window.location.hash;
    if (hash.startsWith('#problem-')) {
      setTimeout(
        () =>
          document
            .getElementById(hash.slice(1))
            ?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
        150
      );
    }

    const handlePopState = () => {
      const pid = new URLSearchParams(window.location.search).get('pattern');
      if (pid) setSelectedPatternId(pid);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // Runs once: this reads the URL as it was on arrival and installs the
    // popstate listener. Re-running it on every pattern change would fight
    // the very state it sets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* A new pattern arrives with every panel the previous one had open still
     expanded, which is never what is wanted. Adjusted during render rather
     than in an effect: an effect would paint the new pattern once with the
     old pattern's panels open before closing them. */
  const [lastPatternId, setLastPatternId] = useState(selectedPatternId);
  if (lastPatternId !== selectedPatternId) {
    setLastPatternId(selectedPatternId);
    setDemoStatementOpen(false);
    setClueExamplesOpen(false);
    setExpandedStatementId(null);
    setExpandedProblemId(null);
  }

  return (
    <div className="flex justify-center gap-8 xl:gap-12 max-w-[1400px] w-full mx-auto p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-[1100px] min-w-0 flex flex-col gap-6">
        {selectedPattern ? (
          <PatternPanel
            pattern={selectedPattern}
            topicName={selectedTopicName}
            clueMatches={clueMatches}
            clueExamplesOpen={clueExamplesOpen}
            demoStatementOpen={demoStatementOpen}
            expandedProblemId={expandedProblemId}
            expandedStatementId={expandedStatementId}
            solvedSet={solvedSet}
            reviseSet={reviseSet}
            notes={notes}
            onToggleClueExamples={() => setClueExamplesOpen((open) => !open)}
            onToggleDemoStatement={() => setDemoStatementOpen((open) => !open)}
            onToggleSolved={toggleSolved}
            onToggleRevise={toggleRevise}
            onToggleNotes={(id) => setExpandedProblemId(expandedProblemId === id ? null : id)}
            onToggleStatement={(id) => setExpandedStatementId(expandedStatementId === id ? null : id)}
            onNoteChange={changeNote}
          />
        ) : (
          <div className="surface-panel t-caption p-8 text-center">
            কোনো প্যাটার্ন সিলেক্ট করা নেই।
          </div>
        )}
      </div>

      {selectedPattern && (
        <PatternToc
          pattern={selectedPattern}
          hasSimulation={hasSimulation}
          solvedSet={solvedSet}
        />
      )}
    </div>
  );
}
