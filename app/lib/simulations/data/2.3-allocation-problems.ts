import type { PatternSimulation, SimStep } from '../types';

/**
 * 2.3 Allocation Problems — splitArray (LC 410).
 *
 * Binary search on the answer space: the maximum subarray sum (cap).
 * Range: max(nums)=10 to sum(nums)=32. For each candidate cap, a greedy
 * pass counts how many contiguous parts are needed. If parts ≤ k, feasible.
 *
 * The main scene shows the original nums array with subValues indicating
 * the running sum within each partition. A side table shows cap vs parts.
 *
 * Concrete input: nums = [7, 2, 5, 10, 8], k = 2 → answer = 18
 */

const NUMS = [7, 2, 5, 10, 8];
const K = 2;

/** Greedy partition: how many parts and what each partition looks like. */
function partition(cap: number) {
  let parts = 1;
  let sum = 0;
  const partSums: number[] = [];
  const partAssignment: number[] = []; // which part each index belongs to

  for (let i = 0; i < NUMS.length; i++) {
    if (sum + NUMS[i] > cap) {
      partSums.push(sum);
      parts++;
      sum = 0;
    }
    sum += NUMS[i];
    partAssignment[i] = parts - 1;
  }
  partSums.push(sum);

  return { parts, partSums, partAssignment, feasible: parts <= K };
}

/** Running sums as subValues. */
function runningSubs(cap: number): Record<number, string | number> {
  const subs: Record<number, string | number> = {};
  let sum = 0;
  for (let i = 0; i < NUMS.length; i++) {
    if (sum + NUMS[i] > cap) {
      sum = 0;
    }
    sum += NUMS[i];
    subs[i] = sum;
  }
  return subs;
}

/** Color each index by which partition it belongs to. */
function partMarks(cap: number): Record<number, 'done' | 'fill'> {
  const { partAssignment } = partition(cap);
  const marks: Record<number, 'done' | 'fill'> = {};
  for (let i = 0; i < NUMS.length; i++) {
    marks[i] = partAssignment[i] % 2 === 0 ? 'done' : 'fill';
  }
  return marks;
}

