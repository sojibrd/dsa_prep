import type { PatternSimulation, SimStep } from '../types';

/**
 * 1.3 Prefix Sum — Subarray Sum Equals K (LC 560).
 *
 * The exact input from the pattern's own demo statement (`nums=[1,1,1], k=2`)
 * — small enough on its own that inventing a longer one would only have
 * padded the run without teaching more.
 */

const NUMS = [1, 1, 1];
const K = 2;

function seenTable(entries: [number, number][], justUsed?: number) {
  return {
    title: 'seen',
    entries: entries.map(([key, value]) => ({
      key: String(key),
      value,
      mark: key === justUsed ? ('fill' as const) : undefined,
    })),
  };
}

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — খালি prefix গোনা আছে',
    whatHappens: 'seen = {0: 1} — "যোগফল শূন্য" একবার দেখা গেছে, কারণ কিছু না নেওয়াটাও একটা বৈধ prefix। sum ও count দুটোই ০।',
    whyItMatters:
      'এই একটা এন্ট্রি ছাড়া nums[0..j] নিজেই k-এর সমান হলে সেটা মিস হয়ে যেত — [0,1]-কে "prefix − k = 0" হিসেবে ধরার জন্যই এই সিড।',
    highlightLines: [2, 3, 4],
    vars: [
      { name: 'sum', value: 0 },
      { name: 'count', value: 0 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      table: seenTable([[0, 1]]),
      caption: `nums = [1, 1, 1], k = ${K}`,
    },
  },
  {
    id: 'i0',
    title: 'i=0 — sum=1, দরকারি prefix (1−2=−1) নেই',
    whatHappens: 'sum += 1 → 1। খুঁজছি sum−k = −1, যা seen-এ নেই — count অপরিবর্তিত। এখন seen-এ 1 যোগ হলো।',
    highlightLines: [6, 7, 8],
    vars: [
      { name: 'sum', value: 1 },
      { name: 'count', value: 0 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'i', index: 0 }],
      marks: { 0: 'active' },
      subValues: { 0: 'sum=1' },
      table: seenTable([[0, 1], [1, 1]], 1),
    },
  },
  {
    id: 'i1',
    title: 'i=1 — sum=2, প্রথম subarray মিলল',
    whatHappens: 'sum += 1 → 2। sum−k = 0, আর seen[0] = 1 — মানে "সবকিছু বাদ দিলে" ঠিক k পাওয়া যায়। count += 1 = 1। এটাই [1,1] (index 0..1)।',
    whyItMatters: 'seen[0]=1 ব্যবহার হলো এখানেই — শুরুর সিডটা ঠিক এই মুহূর্তের জন্য রাখা।',
    highlightLines: [6, 7, 8],
    vars: [
      { name: 'sum', value: 2 },
      { name: 'count', value: 1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'i', index: 1 }],
      marks: { 0: 'done', 1: 'active' },
      subValues: { 0: 'sum=1', 1: 'sum=2' },
      table: seenTable([[0, 1], [1, 1], [2, 1]], 0),
      output: { title: 'মিলেছে', values: ['[1,1]'] },
    },
  },
  {
    id: 'i2',
    title: 'i=2 — sum=3, দ্বিতীয় subarray মিলল',
    whatHappens: 'sum += 1 → 3। sum−k = 1, seen[1] = 1 — মানে index 1 থেকে এখানে পর্যন্ত (index 1..2) যোগফল k। count += 1 = 2।',
    whyItMatters: 'দুটো ভিন্ন subarray-ই [1,1] দেখতে এক রকম কিন্তু আলাদা index-এ — hashmap সেটা গুলিয়ে ফেলে না, কারণ key sum-এর মান, subarray নয়।',
    highlightLines: [6, 7, 8],
    vars: [
      { name: 'sum', value: 3 },
      { name: 'count', value: 2 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'i', index: 2 }],
      marks: { 0: 'done', 1: 'done', 2: 'active' },
      subValues: { 0: 'sum=1', 1: 'sum=2', 2: 'sum=3' },
      table: seenTable([[0, 1], [1, 1], [2, 1], [3, 1]], 1),
      output: { title: 'মিলেছে', values: ['[1,1]', '[1,1]'] },
    },
  },
  {
    id: 'done',
    title: 'array শেষ — count-ই উত্তর',
    whatHappens: 'আর কোনো index বাকি নেই। মোট মিলেছে ২টা subarray — উত্তর count = 2।',
    whyItMatters:
      'প্রতিটা index-এ শুধু একটা map lookup আর একটা insert — nested loop ছাড়াই O(n)। brute force-এ প্রতিটা (i, j) জোড়া চেক করতে হতো, O(n²)।',
    highlightLines: [10],
    vars: [
      { name: 'sum', value: 3 },
      { name: 'count', value: 2 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'done', 1: 'done', 2: 'done' },
      subValues: { 0: 'sum=1', 1: 'sum=2', 2: 'sum=3' },
      table: seenTable([[0, 1], [1, 1], [2, 1], [3, 1]]),
      output: { title: 'উত্তর', values: [2] },
    },
  },
];

export const prefixSumSim: PatternSimulation = {
  patternId: '1.3',
  input: 'nums = [1,1,1], k = 2',
  output: '2',
  steps,
};
