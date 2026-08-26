import type {
  CellMark,
  GraphEdgeData,
  PatternSimulation,
  SimStep,
} from '../types';

/* ============================================================================
   8.7 Minimum Spanning Tree — Min Cost to Connect All Points (Prim's)

   Three points instead of the workbook's five, so every distance update is
   worth a step. Different input, so a different answer: 13, not 20.
   ========================================================================= */

const POINTS: [number, number][] = [
  [0, 0],
  [2, 2],
  [3, 10],
];

const NODE_IDS = ['0', '1', '2'];
const INF = '∞';

/** Every pair, since Prim's on points treats the graph as complete. */
const EDGES = [
  { id: 'e01', from: '0', to: '1', weight: 4 },
  { id: 'e02', from: '0', to: '2', weight: 13 },
  { id: 'e12', from: '1', to: '2', weight: 9 },
];

interface Event {
  kind: 'add' | 'update';
  /** Node added to the MST, or the source of a distance update. */
  u: string;
  v?: string;
  edgeId?: string;
  /** Manhattan distance measured, for `update`. */
  measured?: number;
  dist: (number | null)[];
  inMST: string[];
  total: number;
  /** Edge that actually joined the MST, for `add`. */
  joinedEdgeId?: string;
}

/** Verified by running the demo code and logging every step of the outer loop. */
const EVENTS: Event[] = [
  { kind: 'add', u: '0', dist: [0, null, null], inMST: ['0'], total: 0 },
  { kind: 'update', u: '0', v: '1', edgeId: 'e01', measured: 4, dist: [0, 4, null], inMST: ['0'], total: 0 },
  { kind: 'update', u: '0', v: '2', edgeId: 'e02', measured: 13, dist: [0, 4, 13], inMST: ['0'], total: 0 },
  { kind: 'add', u: '1', dist: [0, 4, 13], inMST: ['0', '1'], total: 4, joinedEdgeId: 'e01' },
  { kind: 'update', u: '1', v: '2', edgeId: 'e12', measured: 9, dist: [0, 4, 9], inMST: ['0', '1'], total: 4 },
  { kind: 'add', u: '2', dist: [0, 4, 9], inMST: ['0', '1', '2'], total: 13, joinedEdgeId: 'e12' },
];

const distLabel = (value: number | null) => (value === null ? INF : String(value));

function nodes(event: Event, activeId?: string) {
  return NODE_IDS.map((id, i) => ({
    id,
    label: `${id}·(${POINTS[i][0]},${POINTS[i][1]})`,
    mark: (id === activeId
      ? 'active'
      : event.inMST.includes(id)
        ? 'done'
        : event.dist[i] !== null
          ? 'fill'
          : undefined) as CellMark | undefined,
    annotation: `খরচ ${distLabel(event.dist[i])}`,
  }));
}

/** Edges chosen into the MST at or before event `index`. */
function chosenAt(index: number): string[] {
  return EVENTS.slice(0, index + 1)
    .filter((event) => event.kind === 'add' && event.joinedEdgeId)
    .map((event) => event.joinedEdgeId as string);
}

function edges(activeEdgeId: string | undefined, chosen: string[]): GraphEdgeData[] {
  return EDGES.map((edge) => ({
    ...edge,
    mark: (edge.id === activeEdgeId
      ? 'active'
      : chosen.includes(edge.id)
        ? 'done'
        : undefined) as CellMark | undefined,
  }));
}

