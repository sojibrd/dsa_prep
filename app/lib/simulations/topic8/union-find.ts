import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   8.4 Union Find (Disjoint Set) — Redundant Connection

   Deliberately NOT the new `graph` scene. Union-Find's state is a `parent[]`
   array, and what matters at each step is which index points where — an array
   row shows that directly. Drawing it as a node-link picture would add a
   layout that has to be re-read every step to answer a question the array
   answers at a glance.
   ========================================================================= */

type Kind = 'check' | 'union' | 'redundant';

interface Event {
  kind: Kind;
  a: number;
  b: number;
  ra: number;
  rb: number;
  /** `parent` after the event. */
  parent: number[];
}

/** Verified by running the demo code, including path compression. */
const EVENTS: Event[] = [
  { kind: 'check', a: 1, b: 2, ra: 1, rb: 2, parent: [0, 1, 2, 3] },
  { kind: 'union', a: 1, b: 2, ra: 1, rb: 2, parent: [0, 2, 2, 3] },
  { kind: 'check', a: 1, b: 3, ra: 2, rb: 3, parent: [0, 2, 2, 3] },
  { kind: 'union', a: 1, b: 3, ra: 2, rb: 3, parent: [0, 2, 3, 3] },
  { kind: 'check', a: 2, b: 3, ra: 3, rb: 3, parent: [0, 2, 3, 3] },
  { kind: 'redundant', a: 2, b: 3, ra: 3, rb: 3, parent: [0, 2, 3, 3] },
];

/** A node whose parent is itself is a root — the name of its whole group. */
function marksFor(event: Event): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  marks[0] = 'reject'; // index 0 is unused padding
  marks[event.a] = 'active';
  marks[event.b] = 'active';
  marks[event.ra] = event.kind === 'redundant' ? 'reject' : 'done';
  marks[event.rb] = event.kind === 'redundant' ? 'reject' : 'done';
  return marks;
}

function rootTable(event: Event) {
  return {
    title: 'দুই প্রান্তের গোষ্ঠী',
    entries: [
      {
        key: `find(${event.a})`,
        value: event.ra,
        mark: 'active' as CellMark,
      },
      {
        key: `find(${event.b})`,
        value: event.rb,
        mark: (event.ra === event.rb ? 'reject' : 'done') as CellMark,
      },
    ],
  };
}

