import type {
  CellMark,
  GraphEdgeData,
  PatternSimulation,
  SimStep,
} from '../types';

/* ============================================================================
   8.5 Bipartite Check / Graph Coloring — Is Graph Bipartite?

   Two colours, two marks: +1 reads `active` (amber), −1 reads `done` (green).
   Reusing the existing mark vocabulary rather than inventing a fifth keeps
   the theme honest — and amber-vs-green already reads as "two camps".
   ========================================================================= */

const NODE_IDS = ['0', '1', '2', '3'];

/** graph = [[1,3],[0,2],[1,3],[0,2]] — undirected, deduplicated. */
const EDGES = [
  { id: 'e01', from: '0', to: '1' },
  { id: 'e03', from: '0', to: '3' },
  { id: 'e12', from: '1', to: '2' },
  { id: 'e23', from: '2', to: '3' },
];

interface Event {
  kind: 'seed' | 'color';
  /** Node receiving a colour. */
  node: string;
  /** Node the colour was derived from, for `color`. */
  from?: string;
  edgeId?: string;
  colors: number[];
  queue: string[];
}

/** Verified by running the demo code and logging every colouring. */
const EVENTS: Event[] = [
  { kind: 'seed', node: '0', colors: [1, 0, 0, 0], queue: ['0'] },
  { kind: 'color', node: '1', from: '0', edgeId: 'e01', colors: [1, -1, 0, 0], queue: ['1'] },
  { kind: 'color', node: '3', from: '0', edgeId: 'e03', colors: [1, -1, 0, -1], queue: ['1', '3'] },
  { kind: 'color', node: '2', from: '1', edgeId: 'e12', colors: [1, -1, 1, -1], queue: ['3', '2'] },
];

const COLOR_NAME = (value: number) => (value === 1 ? 'দল ক' : value === -1 ? 'দল খ' : '—');

function nodes(colors: number[], activeId?: string) {
  return NODE_IDS.map((id, i) => ({
    id,
    label: id,
    mark: (colors[i] === 1 ? 'active' : colors[i] === -1 ? 'done' : undefined) as
      | CellMark
      | undefined,
    annotation: activeId === id ? `← ${COLOR_NAME(colors[i])}` : COLOR_NAME(colors[i]),
  }));
}

function edges(activeEdgeId?: string, colors: number[] = []): GraphEdgeData[] {
  return EDGES.map((edge) => {
    const a = colors[Number(edge.from)];
    const b = colors[Number(edge.to)];
    return {
      ...edge,
      mark: (edge.id === activeEdgeId
        ? 'active'
        : a && b && a !== b
          ? 'done'
          : undefined) as CellMark | undefined,
    };
  });
}

