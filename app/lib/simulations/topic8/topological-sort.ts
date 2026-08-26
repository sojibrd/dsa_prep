import type {
  CellMark,
  GraphEdgeData,
  PatternSimulation,
  SimStep,
} from '../types';

/* ============================================================================
   8.3 Topological Sort — Course Schedule II (Kahn's algorithm)
   ========================================================================= */

const NODE_IDS = ['0', '1', '2', '3'];

/** adj = [[1,2],[3],[3],[]] */
const EDGES = [
  { id: 'e01', from: '0', to: '1' },
  { id: 'e02', from: '0', to: '2' },
  { id: 'e13', from: '1', to: '3' },
  { id: 'e23', from: '2', to: '3' },
];

type Kind = 'seed' | 'pop' | 'decrement' | 'enqueue';

interface Event {
  kind: Kind;
  /** Node popped or enqueued. */
  node?: string;
  /** Edge whose target is being decremented. */
  edgeId?: string;
  from?: string;
  to?: string;
  indegree: number[];
  queue: string[];
  order: string[];
}

/** Verified by running the demo code and logging all 12 queue operations. */
const EVENTS: Event[] = [
  { kind: 'seed', node: '0', indegree: [0, 1, 1, 2], queue: ['0'], order: [] },
  { kind: 'pop', node: '0', indegree: [0, 1, 1, 2], queue: [], order: ['0'] },
  { kind: 'decrement', edgeId: 'e01', from: '0', to: '1', indegree: [0, 0, 1, 2], queue: [], order: ['0'] },
  { kind: 'enqueue', node: '1', indegree: [0, 0, 1, 2], queue: ['1'], order: ['0'] },
  { kind: 'decrement', edgeId: 'e02', from: '0', to: '2', indegree: [0, 0, 0, 2], queue: ['1'], order: ['0'] },
  { kind: 'enqueue', node: '2', indegree: [0, 0, 0, 2], queue: ['1', '2'], order: ['0'] },
  { kind: 'pop', node: '1', indegree: [0, 0, 0, 2], queue: ['2'], order: ['0', '1'] },
  { kind: 'decrement', edgeId: 'e13', from: '1', to: '3', indegree: [0, 0, 0, 1], queue: ['2'], order: ['0', '1'] },
  { kind: 'pop', node: '2', indegree: [0, 0, 0, 1], queue: [], order: ['0', '1', '2'] },
  { kind: 'decrement', edgeId: 'e23', from: '2', to: '3', indegree: [0, 0, 0, 0], queue: [], order: ['0', '1', '2'] },
  { kind: 'enqueue', node: '3', indegree: [0, 0, 0, 0], queue: ['3'], order: ['0', '1', '2'] },
  { kind: 'pop', node: '3', indegree: [0, 0, 0, 0], queue: [], order: ['0', '1', '2', '3'] },
];

/** Ordered nodes settle green; queued ones wait in amber. */
function nodes(event: { indegree: number[]; queue: string[]; order: string[] }, activeId?: string) {
  return NODE_IDS.map((id, i) => ({
    id,
    label: id,
    mark: (id === activeId
      ? 'active'
      : event.order.includes(id)
        ? 'done'
        : event.queue.includes(id)
          ? 'active'
          : undefined) as CellMark | undefined,
    annotation: `in ${event.indegree[i]}`,
  }));
}

function edges(activeEdgeId?: string, spent: string[] = []): GraphEdgeData[] {
  return EDGES.map((edge) => ({
    ...edge,
    directed: true,
    mark: (edge.id === activeEdgeId
      ? 'active'
      : spent.includes(edge.id)
        ? 'done'
        : undefined) as CellMark | undefined,
  }));
}

function spentAt(index: number): string[] {
  return EVENTS.slice(0, index)
    .filter((event) => event.kind === 'decrement')
    .map((event) => event.edgeId as string);
}

