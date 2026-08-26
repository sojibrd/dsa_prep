import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.7 House Robber (Non-Adjacent Choice)

   `robbed` and `skipped` are running scalars, not per-index values, so they
   belong in `vars` — not in `subValues`, which is for a second number that
   genuinely belongs to each cell (Kadane's `cur`, say).
   ========================================================================= */

const NUMS = [2, 7, 9, 3, 1];

interface Tick {
  x: number;
  robbedBefore: number;
  skippedBefore: number;
  robbed: number;
  skipped: number;
}

/** Verified by running the demo code. */
const TICKS: Tick[] = [
  { x: 2, robbedBefore: 0, skippedBefore: 0, robbed: 2, skipped: 0 },
  { x: 7, robbedBefore: 2, skippedBefore: 0, robbed: 7, skipped: 2 },
  { x: 9, robbedBefore: 7, skippedBefore: 2, robbed: 11, skipped: 7 },
  { x: 3, robbedBefore: 11, skippedBefore: 7, robbed: 10, skipped: 11 },
  { x: 1, robbedBefore: 10, skippedBefore: 11, robbed: 12, skipped: 11 },
];

function marksFor(current: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (let i = 0; i < current; i++) marks[i] = 'done';
  marks[current] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '9.7-init',
    title: 'শুরু — দুটো হিসাব পাশাপাশি',
    whatHappens:
      '`robbed = 0`, `skipped = 0`। দুটো আলাদা প্রশ্নের উত্তর রাখা হচ্ছে: **এই বাড়িটা লুট করলে** এ পর্যন্ত সর্বোচ্চ কত, আর **না করলে** কত।',
    whyItMatters:
      'শর্ত একটাই — পাশাপাশি দুটো বাড়ি লুট করা যাবে না। তাই প্রতিটা বাড়িতে সিদ্ধান্ত মাত্র দুটো, আর সেই সিদ্ধান্ত কেবল আগের বাড়িতে কী হয়েছিল তার উপর নির্ভর করে। দুটো সংখ্যাই যথেষ্ট; পুরো dp array লাগে না।',
    highlightLines: [2, 3],
    vars: [
      { name: 'robbed', value: 0 },
      { name: 'skipped', value: 0 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      caption: 'প্রতিটা ঘর একটা বাড়ি, মান = কত টাকা আছে।',
    },
  },

  ...TICKS.map((tick, i): SimStep => ({
    id: `9.7-${i + 1}`,
    title: `বাড়ি ${i} (${tick.x} টাকা) — লুট ${tick.robbed}, বাদ ${tick.skipped}`,
    whatHappens: `এই বাড়ি লুট করলে আগের বাড়িটা বাদ দিতেই হতো, তাই নতুন \`robbed\` = আগের \`skipped\` (${tick.skippedBefore}) + ${tick.x} = ${tick.robbed}। আর এই বাড়ি বাদ দিলে আগেরটা লুট করা যেত বা না-ও যেত, তাই নতুন \`skipped\` = max(${tick.robbedBefore}, ${tick.skippedBefore}) = ${tick.skipped}।`,
    whyItMatters:
      i === 0
        ? 'নতুন `robbed` আগের `skipped` থেকেই আসে — এই এক লাইনেই "পাশাপাশি নয়" শর্তটা এনকোড হয়ে আছে। আলাদা কোনো `if` লাগে না।'
        : i === 2
          ? '2 আর 9 দুটোই নেওয়া গেল (11), কারণ তারা পাশাপাশি নয়। 7 বাদ পড়ল — একা 7 নেওয়ার চেয়ে 2+9 ভালো।'
          : i === 3
            ? 'এখানে `robbed` কমে গেল (11 থেকে 10)! কারণ 3 নিতে হলে 9 ছাড়তে হয়। কিন্তু `skipped` ততক্ষণে 11 ধরে রেখেছে, তাই সেরা উত্তর হারায়নি — দুটো হিসাব আলাদা রাখার লাভ ঠিক এটাই।'
            : i === 4
              ? 'শেষ বাড়ির 1 যোগ হয়ে 12 — পথটা 2 + 9 + 1। তিনটেই পাশাপাশি নয়, তাই বৈধ।'
              : undefined,
    highlightLines: [4, 5],
    vars: [
      { name: 'x', value: tick.x },
      { name: 'robbed', value: tick.robbed },
      { name: 'skipped', value: tick.skipped },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: marksFor(i),
      caption: `সেরা এ পর্যন্ত: ${Math.max(tick.robbed, tick.skipped)}`,
    },
  })),

  {
    id: '9.7-done',
    title: 'শেষ — সর্বোচ্চ 12',
    whatHappens:
      '`max(12, 11) = 12`। বাড়ি 0, 2 আর 4 থেকে: 2 + 9 + 1 = 12।',
    whyItMatters:
      'O(n) সময়, O(1) জায়গা। শেষে `max` নিতেই হয়, কারণ শেষ বাড়িটা লুট করা সেরা না-ও হতে পারে — এখানে যেমন হয়েছে ঠিকই, কিন্তু ইনপুট `[5, 1]` হলে `skipped`-ই জিতত।',
    highlightLines: [6],
    vars: [{ name: 'উত্তর', value: 12 }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'active', 1: 'reject', 2: 'active', 3: 'reject', 4: 'active' },
      output: { title: 'লুট করা বাড়ি', values: [2, 9, 1] },
      caption: 'amber = লুট, ম্লান = বাদ। কোনো দুটো পাশাপাশি নয়।',
    },
  },
];

export const houseRobberSim: PatternSimulation = {
  patternId: '9.7',
  input: 'nums = [2,7,9,3,1]',
  output: '12',
  steps,
};