const steps: SimStep[] = [
  {
    id: '8.5-init',
    title: 'শুরু — কেউ রঙ পায়নি',
    whatHappens:
      '`color = [0, 0, 0, 0]` — শূন্য মানে এখনো রঙ দেওয়া হয়নি। গ্রাফটা একটা চতুর্ভুজ: 0‑1, 1‑2, 2‑3, 3‑0।',
    whyItMatters:
      'প্রশ্নটা: নোডগুলোকে দুই দলে ভাগ করা যায় কি, যাতে কোনো edge-এর দুই প্রান্ত একই দলে না পড়ে? সমতুল্য প্রশ্ন — গ্রাফে কি কোনো **বিজোড়** দৈর্ঘ্যের চক্র আছে? BFS করতে করতে পালা করে রঙ দিলে সেই চক্র থাকলে সংঘর্ষে ধরা পড়বেই।',
    highlightLines: [2, 3],
    vars: [{ name: 'color', value: '[0,0,0,0]' }],
    scene: {
      kind: 'graph',
      nodes: nodes([0, 0, 0, 0]),
      edges: edges(),
      caption: 'amber = দল ক, সবুজ = দল খ। প্রতিটা edge-এর দুই প্রান্তে দুই রঙ চাই।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const value = event.colors[Number(event.node)];
    const base = {
      id: `8.5-${i + 1}`,
      vars: [
        { name: 'u', value: event.from ?? event.node },
        { name: 'color', value: `[${event.colors.join(',')}]` },
        { name: 'queue', value: `[${event.queue.join(',')}]` },
      ],
    };

    if (event.kind === 'seed') {
      return {
        ...base,
        title: `শুরুর নোড ${event.node} — দল ক`,
        whatHappens: `${event.node} এখনো বেরঙিন, তাই সে হলো এই component-এর শুরু। তাকে দেওয়া হলো রঙ 1 (দল ক), আর queue-তে বসানো হলো।`,
        whyItMatters:
          'বাইরের লুপটা প্রতিটা নোডে একবার করে যায়, কারণ গ্রাফ একাধিক আলাদা টুকরোয় ভাগ থাকতে পারে। প্রতিটা টুকরোর নিজস্ব শুরু লাগে; না হলে বিচ্ছিন্ন কোনো অংশ কখনো রঙই পেত না।',
        highlightLines: [3, 4, 5, 6],
        scene: {
          kind: 'graph',
          nodes: nodes(event.colors, event.node),
          edges: edges(undefined, event.colors),
          activeNodeId: event.node,
          caption: 'প্রথম রঙটা যেকোনো হতে পারত — শুধু বাকিরা এর সাপেক্ষে ঠিক হবে।',
        },
      };
    }

    return {
      ...base,
      title: `${event.from} → ${event.node} — উল্টো রঙ (${COLOR_NAME(value)})`,
      whatHappens: `${event.from} থেকে ${event.node}-এ যাওয়া হলো। ${event.node} বেরঙিন ছিল, তাই সে পেল ${event.from}-এর ঠিক উল্টো রঙ: ${value}। queue-তে যোগ হলো।`,
      whyItMatters:
        i === 1
          ? 'প্রতিটা প্রতিবেশীকে দুটো প্রশ্ন করা হয় ক্রমে: (১) একই রঙ? তাহলে সাথে সাথে false। (২) বেরঙিন? তাহলে উল্টো রঙ দাও। ইতিমধ্যে উল্টো রঙ পাওয়া থাকলে কিছুই করার নেই — সে ঠিকই আছে।'
          : i === 3
            ? 'নোড 2 পেল দল ক, অথচ সে 3-এরও প্রতিবেশী, আর 3 দল খ-তে। কোনো সংঘর্ষ নেই — চতুর্ভুজটা জোড় দৈর্ঘ্যের চক্র, তাই রঙ ঠিকঠাক পালা করে যায়। ত্রিভুজ হলে এখানেই ভাঙত।'
            : undefined,
      highlightLines: [7, 8, 9, 10, 11, 12, 13],
      scene: {
        kind: 'graph',
        nodes: nodes(event.colors, event.node),
        edges: edges(event.edgeId, event.colors),
        activeNodeId: event.node,
        activeEdgeId: event.edgeId,
        caption: `${event.node} এখন ${COLOR_NAME(value)}-এ।`,
      },
    };
  }),

  {
    id: '8.5-done',
    title: 'শেষ — গ্রাফটা bipartite',
    whatHappens:
      'চারটে নোডই রঙ পেয়েছে (`[1, -1, 1, -1]`), কোনো edge-এর দুই প্রান্তে এক রঙ পড়েনি। উত্তর `true`।',
    whyItMatters:
      'প্রতিটা নোড ও edge একবার — O(V + E)। দল দুটো: {0, 2} আর {1, 3}। এই কাঠামো ব্যবহারিক কাজে আসে — যেমন কাজ ও কর্মী দুই দলে ভাগ করে সর্বোচ্চ জোড়া মেলানো (bipartite matching)। মনে রাখার সূত্র: গ্রাফ bipartite ⟺ কোনো বিজোড় দৈর্ঘ্যের চক্র নেই।',
    highlightLines: [18],
    vars: [{ name: 'উত্তর', value: 'true' }],
    scene: {
      kind: 'graph',
      nodes: nodes([1, -1, 1, -1]),
      edges: edges(undefined, [1, -1, 1, -1]),
      output: { title: 'দুই দল', values: ['{0, 2}', '{1, 3}'] },
      caption: 'প্রতিটা edge amber আর সবুজ জোড়া লাগাচ্ছে — একটাও একই রঙে নয়।',
    },
  },
];

export const bipartiteSim: PatternSimulation = {
  patternId: '8.5',
  input: 'graph = [[1,3],[0,2],[1,3],[0,2]]',
  output: 'true',
  steps,
};
