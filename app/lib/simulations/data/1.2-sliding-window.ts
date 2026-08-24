import type { PatternSimulation, SimStep } from '../types';

/**
 * 1.2 Sliding Window — Minimum Window Substring (LC 76).
 *
 * A shorter instructive pair than the demo's own example (`s="ADCBEC"`,
 * `t="ABC"`) — long enough to show a real shrink, short enough to fit a
 * screen. The `need` map is the second structure this pattern lives or dies
 * by, so it rides beside the string as a table, not folded into the array.
 */

const S = ['A', 'D', 'C', 'B', 'E', 'C'];
const NEEDED = new Set(['A', 'B', 'C']);

/** `need` counts as they stand after a given point in the run. */
function needTable(counts: Record<string, number>) {
  return {
    title: 'need',
    entries: Object.entries(counts).map(([key, value]) => ({
      key,
      value,
      mark: value <= 0 ? ('fill' as const) : undefined,
    })),
  };
}

function marksFor(l: number, r: number): Record<number, 'done' | 'active' | 'reject'> {
  const marks: Record<number, 'done' | 'active' | 'reject'> = {};
  for (let i = 0; i < l; i++) marks[i] = 'done';
  for (let i = l; i <= r; i++) {
    if (i === r) marks[i] = 'active';
    else if (!NEEDED.has(S[i])) marks[i] = 'reject';
  }
  return marks;
}

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — need তৈরি, missing = 3',
    whatHappens: 't="ABC"-এর প্রতিটা char need ম্যাপে গেল, প্রতিটার count 1। missing = 3 — এখনো তিনটা char বাকি জোগাড় করতে।',
    whyItMatters:
      'missing একটা single number-এ পুরো "window valid কি না" প্রশ্নের উত্তর ধরে রাখে — প্রতিবার পুরো map স্ক্যান করে চেক করতে হয় না।',
    highlightLines: [2, 3, 4, 5, 6],
    vars: [
      { name: 'r', value: '—' },
      { name: 'l', value: 0 },
      { name: 'missing', value: 3 },
      { name: 'best', value: '[0, ∞]' },
    ],
    scene: {
      kind: 'array',
      values: S,
      pointers: [{ name: 'l', index: 0 }],
      table: needTable({ A: 1, B: 1, C: 1 }),
      caption: 's = "ADCBEC", t = "ABC" — need ম্যাপে যা লাগবে তাই আছে।',
    },
  },
  {
    id: 'r0',
    title: 'r=0 — "A" দরকারি, missing 3→2',
    whatHappens: 'need.has("A") সত্যি আর count এখনো পজিটিভ, তাই missing এক কমল। need["A"] = 0।',
    highlightLines: [8, 9, 10, 11],
    vars: [
      { name: 'r', value: 0 },
      { name: 'l', value: 0 },
      { name: 'missing', value: 2 },
      { name: 'best', value: '[0, ∞]' },
    ],
    scene: {
      kind: 'array',
      values: S,
      pointers: [
        { name: 'l', index: 0 },
        { name: 'r', index: 0 },
      ],
      window: { from: 0, to: 0, label: 'window' },
      marks: marksFor(0, 0),
      table: needTable({ A: 0, B: 1, C: 1 }),
    },
  },
  {
    id: 'r1',
    title: 'r=1 — "D" দরকার নেই',
    whatHappens: 'need.has("D") মিথ্যা — এই char গোনার মধ্যেই পড়ে না, missing অপরিবর্তিত।',
    whyItMatters: 'অদরকারি char-ও window-এর মধ্যে থাকতে পারে — শুধু গোনায় ধরা হচ্ছে না।',
    highlightLines: [8, 9],
    vars: [
      { name: 'r', value: 1 },
      { name: 'l', value: 0 },
      { name: 'missing', value: 2 },
      { name: 'best', value: '[0, ∞]' },
    ],
    scene: {
      kind: 'array',
      values: S,
      pointers: [
        { name: 'l', index: 0 },
        { name: 'r', index: 1 },
      ],
      window: { from: 0, to: 1, label: 'window' },
      marks: marksFor(0, 1),
      table: needTable({ A: 0, B: 1, C: 1 }),
    },
  },
  {
    id: 'r2',
    title: 'r=2 — "C" দরকারি, missing 2→1',
    whatHappens: 'need["C"] ছিল পজিটিভ (1), তাই missing কমল। need["C"] = 0।',
    highlightLines: [8, 9, 10, 11],
    vars: [
      { name: 'r', value: 2 },
      { name: 'l', value: 0 },
      { name: 'missing', value: 1 },
      { name: 'best', value: '[0, ∞]' },
    ],
    scene: {
      kind: 'array',
      values: S,
      pointers: [
        { name: 'l', index: 0 },
        { name: 'r', index: 2 },
      ],
      window: { from: 0, to: 2, label: 'window' },
      marks: marksFor(0, 2),
      table: needTable({ A: 0, B: 1, C: 0 }),
    },
  },
  {
    id: 'r3',
    title: 'r=3 — "B" দরকারি, missing 1→0',
    whatHappens: 'শেষ বাকি char-টাও পাওয়া গেল — missing = 0। window [0,3] = "ADCB" এখন valid।',
    whyItMatters: 'missing শূন্য হওয়া মাত্র বাইরের for loop থেমে ভেতরের while (শ্রিংক) শুরু হবে — এখান থেকেই ছোট করার চেষ্টা।',
    highlightLines: [8, 9, 10, 11],
    vars: [
      { name: 'r', value: 3 },
      { name: 'l', value: 0 },
      { name: 'missing', value: 0 },
      { name: 'best', value: '[0, ∞]' },
    ],
    scene: {
      kind: 'array',
      values: S,
      pointers: [
        { name: 'l', index: 0 },
        { name: 'r', index: 3 },
      ],
      window: { from: 0, to: 3, label: 'window' },
      marks: marksFor(0, 3),
      table: needTable({ A: 0, B: 0, C: 0 }),
    },
  },
  {
    id: 'valid-1',
    title: 'valid window রেকর্ড হলো — best = [0, 3]',
    whatHappens: 'দৈর্ঘ্য 3−0=3, আগের best (Infinity) থেকে ছোট — তাই best = [0, 3], মানে "ADCB"।',
    highlightLines: [13, 14, 15],
    vars: [
      { name: 'r', value: 3 },
      { name: 'l', value: 0 },
      { name: 'missing', value: 0 },
      { name: 'best', value: '[0, 3]' },
    ],
    scene: {
      kind: 'array',
      values: S,
      pointers: [
        { name: 'l', index: 0 },
        { name: 'r', index: 3 },
      ],
      window: { from: 0, to: 3, label: 'best so far' },
      marks: marksFor(0, 3),
      table: needTable({ A: 0, B: 0, C: 0 }),
      output: { title: 'best window', values: ['ADCB'] },
    },
  },
  {
    id: 'shrink-1',
    title: 'বাঁ দিক থেকে শ্রিংক — "A" ছেড়ে দিল',
    whatHappens: 's[l]="A" বেরিয়ে গেল window থেকে। need["A"] = 0+1 = 1, আর এখন positive হওয়ায় missing = 0+1 = 1। l এগিয়ে ১-এ।',
    whyItMatters: '"A" ছাড়ার সাথে সাথেই window আর valid থাকল না — while (missing === 0) এখানেই থেমে যাবে।',
    highlightLines: [16, 17, 18, 19, 21],
    vars: [
      { name: 'r', value: 3 },
      { name: 'l', value: 1 },
      { name: 'missing', value: 1 },
      { name: 'best', value: '[0, 3]' },
    ],
    scene: {
      kind: 'array',
      values: S,
      pointers: [
        { name: 'l', index: 1 },
        { name: 'r', index: 3 },
      ],
      window: { from: 1, to: 3, label: 'window' },
      marks: marksFor(1, 3),
      table: needTable({ A: 1, B: 0, C: 0 }),
      output: { title: 'best window', values: ['ADCB'] },
    },
  },
  {
    id: 'r4',
    title: 'r=4 — "E" দরকার নেই',
    whatHappens: 'missing 1, "E" গোনার বাইরে — window বড় হলো কিন্তু আবার valid হলো না।',
    highlightLines: [8, 9],
    vars: [
      { name: 'r', value: 4 },
      { name: 'l', value: 1 },
      { name: 'missing', value: 1 },
      { name: 'best', value: '[0, 3]' },
    ],
    scene: {
      kind: 'array',
      values: S,
      pointers: [
        { name: 'l', index: 1 },
        { name: 'r', index: 4 },
      ],
      window: { from: 1, to: 4, label: 'window' },
      marks: marksFor(1, 4),
      table: needTable({ A: 1, B: 0, C: 0 }),
      output: { title: 'best window', values: ['ADCB'] },
    },
  },
  {
    id: 'r5',
    title: 'r=5 — দ্বিতীয় "C", কিন্তু কাজে লাগল না',
    whatHappens: 'need["C"] ইতিমধ্যে 0 (আগেই satisfied), তাই এই কপি missing কমায় না — need["C"] হয়ে যায় −1, একটা বাড়তি কপি জমা থাকল।',
    whyItMatters: 'যা দরকার তার চেয়ে বেশি কপি পাওয়া "নতুন করে সাহায্য" নয় — শুধু গণনায় ধরা থাকল, missing-এ প্রভাব নেই। মূল গ্যাপটা এখনো "A"।',
    highlightLines: [8, 9, 10, 11],
    vars: [
      { name: 'r', value: 5 },
      { name: 'l', value: 1 },
      { name: 'missing', value: 1 },
      { name: 'best', value: '[0, 3]' },
    ],
    scene: {
      kind: 'array',
      values: S,
      pointers: [
        { name: 'l', index: 1 },
        { name: 'r', index: 5 },
      ],
      window: { from: 1, to: 5, label: 'window' },
      marks: marksFor(1, 5),
      table: needTable({ A: 1, B: 0, C: -1 }),
      output: { title: 'best window', values: ['ADCB'] },
    },
  },
  {
    id: 'done',
    title: 'string শেষ — best-ই চূড়ান্ত উত্তর',
    whatHappens: 'r আর বাড়ানোর জায়গা নেই। missing আর কখনো 0-এ ফেরেনি, তাই best অপরিবর্তিত। উত্তর: "ADCB"।',
    whyItMatters:
      'প্রতিটা char সর্বোচ্চ দুবার দেখা হয় — একবার r বাড়ার সময়, একবার l বাড়ার সময় — তাই O(|s| + |t|), একবারও nested scan লাগেনি।',
    highlightLines: [24],
    vars: [
      { name: 'r', value: 5 },
      { name: 'l', value: 1 },
      { name: 'missing', value: 1 },
      { name: 'best', value: '[0, 3]' },
    ],
    scene: {
      kind: 'array',
      values: S,
      pointers: [
        { name: 'l', index: 1 },
        { name: 'r', index: 5 },
      ],
      window: { from: 0, to: 3, label: 'answer' },
      marks: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'reject', 5: 'reject' },
      table: needTable({ A: 1, B: 0, C: -1 }),
      output: { title: 'উত্তর', values: ['ADCB'] },
    },
  },
];

export const slidingWindowSim: PatternSimulation = {
  patternId: '1.2',
  input: 's = "ADCBEC", t = "ABC"',
  output: '"ADCB"',
  steps,
};
