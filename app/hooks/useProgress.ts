'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { ProblemNote } from '../types';

/* Storage keys. Progress used to live in a Google Sheet behind an Apps
   Script URL; it lives in the browser now, which is what lets a second
   route read it without paying for a second fetch. */
export const SOLVED_KEY = 'dsa_solved_ids';
export const REVISE_KEY = 'dsa_revise_ids';
export const NOTES_KEY = 'dsa_notes';

/** A note counts as written only once something is actually in it. */
export function hasNote(note?: ProblemNote): boolean {
  return Boolean(note?.solution?.trim() || note?.obstacle?.trim());
}

const EMPTY_NOTE: ProblemNote = { solution: '', obstacle: '' };

/**
 * Every piece of per-problem state, from one place.
 *
 * `useLocalStorage` shares a snapshot per key across instances, so the rail,
 * the pattern panel and the progress page all read the same numbers without
 * anything being threaded through props.
 */
export function useProgress() {
  const [solvedIds, setSolvedIds] = useLocalStorage<string[]>(SOLVED_KEY, []);
  const [reviseIds, setReviseIds] = useLocalStorage<string[]>(REVISE_KEY, []);
  const [notes, setNotes] = useLocalStorage<Record<string, ProblemNote>>(NOTES_KEY, {});

  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);
  const reviseSet = useMemo(() => new Set(reviseIds), [reviseIds]);

  const toggleSolved = useCallback(
    (id: string) =>
      setSolvedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setSolvedIds]
  );

  const toggleRevise = useCallback(
    (id: string) =>
      setReviseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setReviseIds]
  );

  const changeNote = useCallback(
    (id: string, field: keyof ProblemNote, value: string) =>
      setNotes((prev) => ({ ...prev, [id]: { ...EMPTY_NOTE, ...prev[id], [field]: value } })),
    [setNotes]
  );

  return {
    solvedSet,
    reviseSet,
    notes,
    solvedCount: solvedSet.size,
    toggleSolved,
    toggleRevise,
    changeNote,
    setSolvedIds,
    setReviseIds,
    setNotes,
  };
}
