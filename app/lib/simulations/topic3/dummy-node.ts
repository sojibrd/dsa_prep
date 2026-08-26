import type { LinkedListNode, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   3.2 Dummy Node Technique — Merge Two Sorted Lists (LC 21)

   Three lists exist at once here — two shrinking inputs and one growing
   output — which no single chain can honestly show. So the chain drawn IS
   the output being built, and what is left of each input rides in the side
   table with the head under comparison lit.
   ========================================================================= */

const VALUES: Record<string, number> = { a0: 1, a1: 2, a2: 4, b0: 1, b1: 3, b2: 4 };
const LIST_A = ['a0', 'a1', 'a2'];
const LIST_B = ['b0', 'b1', 'b2'];

interface Take {
  /** Heads under comparison, before the take. */
  a: string;
  b: string;
  /** Which list won this comparison. */
  from: 'a' | 'b';
  taken: string;
  /** Output chain after the take. */
  chain: string[];
  /** What is left of each input after the take. */
  restA: string[];
  restB: string[];
}

/** Verified against the demo code, comparison by comparison. */
const TAKES: Take[] = [
  {
    a: 'a0', b: 'b0', from: 'a', taken: 'a0',
    chain: ['a0'], restA: ['a1', 'a2'], restB: ['b0', 'b1', 'b2'],
  },
  {
    a: 'a1', b: 'b0', from: 'b', taken: 'b0',
    chain: ['a0', 'b0'], restA: ['a1', 'a2'], restB: ['b1', 'b2'],
  },
  {
    a: 'a1', b: 'b1', from: 'a', taken: 'a1',
    chain: ['a0', 'b0', 'a1'], restA: ['a2'], restB: ['b1', 'b2'],
  },
  {
    a: 'a2', b: 'b1', from: 'b', taken: 'b1',
    chain: ['a0', 'b0', 'a1', 'b1'], restA: ['a2'], restB: ['b2'],
  },
  {
    a: 'a2', b: 'b2', from: 'a', taken: 'a2',
    chain: ['a0', 'b0', 'a1', 'b1', 'a2'], restA: [], restB: ['b2'],
  },
];

const DUMMY = { id: 'dummy', val: '·', nextId: 'a0' as string | null };

/** The output chain, each node pointing at the one after it. */
function outputChain(chain: string[]): LinkedListNode[] {
  return chain.map((id, i) => ({
    id,
    val: VALUES[id],
    nextId: chain[i + 1] ?? null,
    mark: (i === chain.length - 1 ? 'active' : 'done') as LinkedListNode['mark'],
  }));
}

function restTable(restA: string[], restB: string[], winner?: 'a' | 'b') {
  return {
    title: 'যা এখনো বাকি',
    entries: [
      {
        key: 'list1',
        value: restA.length ? restA.map((id) => VALUES[id]).join(', ') : '— শেষ',
        mark: (winner === 'a' ? 'active' : undefined) as LinkedListNode['mark'],
      },
      {
        key: 'list2',
        value: restB.length ? restB.map((id) => VALUES[id]).join(', ') : '— শেষ',
        mark: (winner === 'b' ? 'active' : undefined) as LinkedListNode['mark'],
      },
    ],
  };
}

const steps: SimStep[] = [
  {
    id: '3.2-init',
    title: 'শুরু — একটা নকল নোড',
    whatHappens:
      '`dummy` নামে একটা খালি নোড বানানো হলো, যার কোনো মান নেই। `tail` বসল ওখানেই। দুটো ইনপুট লিস্ট এখনো অক্ষত: `[1,2,4]` ও `[1,3,4]`।',
    whyItMatters:
      'dummy না থাকলে প্রতিবার লিখতে হতো "এটাই কি প্রথম নোড? তাহলে head সেট করো, নইলে tail.next সেট করো" — লুপের ভেতরে একটা বাড়তি শর্ত, আর head আলাদা করে সামলানোর ঝামেলা। একটা নকল নোড থাকলে প্রথম সংযোগও বাকি সবগুলোর মতোই সাধারণ `tail.next = …` হয়ে যায়। শেষে শুধু `dummy.next` ফেরত দিলেই হলো।',
    highlightLines: [2, 3],
    vars: [
      { name: 'a', value: 1 },
      { name: 'b', value: 1 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [],
      dummy: { ...DUMMY, nextId: null },
      table: restTable(LIST_A, LIST_B),
      caption: 'নিচের চেইনটা তৈরি হতে থাকা **ফলাফল** — ইনপুট দুটো পাশের প্যানেলে।',
    },
  },

  ...TAKES.map((take, i): SimStep => {
    const aVal = VALUES[take.a];
    const bVal = VALUES[take.b];
    const wins = take.from === 'a';

    return {
      id: `3.2-take-${i + 1}`,
      title: `${aVal} ≤ ${bVal} ${wins ? 'সত্য' : 'মিথ্যা'} — ${wins ? 'list1' : 'list2'} থেকে ${VALUES[take.taken]}`,
      whatHappens: `দুই লিস্টের সামনের মান ${aVal} আর ${bVal}। ${
        wins
          ? `${aVal} ≤ ${bVal}, তাই list1-এর নোডটা নেওয়া হলো — \`tail.next = a\`, তারপর a এগোল।`
          : `${aVal} ≤ ${bVal} নয়, তাই list2-এর নোডটা নেওয়া হলো — \`tail.next = b\`, তারপর b এগোল।`
      } tail সরে এল নতুন শেষ নোডে।`,
      whyItMatters:
        i === 0
          ? 'সমান হলে `≤` বলে list1-ই আগে যায়। এটা নিছক খুঁটিনাটি নয় — এতে সমান মানগুলোর আপেক্ষিক ক্রম বজায় থাকে (stable merge), যা merge sort-এ গুরুত্বপূর্ণ।'
          : i === 4
            ? 'a2 নেওয়ার পর list1 শেষ। `while (a && b)` শর্ত ভেঙে গেল, তাই তুলনা করার আর কিছু নেই — লুপ থামবে।'
            : undefined,
      highlightLines: wins ? [4, 5, 6, 7, 12] : [4, 5, 8, 9, 10, 12],
      vars: [
        { name: 'a', value: take.restA.length ? VALUES[take.restA[0]] : 'null' },
        { name: 'b', value: take.restB.length ? VALUES[take.restB[0]] : 'null' },
        { name: 'tail', value: VALUES[take.taken] },
      ],
      scene: {
        kind: 'linked-list',
        nodes: outputChain(take.chain),
        dummy: { ...DUMMY, nextId: take.chain[0] },
        pointers: [{ name: 'tail', nodeId: take.taken }],
        table: restTable(take.restA, take.restB, take.from),
        caption: `ফলাফল এখন: ${take.chain.map((id) => VALUES[id]).join(' → ')}`,
      },
    };
  }),

  {
    id: '3.2-attach',
    title: 'বাকিটা এক টানে জুড়ে দেওয়া',
    whatHappens:
      'list1 শেষ, list2-তে এখনো `4` পড়ে আছে। `tail.next = a || b` — অর্থাৎ যেটা এখনো বাকি সেটার পুরো লেজটাই এক লাইনে জুড়ে দেওয়া হলো।',
    whyItMatters:
      'বাকি অংশটা এক-এক করে কপি করার দরকার নেই — সেটা তো আগে থেকেই সাজানো একটা চেইন। একটা পয়েন্টার বসিয়ে দিলেই পুরোটা জুড়ে যায়। এই "লেজ জোড়া" চালটাই লিংকড লিস্টকে array-র চেয়ে সুবিধাজনক করে; array হলে বাকি উপাদানগুলো সত্যিই কপি করতে হতো।',
    highlightLines: [14],
    vars: [
      { name: 'a', value: 'null' },
      { name: 'b', value: 4 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: outputChain(['a0', 'b0', 'a1', 'b1', 'a2', 'b2']),
      dummy: { ...DUMMY, nextId: 'a0' },
      pointers: [{ name: 'tail', nodeId: 'a2' }],
      table: restTable([], [], undefined),
      caption: 'শেষ নোডটা তুলনা ছাড়াই জোড়া লেগেছে।',
    },
  },

  {
    id: '3.2-done',
    title: 'শেষ — 1, 1, 2, 3, 4, 4',
    whatHappens:
      '`dummy.next` ফেরত দেওয়া হলো — সেটাই আসল head। ফলাফল: `1 → 1 → 2 → 3 → 4 → 4`।',
    whyItMatters:
      'কোনো নতুন নোড বানানো হয়নি — বিদ্যমান নোডগুলোর `next` বদলে দেওয়া হয়েছে মাত্র। তাই O(1) বাড়তি জায়গা, আর সময় দুই লিস্টের দৈর্ঘ্যের যোগফলের সমান।',
    highlightLines: [15],
    vars: [{ name: 'উত্তর', value: '1,1,2,3,4,4' }],
    scene: {
      kind: 'linked-list',
      nodes: ['a0', 'b0', 'a1', 'b1', 'a2', 'b2'].map((id, i, all) => ({
        id,
        val: VALUES[id],
        nextId: all[i + 1] ?? null,
        mark: 'done' as const,
      })),
      dummy: { ...DUMMY, nextId: 'a0' },
      output: { title: 'merge করা লিস্ট', values: [1, 1, 2, 3, 4, 4] },
      caption: 'dummy নিজে ফলাফলের অংশ নয় — তার next-ই আসল head।',
    },
  },
];

export const dummyNodeSim: PatternSimulation = {
  patternId: '3.2',
  input: 'list1 = [1,2,4], list2 = [1,3,4]',
  output: '[1,1,2,3,4,4]',
  steps,
};
