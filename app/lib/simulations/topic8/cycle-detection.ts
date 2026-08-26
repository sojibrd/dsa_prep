import type {
  CellMark,
  GraphEdgeData,
  PatternSimulation,
  SimStep,
} from '../types';

/* ============================================================================
   8.2 Cycle Detection (Directed) — Course Schedule

   The workbook's own 2-node example is too small to show anything, so this
   uses a 4-node graph with a genuine cycle: 0 → 1 → 2 → 3 → 1.

   Direction warning worth keeping straight: `prerequisites = [a, b]` means
   "a needs b", and the code builds `adj[b].push(a)` — the edge runs from the
   dependency TO the dependent. That is the direction DFS walks.
   ========================================================================= */

const NODE_IDS = ['0', '1', '2', '3'];

/** adj = [[1],[2],[3],[1]] — one edge out of each node. */
const EDGES: { id: string; from: string; to: string }[] = [
  { id: 'e0', from: '0', to: '1' },
  { id: 'e1', from: '1', to: '2' },
  { id: 'e2', from: '2', to: '3' },
  { id: 'e3', from: '3', to: '1' },
];

type Kind = 'enter' | 'edge' | 'cycle';

interface Event {
  kind: Kind;
  /** Node entered, or the edge's source. */
  u: string;
  /** Edge target, for `edge` and `cycle`. */
  v?: string;
  edgeId?: string;
  /** `state` after the event: 0 new, 1 visiting, 2 done. */
  state: number[];
}

/** Verified by running the demo code and logging every call. */
const EVENTS: Event[] = [
  { kind: 'enter', u: '0', state: [1, 0, 0, 0] },
  { kind: 'edge', u: '0', v: '1', edgeId: 'e0', state: [1, 0, 0, 0] },
  { kind: 'enter', u: '1', state: [1, 1, 0, 0] },
  { kind: 'edge', u: '1', v: '2', edgeId: 'e1', state: [1, 1, 0, 0] },
  { kind: 'enter', u: '2', state: [1, 1, 1, 0] },
  { kind: 'edge', u: '2', v: '3', edgeId: 'e2', state: [1, 1, 1, 0] },
  { kind: 'enter', u: '3', state: [1, 1, 1, 1] },
  { kind: 'edge', u: '3', v: '1', edgeId: 'e3', state: [1, 1, 1, 1] },
  { kind: 'cycle', u: '3', v: '1', edgeId: 'e3', state: [1, 1, 1, 1] },
];

const STATE_NAME = ['new', 'visiting', 'done'];

/** state 1 (on the live path) is amber; state 2 (finished) is green. */
function nodes(state: number[], activeId?: string, conflictId?: string) {
  return NODE_IDS.map((id, i) => ({
    id,
    label: id,
    mark: (id === conflictId
      ? 'reject'
      : id === activeId
        ? 'active'
        : state[i] === 1
          ? 'active'
          : state[i] === 2
            ? 'done'
            : undefined) as CellMark | undefined,
    annotation: STATE_NAME[state[i]],
  }));
}

function edges(activeEdgeId?: string, walked: string[] = []): GraphEdgeData[] {
  return EDGES.map((edge) => ({
    ...edge,
    directed: true,
    mark: (edge.id === activeEdgeId
      ? 'active'
      : walked.includes(edge.id)
        ? 'done'
        : undefined) as CellMark | undefined,
  }));
}

/** Edges already traversed at or before event `index`. */
function walkedAt(index: number): string[] {
  return EVENTS.slice(0, index)
    .filter((event) => event.kind === 'edge')
    .map((event) => event.edgeId as string);
}

