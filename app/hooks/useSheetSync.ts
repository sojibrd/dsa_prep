'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PracticeProblem } from '../utils/dsaParser';
import { ProblemNote, SheetRow, SyncStatus } from '../types';

/**
 * How long typing must pause before a note is pushed to the sheet. Without
 * this every keystroke fired its own POST, and Apps Script answers far slower
 * than a person types — the queue only ever grew.
 */
const NOTE_SYNC_DEBOUNCE_MS = 900;

interface UseSheetSyncArgs {
  sheetUrl: string;
  allProblems: PracticeProblem[];
  problemsById: Map<string, PracticeProblem>;
}

/**
 * Owns everything the Google Sheet touches: the initial load, the per-row
 * push, the debounce, and how many pushes are in flight.
 *
 * The tracker itself only says WHAT changed; when and how it reaches the
 * sheet is entirely this hook's business.
 */
export function useSheetSync({ sheetUrl, allProblems, problemsById }: UseSheetSyncArgs) {
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, ProblemNote>>({});
  const [initialLoading, setInitialLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);

  const solvedCount = useMemo(
    () => solvedIds.reduce((n, id) => (problemsById.has(id) ? n + 1 : n), 0),
    [solvedIds, problemsById]
  );

  // --- Initial load ------------------------------------------------------

  useEffect(() => {
    if (!sheetUrl.trim()) return;

    const loadData = async () => {
      setInitialLoading(true);
      try {
        const res = await fetch(sheetUrl, { method: 'GET', mode: 'cors' });
        const resData = await res.json();

        // A new/empty sheet gets the problem list written into it once.
        if (resData.status === 'success' && resData.isNew) {
          const initPayload = {
            action: 'init_sheet',
            problems: allProblems.map((prob) => ({
              id: prob.id,
              name: prob.name,
              solved: false,
              noteIdea: '',
              noteObstacle: '',
            })),
          };
          await fetch(sheetUrl, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(initPayload),
          });
          setSolvedIds([]);
          setNotes({});
        } else if (resData.status === 'success' && Array.isArray(resData.data)) {
          const restoredSolvedIds: string[] = [];
          const restoredNotes: Record<string, ProblemNote> = {};

          resData.data.forEach((item: SheetRow) => {
            if (item.solved) restoredSolvedIds.push(item.id);
            if (item.noteIdea || item.noteObstacle) {
              restoredNotes[item.id] = {
                solution: item.noteIdea || '',
                obstacle: item.noteObstacle || '',
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
          message:
            'গুগল শিট থেকে ডাটা লোড হয়নি। এই অবস্থায় টিক দিলে শিটের ডাটা মুছে যেতে পারে — আগে কানেকশন ঠিক করুন।',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    void loadData();
  }, [sheetUrl, allProblems]);

  // --- Pushing rows ------------------------------------------------------

  /**
   * How many pushes are in flight. A single boolean could not describe N
   * overlapping requests: whichever finished first cleared it while the rest
   * were still running, so the indicator lied.
   */
  const inFlightRef = useRef(0);

  /** One pending debounce timer per problem id. */
  const pendingSyncRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const syncRowToCloud = useCallback(
    async (problemId: string, isSolved: boolean, note: ProblemNote) => {
      if (!sheetUrl.trim()) return;

      const problemObj = problemsById.get(problemId);
      if (!problemObj) return;

      inFlightRef.current += 1;
      setSyncing(true);

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
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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
        if (inFlightRef.current === 0) setSyncing(false);
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

  // --- What the tracker calls -------------------------------------------

  const toggleSolved = useCallback(
    (id: string) => {
      const willBeSolved = !solvedSet.has(id);
      setSolvedIds((prev) => (willBeSolved ? [...prev, id] : prev.filter((x) => x !== id)));

      // A tick is one deliberate act — push it straight away.
      queueRowSync(id, willBeSolved, notes[id] || { solution: '', obstacle: '' }, true);
    },
    [solvedSet, notes, queueRowSync]
  );

  const changeNote = useCallback(
    (problemId: string, field: keyof ProblemNote, value: string) => {
      const updated = {
        ...(notes[problemId] || { solution: '', obstacle: '' }),
        [field]: value,
      };
      setNotes((prev) => ({ ...prev, [problemId]: updated }));

      // Typing is a stream — wait for the pause, then push once.
      queueRowSync(problemId, solvedSet.has(problemId), updated);
    },
    [notes, solvedSet, queueRowSync]
  );

  return {
    solvedSet,
    solvedCount,
    notes,
    initialLoading,
    syncing,
    syncStatus,
    setSyncStatus,
    toggleSolved,
    changeNote,
  };
}
