import type { PatternSimulation, SimStep } from '../types';

/**
 * 1.6 Kadane's Algorithm — Maximum Subarray (LC 53).
 *
 * The pattern's own demo input. Drawn as plain cells rather than bars —
 * negative values break a bar's "height above zero" reading, and the thing
 * worth watching here is the running `cur` printed under each cell, not a
 * magnitude.
 */

const NUMS = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

/** `cur` as it stood after processing every index up to `upto`. */
const CUR_AT: Record<number, number> = { 0: -2, 1: 1, 2: -2, 3: 4, 4: 3, 5: 5, 6: 6, 7: 1, 8: 5 };

function subValuesUpTo(i: number): Record<number, string> {
  const out: Record<number, string> = {};
  for (let k = 0; k <= i; k++) out[k] = String(CUR_AT[k]);
  return out;
}

function iteration(i: number, best: number, extended: boolean): SimStep {
  return {
    id: `i${i}`,
    title: `i=${i} — nums[${i}]=${NUMS[i]}, ${extended ? 'আগেরটা টেনে নেওয়া হলো' : 'নতুন করে শুরু হলো'}`,
    whatHappens: extended
      ? `cur + nums[${i}] (আগেরটা টেনে) নতুন করে শুরু করার চেয়ে বড় — cur = ${CUR_AT[i]}। best = max(আগের best, ${CUR_AT[i]}) = ${best}।`
      : `nums[${i}] একা-ই আগের cur টেনে আনার চেয়ে বড় — এখান থেকে নতুন subarray শুরু। cur = ${CUR_AT[i]}। best = ${best}।`,
    whyItMatters: extended
      ? undefined
      : 'আগের চলমান sum negative অবদান রাখছিল, তাই তাকে বহন করার চেয়ে এখান থেকে নতুন করে শুরু করাই লাভজনক।',
    highlightLines: [5, 6],
    vars: [
      { name: 'i', value: i },
      { name: 'cur', value: CUR_AT[i] },
      { name: 'best', value: best },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'i', index: i }],
      marks: Object.fromEntries(
        Array.from({ length: NUMS.length }, (_, idx) => [idx, idx === i ? 'active' : idx < i ? 'done' : undefined])
          .filter(([, v]) => v !== undefined)
      ) as Record<number, 'active' | 'done'>,
      subValues: subValuesUpTo(i),
      subLabel: 'cur',
    },
  };
}

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — প্রথম element-ই cur ও best',
    whatHappens: 'cur = best = nums[0] = -2। একক element হলেও সেটাই এখন পর্যন্ত সেরা subarray — array খালি রাখা যাবে না।',
    highlightLines: [2, 3],
    vars: [
      { name: 'cur', value: -2 },
      { name: 'best', value: -2 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'i', index: 0 }],
      marks: { 0: 'active' },
      subValues: { 0: '-2' },
      subLabel: 'cur',
      caption: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
    },
  },
  iteration(1, 1, true),
  iteration(2, 1, true),
  iteration(3, 4, false),
  iteration(4, 4, true),
  iteration(5, 5, true),
  iteration(6, 6, true),
  iteration(7, 6, true),
  iteration(8, 6, false),
  {
    id: 'done',
    title: 'array শেষ — best-ই উত্তর',
    whatHappens: 'সবচেয়ে বড় যোগফল best = 6 — subarray [4, -1, 2, 1] (index 3 থেকে 6)।',
    whyItMatters: 'প্রতিটা index-এ শুধু একটা সিদ্ধান্ত — "টেনে নেব নাকি নতুন শুরু করব" — আর একটা max। কোনো nested loop ছাড়াই O(n), আর মাত্র দুটো ভেরিয়েবল লাগল — O(1) space।',
    highlightLines: [8],
    vars: [{ name: 'best', value: 6 }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'done', 1: 'done', 2: 'done', 3: 'fill', 4: 'fill', 5: 'fill', 6: 'fill', 7: 'done', 8: 'done' },
      subValues: subValuesUpTo(8),
      subLabel: 'cur',
      output: { title: 'সেরা subarray', values: ['[4,-1,2,1]'] },
      caption: 'যোগফল = 4 − 1 + 2 + 1 = 6',
    },
  },
];

export const kadaneSim: PatternSimulation = {
  patternId: '1.6',
  input: '[-2,1,-3,4,-1,2,1,-5,4]',
  output: '6',
  steps,
};
