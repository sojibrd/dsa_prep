import type { PatternSimulation, SimStep } from '../types';

/**
 * 1.5 Merge Intervals — Merge Intervals (LC 56).
 *
 * The pattern's own demo input. Already sorted by start, which is worth
 * saying out loud in `init` — the sort is one line of the real solution and
 * easy to read past.
 */

const SORTED = [
  { start: 1, end: 3 },
  { start: 2, end: 6 },
  { start: 8, end: 10 },
  { start: 15, end: 18 },
];

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — start অনুযায়ী sort করা, res-এ প্রথমটা',
    whatHappens: 'intervals ইতিমধ্যে start অনুযায়ী সাজানো। res শুরু হলো প্রথম interval [1,3] দিয়ে — এখন থেকে প্রতিটা interval-কে res-এর শেষটার সাথে তুলনা করা হবে।',
    whyItMatters: 'sort না করলে overlap ধরার জন্য প্রতিটা জোড়া তুলনা করতে হতো — O(n²)। sort-এর পর merge হয় মাত্র এক পাসে, res-এর শেষ interval-টাই যথেষ্ট তুলনার জন্য।',
    highlightLines: [2, 3],
    vars: [{ name: 'i', value: '—' }],
    scene: {
      kind: 'intervals',
      intervals: SORTED.map((iv, idx) => (idx === 0 ? { ...iv, mark: 'done' } : iv)),
      result: [{ start: 1, end: 3, mark: 'done' }],
      axis: { from: 0, to: 19 },
      caption: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
    },
  },
  {
    id: 'i1-merge',
    title: 'i=1 — [2,6] শেষ interval-এর সাথে মেলে',
    whatHappens: 's=2 ≤ last[1]=3, তাই overlap। last[1] = max(3, 6) = 6 — res-এর শেষ interval বড় হয়ে গেল [1,6]।',
    whyItMatters: '[1,3] আর [2,6] আলাদা রাখলে দুটোই সত্য বলত, কিন্তু আসলে একটাই একটানা রেঞ্জ — end বাড়িয়ে সেটাই বলা হচ্ছে।',
    highlightLines: [5, 6, 7, 8],
    vars: [
      { name: 'i', value: 1 },
      { name: 's,e', value: '2, 6' },
      { name: 'last', value: '[1, 3]' },
    ],
    scene: {
      kind: 'intervals',
      intervals: SORTED.map((iv, idx) => (idx <= 1 ? { ...iv, mark: idx === 1 ? 'active' : 'done' } : iv)),
      result: [{ start: 1, end: 6, mark: 'fill' }],
      axis: { from: 0, to: 19 },
      caption: 'overlap → merge, res-এর শেষটাই বড় হয়',
    },
  },
  {
    id: 'i2-push',
    title: 'i=2 — [8,10] মেলে না, নতুন interval',
    whatHappens: 's=8 ≤ last[1]=6? না — কোনো overlap নেই। [8,10] সরাসরি res-এ push হলো।',
    highlightLines: [5, 6, 7, 9],
    vars: [
      { name: 'i', value: 2 },
      { name: 's,e', value: '8, 10' },
      { name: 'last', value: '[1, 6]' },
    ],
    scene: {
      kind: 'intervals',
      intervals: SORTED.map((iv, idx) => (idx <= 2 ? { ...iv, mark: idx === 2 ? 'active' : 'done' } : iv)),
      result: [
        { start: 1, end: 6, mark: 'done' },
        { start: 8, end: 10, mark: 'fill' },
      ],
      axis: { from: 0, to: 19 },
    },
  },
  {
    id: 'i3-push',
    title: 'i=3 — [15,18]-ও মেলে না',
    whatHappens: 's=15 ≤ last[1]=10? না — আবারও নতুন interval হিসেবে push।',
    highlightLines: [5, 6, 7, 9],
    vars: [
      { name: 'i', value: 3 },
      { name: 's,e', value: '15, 18' },
      { name: 'last', value: '[8, 10]' },
    ],
    scene: {
      kind: 'intervals',
      intervals: SORTED.map((iv, idx) => ({ ...iv, mark: idx === 3 ? 'active' : 'done' })),
      result: [
        { start: 1, end: 6, mark: 'done' },
        { start: 8, end: 10, mark: 'done' },
        { start: 15, end: 18, mark: 'fill' },
      ],
      axis: { from: 0, to: 19 },
    },
  },
  {
    id: 'done',
    title: 'সব interval দেখা শেষ',
    whatHappens: 'res = [[1,6],[8,10],[15,18]] — তিনটা non-overlapping interval, যেখানে প্রথম দুটো ইনপুট মিলে একটাই হয়ে গেছে।',
    whyItMatters: 'sort-এর খরচ O(n log n), তারপর merge মাত্র O(n) — মোট O(n log n), যেটা এই প্যাটার্নের প্রায় সব প্রবলেমে একই থাকে।',
    highlightLines: [11],
    vars: [],
    scene: {
      kind: 'intervals',
      intervals: SORTED.map((iv) => ({ ...iv, mark: 'done' as const })),
      result: [
        { start: 1, end: 6, mark: 'done' },
        { start: 8, end: 10, mark: 'done' },
        { start: 15, end: 18, mark: 'done' },
      ],
      axis: { from: 0, to: 19 },
      output: { title: 'উত্তর', values: ['[1,6]', '[8,10]', '[15,18]'] },
    },
  },
];

export const mergeIntervalsSim: PatternSimulation = {
  patternId: '1.5',
  input: '[[1,3],[2,6],[8,10],[15,18]]',
  output: '[[1,6],[8,10],[15,18]]',
  steps,
};
