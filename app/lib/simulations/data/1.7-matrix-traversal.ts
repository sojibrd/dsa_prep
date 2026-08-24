import type { PatternSimulation, SimStep } from '../types';

/**
 * 1.7 Matrix Traversal — Spiral Matrix (LC 54).
 *
 * The pattern's own demo input, a 3×3 grid — small enough that both full
 * layers of the spiral fit on one screen.
 */

const MATRIX = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

function marksFor(cells: [number, number][]): Record<string, 'done'> {
  const marks: Record<string, 'done'> = {};
  for (const [r, c] of cells) marks[`${r},${c}`] = 'done';
  return marks;
}

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — চারটা সীমানা পুরো matrix ঘিরে',
    whatHappens: 'top=0, bottom=2, left=0, right=2 — এখনো পুরো grid-ই "এখনো হাঁটা বাকি" অংশ। res খালি।',
    whyItMatters: 'এই চারটা সংখ্যাই পুরো state — কোনো visited[][] array লাগে না, বাউন্ডারি গুটিয়ে আনাই যথেষ্ট।',
    highlightLines: [2, 3, 4, 5, 6],
    vars: [
      { name: 'top', value: 0 },
      { name: 'bottom', value: 2 },
      { name: 'left', value: 0 },
      { name: 'right', value: 2 },
    ],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      bounds: { top: 0, bottom: 2, left: 0, right: 2 },
      caption: '3×3 matrix — ডান → নিচ → বাম → উপর ক্রমে হাঁটা হবে',
    },
  },
  {
    id: 'top-row-1',
    title: 'উপরের সারি (row 0) বাঁ থেকে ডানে',
    whatHappens: 'j = left..right ধরে row top-এর প্রতিটা ঘর res-এ গেল: 1, 2, 3। এই সারি শেষ, তাই top++ → 1।',
    highlightLines: [8, 9],
    vars: [{ name: 'top', value: 1 }],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      cursor: { row: 0, col: 2 },
      marks: marksFor([[0, 0], [0, 1], [0, 2]]),
      bounds: { top: 0, bottom: 2, left: 0, right: 2 },
      output: { title: 'res', values: [1, 2, 3] },
    },
  },
  {
    id: 'right-col-1',
    title: 'ডান কলাম (col 2) উপর থেকে নিচে',
    whatHappens: 'i = top(1)..bottom(2) ধরে col right-এর ঘর: 6, 9। শেষ, তাই right-- → 1।',
    highlightLines: [10, 11],
    vars: [{ name: 'right', value: 1 }],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      cursor: { row: 2, col: 2 },
      marks: marksFor([[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]]),
      bounds: { top: 1, bottom: 2, left: 0, right: 2 },
      output: { title: 'res', values: [1, 2, 3, 6, 9] },
    },
  },
  {
    id: 'bottom-row-1',
    title: 'top ≤ bottom — নিচের সারি ডান থেকে বাঁয়ে',
    whatHappens: 'top(1) ≤ bottom(2) সত্যি, তাই এই ধাপ চলবে। j = right(1)..left(0): 8, 7। bottom-- → 1।',
    whyItMatters: 'এই চেকটা না থাকলে একটা single row spiral-এ (top===bottom) সেই সারি দুবার গোনা হতো — একবার top-row হিসেবে, একবার bottom-row হিসেবে।',
    highlightLines: [12, 13, 14],
    vars: [{ name: 'bottom', value: 1 }],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      cursor: { row: 2, col: 0 },
      marks: marksFor([[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0]]),
      bounds: { top: 1, bottom: 2, left: 0, right: 1 },
      output: { title: 'res', values: [1, 2, 3, 6, 9, 8, 7] },
    },
  },
  {
    id: 'left-col-1',
    title: 'left ≤ right — বাম কলাম নিচ থেকে উপরে',
    whatHappens: 'left(0) ≤ right(1) সত্যি। i = bottom(1)..top(1): শুধু 4। left++ → 1।',
    highlightLines: [16, 17, 18],
    vars: [{ name: 'left', value: 1 }],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      cursor: { row: 1, col: 0 },
      marks: marksFor([[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0]]),
      bounds: { top: 1, bottom: 1, left: 0, right: 1 },
      output: { title: 'res', values: [1, 2, 3, 6, 9, 8, 7, 4] },
    },
  },
  {
    id: 'layer-2-check',
    title: 'পরের layer — এখনো top ≤ bottom ও left ≤ right',
    whatHappens: 'top=1, bottom=1, left=1, right=1 — মাঝখানে একটাই ঘর বাকি (5)। while-এর শর্ত এখনো সত্যি, তাই একটা layer আরও চলবে।',
    highlightLines: [7],
    vars: [
      { name: 'top', value: 1 },
      { name: 'bottom', value: 1 },
      { name: 'left', value: 1 },
      { name: 'right', value: 1 },
    ],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      marks: marksFor([[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0]]),
      bounds: { top: 1, bottom: 1, left: 1, right: 1 },
      output: { title: 'res', values: [1, 2, 3, 6, 9, 8, 7, 4] },
    },
  },
  {
    id: 'top-row-2',
    title: 'শেষ ঘর — row 1 হিসেবে গোনা হলো',
    whatHappens: 'j = left(1)..right(1): শুধু 5। top++ → 2।',
    highlightLines: [8, 9],
    vars: [{ name: 'top', value: 2 }],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      cursor: { row: 1, col: 1 },
      marks: marksFor([[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0], [1, 1]]),
      bounds: { top: 1, bottom: 1, left: 1, right: 1 },
      output: { title: 'res', values: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
    },
  },
  {
    id: 'right-col-2',
    title: 'ডান কলাম — i রেঞ্জ খালি',
    whatHappens: 'i = top(2)..bottom(1): শুরুই 2 কিন্তু সীমা 1 — কোনো ঘর যোগ হয় না। তবু right-- → 0 চলে।',
    whyItMatters: 'boundary গুটিয়ে আসার সময় for loop-এর রেঞ্জ খালি হয়ে যাওয়াটাই স্বাভাবিক — for loop নিজেই বুঝে নেয়, আলাদা if লাগে না।',
    highlightLines: [10, 11],
    vars: [{ name: 'right', value: 0 }],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      marks: marksFor([[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0], [1, 1]]),
      bounds: { top: 2, bottom: 1, left: 1, right: 0 },
      output: { title: 'res', values: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
    },
  },
  {
    id: 'skip-checks',
    title: 'top ≤ bottom ও left ≤ right — দুটোই এখন মিথ্যা',
    whatHappens: 'top(2) ≤ bottom(1) মিথ্যা, তাই bottom-row স্কিপ। left(1) ≤ right(0) মিথ্যা, তাই left-col-ও স্কিপ।',
    whyItMatters: 'ঠিক এই দুটো চেকই নিশ্চিত করে কেন্দ্রের ঘরটা (বা কেন্দ্রের একটা সারি/কলাম) দ্বিতীয়বার গোনা হয় না।',
    highlightLines: [12, 16],
    vars: [],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      marks: marksFor([[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0], [1, 1]]),
      bounds: { top: 2, bottom: 1, left: 1, right: 0 },
      output: { title: 'res', values: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
    },
  },
  {
    id: 'done',
    title: 'while-এর শর্ত মিথ্যা — লুপ শেষ',
    whatHappens: 'top(2) ≤ bottom(1) মিথ্যা — while থেমে গেল। res-এর ৯টা ঘরই matrix-এর সব element, স্পাইরাল ক্রমে।',
    whyItMatters: 'প্রতিটা ঘর ঠিক একবার visit হয়েছে — O(m·n) time, আর boundary চারটা সংখ্যা ছাড়া অতিরিক্ত মেমরি লাগেনি — O(1) (output বাদে)।',
    highlightLines: [21],
    vars: [],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      marks: marksFor([[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0], [1, 1]]),
      output: { title: 'উত্তর', values: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
    },
  },
];

export const matrixTraversalSim: PatternSimulation = {
  patternId: '1.7',
  input: '[[1,2,3],[4,5,6],[7,8,9]]',
  output: '[1,2,3,6,9,8,7,4,5]',
  steps,
};