/** Side table showing partitions and feasibility. */
function capTable(cap: number) {
  const { parts, partSums, feasible } = partition(cap);
  return {
    title: `cap=${cap}, k=${K}`,
    entries: [
      ...partSums.map((s, i) => ({
        key: `part ${i + 1}`,
        value: `sum=${s}`,
        mark: s > cap ? ('reject' as const) : undefined,
      })),
      {
        key: 'parts',
        value: `${parts} ${feasible ? '≤' : '>'} ${K}`,
        mark: feasible ? ('done' as const) : ('reject' as const),
      },
    ],
  };
}

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — cap-এর রেঞ্জ নির্ধারণ',
    whatHappens:
      'সবচেয়ে ছোট cap = max(nums) = 10 (একটা এলিমেন্ট একটা ভাগে তো থাকতেই হবে)। সবচেয়ে বড় cap = sum(nums) = 32 (সব একই ভাগে)। এর মাঝে সবচেয়ে ছোট feasible cap বের করতে হবে।',
    whyItMatters:
      'cap-কে "maximum allowed subarray sum" মনে করুন। cap ছোট হলে বেশি ভাগ লাগে, বড় হলে কম ভাগে চলে — এই monotonicity-ই binary search সম্ভব করে।',
    highlightLines: [12, 13, 14],
    vars: [
      { name: 'lo', value: 10 },
      { name: 'hi', value: 32 },
      { name: 'k', value: 2 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      subLabel: 'sum',
      caption: 'nums = [7, 2, 5, 10, 8] — k=2 ভাগে ভাগ করতে হবে',
    },
  },

  {
    id: 'it-1',
    title: 'cap=21 → 2 parts ≤ 2 — Feasible! hi=21',
    whatHappens:
      'mid = ⌊(10+32)/2⌋ = 21। greedy scan: [7,2,5]=14 (≤21), [10,8]=18 (≤21) — 2 parts ≤ 2 — সম্ভব! hi=21।',
    whyItMatters:
      'cap=21-এ 2 ভাগে চলছে — কিন্তু হয়তো আরও কম cap-এও চলবে। তাই hi কমিয়ে চাপ দিচ্ছি।',
    highlightLines: [15, 16, 17],
    vars: [
      { name: 'lo', value: 10 },
      { name: 'hi', value: 21 },
      { name: 'mid (cap)', value: 21 },
      { name: 'parts', value: 2 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: partMarks(21),
      subValues: runningSubs(21),
      subLabel: 'sum',
      table: capTable(21),
      caption: 'cap=21 → [7,2,5|10,8] = 2 parts ✓',
    },
  },

  {
    id: 'it-2',
    title: 'cap=15 → 3 parts > 2 — Too small! lo=16',
    whatHappens:
      'mid = ⌊(10+21)/2⌋ = 15। greedy: [7,2,5]=14 (≤15), [10]=10 (নতুন ভাগ, 10+8=18>15), [8]=8 — 3 parts > 2। অসম্ভব! lo=16।',
    whyItMatters:
      'cap=15-এ 2 ভাগে ফেলা যাচ্ছে না — 15-এর নিচের সব cap-ও ব্যর্থ হবে (monotonic), তাই lo নিরাপদে বাড়ানো যায়।',
    highlightLines: [15, 16, 18],
    vars: [
      { name: 'lo', value: 16 },
      { name: 'hi', value: 21 },
      { name: 'mid (cap)', value: 15 },
      { name: 'parts', value: 3 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: partMarks(15),
      subValues: runningSubs(15),
      subLabel: 'sum',
      table: capTable(15),
      caption: 'cap=15 → [7,2,5|10|8] = 3 parts ✗',
    },
  },

  {
    id: 'it-3',
    title: 'cap=18 → 2 parts ≤ 2 — Feasible! hi=18',
    whatHappens:
      'mid = ⌊(16+21)/2⌋ = 18। greedy: [7,2,5]=14 (≤18), [10,8]=18 (≤18) — 2 parts ≤ 2। Feasible! hi=18।',
    highlightLines: [15, 16, 17],
    vars: [
      { name: 'lo', value: 16 },
      { name: 'hi', value: 18 },
      { name: 'mid (cap)', value: 18 },
      { name: 'parts', value: 2 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: partMarks(18),
      subValues: runningSubs(18),
      subLabel: 'sum',
      table: capTable(18),
      caption: 'cap=18 → [7,2,5|10,8] = 2 parts ✓',
    },
  },

  {
    id: 'it-4',
    title: 'cap=17 → 3 parts > 2 — Too small! lo=18',
    whatHappens:
      'mid = ⌊(16+18)/2⌋ = 17। greedy: [7,2,5]=14 (≤17), [10]=10 (10+8=18>17), [8]=8 — 3 parts > 2। lo=18। এখন lo=hi=18 — লুপ শেষ।',
    highlightLines: [15, 16, 18],
    vars: [
      { name: 'lo', value: 18 },
      { name: 'hi', value: 18 },
      { name: 'mid (cap)', value: 17 },
      { name: 'parts', value: 3 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: partMarks(17),
      subValues: runningSubs(17),
      subLabel: 'sum',
      table: capTable(17),
      caption: 'cap=17 → [7,2,5|10|8] = 3 parts ✗',
    },
  },

  {
    id: 'done',
    title: 'উত্তর: 18',
    whatHappens:
      'lo = hi = 18 → return 18। সর্বোচ্চ সাব-অ্যারে যোগফল 18 রেখেই 2 ভাগে ভাগ করা সম্ভব: [7,2,5] (14) এবং [10,8] (18)।',
    whyItMatters:
      'cap=17-এ 3 ভাগ লাগে, cap=18-এ 2 ভাগেই চলে — 18 হলো সেই exact boundary point। O(n × log(sum−max)) time, O(1) space।',
    highlightLines: [20],
    vars: [{ name: 'answer', value: 18 }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: partMarks(18),
      subValues: runningSubs(18),
      subLabel: 'sum',
      table: capTable(18),
      output: { title: 'result', values: [18] },
      caption: 'splitArray([7,2,5,10,8], 2) = 18',
    },
  },
];

export const allocationProblemsSim: PatternSimulation = {
  patternId: '2.3',
  input: 'nums = [7, 2, 5, 10, 8], k = 2',
  output: '18',
  steps,
};
