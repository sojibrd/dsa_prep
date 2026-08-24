import type { PatternSimulation, SimStep } from '../types';

/**
 * 1.4 Hashing / Frequency Counting — Longest Consecutive Sequence (LC 128).
 *
 * The pattern's own demo input, `[100,4,200,1,3,2]` — chosen by the workbook
 * because it has exactly one real chain (1-2-3-4) buried among numbers that
 * lead nowhere, which is the whole point of the "only start from a true
 * beginning" trick.
 */

const NUMS = [100, 4, 200, 1, 3, 2];

function setTable(active?: number, chain: number[] = []) {
  return {
    title: 'set',
    entries: NUMS.map((n) => ({
      key: String(n),
      mark: n === active ? ('active' as const) : chain.includes(n) ? ('fill' as const) : undefined,
    })),
  };
}

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — সব সংখ্যা একটা Set-এ',
    whatHappens: 'nums-এর প্রতিটা সংখ্যা Set-এ ঢুকে গেল — এখন যেকোনো সংখ্যা আছে কি না O(1)-এ জিজ্ঞেস করা যায়। best = 0।',
    whyItMatters: 'sort না করেই "পাশের সংখ্যা আছে কি না" জানা যাচ্ছে — এটাই sort-ভিত্তিক O(n log n) সমাধানের চেয়ে দ্রুত হওয়ার চাবি।',
    highlightLines: [2, 3],
    vars: [{ name: 'best', value: 0 }],
    scene: {
      kind: 'array',
      values: NUMS,
      table: setTable(),
      caption: 'nums = [100, 4, 200, 1, 3, 2]',
    },
  },
  {
    id: 'x100',
    title: 'x=100 — শুরু (99 নেই), কিন্তু একলা',
    whatHappens: 'set.has(99) মিথ্যা, তাই 100 কোনো chain-এর শুরু। len=1 থেকে বাড়ানোর চেষ্টা — set.has(101) মিথ্যা, তাই থেমে গেল। best = max(0, 1) = 1।',
    highlightLines: [4, 5, 6, 7, 8],
    vars: [
      { name: 'x', value: 100 },
      { name: 'len', value: 1 },
      { name: 'best', value: 1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'x', index: 0 }],
      marks: { 0: 'active' },
      table: setTable(100, [100]),
      output: { title: 'chain', values: [100] },
    },
  },
  {
    id: 'x4',
    title: 'x=4 — 3 আছে, তাই এখান থেকে শুরু না',
    whatHappens: 'set.has(3) সত্যি — মানে 4 কোনো chain-এর মাথা নয়, মাঝখানে বা শেষে। continue দিয়ে সরাসরি পরের সংখ্যায়।',
    whyItMatters: 'এই লাইনটাই পুরো ট্রিকের কেন্দ্র: প্রতিটা সংখ্যা থেকে chain গোনা শুরু করলে O(n²)-এর কাছাকাছি চলে যেত — শুধু সত্যিকারের শুরু থেকেই গোনা হয়, তাই প্রতিটা সংখ্যা মোট মিলিয়ে সর্বোচ্চ দুবার দেখা হয়।',
    highlightLines: [4, 5],
    vars: [
      { name: 'x', value: 4 },
      { name: 'best', value: 1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'x', index: 1 }],
      marks: { 0: 'done', 1: 'reject' },
      table: setTable(4),
      output: { title: 'chain', values: [100] },
    },
  },
  {
    id: 'x200',
    title: 'x=200 — আরেকটা একলা শুরু',
    whatHappens: 'set.has(199) মিথ্যা, তাই শুরু ধরা হলো। len=1-এ আটকে গেল, set.has(201) মিথ্যা। best অপরিবর্তিত থাকল — max(1, 1) = 1।',
    highlightLines: [4, 5, 6, 7, 8],
    vars: [
      { name: 'x', value: 200 },
      { name: 'len', value: 1 },
      { name: 'best', value: 1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'x', index: 2 }],
      marks: { 0: 'done', 1: 'reject', 2: 'active' },
      table: setTable(200, [200]),
      output: { title: 'chain', values: [200] },
    },
  },
  {
    id: 'x1-start',
    title: 'x=1 — আসল chain-এর শুরু',
    whatHappens: 'set.has(0) মিথ্যা — 1 হলো এই chain-এর মাথা। len=1 থেকে শুরু, এবার সংলগ্ন সংখ্যা খোঁজা হবে।',
    whyItMatters: 'এখানেই মূল কাজ — বাকি সব x শুধু "শুরু কিনা" চেক করে থেমে গেছে, কিন্তু 1 থেকে আসলে একটা লম্বা chain আছে।',
    highlightLines: [4, 5, 6],
    vars: [
      { name: 'x', value: 1 },
      { name: 'len', value: 1 },
      { name: 'best', value: 1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'x', index: 3 }],
      marks: { 0: 'done', 1: 'reject', 2: 'done', 3: 'active' },
      table: setTable(1, [1]),
      output: { title: 'chain', values: [1] },
    },
  },
  {
    id: 'x1-extend-2',
    title: 'set.has(2) সত্যি — chain বাড়ল',
    whatHappens: '1+1=2 সেটে আছে, len 1→2। এবার 1+2=3 আছে কিনা দেখা হবে।',
    highlightLines: [7],
    vars: [
      { name: 'x', value: 1 },
      { name: 'len', value: 2 },
      { name: 'best', value: 1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'x', index: 3 }],
      marks: { 0: 'done', 1: 'reject', 2: 'done', 3: 'active' },
      table: setTable(2, [1, 2]),
      output: { title: 'chain', values: [1, 2] },
    },
  },
  {
    id: 'x1-extend-3',
    title: 'set.has(3) সত্যি — chain আরও বাড়ল',
    whatHappens: '1+2=3 সেটে আছে, len 2→3।',
    highlightLines: [7],
    vars: [
      { name: 'x', value: 1 },
      { name: 'len', value: 3 },
      { name: 'best', value: 1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'x', index: 3 }],
      marks: { 0: 'done', 1: 'reject', 2: 'done', 3: 'active' },
      table: setTable(3, [1, 2, 3]),
      output: { title: 'chain', values: [1, 2, 3] },
    },
  },
  {
    id: 'x1-extend-4',
    title: 'set.has(4) সত্যি — chain আরেকবার বাড়ল',
    whatHappens: '1+3=4 সেটে আছে, len 3→4।',
    highlightLines: [7],
    vars: [
      { name: 'x', value: 1 },
      { name: 'len', value: 4 },
      { name: 'best', value: 1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'x', index: 3 }],
      marks: { 0: 'done', 1: 'active', 2: 'done', 3: 'active' },
      table: setTable(4, [1, 2, 3, 4]),
      output: { title: 'chain', values: [1, 2, 3, 4] },
    },
  },
  {
    id: 'x1-stop',
    title: 'set.has(5) মিথ্যা — chain থামল, best আপডেট',
    whatHappens: '1+4=5 সেটে নেই — লুপ থামল। best = max(1, 4) = 4।',
    whyItMatters: 'এই একটা chain-ই পুরো উত্তর — বাকি সব শুরু len=1-এ আটকে গেছে বলে best-কে ছাড়িয়ে যায়নি।',
    highlightLines: [7, 8],
    vars: [
      { name: 'x', value: 1 },
      { name: 'len', value: 4 },
      { name: 'best', value: 4 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'x', index: 3 }],
      marks: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' },
      table: setTable(undefined, [1, 2, 3, 4]),
      output: { title: 'chain', values: [1, 2, 3, 4] },
    },
  },
  {
    id: 'x3',
    title: 'x=3 — 2 আছে, শুরু নয়',
    whatHappens: 'set.has(2) সত্যি — 3 chain-এর মাঝখানে, তাই skip।',
    highlightLines: [4, 5],
    vars: [
      { name: 'x', value: 3 },
      { name: 'best', value: 4 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'x', index: 4 }],
      marks: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'reject' },
      table: setTable(3, [1, 2, 3, 4]),
      output: { title: 'chain', values: [1, 2, 3, 4] },
    },
  },
  {
    id: 'x2',
    title: 'x=2 — 1 আছে, শুরু নয়',
    whatHappens: 'set.has(1) সত্যি — skip। Set শেষ।',
    highlightLines: [4, 5],
    vars: [
      { name: 'x', value: 2 },
      { name: 'best', value: 4 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'x', index: 5 }],
      marks: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'reject', 5: 'reject' },
      table: setTable(2, [1, 2, 3, 4]),
      output: { title: 'chain', values: [1, 2, 3, 4] },
    },
  },
  {
    id: 'done',
    title: 'Set শেষ — best-ই উত্তর',
    whatHappens: 'সব সংখ্যা দেখা শেষ। সবচেয়ে লম্বা consecutive chain ছিল 1-2-3-4, দৈর্ঘ্য 4।',
    whyItMatters: 'প্রতিটা সংখ্যা সর্বোচ্চ দুবার দেখা হয়েছে — একবার for-এর x হিসেবে, একবার কোনো chain-এর while-এ। sort করলে O(n log n) লাগত; এখানে O(n)।',
    highlightLines: [10],
    vars: [{ name: 'best', value: 4 }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'reject', 5: 'reject' },
      table: setTable(undefined, [1, 2, 3, 4]),
      output: { title: 'উত্তর', values: [4] },
    },
  },
];

export const hashingSim: PatternSimulation = {
  patternId: '1.4',
  input: 'nums = [100,4,200,1,3,2]',
  output: '4',
  steps,
};
