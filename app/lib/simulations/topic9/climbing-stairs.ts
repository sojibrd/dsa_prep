import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.1 Fibonacci Style — Climbing Stairs

   The code keeps two scalars, but the row shows the whole `dp[0..n]` filling
   in. That is a deliberate abstraction: the rolling pair IS the dp table with
   everything but the last two entries thrown away, and seeing the table makes
   the recurrence obvious in a way two variables never do.
   ========================================================================= */

const N = 5;

interface Tick {
  i: number;
  prevBefore: number;
  curBefore: number;
  prev: number;
  cur: number;
}

/** Verified by running the demo code. */
const TICKS: Tick[] = [
  { i: 2, prevBefore: 1, curBefore: 1, prev: 1, cur: 2 },
  { i: 3, prevBefore: 1, curBefore: 2, prev: 2, cur: 3 },
  { i: 4, prevBefore: 2, curBefore: 3, prev: 3, cur: 5 },
  { i: 5, prevBefore: 3, curBefore: 5, prev: 5, cur: 8 },
];

/** dp values known once step `i` is done; the rest stay blank. */
function table(upTo: number): (number | string)[] {
  const dp = [1, 1, 2, 3, 5, 8];
  return dp.map((value, i) => (i <= upTo ? value : '·'));
}

function marksFor(current: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (let i = 0; i < current; i++) marks[i] = 'done';
  marks[current] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '9.1-init',
    title: 'শুরু — দুটো ভিত্তি',
    whatHappens:
      '`prev = 1` (dp[0]), `cur = 1` (dp[1])। শূন্য ধাপে ওঠার উপায় একটাই — কিছু না করা; এক ধাপেও একটাই।',
    whyItMatters:
      'পুনরাবৃত্তি সূত্রটা সরল: `dp[i] = dp[i-1] + dp[i-2]`। কারণ শেষ পদক্ষেপ হয় ১ ধাপের, নয় ২ ধাপের — অন্য কিছু নয়। তাই i-তে পৌঁছানোর উপায় = (i−1 থেকে আসার উপায়) + (i−2 থেকে আসার উপায়)। এটাই Fibonacci, শুধু নাম আলাদা।',
    highlightLines: [2, 3],
    vars: [
      { name: 'prev', value: 1 },
      { name: 'cur', value: 1 },
    ],
    scene: {
      kind: 'array',
      values: table(1),
      marks: { 0: 'done', 1: 'done' },
      caption: 'সারিটা dp[0..5] — index মানে "কত ধাপ", মান মানে "কত উপায়"।',
    },
  },

  ...TICKS.map((tick, i): SimStep => ({
    id: `9.1-i-${tick.i}`,
    title: `dp[${tick.i}] = ${tick.prevBefore} + ${tick.curBefore} = ${tick.cur}`,
    whatHappens: `\`[prev, cur] = [cur, prev + cur]\` — এক লাইনেই দুটো কাজ। নতুন cur হলো ${tick.prevBefore} + ${tick.curBefore} = ${tick.cur}, আর prev সরে এল আগের cur (${tick.curBefore})-এ।`,
    whyItMatters:
      i === 0
        ? 'পুরো dp array রাখার দরকার নেই, কারণ `dp[i]` শুধু তার আগের দুটোর উপর নির্ভর করে। তাই জায়গা O(n) থেকে নেমে O(1)। destructuring না করে সাধারণ assignment লিখলে prev আগে বদলে যেত আর হিসাব ভুল হতো — এই এক লাইনে দুটোই একসাথে হয়।'
        : i === 3
          ? '৫ ধাপে ওঠার ৮টা উপায়। তালিকা করলে: 1+1+1+1+1, 1+1+1+2, 1+1+2+1, 1+2+1+1, 2+1+1+1, 1+2+2, 2+1+2, 2+2+1।'
          : undefined,
    highlightLines: [4],
    vars: [
      { name: 'i', value: tick.i },
      { name: 'prev', value: tick.prev },
      { name: 'cur', value: tick.cur },
    ],
    scene: {
      kind: 'array',
      values: table(tick.i),
      marks: marksFor(tick.i),
      caption: `dp[${tick.i - 2}] + dp[${tick.i - 1}] = ${tick.prevBefore} + ${tick.curBefore}`,
    },
  })),

  {
    id: '9.1-done',
    title: `শেষ — ${N} ধাপে ওঠার ৮টা উপায়`,
    whatHappens: '`cur = 8` রিটার্ন হলো।',
    whyItMatters:
      'O(n) সময়, O(1) জায়গা। সরল recursion লিখলে একই উপ-সমস্যা বারবার হিসাব হতো — খরচ O(2ⁿ)। DP-র পুরো লাভটাই এখানে: প্রতিটা উপ-সমস্যা ঠিক একবার সমাধান করা।',
    highlightLines: [5],
    vars: [{ name: 'উত্তর', value: 8 }],
    scene: {
      kind: 'array',
      values: table(N),
      marks: Object.fromEntries(table(N).map((_, i) => [i, 'done' as CellMark])),
      output: { title: 'উত্তর', values: [8] },
      caption: '1, 1, 2, 3, 5, 8 — চেনা Fibonacci ক্রম।',
    },
  },
];

export const climbingStairsSim: PatternSimulation = {
  patternId: '9.1',
  input: 'n = 5',
  output: '8',
  steps,
};
