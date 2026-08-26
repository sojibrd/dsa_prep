/* ============================================================================
   SIMULATION CONTRACT

   A simulation is a pattern's demo code run on one fixed input, sliced into
   steps you can play, pause and scrub through.

   The one rule that keeps this maintainable: a step's `scene` describes
   MEANING, never appearance. No coordinates, no colours, no CSS class names,
   no renderer types. A data file says "index 3 is active"; the theme decides
   what active looks like. That is what lets a renderer be rewritten without
   touching a single one of the fifty-odd trace files behind it.
   ========================================================================= */

/** How one cell reads at this moment. These names are MEANINGS, not colours. */
export type CellMark =
  | 'active' // a pointer is here right now
  | 'done' // processed, settled
  | 'reject' // skipped, discarded, failed
  | 'fill'; // an accumulated quantity — trapped water, a running sum

/** A named cursor into the structure — `l`, `r`, `slow`, `fast`, `i`. */
export interface ScenePointer {
  name: string;
  index: number;
}

/**
 * Side panels any scene may carry — a hashmap, a Set, the output built so
 * far. Shared here so a matrix walk (or a scene kind that does not exist yet)
 * gets them for free instead of every kind reinventing its own extra panel.
 */
interface SceneBase {
  table?: {
    title: string;
    entries: { key: string; value?: string | number; mark?: CellMark }[];
    emptyLabel?: string;
  };
  output?: {
    title: string;
    values: (string | number)[];
  };
  caption?: string;
}

/** A row of values with cursors over it — two pointers, sliding window. */
export interface ArrayScene extends SceneBase {
  kind: 'array';
  values: (number | string)[];
  pointers?: ScenePointer[];
  window?: { from: number; to: number; label?: string };
  marks?: Record<number, CellMark>;
  /** Height stacked on top of a cell (water above a bar). Needs `asBars`. */
  fills?: Record<number, number>;
  /** A second per-index value, e.g. Kadane's running `cur`. */
  subValues?: Record<number, string | number>;
  subLabel?: string;
  asBars?: boolean;
}

/** A 2D grid — spiral order, grid BFS, a DP table. */
export interface MatrixScene extends SceneBase {
  kind: 'matrix';
  values: (number | string)[][];
  cursor?: { row: number; col: number };
  /** Key is `"row,col"` — an object literal cannot hold a tuple key. */
  marks?: Record<string, CellMark>;
  bounds?: { top: number; bottom: number; left: number; right: number };
}

/** Spans on a shared timeline — merge intervals, meeting rooms. */
export interface IntervalsScene extends SceneBase {
  kind: 'intervals';
  intervals: { start: number; end: number; label?: string; mark?: CellMark }[];
  cursor?: number;
  result?: { start: number; end: number; mark?: CellMark }[];
  axis?: { from: number; to: number };
}

export type Scene = ArrayScene | MatrixScene | IntervalsScene;
/* Topic 3 adds `LinkedListScene`, topic 5 `TreeScene`, topic 8 `GraphScene`,
   topic 10 `TrieScene` — this union grows, nothing above it changes. */

export interface SimStep {
  id: string;
  title: string;
  whatHappens: string;
  whyItMatters?: string;
  /** 1-based line numbers of `pattern.demoCode` executing now. */
  highlightLines?: number[];
  vars?: { name: string; value: string | number }[];
  scene: Scene;
}

export interface PatternSimulation {
  /** Matches `Pattern.id`, e.g. "1.1". */
  patternId: string;
  input: string;
  output: string;
  steps: SimStep[];
}