const steps: SimStep[] = [
  {
    id: '8.7-init',
    title: 'শুরু — 0 থেকে, বাকিরা অসীম দূরে',
    whatHappens:
      'তিনটে বিন্দু: (0,0), (2,2), (3,10)। `dist[0] = 0`, বাকি `∞`। `inMST` সব false, `total = 0`।',
    whyItMatters:
      '`dist[i]` এখানে উৎস থেকে দূরত্ব নয় (সেটা Dijkstra) — এটা **MST-তে ঢোকার খরচ**, অর্থাৎ ইতিমধ্যে যুক্ত গাছটার সবচেয়ে কাছের সদস্য থেকে i-এর দূরত্ব। এই একটা পার্থক্যই দুটো অ্যালগরিদমকে আলাদা করে; কোড দেখতে প্রায় এক।',
    highlightLines: [2, 3, 4, 5, 6],
    vars: [
      { name: 'total', value: 0 },
      { name: 'dist', value: `[0,${INF},${INF}]` },
    ],
    scene: {
      kind: 'graph',
      nodes: NODE_IDS.map((id, i) => ({
        id,
        label: `${id}·(${POINTS[i][0]},${POINTS[i][1]})`,
        annotation: `খরচ ${i === 0 ? '0' : INF}`,
      })),
      edges: edges(undefined, []),
      caption: 'edge-এর ওজন = Manhattan দূরত্ব |Δx| + |Δy|।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const base = {
      id: `8.7-${i + 1}`,
      vars: [
        { name: 'u', value: event.u },
        { name: 'dist', value: `[${event.dist.map(distLabel).join(',')}]` },
        { name: 'total', value: event.total },
      ],
    };

    if (event.kind === 'add') {
      const cost = event.dist[Number(event.u)];
      return {
        ...base,
        title: `MST-তে যোগ — নোড ${event.u} (খরচ ${cost})`,
        whatHappens: `বাইরে থাকা নোডগুলোর মধ্যে সবচেয়ে কম খরচ ${event.u}-এর (${cost})। তাকে গাছে নেওয়া হলো, \`total\` বেড়ে ${event.total}।`,
        whyItMatters:
          i === 0
            ? '`dist[0] = 0` বসানোর একমাত্র কারণ হলো প্রথম নোডটা বিনা খরচে বেছে নেওয়া। কোন নোড দিয়ে শুরু হলো তাতে কিছু আসে যায় না — MST-র মোট খরচ একই থাকে।'
            : i === 3
              ? 'লোভী সিদ্ধান্ত, কিন্তু নিরাপদ: গাছ আর বাইরের জগতের মধ্যে সবচেয়ে সস্তা সেতুটা সবসময় কোনো না কোনো MST-তে থাকে (cut property)। তাই এখানে পিছিয়ে দেখার দরকার নেই।'
              : i === 5
                ? 'শেষ নোডটা 9 খরচে ঢুকল, 13-এ নয় — কারণ 1 গাছে ঢোকার পর 2-এ পৌঁছানোর সস্তা রাস্তা তৈরি হয়েছিল। গাছ বাড়লে বাইরের খরচ কমে।'
                : undefined,
        highlightLines: [7, 8, 9, 10, 11, 12],
        scene: {
          kind: 'graph',
          nodes: nodes(event, event.u),
          edges: edges(event.joinedEdgeId, chosenAt(i)),
          activeNodeId: event.u,
          activeEdgeId: event.joinedEdgeId,
          output: { title: 'total', values: [event.total] },
          caption: `গাছে এখন ${event.inMST.length}টা নোড, মোট খরচ ${event.total}।`,
        },
      };
    }

    const target = Number(event.v);
    const before = EVENTS[i - 1].dist[target];
    const improved = event.dist[target] !== before;
    return {
      ...base,
      title: `${event.u} → ${event.v} — খরচ ${distLabel(before)} থেকে ${distLabel(event.dist[target])}`,
      whatHappens: `${event.u} গাছে ঢুকেছে, তাই বাইরের প্রতিটা নোডের খরচ আবার মাপা হচ্ছে। (${POINTS[Number(event.u)]}) থেকে (${POINTS[target]}) পর্যন্ত Manhattan দূরত্ব ${event.measured}। ${
        improved
          ? `আগের ${distLabel(before)}-এর চেয়ে কম, তাই খরচ নামল ${event.dist[target]}-এ।`
          : `আগেরটাই ছোট, তাই খরচ অপরিবর্তিত।`
      }`,
      whyItMatters:
        i === 1
          ? 'নতুন নোড গাছে ঢুকলে বাইরের সবার খরচ কেবল কমতে পারে, বাড়তে পারে না — গাছে একটা নতুন প্রতিবেশী যোগ হলো মাত্র। তাই `Math.min` যথেষ্ট, পুরোটা নতুন করে হিসাব করার দরকার নেই।'
          : i === 4
            ? 'নোড 2-এর খরচ 13 থেকে 9-এ নামল, কারণ (2,2) তার (0,0)-এর চেয়ে কাছে। একেই বলে গাছ বাড়ার সাথে সাথে "সীমান্ত" আপডেট হওয়া।'
            : undefined,
      highlightLines: [13, 14, 15, 16, 17, 18],
      scene: {
        kind: 'graph',
        nodes: nodes(event, event.u),
        edges: edges(event.edgeId, chosenAt(i)),
        activeEdgeId: event.edgeId,
        output: { title: 'total', values: [event.total] },
        caption: `Manhattan(${POINTS[Number(event.u)]}, ${POINTS[target]}) = ${event.measured}`,
      },
    };
  }),

  {
    id: '8.7-done',
    title: 'শেষ — মোট খরচ 13',
    whatHappens:
      'তিনটে নোডই গাছে। ব্যবহৃত edge: `0‑1` (৪) আর `1‑2` (৯) — মোট `13`।',
    whyItMatters:
      'সরাসরি 0‑2 জোড়া লাগালে খরচ হতো 13, আর তখনো 1 বাদ পড়ে থাকত। ঘুরপথে 0‑1‑2 গিয়ে তিনটেই যুক্ত হলো একই 13-এ। n নোডের MST-তে সবসময় ঠিক n−1টা edge থাকে। এই বাস্তবায়ন O(n²) — বিন্দুর সমস্যায় গ্রাফ পূর্ণ (সব জোড়ায় edge), তাই heap আনলে O(n² log n) হয়ে উল্টো খারাপ হতো।',
    highlightLines: [21],
    vars: [{ name: 'total', value: 13 }],
    scene: {
      kind: 'graph',
      nodes: NODE_IDS.map((id, i) => ({
        id,
        label: `${id}·(${POINTS[i][0]},${POINTS[i][1]})`,
        mark: 'done' as CellMark,
        annotation: `খরচ ${[0, 4, 9][i]}`,
      })),
      edges: edges(undefined, ['e01', 'e12']),
      output: { title: 'MST edge', values: ['0‑1 (4)', '1‑2 (9)'] },
      caption: '০‑২ edge (১৩) বাদ পড়েছে — দরকার হয়নি।',
    },
  },
];

export const mstSim: PatternSimulation = {
  patternId: '8.7',
  input: 'points = [[0,0],[2,2],[3,10]]',
  output: '13',
  steps,
};
