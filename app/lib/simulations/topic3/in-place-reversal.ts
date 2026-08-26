import type { CellMark, LinkedListNode, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   3.3 In-Place Reversal — Reverse Nodes in k-Group (LC 25)

   Nodes stay pinned in their ORIGINAL left-to-right order for the whole run,
   even as the chain reorders around them. That is deliberate: a `next` that
   now aims backwards is drawn as a jump (`↳`) instead of being tidied away,
   and watching those jumps appear one at a time is what makes in-place
   reversal readable. Only the final step relaxes and lays the nodes out in
   chain order, to show the result as a list rather than as a rewiring.
   ========================================================================= */

const VALUES: Record<string, number> = { n1: 1, n2: 2, n3: 3, n4: 4, n5: 5 };
const LAYOUT = ['n1', 'n2', 'n3', 'n4', 'n5'];

type Links = Record<string, string | null>;

const INITIAL: Links = { n1: 'n2', n2: 'n3', n3: 'n4', n4: 'n5', n5: null };

function chain(links: Links, marks: Record<string, CellMark> = {}): LinkedListNode[] {
  return LAYOUT.map((id) => ({
    id,
    val: VALUES[id],
    nextId: links[id],
    mark: marks[id],
  }));
}

/** The group of `k` nodes a given recursion depth owns. */
const GROUP: Record<number, string[]> = {
  1: ['n1', 'n2'],
  2: ['n3', 'n4'],
  3: ['n5'],
};

function groupMarks(depth: number, active?: string): Record<string, CellMark> {
  const marks: Record<string, CellMark> = {};
  for (const id of GROUP[depth] ?? []) marks[id] = 'done';
  if (active) marks[active] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '3.3-init',
    title: 'শুরু — 1 → 2 → 3 → 4 → 5, k = 2',
    whatHappens:
      'লিস্টটা অক্ষত: `1 → 2 → 3 → 4 → 5`। লক্ষ্য: প্রতি ২টা নোডের গ্রুপ উল্টে দেওয়া, আর শেষে ২টার কম বাকি থাকলে তাকে ছুঁয়ে না দেখা।',
    whyItMatters:
      'নতুন নোড বানানো নিষেধ — শুধু `next` পয়েন্টারগুলো ঘুরিয়ে দিতে হবে। তাই প্রতিটা গ্রুপ উল্টানোর সময় সাবধানে এগোতে হয়: `cur.next` বদলানোর **আগেই** পরের নোডটা ধরে রাখতে হবে, নইলে বাকি লিস্টের সাথে যোগাযোগ চিরতরে হারিয়ে যাবে।',
    highlightLines: [2, 3],
    vars: [
      { name: 'k', value: 2 },
      { name: 'depth', value: 1 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chain(INITIAL),
      pointers: [{ name: 'head', nodeId: 'n1' }],
      caption: 'গ্রুপ: (1,2) (3,4) — আর 5 একা পড়ে থাকবে।',
    },
  },

  {
    id: '3.3-count-d1',
    title: 'depth 1 — ২টা গুনে সীমানা খোঁজা',
    whatHappens:
      '`n1` থেকে ২টা নোড গোনা হলো (1, 2), `node` গিয়ে দাঁড়াল মান 3-এ — এটাই পরের গ্রুপের শুরু। `count = 2 = k`, তাই এই গ্রুপটা উল্টানো যাবে। কিন্তু তার আগে `reverseKGroup(3, 2)` ডাকা হলো।',
    whyItMatters:
      'উল্টানোর আগে গোনা কেন? কারণ শেষে যদি k-এর কম নোড পড়ে থাকে, তাদের ছোঁয়াই যাবে না। আগে না গুনে উল্টাতে শুরু করলে অর্ধেক-উল্টানো একটা লেজ পড়ে থাকত, যা আর ঠিক করা যেত না।',
    highlightLines: [2, 3, 4, 5, 6, 9],
    vars: [
      { name: 'depth', value: 1 },
      { name: 'count', value: 2 },
      { name: 'node', value: 3 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chain(INITIAL, groupMarks(1, 'n3')),
      pointers: [
        { name: 'head', nodeId: 'n1' },
        { name: 'node', nodeId: 'n3' },
      ],
      caption: 'depth 1 — গ্রুপ (1,2) দখলে, কিন্তু আগে পরেরটা সমাধান হবে।',
    },
  },

  {
    id: '3.3-count-d2',
    title: 'depth 2 — আবার ২টা গুনে আরও ভেতরে',
    whatHappens:
      'একই কাজ `n3` থেকে: ২টা গোনা হলো (3, 4), `node` দাঁড়াল মান 5-এ। আবার `reverseKGroup(5, 2)` ডাকা হলো।',
    highlightLines: [2, 3, 4, 5, 6, 9],
    vars: [
      { name: 'depth', value: 2 },
      { name: 'count', value: 2 },
      { name: 'node', value: 5 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chain(INITIAL, groupMarks(2, 'n5')),
      pointers: [
        { name: 'head', nodeId: 'n3' },
        { name: 'node', nodeId: 'n5' },
      ],
      caption: 'depth 2 — গ্রুপ (3,4) দখলে। এখনো কিছুই উল্টানো হয়নি।',
    },
  },

  {
    id: '3.3-base',
    title: 'depth 3 — মাত্র ১টা বাকি, ছোঁয়া হবে না',
    whatHappens:
      '`n5` থেকে গুনে পাওয়া গেল মাত্র ১টা নোড, `count = 1 < k = 2`। তাই `return head` — মান 5-এর নোডটা যেমন আছে তেমনই ফেরত গেল।',
    whyItMatters:
      'এটাই recursion-এর ভিত্তি (base case), এবং এখান থেকেই ফেরার পথ শুরু। এই নোডটাই হয়ে যায় উপরের গ্রুপের জন্য `prev`-এর প্রাথমিক মান — অর্থাৎ উল্টানো গ্রুপের লেজ কোথায় জোড়া লাগবে, সেই ঠিকানা। এভাবেই ভেতর থেকে বাইরের দিকে জোড়া লাগতে থাকে।',
    highlightLines: [4, 8],
    vars: [
      { name: 'depth', value: 3 },
      { name: 'count', value: 1 },
      { name: 'return', value: 5 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chain(INITIAL, { n5: 'active' }),
      pointers: [{ name: 'head', nodeId: 'n5' }],
      caption: 'depth 3 — k-এর কম বাকি, অপরিবর্তিত ফেরত।',
    },
  },

  {
    id: '3.3-relink-1',
    title: 'depth 2 — 3-এর তীর ঘুরে গেল 5-এ',
    whatHappens:
      '`prev` শুরুতে মান 5-এর নোড (ভেতরের কল যা ফেরত দিল), আর `cur` এই গ্রুপের head — মান 3। প্রথমে `next = cur.next` (মান 4) ধরে রাখা হলো, তারপর `cur.next = prev` — অর্থাৎ 3 এখন 5-কে দেখায়। `prev` হলো 3, `cur` হলো 4।',
    whyItMatters:
      '`next` আগে ধরে না রাখলে পরের লাইনেই মান 4-এর নোডের ঠিকানা চিরতরে হারিয়ে যেত — কারণ 3-ই ছিল তার একমাত্র রেফারেন্স। তিন লাইনের এই নাচটাই (ধরে রাখো → ঘোরাও → এগোও) সব in-place reversal-এর মূল।',
    highlightLines: [11, 12, 13, 14, 15],
    vars: [
      { name: 'depth', value: 2 },
      { name: 'prev', value: 3 },
      { name: 'cur', value: 4 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chain({ ...INITIAL, n3: 'n5' }, { n3: 'done', n4: 'active' }),
      pointers: [
        { name: 'prev', nodeId: 'n3' },
        { name: 'cur', nodeId: 'n4' },
      ],
      caption: 'depth 2 — 3-এর তীর এখন সামনে নয়, লাফিয়ে 5-এ। এটাই ↳ চিহ্ন।',
    },
  },

  {
    id: '3.3-relink-2',
    title: 'depth 2 — 4-এর তীর ঘুরল 3-এ, গ্রুপ শেষ',
    whatHappens:
      '`cur` এখন মান 4। `next = 5` ধরে রেখে `cur.next = prev` — 4 এখন 3-কে দেখায়। `count` শূন্য হয়ে গেল, লুপ শেষ। depth 2 ফেরত দিল `prev` = মান 4-এর নোড।',
    whyItMatters:
      'গ্রুপ (3,4) এখন উল্টে গেছে: `4 → 3 → 5`। খেয়াল করুন 3-এর তীরটা আগেই 5-এ জোড়া লেগে ছিল — তাই উল্টানো গ্রুপটা বাকি লিস্ট থেকে এক মুহূর্তের জন্যও বিচ্ছিন্ন হয়নি।',
    highlightLines: [11, 12, 13, 14, 15, 17],
    vars: [
      { name: 'depth', value: 2 },
      { name: 'prev', value: 4 },
      { name: 'return', value: 4 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chain({ ...INITIAL, n3: 'n5', n4: 'n3' }, { n3: 'done', n4: 'done' }),
      pointers: [{ name: 'prev', nodeId: 'n4' }],
      caption: 'depth 2 শেষ — এই অংশটা এখন 4 → 3 → 5।',
    },
  },

  {
    id: '3.3-relink-3',
    title: 'depth 1 — 1-এর তীর ঘুরল 4-এ',
    whatHappens:
      'বাইরের কলে ফেরা হলো। `prev` = মান 4-এর নোড (ভেতর থেকে যা ফেরত এল), `cur` = মান 1। `next = 2` ধরে রেখে `cur.next = prev` — 1 এখন 4-কে দেখায়। `prev` হলো 1, `cur` হলো 2।',
    whyItMatters:
      'ভেতরের কল আগেই তার অংশটা সাজিয়ে রেখেছিল, তাই এখানে শুধু সেই সাজানো অংশের নতুন head-এর সাথে জোড়া লাগাতে হলো। recursion-এর এই ভাগাভাগিই কোডটাকে ছোট রাখে।',
    highlightLines: [11, 12, 13, 14, 15],
    vars: [
      { name: 'depth', value: 1 },
      { name: 'prev', value: 1 },
      { name: 'cur', value: 2 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chain(
        { ...INITIAL, n3: 'n5', n4: 'n3', n1: 'n4' },
        { n1: 'done', n2: 'active' }
      ),
      pointers: [
        { name: 'prev', nodeId: 'n1' },
        { name: 'cur', nodeId: 'n2' },
      ],
      caption: 'depth 1 — 1 এখন উল্টানো অংশের মাথা (4)-এ জোড়া লেগেছে।',
    },
  },

  {
    id: '3.3-relink-4',
    title: 'depth 1 — 2-এর তীর ঘুরল 1-এ, কাজ শেষ',
    whatHappens:
      '`cur` = মান 2। `cur.next = prev` — 2 এখন 1-কে দেখায়। `count` শূন্য, লুপ শেষ। চূড়ান্ত `return prev` = মান 2-এর নোড, যেটাই নতুন head।',
    highlightLines: [11, 12, 13, 14, 15, 17],
    vars: [
      { name: 'depth', value: 1 },
      { name: 'prev', value: 2 },
      { name: 'নতুন head', value: 2 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chain(
        { n1: 'n4', n2: 'n1', n3: 'n5', n4: 'n3', n5: null },
        { n1: 'done', n2: 'done', n3: 'done', n4: 'done', n5: 'done' }
      ),
      pointers: [{ name: 'head', nodeId: 'n2' }],
      caption: 'মূল অবস্থানে সাজানো — প্রতিটা ↳ দেখাচ্ছে তীরটা কোথায় ঘুরেছে।',
    },
  },

  {
    id: '3.3-done',
    title: 'শেষ — 2 → 1 → 4 → 3 → 5',
    whatHappens:
      'এবার নোডগুলো চেইনের ক্রমেই সাজিয়ে দেখানো হলো: `2 → 1 → 4 → 3 → 5`। মান 5 একা ছিল, তাই অপরিবর্তিত।',
    whyItMatters:
      'উপরের ধাপে নোডগুলো মূল জায়গায় বসানো ছিল বলেই ঘুরে যাওয়া তীরগুলো (↳) চোখে পড়েছে। এখানে চেইনের ক্রমে সাজানোয় ফলাফলটা একটা লিস্ট হিসেবে পড়া যাচ্ছে — একই ডেটা, শুধু দেখার কোণ আলাদা। খরচ O(n) সময়; recursion-এর স্ট্যাক ধরলে জায়গা O(n/k)।',
    highlightLines: [17],
    vars: [{ name: 'উত্তর', value: '2,1,4,3,5' }],
    scene: {
      kind: 'linked-list',
      nodes: ['n2', 'n1', 'n4', 'n3', 'n5'].map((id, i, all) => ({
        id,
        val: VALUES[id],
        nextId: all[i + 1] ?? null,
        mark: 'done' as const,
      })),
      output: { title: 'ফলাফল', values: [2, 1, 4, 3, 5] },
      caption: 'প্রতি ২টার গ্রুপ উল্টে গেছে; শেষের একাকী 5 অক্ষত।',
    },
  },
];

export const inPlaceReversalSim: PatternSimulation = {
  patternId: '3.3',
  input: 'head = [1,2,3,4,5], k = 2',
  output: '[2,1,4,3,5]',
  steps,
};
