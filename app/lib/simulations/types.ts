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
 * A row of values with cursors over it — the shape most of the workbook needs:
 * two pointers, a sliding window, prefix sums, Kadane, hashing passes.
 */
export interface ArrayScene {
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
  /** Draw values as proportional bars rather than boxes. */
  asBars?: boolean;
  /** One line under the row, when the row alone does not say enough. */
  caption?: string;
}

/**
 * Every scene shape the renderers know. The union grows one member at a time,
 * each with a renderer of its own; a pattern whose shape is not here yet simply
 * has no simulation, which the panel handles by showing nothing.
 */
export type Scene = ArrayScene;

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
