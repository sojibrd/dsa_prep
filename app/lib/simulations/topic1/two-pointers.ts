import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   1.1 Two Pointers — Trapping Rain Water (LC 42)

   Drawn as BARS rather than boxes, because the insight is vertical: water
   collects ABOVE a column, up to the shorter of the two walls enclosing it. A
   row of numbered cells has no "above" to put it in.
   ========================================================================= */

const HEIGHT = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];

/** One `while` iteration, as produced by running the demo code. */
interface Move {
  /** Which branch of the `if` ran. */
  side: 'L' | 'R';
  /** Index processed this iteration. */
  at: number;
  /** Pointer positions BEFORE the move — where the labels are drawn. */
  l: number;
  r: number;
  leftMax: number;
  rightMax: number;
  /** Water added at `at` this iteration. */
  add: number;
  water: number;
}

const MOVES: Move[] = [
  { side: 'L', at: 0, l: 0, r: 11, leftMax: 0, rightMax: 0, add: 0, water: 0 },
  { side: 'R', at: 11, l: 1, r: 11, leftMax: 0, rightMax: 1, add: 0, water: 0 },
  { side: 'L', at: 1, l: 1, r: 10, leftMax: 1, rightMax: 1, add: 0, water: 0 },
  { side: 'L', at: 2, l: 2, r: 10, leftMax: 1, rightMax: 1, add: 1, water: 1 },
  { side: 'R', at: 10, l: 3, r: 10, leftMax: 1, rightMax: 2, add: 0, water: 1 },
  { side: 'R', at: 9, l: 3, r: 9, leftMax: 1, rightMax: 2, add: 1, water: 2 },
  { side: 'R', at: 8, l: 3, r: 8, leftMax: 1, rightMax: 2, add: 0, water: 2 },
  { side: 'L', at: 3, l: 3, r: 7, leftMax: 2, rightMax: 2, add: 0, water: 2 },
  { side: 'L', at: 4, l: 4, r: 7, leftMax: 2, rightMax: 2, add: 1, water: 3 },
  { side: 'L', at: 5, l: 5, r: 7, leftMax: 2, rightMax: 2, add: 2, water: 5 },
  { side: 'L', at: 6, l: 6, r: 7, leftMax: 2, rightMax: 2, add: 1, water: 6 },
];

