import type {
  CellMark,
  GraphEdgeData,
  PatternSimulation,
  SimStep,
} from '../types';

/* ============================================================================
   8.6 Dijkstra (Weighted Shortest Path) — Network Delay Time

   The demo code calls a `MinHeap` that the workbook's topic 6 was meant to
   define — and topic 6's source file is missing. The code is shown as-is
   (line numbers still refer to it); the heap is treated here as what it
   behaves like, a list of `[dist, node]` kept in ascending order, and its
   contents ride in the side table.
   ========================================================================= */

const NODE_IDS = ['1', '2', '3', '4'];
const SOURCE = '2';
const INF = '∞';

const EDGES = [
  { id: 'e21', from: '2', to: '1', weight: 1 },
  { id: 'e23', from: '2', to: '3', weight: 1 },
  { id: 'e34', from: '3', to: '4', weight: 1 },
];

interface Event {
  kind: 'pop' | 'relax';
  /** Node popped, or the edge's source. */
  u: string;
  /** Edge target, for `relax`. */
  v?: string;
  edgeId?: string;
  d: number;
  /** dist for nodes 1..4, `null` meaning infinity. */
  dist: (number | null)[];
  /** Heap after the event, as [dist, node] pairs. */
  heap: [number, string][];
  /** Nodes already popped (settled) after this event. */
  settled: string[];
}

/** Verified by running the demo code with the heap kept sorted. */
const EVENTS: Event[] = [
  { kind: 'pop', u: '2', d: 0, dist: [null, 0, null, null], heap: [], settled: ['2'] },
  { kind: 'relax', u: '2', v: '1', edgeId: 'e21', d: 0, dist: [1, 0, null, null], heap: [[1, '1']], settled: ['2'] },
  { kind: 'relax', u: '2', v: '3', edgeId: 'e23', d: 0, dist: [1, 0, 1, null], heap: [[1, '1'], [1, '3']], settled: ['2'] },
  { kind: 'pop', u: '1', d: 1, dist: [1, 0, 1, null], heap: [[1, '3']], settled: ['2', '1'] },
  { kind: 'pop', u: '3', d: 1, dist: [1, 0, 1, null], heap: [], settled: ['2', '1', '3'] },
  { kind: 'relax', u: '3', v: '4', edgeId: 'e34', d: 1, dist: [1, 0, 1, 2], heap: [[2, '4']], settled: ['2', '1', '3'] },
  { kind: 'pop', u: '4', d: 2, dist: [1, 0, 1, 2], heap: [], settled: ['2', '1', '3', '4'] },
];

const distLabel = (value: number | null) => (value === null ? INF : String(value));

function nodes(event: Event, activeId?: string) {
  return NODE_IDS.map((id, i) => ({
    id,
    label: id,
    mark: (id === activeId
      ? 'active'
      : event.settled.includes(id)
        ? 'done'
        : event.dist[i] !== null
          ? 'fill'
          : undefined) as CellMark | undefined,
    annotation: `d ${distLabel(event.dist[i])}`,
  }));
}

function edges(activeEdgeId?: string, used: string[] = []): GraphEdgeData[] {
  return EDGES.map((edge) => ({
    ...edge,
    directed: true,
    mark: (edge.id === activeEdgeId
      ? 'active'
      : used.includes(edge.id)
        ? 'done'
        : undefined) as CellMark | undefined,
  }));
}

function heapTable(heap: [number, string][]) {
  return {
    title: 'heap — [দূরত্ব, নোড]',
    entries: heap.map(([d, node], i) => ({
      key: `[${d},${node}]`,
      mark: (i === 0 ? 'active' : 'done') as CellMark,
    })),
    emptyLabel: 'খালি',
  };
}

function usedAt(index: number): string[] {
  return EVENTS.slice(0, index)
    .filter((event) => event.kind === 'relax')
    .map((event) => event.edgeId as string);
}

