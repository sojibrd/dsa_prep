import type { PatternSimulation, SimStep } from '../types';

/**
 * 2.4 Bitonic / Rotated Array — search (LC 33).
 *
 * Binary search in a rotated sorted array. At each step we check which half
 * is properly sorted (nums[lo] <= nums[mid] → left is sorted) and whether
 * the target falls in that sorted range to decide which direction to go.
 *
 * Concrete input: nums = [4, 5, 6, 7, 0, 1, 2], target = 0 → index 4
 */

const NUMS = [4, 5, 6, 7, 0, 1, 2];

/** Mark the sorted half distinctly from the unsorted half. */
function halfMarks(
  lo: number,
  hi: number,
  mid: number,
  sortedSide: 'left' | 'right'
): Record<number, 'done' | 'active' | 'reject'> {
  const marks: Record<number, 'done' | 'active' | 'reject'> = {};
  // Rejected indices outside search range
  for (let i = 0; i < NUMS.length; i++) {
    if (i < lo || i > hi) marks[i] = 'reject';
  }
  // Mark sorted half as 'done', unsorted as unmarked (default)
  if (sortedSide === 'left') {
    for (let i = lo; i < mid; i++) marks[i] = 'done';
  } else {
    for (let i = mid + 1; i <= hi; i++) marks[i] = 'done';
  }
  marks[mid] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — rotated sorted array-তে সার্চ',
    whatHappens:
      'lo=0, hi=6। sorted array [0,1,2,4,5,6,7] কোনো pivot-এ rotate হয়ে [4,5,6,7,0,1,2] হয়েছে। target=0 খুঁজতে হবে O(log n)-এ।',
    whyItMatters:
      'পুরো array sorted না হলেও, দুই ভাগের একটা সবসময় sorted থাকে — সেটাই কাজে লাগাব।',
    highlightLines: [2, 3],
    vars: [
      { name: 'lo', value: 0 },
      { name: 'hi', value: 6 },
      { name: 'target', value: 0 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 0 },
        { name: 'hi', index: 6 },
      ],
      window: { from: 0, to: 6, label: 'Search Range' },
      caption: 'nums = [4, 5, 6, 7, 0, 1, 2] — target = 0',
    },
  },

  {
    id: 'it-1',
    title: 'mid=3 (7) — বাম [4..7] sorted, target ওখানে নেই → ডানে',
    whatHappens:
      'mid = (0+6)>>1 = 3, nums[3]=7 ≠ 0। nums[lo]=4 ≤ nums[mid]=7, তাই বাম অর্ধেক [4,5,6,7] sorted। target 0 কি 4..7 রেঞ্জে? না (0 < 4)। সুতরাং lo = mid+1 = 4।',
    whyItMatters:
      'বাম sorted হলেও target সেখানে পড়ছে না — তাই pivot-এর ওপারে, ডান দিকে নিশ্চিতভাবে আছে। sorted অর্ধেকটা দিয়েই "কোথায় নেই" বুঝে বাকিটায় যাচ্ছি।',
    highlightLines: [4, 5, 6, 7, 8, 10],
    vars: [
      { name: 'lo', value: 4 },
      { name: 'hi', value: 6 },
      { name: 'mid', value: 3 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 4 },
        { name: 'mid', index: 3 },
        { name: 'hi', index: 6 },
      ],
      window: { from: 4, to: 6, label: 'Search Range' },
      marks: halfMarks(0, 6, 3, 'left'),
      caption: 'বাম [4,5,6,7] sorted — target 0 নেই → ডানে',
    },
  },

  {
    id: 'it-2',
    title: 'mid=5 (1) — বাম [0,1] নয়, ডান [1,2] sorted → বামে',
    whatHappens:
      'mid = (4+6)>>1 = 5, nums[5]=1 ≠ 0। nums[lo]=0 ≤ nums[mid]=1 → বাম sorted? হ্যাঁ [0,1]! target 0 কি 0..1 রেঞ্জে (0 ≤ 0 && 0 < 1)? হ্যাঁ! hi = mid−1 = 4।',
    whyItMatters:
      'এবার target sorted অর্ধেকের মধ্যেই পড়ছে — তাই নির্দ্বিধায় সেদিকে সরে গেলাম। অন্য দিক পুরোটা বাদ।',
    highlightLines: [4, 5, 6, 7, 9],
    vars: [
      { name: 'lo', value: 4 },
      { name: 'hi', value: 4 },
      { name: 'mid', value: 5 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 4 },
        { name: 'mid', index: 5 },
        { name: 'hi', index: 4 },
      ],
      window: { from: 4, to: 4, label: 'Search Range' },
      marks: { ...halfMarks(4, 6, 5, 'left'), 0: 'reject', 1: 'reject', 2: 'reject', 3: 'reject' },
      caption: 'বাম [0,1] sorted — target 0 আছে → বামে',
    },
  },

  {
    id: 'it-3',
    title: 'mid=4 (0) — nums[mid] === target → পাওয়া গেছে!',
    whatHappens:
      'mid = (4+4)>>1 = 4, nums[4]=0 === target! return 4।',
    whyItMatters:
      'মাত্র 3 ধাপে 7 elements-এর rotated array-তে target পেয়ে গেলাম — O(log n)।',
    highlightLines: [4, 5, 6],
    vars: [
      { name: 'lo', value: 4 },
      { name: 'hi', value: 4 },
      { name: 'mid', value: 4 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'mid', index: 4 }],
      marks: { 0: 'reject', 1: 'reject', 2: 'reject', 3: 'reject', 4: 'done', 5: 'reject', 6: 'reject' },
      caption: 'nums[4] = 0 === target → পাওয়া গেছে!',
    },
  },

  {
    id: 'done',
    title: 'ফলাফল: index 4',
    whatHappens:
      'return 4। target 0 এই rotated array-তে index 4-এ আছে।',
    whyItMatters:
      'মূলনীতি: প্রতি ধাপে একটা অর্ধেক অবশ্যই sorted — সেটা identify করো, target সেখানে পড়ে কিনা range check করো, আর সিদ্ধান্ত নাও। "কোন দিক sorted?" — এই একটা প্রশ্নেই rotated array সমস্যাটা সাধারণ binary search-এ নেমে আসে।',
    highlightLines: [6],
    vars: [{ name: 'answer', value: 4 }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'reject', 1: 'reject', 2: 'reject', 3: 'reject', 4: 'done', 5: 'reject', 6: 'reject' },
      output: { title: 'result', values: [4] },
      caption: 'search([4,5,6,7,0,1,2], 0) = 4',
    },
  },
];

export const bitonicRotatedArraySim: PatternSimulation = {
  patternId: '2.4',
  input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0',
  output: '4',
  steps,
};
