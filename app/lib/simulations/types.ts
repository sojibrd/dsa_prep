/**
 * The simulation contract.
 *
 * A step describes STATE, never appearance. It names what the data looks like
 * at one moment of the demo run — which cells matter, where the pointers are,
 * what the variables hold — and a renderer decides how to draw it. Nothing in
 * a data file may mention a colour, a CSS class, or a coordinate: swapping a
 * renderer's internals (plain SVG today, a graph library tomorrow) must never
 * force a single step to be rewritten.
 */

/** How one cell reads at this moment. The names are MEANINGS, not colours. */
export type CellMark =
  /** the cell a pointer is sitting on right now */
  | 'active'
  /** already processed and settled */
  | 'done'
  /** ruled out — skipped, discarded, or failed a test */
  | 'reject'
  /** an accumulated quantity resting on top of the cell (trapped water, a running sum) */
  | 'fill';

/** A named cursor into the structure — `l`, `r`, `slow`, `fast`, `i`. */
export interface ScenePointer {
  /** Shown verbatim; use the identifier from the demo code so the two line up. */
  name: string;
  index: number;
}

/**
 * Side panels every scene may carry.
 *
 * They exist because half of the workbook's array patterns keep a SECOND
 * structure alongside the row — a `need` map, a `seen` map, a `Set`, a result
 * list. Bolting those onto one renderer would have made `ArrayScene` the only
 * scene that could ever have a hashmap; as a shared base, a matrix walk gets
 * its output list for free.
 */
interface SceneBase {
  /** A key→value companion: a hashmap, a frequency table, a Set (values omitted). */
  table?: {
    title: string;
    entries: { key: string; value?: string | number; mark?: CellMark }[];
    /** Shown in place of the entries when the structure is empty. */
    emptyLabel?: string;
  };
  /** What the run has produced so far — `res`, a collected order, an answer list. */
  output?: {
    title: string;
    values: (string | number)[];
  };
  /** One line under the scene, when the picture alone does not say enough. */
  caption?: string;
}

/**
 * A row of values with cursors over it — the shape most of the workbook needs:
 * two pointers, a sliding window, prefix sums, Kadane, hashing passes.
 */
export interface ArrayScene extends SceneBase {
  kind: 'array';
  values: (number | string)[];
  pointers?: ScenePointer[];
  /** An inclusive span under consideration (a sliding window, a search range). */
  window?: { from: number; to: number; label?: string };
  /** Sparse per-index meaning; absent indices are ordinary. */
  marks?: Record<number, CellMark>;
  /**
   * Height stacked on top of a cell, in the same unit as `values` — water above
   * a bar, a running total. Only meaningful with `asBars`.
   */
  fills?: Record<number, number>;
  /**
   * A second number carried under a cell — the running sum at that index, a DP
   * value. Printed as given, so a data file controls its own formatting.
   */
  subValues?: Record<number, string | number>;
  /** Label for the `subValues` row, e.g. "cur". */
  subLabel?: string;
  /** Draw values as proportional bars rather than boxes. */
  asBars?: boolean;
}

/** A 2D grid walked by row and column — spiral order, grid BFS, a DP table. */
export interface MatrixScene extends SceneBase {
  kind: 'matrix';
  values: (number | string)[][];
  /** The cell being read right now. */
  cursor?: { row: number; col: number };
  /** Sparse per-cell meaning, keyed `"row,col"`. */
  marks?: Record<string, CellMark>;
  /**
   * The live boundaries of a layer walk. Drawn as a frame around the region
   * still in play, which is the whole idea behind the spiral pattern.
   */
  bounds?: { top: number; bottom: number; left: number; right: number };
}

/**
 * Spans on a shared timeline — merge intervals, meeting rooms, scheduling.
 *
 * Not an array of pairs pretending to be scalars: the overlap between two
 * intervals is a geometric fact, and only laying them on one axis shows it.
 */
export interface IntervalsScene extends SceneBase {
  kind: 'intervals';
  intervals: { start: number; end: number; label?: string; mark?: CellMark }[];
  /** Which interval index the loop is on. */
  cursor?: number;
  /** The merged result so far, drawn on its own axis under the input. */
  result?: { start: number; end: number; mark?: CellMark }[];
  /** Axis range; defaults to the span of everything drawn. */
  axis?: { from: number; to: number };
}

/**
 * Every scene shape the renderers know. The union grows one member at a time,
 * each with a renderer of its own; a pattern whose shape is not here yet simply
 * has no simulation, which the panel handles by showing nothing.
 */
export type Scene = ArrayScene | MatrixScene | IntervalsScene;

/** One meaningful moment of the run — a loop iteration or a branch, not a statement. */
export interface SimStep {
  id: string;
  /** Short heading, e.g. "বাঁ দিক ছোট — l এগোবে". */
  title: string;
  /** What is happening, in plain Bangla. */
  whatHappens: string;
  /** Why this move is the right one — the reasoning worth remembering. */
  whyItMatters?: string;
  /** 1-based line numbers of `pattern.demoCode` that are executing now. */
  highlightLines?: number[];
  /** Live variable readout, in the order it should be shown. */
  vars?: { name: string; value: string | number }[];
  scene: Scene;
}

export interface PatternSimulation {
  /** Matches `Pattern.id`, e.g. "1.1". */
  patternId: string;
  /** The concrete input this run uses, shown once above the scene. */
  input: string;
  /** What the run produces, revealed at the end. */
  output: string;
  steps: SimStep[];
}
