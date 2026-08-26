import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.2 0/1 Knapsack / Subset Sum — Partition Equal Subset Sum

   The inner loop runs `target` times per item, but almost every pass changes
   nothing. Only the five passes that flip a `false` to `true` become steps —
   the rest would be twenty-odd identical frames.
   ========================================================================= */

const NUMS = [1, 5, 11, 5];
const TARGET = 11;

interface Flip {
  num: number;
  s: number;
  /** The already-reachable sum this one is built from. */
  from: number;
  /** dp after the flip, as a T/F string. */
  dp: string;
}

/** Verified by running the demo code and logging only the changes. */
const FLIPS: Flip[] = [
  { num: 1, s: 1, from: 0, dp: 'TTFFFFFFFFFF' },
  { num: 5, s: 6, from: 1, dp: 'TTFFFFTFFFFF' },
  { num: 5, s: 5, from: 0, dp: 'TTFFFTTFFFFF' },
  { num: 11, s: 11, from: 0, dp: 'TTFFFTTFFFFT' },
  { num: 5, s: 10, from: 5, dp: 'TTFFFTTFFFTT' },
];

const row = (dp: string) => dp.split('');

function marksFor(flip: Flip, dp: string): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  // Everything already reachable is settled fact.
  row(dp).forEach((cell, i) => {
    if (cell === 'T') marks[i] = 'done';
  });
  marks[flip.from] = 'fill';
  marks[flip.s] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '9.2-init',
    title: 'শুরু — যোগফল 22, তাই লক্ষ্য 11',
    whatHappens:
      '`[1, 5, 11, 5]`-এর মোট 22, জোড় — তাই সমান দুই ভাগে ভাঙার আশা আছে। লক্ষ্য প্রতি ভাগে 11। `dp` array-তে শুধু `dp[0] = true`।',
    whyItMatters:
      'প্রশ্নটা বদলে গেল: "সমান দুই ভাগ করা যায়?" থেকে "উপাদানগুলোর কোনো উপসেটের যোগফল কি ঠিক 11 হতে পারে?" — কারণ একটা ভাগ 11 হলে বাকিটাও আপনাআপনি 11। `dp[s]` মানে "s যোগফল বানানো সম্ভব কি"। `dp[0] = true`, কারণ কিছুই না নিলে যোগফল 0।',
    highlightLines: [2, 3, 4, 5, 6],
    vars: [
      { name: 'nums', value: `[${NUMS.join(',')}]` },
      { name: 'total', value: NUMS.reduce((a, b) => a + b, 0) },
      { name: 'target', value: TARGET },
    ],
    scene: {
      kind: 'array',
      values: row('TFFFFFFFFFFF'),
      marks: { 0: 'done' },
      caption: 'সারির index = যোগফল, মান = সেটা বানানো সম্ভব কি না।',
    },
  },

  ...FLIPS.map((flip, i): SimStep => {
    const previous = i === 0 ? 'TFFFFFFFFFFF' : FLIPS[i - 1].dp;
    return {
      id: `9.2-flip-${i + 1}`,
      title: `num = ${flip.num} — যোগফল ${flip.s} এখন সম্ভব`,
      whatHappens: `\`dp[${flip.from}]\` ইতিমধ্যেই true, আর ${flip.from} + ${flip.num} = ${flip.s}। তাই \`dp[${flip.s}]\` true হলো — মানে ${flip.num}-কে যোগ করে ${flip.s} বানানো যায়।`,
      whyItMatters:
        i === 0
          ? 'ভেতরের লুপ **উল্টো দিকে** চলে (`s = target` থেকে নিচে) — এটাই 0/1 knapsack-কে unbounded থেকে আলাদা করে। উল্টো দিকে গেলে `dp[s - num]` এখনো এই আইটেম যোগ হওয়ার **আগের** অবস্থা, তাই প্রতিটা আইটেম সর্বোচ্চ একবার ব্যবহার হয়। সোজা দিকে গেলে একই আইটেম বারবার ব্যবহার হয়ে যেত।'
          : i === 3
            ? '11 একাই লক্ষ্যে পৌঁছে গেল — `[11]` আর `[1,5,5]`, দুই ভাগ। উত্তর এখানেই নিশ্চিত, কিন্তু লুপ বাকিটা চালিয়ে যায়।'
            : undefined,
      highlightLines: [7, 8, 9, 10, 11, 12, 13],
      vars: [
        { name: 'num', value: flip.num },
        { name: 's', value: flip.s },
        { name: 's − num', value: flip.from },
      ],
      scene: {
        kind: 'array',
        values: row(flip.dp),
        marks: marksFor(flip, previous),
        caption: `নীল ঘর = উৎস (${flip.from}), amber = নতুন সম্ভব হওয়া (${flip.s})।`,
      },
    };
  }),

  {
    id: '9.2-done',
    title: 'শেষ — ভাগ করা সম্ভব',
    whatHappens:
      '`dp[11] = true`। উত্তর `true` — `[1, 5, 5]` আর `[11]`, দুটোরই যোগফল 11।',
    whyItMatters:
      'খরচ O(n · target) সময়, O(target) জায়গা। খেয়াল করুন dp array কখনো বলে না **কোন** উপাদানগুলো নিয়ে যোগফলটা হলো — শুধু "সম্ভব কি না"। ভাগটা আসলে বের করতে হলে হয় ২D টেবিল রাখতে হতো, নয় পেছনে হেঁটে পুনর্গঠন করতে হতো।',
    highlightLines: [14],
    vars: [{ name: 'dp[11]', value: 'true' }],
    scene: {
      kind: 'array',
      values: row('TTFFFTTFFFTT'),
      marks: { 0: 'done', 1: 'done', 5: 'done', 6: 'done', 10: 'done', 11: 'active' },
      output: { title: 'দুই ভাগ', values: ['[1,5,5] = 11', '[11] = 11'] },
      caption: 'সবুজ ঘরগুলোই সব সম্ভব যোগফল — 0, 1, 5, 6, 10, 11।',
    },
  },
];

export const subsetSumSim: PatternSimulation = {
  patternId: '9.2',
  input: 'nums = [1,5,11,5]',
  output: 'true',
  steps,
};
