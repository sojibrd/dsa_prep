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
  /**
   * Named 2D cursors — interval DP's l/r/k triple, say. Additive to `cursor`,
   * which stays for the common case of one unnamed position.
   */
  pointers?: { name: string; row: number; col: number }[];
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

/** A single node in a linked list scene. */
export interface LinkedListNode {
  id: string;
  val: string | number;
  /** The `id` of the next node, or `null`/omitted for the tail. */
  nextId?: string | null;
  mark?: CellMark;
}

/**
 * A chain of nodes joined by pointers — traversal, reversal, merge, cycle.
 *
 * `nodes` is a LAYOUT order (left to right on screen), not the chain order.
 * The two agree while a list is intact and deliberately disagree mid
 * reversal, which is the whole point: the renderer reads each node's real
 * `nextId`, so a link that jumps backwards is drawn as a jump rather than
 * quietly redrawn as a tidy left-to-right chain that no longer exists.
 */
export interface LinkedListScene extends SceneBase {
  kind: 'linked-list';
  nodes: LinkedListNode[];
  /** Named cursors sitting on a node, identified by `nodeId`. */
  pointers?: { name: string; nodeId: string }[];
  /** An optional dummy/sentinel shown at the head of the chain. */
  dummy?: { id: string; val: string | number; nextId?: string | null };
  /** If the list has a cycle, the `id` the tail connects back to. */
  cycleTargetId?: string;
}

export interface TreeNodeData {
  id: string;
  val: string | number;
  leftId?: string | null;
  rightId?: string | null;
  mark?: CellMark;
  /** Small text under the node — a computed gain, a range, a subtotal. */
  annotation?: string;
}

/**
 * A binary tree — traversal, construction, path sum, validation, LCA.
 *
 * Layout is COMPUTED by the renderer (in-order for x, depth for y), never
 * supplied here. A data file that carried `{x, y}` would be encoding one
 * renderer's geometry into fifty trace files; deriving it instead keeps the
 * contract's rule intact and makes a partially-built tree lay itself out for
 * free, which 5.2 depends on.
 */
export interface TreeScene extends SceneBase {
  kind: 'tree';
  nodes: TreeNodeData[];
  /** Omit and the renderer finds it: the node no one lists as a child. */
  rootId?: string;
  activeNodeId?: string;
  /** Root→node path to light up — typically the live recursion stack. */
  highlightPath?: string[];
  pointers?: { name: string; nodeId: string }[];
}

/** A single node in a graph scene. */
export interface GraphNodeData {
  id: string;
  label: string | number;
  mark?: CellMark;
  /** Shown under the node — a distance, a colour, an indegree count. */
  annotation?: string;
}

/** A single edge in a graph scene. */
export interface GraphEdgeData {
  id: string;
  from: string;
  to: string;
  /** Omit for undirected; present for directed (arrowhead drawn at `to`). */
  directed?: boolean;
  weight?: number | string;
  mark?: CellMark;
}

/**
 * A node-link graph — cycle detection, topological sort, shortest path, MST.
 *
 * `TreeScene` cannot stand in: it is strictly binary, rooted, and assumes no
 * cycles — three assumptions a graph breaks on purpose. The drawing strategy
 * is the same though: plain SVG and a computed layout. Nodes sit on a circle
 * at equal angles in array order, so a data file still never places anything
 * itself, and the demo graphs here (never more than seven nodes) read clearly
 * without pan, zoom, or a force-directed library.
 */
export interface GraphScene extends SceneBase {
  kind: 'graph';
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  activeNodeId?: string;
  activeEdgeId?: string;
  /** Named cursors standing on nodes — e.g. Dijkstra's freshly popped node. */
  pointers?: { name: string; nodeId: string }[];
}

export type Scene =
  | ArrayScene
  | MatrixScene
  | IntervalsScene
  | LinkedListScene
  | TreeScene
  | GraphScene;
/* Topic 10 adds `TrieScene` — this union grows, nothing above it changes. */

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