const steps: SimStep[] = [
  {
    id: '8.2-init',
    title: 'শুরু — সব নোড new',
    whatHappens:
      '`prerequisites = [[1,0],[2,1],[3,2],[1,3]]` থেকে adjacency তৈরি: `0→1`, `1→2`, `2→3`, `3→1`। `state` সব 0 — অর্থাৎ কোথাও যাওয়া হয়নি।',
    whyItMatters:
      'তিনটে অবস্থা কেন, দুটো নয়? সাধারণ visited/unvisited দিয়ে **directed** গ্রাফে cycle ধরা যায় না। একটা নোড আগে দেখা হয়েছে মানেই সে এখন আমার পথে আছে তা নয় — সে অন্য কোনো শাখায় দেখা হয়ে শেষও হয়ে যেতে পারে। তাই "চলতি পথে আছি" (visiting) আর "শেষ" (done) আলাদা রাখতে হয়।',
    highlightLines: [2, 3, 4],
    vars: [{ name: 'state', value: '[0,0,0,0]' }],
    scene: {
      kind: 'graph',
      nodes: nodes([0, 0, 0, 0]),
      edges: edges(),
      caption: '[a,b] মানে "a করতে b লাগে" — তাই তীর b থেকে a-এর দিকে।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const base = {
      id: `8.2-${i + 1}`,
      vars: [
        { name: 'u', value: event.u },
        { name: 'state', value: `[${event.state.join(',')}]` },
      ],
    };

    if (event.kind === 'enter') {
      return {
        ...base,
        title: `নোড ${event.u}-এ ঢোকা — visiting`,
        whatHappens: `\`state[${event.u}]\` ছিল 0 (new), তাই 1 (visiting) করা হলো — মানে এই নোড এখন চলতি recursion পথের উপর।`,
        whyItMatters:
          i === 0
            ? undefined
            : i === 6
              ? 'চারটে নোডই এখন visiting — গোটা পথটা সক্রিয়। পরের edge কোথায় যায়, সেটাই সব ঠিক করবে।'
              : undefined,
        highlightLines: [5, 6, 7, 8],
        scene: {
          kind: 'graph',
          nodes: nodes(event.state, event.u),
          edges: edges(undefined, walkedAt(i)),
          activeNodeId: event.u,
          caption: 'amber = চলতি পথে; সবুজ হলে বোঝা যেত শাখাটা নিরাপদে শেষ হয়েছে।',
        },
      };
    }

    if (event.kind === 'edge') {
      return {
        ...base,
        title: `edge ${event.u} → ${event.v}`,
        whatHappens: `\`adj[${event.u}]\`-এ আছে ${event.v}, তাই সেখানে recurse করা হচ্ছে।`,
        whyItMatters:
          i === 7
            ? 'এই edge-টাই ফাঁদ। 3 থেকে 1-এ যাওয়া মানে আমরা এমন একটা নোডে ফিরছি যেটা এই পথেরই অংশ — পেছনের দিকে একটা তীর।'
            : undefined,
        highlightLines: [9],
        scene: {
          kind: 'graph',
          nodes: nodes(event.state, event.u),
          edges: edges(event.edgeId, walkedAt(i)),
          activeNodeId: event.u,
          activeEdgeId: event.edgeId,
          caption: `${event.u} থেকে ${event.v}-এর দিকে নামা।`,
        },
      };
    }

    return {
      ...base,
      title: `cycle পাওয়া গেল — ${event.v} ইতিমধ্যেই visiting`,
      whatHappens: `\`state[${event.v}] === 1\` — অর্থাৎ ${event.v} এখনো চলতি পথের উপরেই আছে, শেষ হয়নি। এটাই back edge, এটাই cycle। \`true\` ফেরত গেল, আর মূল ফাংশন \`false\` রিটার্ন করল।`,
      whyItMatters:
        'পথটা 1 → 2 → 3 → 1। কোর্সের ভাষায়: 1-এর জন্য 3 লাগে, 3-এর জন্য 2, 2-এর জন্য 1 — অর্থাৎ 1-এর জন্য শেষমেশ 1-ই লাগে। এই কোর্সগুলো কখনো শেষ করা সম্ভব নয়, তাই উত্তর `false`।',
      highlightLines: [6, 13],
      scene: {
        kind: 'graph',
        nodes: nodes(event.state, undefined, event.v),
        edges: edges(event.edgeId, walkedAt(i)),
        activeEdgeId: event.edgeId,
        caption: `${event.v} লাল — সে চলতি পথেই আছে, তাই এটা back edge।`,
      },
    };
  }),

  {
    id: '8.2-done',
    title: 'শেষ — কোর্স শেষ করা অসম্ভব',
    whatHappens: 'উত্তর `false` — গ্রাফে cycle আছে।',
    whyItMatters:
      'প্রতিটা নোড ও edge একবার করে — O(V + E)। মনে রাখার মতো নিয়ম: **undirected** গ্রাফে cycle খুঁজতে শুধু visited যথেষ্ট (parent বাদে); **directed** গ্রাফে তিন অবস্থা লাগে, কারণ সেখানে "আগে দেখেছি" আর "এখনো এই পথেই আছি" এক কথা নয়।',
    highlightLines: [13, 14],
    vars: [{ name: 'canFinish', value: 'false' }],
    scene: {
      kind: 'graph',
      nodes: nodes([1, 1, 1, 1], undefined, '1'),
      edges: edges('e3', ['e0', 'e1', 'e2']),
      output: { title: 'cycle', values: ['1 → 2 → 3 → 1'] },
      caption: 'তিনটে কোর্স একে অন্যের উপর নির্ভরশীল — চক্র।',
    },
  },
];

export const cycleDetectionSim: PatternSimulation = {
  patternId: '8.2',
  input: 'numCourses = 4, prerequisites = [[1,0],[2,1],[3,2],[1,3]]',
  output: 'false',
  steps,
};