const steps: SimStep[] = [
  {
    id: '8.3-init',
    title: 'শুরু — indegree গোনা',
    whatHappens:
      '`prerequisites = [[1,0],[2,0],[3,1],[3,2]]` থেকে edge: `0→1`, `0→2`, `1→3`, `2→3`। প্রতিটা নোডে কতগুলো তীর ঢুকছে সেটাই indegree: `[0, 1, 1, 2]`।',
    whyItMatters:
      'indegree মানে "এই কোর্সটা করার আগে আর কতগুলো বাকি"। শূন্য হলেই সে এখনই করা যায়। এটাই Kahn-এর অ্যালগরিদমের পুরো ধারণা — DFS নয়, বরং বারবার "এখন কোনটা করা যায়" জিজ্ঞেস করা।',
    highlightLines: [2, 3, 4, 5, 6, 7],
    vars: [{ name: 'indegree', value: '[0,1,1,2]' }],
    scene: {
      kind: 'graph',
      nodes: nodes({ indegree: [0, 1, 1, 2], queue: [], order: [] }),
      edges: edges(),
      table: {
        title: 'indegree',
        entries: NODE_IDS.map((id, i) => ({
          key: id,
          value: [0, 1, 1, 2][i],
          mark: (i === 0 ? 'active' : undefined) as CellMark | undefined,
        })),
      },
      output: { title: 'order', values: [] },
      caption: 'নোডের নিচে লেখা `in N` — কতগুলো তীর এখনো ঢুকছে।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const base = {
      id: `8.3-${i + 1}`,
      vars: [
        { name: 'queue', value: `[${event.queue.join(',')}]` },
        { name: 'order', value: `[${event.order.join(',')}]` },
        { name: 'indegree', value: `[${event.indegree.join(',')}]` },
      ],
      scene: {
        kind: 'graph' as const,
        nodes: nodes(event, event.kind === 'pop' ? event.node : undefined),
        edges: edges(event.kind === 'decrement' ? event.edgeId : undefined, spentAt(i)),
        activeNodeId: event.kind === 'pop' ? event.node : undefined,
        table: {
          title: 'indegree',
          entries: NODE_IDS.map((id, idx) => ({
            key: id,
            value: event.indegree[idx],
            mark: (event.indegree[idx] === 0 ? 'active' : undefined) as CellMark | undefined,
          })),
        },
        output: { title: 'order', values: event.order },
      },
    };

    if (event.kind === 'seed') {
      return {
        ...base,
        title: `queue-তে বসানো — নোড ${event.node}`,
        whatHappens: `শুরুতে যাদের indegree শূন্য, তারাই queue-তে যায়। এখানে একমাত্র ${event.node} — বাকি সবার কোনো না কোনো পূর্বশর্ত বাকি।`,
        whyItMatters:
          'queue শূন্য থেকে গেলে বুঝতে হতো গ্রাফে cycle আছে — কারণ তখন কোনো কোর্সই শুরু করা যায় না। শেষে `order.length === numCourses` পরীক্ষাটা ঠিক সেই ক্ষেত্রটাই ধরে।',
        highlightLines: [8, 9],
        scene: { ...base.scene, caption: 'indegree ০ মানে এখনই শুরু করা যায়।' },
      };
    }

    if (event.kind === 'pop') {
      return {
        ...base,
        title: `নেওয়া হলো — নোড ${event.node}`,
        whatHappens: `queue থেকে ${event.node} বেরিয়ে \`order\`-এ গেল। order এখন [${event.order.join(', ')}]।`,
        whyItMatters:
          i === 1
            ? 'queue থেকে বের হওয়া মানেই তার সব পূর্বশর্ত মিটে গেছে — কারণ indegree শূন্য না হলে সে queue-তে ঢুকতই না। তাই order-এ যোগ করার আগে আর কিছু যাচাই করার নেই।'
            : undefined,
        highlightLines: [11, 12, 13],
        scene: { ...base.scene, caption: `${event.node} সম্পন্ন — এবার তার উপর নির্ভরশীলদের ছাড়ানো।` },
      };
    }

    if (event.kind === 'decrement') {
      const value = event.indegree[Number(event.to)];
      return {
        ...base,
        title: `${event.from} → ${event.to} — indegree ${value + 1} থেকে ${value}`,
        whatHappens: `${event.from} শেষ হয়ে গেছে, তাই ${event.to}-এর একটা পূর্বশর্ত মিটল — indegree নামল ${value}-এ।${
          value === 0 ? ' শূন্য হয়ে গেল, তাই এবার queue-তে যাবে।' : ' এখনো শূন্য নয়, তাই অপেক্ষা।'
        }`,
        whyItMatters:
          i === 7
            ? 'নোড 3-এর দুটো পূর্বশর্ত (1 ও 2)। প্রথমটা মিটলেও সে এখনো প্রস্তুত নয় — indegree 1-এ নেমেছে মাত্র। এখানেই "কাউন্টার" পদ্ধতিটা কাজে লাগে; শুধু visited রাখলে এই অপেক্ষাটা ধরা যেত না।'
            : undefined,
        highlightLines: [14],
        scene: { ...base.scene, caption: `edge খরচ হয়ে গেল — indegree[${event.to}] = ${value}` },
      };
    }

    return {
      ...base,
      title: `queue-তে যোগ — নোড ${event.node}`,
      whatHappens: `${event.node}-এর indegree শূন্য হয়ে গেছে, তাই সে queue-তে ঢুকল। queue = [${event.queue.join(', ')}]।`,
      highlightLines: [14],
      scene: { ...base.scene, caption: 'সব পূর্বশর্ত মিটেছে — এখন করা যায়।' },
    };
  }),

  {
    id: '8.3-done',
    title: 'শেষ — order = [0, 1, 2, 3]',
    whatHappens:
      'queue খালি, আর চারটে নোডই order-এ। উত্তর `[0, 1, 2, 3]`।',
    whyItMatters:
      'প্রতিটা নোড একবার queue-তে ঢোকে, প্রতিটা edge একবার খরচ হয় — O(V + E)। খেয়াল করুন উত্তর একটাই নয়: `[0, 2, 1, 3]`-ও সমান বৈধ। topological sort একটা **আংশিক** ক্রম দেয়, নির্দিষ্ট একটা নয়; queue-এর ক্রম বদলালে উত্তরও বদলাবে।',
    highlightLines: [16],
    vars: [{ name: 'order', value: '[0,1,2,3]' }],
    scene: {
      kind: 'graph',
      nodes: nodes({ indegree: [0, 0, 0, 0], queue: [], order: NODE_IDS }),
      edges: edges(undefined, ['e01', 'e02', 'e13', 'e23']),
      output: { title: 'order', values: [0, 1, 2, 3] },
      caption: '0 আগে, তারপর 1 ও 2 (যেকোনো ক্রমে), শেষে 3।',
    },
  },
];

export const topologicalSortSim: PatternSimulation = {
  patternId: '8.3',
  input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]',
  output: '[0,1,2,3]',
  steps,
};
