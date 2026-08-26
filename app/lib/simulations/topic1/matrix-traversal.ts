import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   1.7 Matrix Traversal — Spiral Matrix (LC 54)

   The shrinking `bounds` frame is drawn on every step. Without it the cursor
   looks like it is wandering; with it the walk reads as what it is — four
   edges of a rectangle that closes in one row/column at a time.
   ========================================================================= */

const MATRIX = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

interface Visit {
  row: number;
  col: number;
  value: number;
  direction: 'ডানে' | 'নিচে' | 'বামে' | 'উপরে';
  bounds: { top: number; bottom: number; left: number; right: number };
  /** The `for` loop that produced this visit. */
  line: number;
}

const VISITS: Visit[] = [
  { row: 0, col: 0, value: 1, direction: 'ডানে', bounds: { top: 0, bottom: 2, left: 0, right: 2 }, line: 8 },
  { row: 0, col: 1, value: 2, direction: 'ডানে', bounds: { top: 0, bottom: 2, left: 0, right: 2 }, line: 8 },
  { row: 0, col: 2, value: 3, direction: 'ডানে', bounds: { top: 0, bottom: 2, left: 0, right: 2 }, line: 8 },
  { row: 1, col: 2, value: 6, direction: 'নিচে', bounds: { top: 1, bottom: 2, left: 0, right: 2 }, line: 10 },
  { row: 2, col: 2, value: 9, direction: 'নিচে', bounds: { top: 1, bottom: 2, left: 0, right: 2 }, line: 10 },
  { row: 2, col: 1, value: 8, direction: 'বামে', bounds: { top: 1, bottom: 2, left: 0, right: 1 }, line: 13 },
  { row: 2, col: 0, value: 7, direction: 'বামে', bounds: { top: 1, bottom: 2, left: 0, right: 1 }, line: 13 },
  { row: 1, col: 0, value: 4, direction: 'উপরে', bounds: { top: 1, bottom: 1, left: 0, right: 1 }, line: 17 },
  { row: 1, col: 1, value: 5, direction: 'ডানে', bounds: { top: 1, bottom: 1, left: 1, right: 1 }, line: 8 },
];

const steps: SimStep[] = [
  {
    id: '1.7-init',
    title: 'শুরু — চার দিকের সীমানা',
    whatHappens:
      'চারটা সীমানা বসানো হলো: `top = 0`, `bottom = 2`, `left = 0`, `right = 2`। এই চারটা মিলে যে আয়তক্ষেত্র, তার ভেতরটাই এখনো বাকি।',
    whyItMatters:
      '"কোথায় গিয়েছি" মনে রাখতে আলাদা `visited` matrix লাগে না — চারটা সংখ্যাই যথেষ্ট। প্রতিটা প্রান্ত হাঁটা শেষ হলে সংশ্লিষ্ট সীমানা এক ধাপ ভেতরে সরে যায়, তাই একই ঘরে দুবার যাওয়ার সুযোগই থাকে না।',
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
      output: { title: 'res', values: [] },
      caption: 'লক্ষ্য: বাইরে থেকে ভেতরে ঘুরে ঘুরে সব ঘর পড়া।',
    },
  },

  ...VISITS.map((visit, i): SimStep => {
    const collected = VISITS.slice(0, i + 1).map((v) => v.value);
    const marks: Record<string, CellMark> = {};
    for (const past of VISITS.slice(0, i)) marks[`${past.row},${past.col}`] = 'done';
    marks[`${visit.row},${visit.col}`] = 'active';

    const turned = i > 0 && VISITS[i - 1].direction !== visit.direction;

    return {
      id: `1.7-visit-${i + 1}`,
      title: `${visit.direction} — (${visit.row}, ${visit.col}) = ${visit.value}`,
      whatHappens: `${turned ? `প্রান্ত শেষ, তাই ${visit.direction} মোড় নিয়ে ` : ''}ঘর (${visit.row}, ${visit.col}) পড়া হলো, মান ${visit.value}। res এখন [${collected.join(', ')}]।`,
      whyItMatters:
        i === 0
          ? undefined
          : turned && i === 3
            ? 'উপরের সারি শেষ হওয়ার পর `top++` হয়ে গেছে — তাই ডান কলামে নামা শুরু হচ্ছে সারি 1 থেকে, 0 থেকে নয়। এই এক ঘরের সরে যাওয়াটাই কোণার ঘর দুবার পড়া ঠেকায়।'
            : i === 8
              ? 'সীমানা চারদিক থেকে চেপে এসে এখন একটাই ঘরে ঠেকেছে (`top = bottom = left = right = 1`)। কেন্দ্রের ঘরটা পড়ার পর `top` `bottom` ছাড়িয়ে যাবে আর লুপ থামবে।'
              : undefined,
      highlightLines: [7, visit.line],
      vars: [
        { name: 'top', value: visit.bounds.top },
        { name: 'bottom', value: visit.bounds.bottom },
        { name: 'left', value: visit.bounds.left },
        { name: 'right', value: visit.bounds.right },
      ],
      scene: {
        kind: 'matrix',
        values: MATRIX,
        cursor: { row: visit.row, col: visit.col },
        marks,
        bounds: visit.bounds,
        output: { title: 'res', values: collected },
        caption: `${collected.length} / 9 ঘর পড়া হয়েছে।`,
      },
    };
  }),

  {
    id: '1.7-done',
    title: 'শেষ — সর্পিল সম্পূর্ণ',
    whatHappens:
      'কেন্দ্রের ঘরের পর `top` `bottom` ছাড়িয়ে গেছে, তাই লুপ থামল। উত্তর `[1,2,3,6,9,8,7,4,5]`।',
    whyItMatters:
      'প্রতিটা ঘর ঠিক একবার — O(m·n) সময়, আর উত্তরের array ছাড়া বাড়তি জায়গা নেই। মূল কৌশল ছিল "কোথায় ছিলাম" নয়, "কোন আয়তক্ষেত্রটা এখনো বাকি" — সেটা মনে রাখা।',
    highlightLines: [21],
    vars: [{ name: 'res.length', value: 9 }],
    scene: {
      kind: 'matrix',
      values: MATRIX,
      marks: Object.fromEntries(
        MATRIX.flatMap((row, r) => row.map((_, c) => [`${r},${c}`, 'done' as CellMark]))
      ),
      output: { title: 'res', values: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      caption: 'বাইরের বলয় → ভেতরের বলয় → কেন্দ্র।',
    },
  },
];

export const matrixTraversalSim: PatternSimulation = {
  patternId: '1.7',
  input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]',
  output: '[1,2,3,6,9,8,7,4,5]',
  steps,
};
