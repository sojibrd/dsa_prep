import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   1.6 Kadane's Algorithm — Maximum Subarray (LC 53)

   `cur` is drawn UNDER every cell, because the running value is the whole
   story: at each index the algorithm only ever decides "carry the tail, or
   start fresh here", and that decision is visible in `cur` alone.
   ========================================================================= */

const NUMS = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

/** `cur` and `best` after processing each index, verified against the code. */
const CUR = [-2, 1, -2, 4, 3, 5, 6, 1, 5];
const BEST = [-2, 1, 1, 4, 4, 5, 6, 6, 6];

/** Running `cur` values known at index `upTo`, drawn beneath their cells. */
function subValues(upTo: number): Record<number, string | number> {
  const values: Record<number, string | number> = {};
  for (let i = 0; i <= upTo; i++) values[i] = CUR[i];
  return values;
}

function marksUpTo(current: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (let i = 0; i < current; i++) marks[i] = 'done';
  marks[current] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '1.6-init',
    title: 'শুরু — প্রথম সংখ্যাটাই একমাত্র প্রার্থী',
    whatHappens:
      '`cur` ও `best` দুটোই `nums[0] = -2` দিয়ে শুরু। এখনো একটাই সংখ্যা দেখা হয়েছে, তাই সবচেয়ে ভালো subarray-ও সেটাই।',
    whyItMatters:
      '`best = 0` দিয়ে শুরু করলে ভুল হতো — সব সংখ্যা ঋণাত্মক হলে উত্তর ঋণাত্মকই হওয়ার কথা, কিন্তু 0 থেকে শুরু করলে "খালি subarray" জিতে যেত। তাই ভিত্তি হিসেবে প্রথম উপাদানই নিতে হয়।',
    highlightLines: [2, 3],
    vars: [
      { name: 'cur', value: -2 },
      { name: 'best', value: -2 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'active' },
      subValues: subValues(0),
      subLabel: 'cur — এই index-এ শেষ হওয়া সেরা subarray-র যোগফল',
      caption: 'লক্ষ্য: সবচেয়ে বড় যোগফলওয়ালা টানা subarray।',
    },
  },

  ...NUMS.slice(1).map((x, offset): SimStep => {
    const i = offset + 1;
    const extend = CUR[i - 1] + x;
    const restarts = x > extend;
    const improved = BEST[i] !== BEST[i - 1];

    return {
      id: `1.6-i-${i}`,
      title: restarts
        ? `i = ${i} — লেজ ফেলে নতুন শুরু`
        : `i = ${i} — লেজ টেনে নিয়ে যাওয়া`,
      whatHappens: `দুটো বিকল্প: এখানেই নতুন শুরু (${x}) নাকি আগের লেজ টেনে আনা (${CUR[i - 1]} + ${x} = ${extend})। ${restarts ? `নতুন শুরুই বড়` : `টেনে আনাই বড় বা সমান`}, তাই cur = ${CUR[i]}। best দাঁড়াল ${BEST[i]}${improved ? ' — নতুন রেকর্ড' : ' (অপরিবর্তিত)'}।`,
      whyItMatters:
        i === 1
          ? 'প্রতিটা index-এ প্রশ্ন মাত্র একটাই: আগের লেজটা কি সাহায্য করছে? আগের `cur` ঋণাত্মক হলে সে শুধু ভার — ফেলে দিয়ে নতুন শুরু করাই ভালো। এই এক সিদ্ধান্তই সব subarray পরীক্ষা করার O(n²) কাজকে O(n)-এ নামায়।'
          : i === 2 && restarts === false
            ? '`cur` এখানে ঋণাত্মক হয়ে গেল, কিন্তু `best` অক্ষত — কারণ `best` আলাদা করে সর্বোচ্চটা মনে রাখে। `cur` চলতি প্রার্থী, `best` এ পর্যন্ত সেরা; দুটো এক করে ফেললে উত্তর হারিয়ে যেত।'
            : undefined,
      highlightLines: [4, 5, 6],
      vars: [
        { name: 'i', value: i },
        { name: 'nums[i]', value: x },
        { name: 'cur', value: CUR[i] },
        { name: 'best', value: BEST[i] },
      ],
      scene: {
        kind: 'array',
        values: NUMS,
        marks: marksUpTo(i),
        subValues: subValues(i),
        subLabel: 'cur — এই index-এ শেষ হওয়া সেরা subarray-র যোগফল',
        caption: `best = ${BEST[i]}`,
      },
    };
  }),

  {
    id: '1.6-done',
    title: 'শেষ — সর্বোচ্চ যোগফল 6',
    whatHappens:
      'array শেষ। সর্বোচ্চ `cur` উঠেছিল index 6-এ, মান 6 — যা এসেছে subarray `[4, -1, 2, 1]` থেকে।',
    whyItMatters:
      'এক পাস, দুটো ভেরিয়েবল, কোনো বাড়তি array নয় — O(n) সময়, O(1) জায়গা। subarray-টা কোথায় শুরু হয়েছিল সেটাও লাগলে শুধু `cur` রিসেট হওয়ার index মনে রাখলেই হয়।',
    highlightLines: [8],
    vars: [{ name: 'best', value: 6 }],
    scene: {
      kind: 'array',
      values: NUMS,
      window: { from: 3, to: 6, label: 'সেরা subarray' },
      marks: { 3: 'active', 4: 'active', 5: 'active', 6: 'active' },
      subValues: subValues(NUMS.length - 1),
      subLabel: 'cur',
      output: { title: 'সেরা subarray', values: [4, -1, 2, 1] },
      caption: '4 + (−1) + 2 + 1 = 6',
    },
  },
];

export const kadaneSim: PatternSimulation = {
  patternId: '1.6',
  input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
  output: '6',
  steps,
};