/** Everything outside `[l, r]` is settled and stops competing for attention. */
function marksFor(l: number, r: number, at: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (let i = 0; i < HEIGHT.length; i++) {
    if (i < l || i > r) marks[i] = 'done';
  }
  marks[at] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '1.1-init',
    title: 'শুরু — দুই প্রান্তে দুই pointer',
    whatHappens:
      '`l` বসে সবচেয়ে বাঁয়ে (index 0), `r` সবচেয়ে ডানে (index 11)। `leftMax`, `rightMax` ও `water` — তিনটাই 0।',
    whyItMatters:
      'একটা index-এ কতটা পানি জমবে তা ঠিক করে তার দুই পাশের সবচেয়ে উঁচু দেয়ালের মধ্যে ছোটটা। দুই প্রান্ত থেকে ভেতরে এগোলে ওই দুটো মান হাতে-হাতেই তৈরি হয়ে যায় — আলাদা করে prefix/suffix array বানাতে হয় না।',
    highlightLines: [2, 3, 4, 5, 6],
    vars: [
      { name: 'l', value: 0 },
      { name: 'r', value: 11 },
      { name: 'leftMax', value: 0 },
      { name: 'rightMax', value: 0 },
      { name: 'water', value: 0 },
    ],
    scene: {
      kind: 'array',
      values: HEIGHT,
      asBars: true,
      pointers: [
        { name: 'l', index: 0 },
        { name: 'r', index: 11 },
      ],
      marks: { 0: 'active', 11: 'active' },
      caption: 'বার = দেয়ালের উচ্চতা। উপরে জমা নীল অংশ = আটকে থাকা পানি।',
    },
  },

  ...MOVES.map((move, index): SimStep => {
    // Fills accumulated up to and including this move.
    const fills: Record<number, number> = {};
    for (const past of MOVES.slice(0, index + 1)) {
      if (past.add > 0) fills[past.at] = past.add;
    }

    const isLeft = move.side === 'L';
    const wall = isLeft ? move.leftMax : move.rightMax;
    const other = isLeft ? move.r : move.l;

    return {
      id: `1.1-move-${index + 1}`,
      title: isLeft
        ? `বাঁ দিক নিচু — index ${move.at} প্রসেস`
        : `ডান দিক নিচু বা সমান — index ${move.at} প্রসেস`,
      whatHappens: isLeft
        ? `height[${move.at}] = ${HEIGHT[move.at]}, height[${other}] = ${HEIGHT[other]} — বাঁ দিকটা নিচু, তাই বাঁ দিক প্রসেস হবে। leftMax দাঁড়ায় ${wall}, জমা পানি ${wall} − ${HEIGHT[move.at]} = ${move.add}। এরপর l সরে ${move.l + 1}-এ।`
        : `height[${other}] = ${HEIGHT[other]} ≤ height[${move.at}] = ${HEIGHT[move.at]} নয় — ডান দিকটাই নিচু বা সমান, তাই ডান দিক প্রসেস হবে। rightMax দাঁড়ায় ${wall}, জমা পানি ${wall} − ${HEIGHT[move.at]} = ${move.add}। এরপর r সরে ${move.r - 1}-এ।`,
      whyItMatters:
        index === 0
          ? 'নিচু দিকটাই কেন প্রসেস করি? কারণ ওই পাশে পানির উচ্চতা নিশ্চিতভাবে ওই পাশের max দিয়েই সীমিত — অন্য পাশে যা-ই থাকুক, সেটা আরও উঁচু। তাই বিপরীত পাশের সঠিক max না জেনেও এই index-এর হিসাব চূড়ান্ত করে ফেলা যায়।'
          : move.add > 0
            ? `index ${move.at}-এর দেয়াল (${HEIGHT[move.at]}) সীমিতকারী max (${wall})-এর চেয়ে নিচু, তাই এখানে ${move.add} একক পানি আটকা পড়ল।`
            : undefined,
      highlightLines: isLeft ? [8, 9, 10, 11] : [8, 12, 13, 14, 15],
      vars: [
        { name: 'l', value: isLeft ? move.l + 1 : move.l },
        { name: 'r', value: isLeft ? move.r : move.r - 1 },
        { name: 'leftMax', value: move.leftMax },
        { name: 'rightMax', value: move.rightMax },
        { name: 'water', value: move.water },
      ],
      scene: {
        kind: 'array',
        values: HEIGHT,
        asBars: true,
        pointers: [
          { name: 'l', index: move.l },
          { name: 'r', index: move.r },
        ],
        marks: marksFor(move.l, move.r, move.at),
        fills,
        caption: `এ পর্যন্ত মোট জমা পানি: ${move.water}`,
      },
    };
  }),

  {
    id: '1.1-done',
    title: 'দুই pointer মিলে গেছে — শেষ',
    whatHappens:
      '`l` ও `r` দুটোই index 7-এ। `l < r` আর সত্যি নয়, তাই লুপ থামে এবং `water` = 6 রিটার্ন হয়।',
    whyItMatters:
      'প্রতিটা index ঠিক একবার প্রসেস হয়েছে, কোনো অতিরিক্ত array লাগেনি — সময় O(n), জায়গা O(1)। একই কাজ prefix-max/suffix-max array দিয়ে করা যায়, কিন্তু সেখানে O(n) বাড়তি মেমরি লাগে।',
    highlightLines: [7, 18],
    vars: [
      { name: 'l', value: 7 },
      { name: 'r', value: 7 },
      { name: 'water', value: 6 },
    ],
    scene: {
      kind: 'array',
      values: HEIGHT,
      asBars: true,
      pointers: [{ name: 'l·r', index: 7 }],
      marks: Object.fromEntries(HEIGHT.map((_, i) => [i, 'done' as CellMark])),
      fills: { 2: 1, 4: 1, 5: 2, 6: 1, 9: 1 },
      caption: 'মোট আটকে থাকা পানি = 1 + 1 + 2 + 1 + 1 = 6',
    },
  },
];

export const twoPointersSim: PatternSimulation = {
  patternId: '1.1',
  input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
  output: '6',
  steps,
};