const steps: SimStep[] = [
  {
    id: '8.4-init',
    title: 'শুরু — প্রত্যেকে নিজের গোষ্ঠীতে একা',
    whatHappens:
      '`parent = [0, 1, 2, 3]` — প্রতিটা index নিজেকেই দেখাচ্ছে, অর্থাৎ চারটে আলাদা গোষ্ঠী। (index 0 ব্যবহার হয় না, নোডগুলো 1 থেকে শুরু।)',
    whyItMatters:
      'প্রশ্নটা: কোন edge যোগ করলে গাছ আর গাছ থাকে না, চক্র হয়ে যায়? Union-Find-এ উত্তরটা সরল — যে edge-এর দুই প্রান্ত **আগে থেকেই** এক গোষ্ঠীতে, সেটাই বাড়তি। কারণ তাদের মধ্যে ইতিমধ্যেই একটা পথ আছে; আরেকটা যোগ করা মানে চক্র।',
    highlightLines: [2, 3],
    vars: [{ name: 'parent', value: '[0,1,2,3]' }],
    scene: {
      kind: 'array',
      values: [0, 1, 2, 3],
      marks: { 0: 'reject' },
      caption: 'সারিটা `parent` array — index i-এর ঘরে লেখা তার অভিভাবক।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const base = {
      id: `8.4-${i + 1}`,
      vars: [
        { name: 'edge', value: `[${event.a},${event.b}]` },
        { name: 'ra', value: event.ra },
        { name: 'rb', value: event.rb },
        { name: 'parent', value: `[${event.parent.join(',')}]` },
      ],
    };

    if (event.kind === 'check') {
      return {
        ...base,
        title: `edge (${event.a}, ${event.b}) — দুই প্রান্তের মূল খোঁজা`,
        whatHappens: `\`find(${event.a})\` = ${event.ra}, \`find(${event.b})\` = ${event.rb}। ${
          event.ra === event.rb
            ? 'দুটোই এক — মানে এরা আগে থেকেই একই গোষ্ঠীতে।'
            : 'আলাদা গোষ্ঠী, তাই এই edge নিরাপদ।'
        }`,
        whyItMatters:
          i === 0
            ? '`find` উপরে উঠতে উঠতে গোষ্ঠীর প্রতিনিধি খুঁজে আনে। সাথে path compression — ফেরার পথে প্রতিটা নোডকে সরাসরি মূলের সাথে জুড়ে দেয়, তাই পরেরবার খোঁজা প্রায় ধ্রুব সময়ে হয়।'
            : i === 2
              ? 'খেয়াল করুন `find(1)` এবার 2 দিল, 1 নয় — আগের union-এ 1-এর অভিভাবক 2 হয়ে গেছে। গোষ্ঠীর নাম বদলায়, সদস্যপদ নয়।'
              : undefined,
        highlightLines: [3, 4, 5, 6],
        scene: {
          kind: 'array',
          values: event.parent,
          marks: marksFor(event),
          table: rootTable(event),
          caption: `${event.a} ও ${event.b} — মূল ${event.ra} বনাম ${event.rb}`,
        },
      };
    }

    if (event.kind === 'union') {
      return {
        ...base,
        title: `জোড়া লাগানো — ${event.ra}-এর অভিভাবক এখন ${event.rb}`,
        whatHappens: `মূল দুটো আলাদা, তাই দুই গোষ্ঠী মিলিয়ে দেওয়া হলো: \`parent[${event.ra}] = ${event.rb}\`। parent এখন [${event.parent.join(', ')}]।`,
        whyItMatters:
          i === 1
            ? 'জোড়া লাগানো হয় **মূলে মূলে**, সরাসরি a আর b-তে নয়। এক মূলকে অন্যের নিচে বসালে গোটা দুটো গোষ্ঠীই এক হয়ে যায় — একটা লেখাতেই।'
            : undefined,
        highlightLines: [8],
        scene: {
          kind: 'array',
          values: event.parent,
          marks: marksFor(event),
          table: rootTable(event),
          caption: `এখন ${event.a} ও ${event.b} একই গোষ্ঠীতে।`,
        },
      };
    }

    return {
      ...base,
      title: `বাড়তি edge — [${event.a}, ${event.b}]`,
      whatHappens: `\`find(${event.a})\` আর \`find(${event.b})\` দুটোই ${event.ra} — অর্থাৎ ${event.a} আর ${event.b} আগে থেকেই যুক্ত। এই edge-টা যোগ করলেই চক্র হয়। তাই এটাই উত্তর: \`[${event.a}, ${event.b}]\`।`,
      whyItMatters:
        'পথ খুঁজে দেখতে হলো না, DFS চালাতে হলো না — শুধু দুটো `find`। n নোড আর প্রায়-ধ্রুব `find` মিলিয়ে খরচ কার্যত O(n·α(n)), যেখানে α প্রায় ধ্রুবক। Union-Find-এর সবচেয়ে চেনা ব্যবহার এটাই: "এই দুটো কি ইতিমধ্যেই যুক্ত?"',
      highlightLines: [7],
      scene: {
        kind: 'array',
        values: event.parent,
        marks: marksFor(event),
        table: rootTable(event),
        output: { title: 'উত্তর', values: [`[${event.a},${event.b}]`] },
        caption: 'দুই প্রান্তের মূল এক — চক্র তৈরি হবে।',
      },
    };
  }),

  {
    id: '8.4-done',
    title: 'শেষ — [2, 3] বাদ দিতে হবে',
    whatHappens:
      'উত্তর `[2, 3]` — এই edge-টা সরালেই বাকি তিনটে নোড একটা গাছ হয়ে যায়।',
    whyItMatters:
      'প্রশ্নে বলা ছিল "শেষেরটা ফেরত দিন", আর লুপ ক্রমেই চলে বলে সেটা আপনাআপনিই ঘটে — প্রথম যে edge চক্র বানায়, ইনপুট-ক্রমে সে-ই শেষেরটা। ক্রম বদলে দিলে উত্তরও বদলাত।',
    highlightLines: [7],
    vars: [{ name: 'উত্তর', value: '[2,3]' }],
    scene: {
      kind: 'array',
      values: [0, 2, 3, 3],
      marks: { 0: 'reject', 1: 'done', 2: 'done', 3: 'done' },
      output: { title: 'বাদ দিতে হবে', values: ['[2,3]'] },
      caption: 'শেষ অবস্থায় 1 → 2 → 3, আর 3 নিজেই মূল।',
    },
  },
];

export const unionFindSim: PatternSimulation = {
  patternId: '8.4',
  input: 'edges = [[1,2],[1,3],[2,3]]',
  output: '[2,3]',
  steps,
};