const steps: SimStep[] = [
  {
    id: '8.6-init',
    title: 'শুরু — উৎস 2, বাকি সবাই অসীম দূরে',
    whatHappens:
      '`dist[2] = 0`, বাকি সব `∞`। heap-এ একটাই এন্ট্রি: `[0, 2]`। edge: `2→1` (১), `2→3` (১), `3→4` (১)।',
    whyItMatters:
      'Dijkstra-র মূল প্রতিজ্ঞা: heap থেকে যে নোড **সবচেয়ে কম দূরত্ব নিয়ে বেরোয়, তার দূরত্ব চূড়ান্ত**। কারণ বাকি সব পথ ইতিমধ্যেই তার সমান বা বেশি খরচের, আর ওজনগুলো ঋণাত্মক নয় — তাই ঘুরপথে গিয়ে আরও সস্তা হওয়ার উপায় নেই। ঋণাত্মক ওজন থাকলে এই যুক্তি ভেঙে যায়, তখন Bellman-Ford লাগে।',
    highlightLines: [2, 3, 4, 5, 6, 7],
    vars: [
      { name: 'k (উৎস)', value: SOURCE },
      { name: 'dist', value: `[${INF},0,${INF},${INF}]` },
    ],
    scene: {
      kind: 'graph',
      nodes: NODE_IDS.map((id, i) => ({
        id,
        label: id,
        mark: (id === SOURCE ? 'active' : undefined) as CellMark | undefined,
        annotation: `d ${i === 1 ? '0' : INF}`,
      })),
      edges: edges(),
      table: heapTable([[0, SOURCE]]),
      caption: 'নোডের নিচে `d` = উৎস থেকে এ পর্যন্ত জানা সবচেয়ে কম দূরত্ব।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const base = {
      id: `8.6-${i + 1}`,
      vars: [
        { name: 'u', value: event.u },
        { name: 'd', value: event.d },
        { name: 'dist', value: `[${event.dist.map(distLabel).join(',')}]` },
      ],
    };

    if (event.kind === 'pop') {
      return {
        ...base,
        title: `heap থেকে নোড ${event.u} (দূরত্ব ${event.d}) — চূড়ান্ত`,
        whatHappens: `heap-এর সবচেয়ে ছোট এন্ট্রি \`[${event.d}, ${event.u}]\` বেরিয়ে এল। \`d\` আর \`dist[${event.u}]\` সমান, তাই এটা বাসি এন্ট্রি নয় — নোড ${event.u}-এর দূরত্ব এখন চূড়ান্ত।`,
        whyItMatters:
          i === 0
            ? undefined
            : i === 3
              ? '`if (d > dist[u]) continue` লাইনটা বাসি এন্ট্রি সামলায়। heap-এ একই নোড একাধিকবার থাকতে পারে (প্রতিবার dist কমলে নতুন এন্ট্রি ঢোকে); পুরনো, বড় দূরত্বের এন্ট্রিটা বেরোলে তাকে চুপচাপ ফেলে দেওয়া হয়। heap থেকে মুছে ফেলার চেয়ে এটা অনেক সহজ।'
              : undefined,
        highlightLines: [8, 9, 10],
        scene: {
          kind: 'graph',
          nodes: nodes(event, event.u),
          edges: edges(undefined, usedAt(i)),
          activeNodeId: event.u,
          table: heapTable(event.heap),
          caption: `নোড ${event.u} settled — সবুজ মানে আর বদলাবে না।`,
        },
      };
    }

    const target = Number(event.v) - 1;
    const before = EVENTS[i - 1].dist[target];
    return {
      ...base,
      title: `relax ${event.u} → ${event.v} — দূরত্ব ${distLabel(before)} থেকে ${event.dist[target]}`,
      whatHappens: `${event.u} থেকে ${event.v}-এ যেতে খরচ ${EDGES.find((e) => e.id === event.edgeId)?.weight}। মোট ${event.d} + ${EDGES.find((e) => e.id === event.edgeId)?.weight} = ${event.dist[target]}, যা আগের জানা ${distLabel(before)}-এর চেয়ে কম। তাই \`dist[${event.v}]\` আপডেট হলো আর \`[${event.dist[target]}, ${event.v}]\` heap-এ ঢুকল।`,
      whyItMatters:
        i === 1
          ? '"relax" মানে একটা টানটান অনুমান একটু ঢিল দেওয়া — জানা দূরত্বটা কমিয়ে আনা। শুধু কমলেই লেখা হয়, তাই dist কখনো বাড়ে না, একদিকেই নামে।'
          : undefined,
      highlightLines: [11, 12, 13, 14],
      scene: {
        kind: 'graph',
        nodes: nodes(event, event.u),
        edges: edges(event.edgeId, usedAt(i)),
        activeNodeId: event.u,
        activeEdgeId: event.edgeId,
        table: heapTable(event.heap),
        caption: `নতুন সেরা পথ পাওয়া গেল ${event.v}-এ।`,
      },
    };
  }),

  {
    id: '8.6-done',
    title: 'শেষ — সবচেয়ে দূরের নোড 2 ধাপ দূরে',
    whatHappens:
      'heap খালি। `dist = [1, 0, 1, 2]`। সবচেয়ে বড় মান 2, তাই সংকেত সবার কাছে পৌঁছাতে সময় লাগে `2`।',
    whyItMatters:
      'কোনো নোড অসীম দূরে থেকে গেলে উত্তর হতো `-1` — সেখানে পৌঁছানোই যায় না। খরচ O(E log V), কারণ প্রতিটা edge সর্বোচ্চ একবার heap-এ একটা এন্ট্রি ঢোকায়। "সব নোডের কাছে পৌঁছাতে কত সময়" প্রশ্নটা আসলে "সবচেয়ে দূরের সবচেয়ে-ছোট-পথ কত" — তাই max নেওয়া হয়।',
    highlightLines: [18, 19],
    vars: [{ name: 'উত্তর', value: 2 }],
    scene: {
      kind: 'graph',
      nodes: NODE_IDS.map((id, i) => ({
        id,
        label: id,
        mark: 'done' as CellMark,
        annotation: `d ${[1, 0, 1, 2][i]}`,
      })),
      edges: edges(undefined, ['e21', 'e23', 'e34']),
      output: { title: 'dist', values: ['1→1', '2→0', '3→1', '4→2'] },
      caption: 'সবচেয়ে দূরে নোড 4 — দুই ধাপ।',
    },
  },
];

export const dijkstraSim: PatternSimulation = {
  patternId: '8.6',
  input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2',
  output: '2',
  steps,
};
