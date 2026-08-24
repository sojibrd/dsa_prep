import type { PatternSimulation, SimStep } from '../types';

/**
 * 2.1 Basic Binary Search & Counting Occurrences — searchRange (LC 34).
 *
 * Two-phase binary search: Phase 1 finds the first occurrence of the target
 * (left-biased), Phase 2 finds the last (right-biased). The simulation shows
 * the search window narrowing via `window`, rejected halves via `marks`, and
 * the candidate `ans` tracking across iterations.
 *
 * Concrete input: nums = [5, 7, 7, 8, 8, 10], target = 8 → [3, 4]
 */

const NUMS = [5, 7, 7, 8, 8, 10];

/** Helper: mark indices outside [lo..hi] as 'reject'. */
function rejected(lo: number, hi: number): Record<number, 'reject'> {
  const marks: Record<number, 'reject'> = {};
  for (let i = 0; i < NUMS.length; i++) {
    if (i < lo || i > hi) marks[i] = 'reject';
  }
  return marks;
}

const steps: SimStep[] = [
  // ── Phase 1: First Occurrence ─────────────────────────────────────────
  {
    id: 'p1-init',
    title: 'Phase 1 — প্রথম occurrence খোঁজা শুরু',
    whatHappens:
      'isFirst = true দিয়ে bound() কল হলো। lo=0, hi=5, ans=−1। পুরো array সার্চ স্পেস।',
    whyItMatters:
      'একবার বাইনারি সার্চে টার্গেট পেলে থেমে গেলে first occurrence নিশ্চিত হয় না — তাই ম্যাচ পেলেও hi কমিয়ে আরও বাঁয়ে চাপ দেব।',
    highlightLines: [3, 4, 5, 6],
    vars: [
      { name: 'phase', value: 'First' },
      { name: 'lo', value: 0 },
      { name: 'hi', value: 5 },
      { name: 'ans', value: -1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 0 },
        { name: 'hi', index: 5 },
      ],
      window: { from: 0, to: 5, label: 'Search Range' },
      caption: 'nums = [5, 7, 7, 8, 8, 10] — target = 8',
    },
  },

  {
    id: 'p1-it1',
    title: 'mid=2 → nums[2]=7 < 8 — ডানে যেতে হবে',
    whatHappens:
      'mid = (0+5)>>1 = 2। nums[2]=7, target=8 — ছোট, তাই lo = mid+1 = 3। বাম অর্ধেক বাদ।',
    whyItMatters:
      'target বড়, তাই বামের সব value ≤ 7 — ওদিকে target থাকার উপায় নেই।',
    highlightLines: [7, 8, 9],
    vars: [
      { name: 'phase', value: 'First' },
      { name: 'lo', value: 3 },
      { name: 'hi', value: 5 },
      { name: 'mid', value: 2 },
      { name: 'ans', value: -1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 3 },
        { name: 'mid', index: 2 },
        { name: 'hi', index: 5 },
      ],
      window: { from: 3, to: 5, label: 'Search Range' },
      marks: { ...rejected(3, 5), 2: 'active' },
      caption: '7 < 8 → lo সরলো ডানে',
    },
  },

  {
    id: 'p1-it2',
    title: 'mid=4 → nums[4]=8 ম্যাচ! ans=4, আরও বাঁয়ে',
    whatHappens:
      'mid = (3+5)>>1 = 4। nums[4]=8 === target! ans=4। কিন্তু isFirst=true, তাই hi = mid−1 = 3 — আরও বাঁয়ে খুঁজি।',
    whyItMatters:
      'ম্যাচ পাওয়া গেলেও থামলাম না — বাঁয়ে আরেকটা 8 থাকতে পারে। ans সেভ করে রেখে সার্চ স্পেস ছোট করলাম।',
    highlightLines: [7, 8, 9, 10, 11],
    vars: [
      { name: 'phase', value: 'First' },
      { name: 'lo', value: 3 },
      { name: 'hi', value: 3 },
      { name: 'mid', value: 4 },
      { name: 'ans', value: 4 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 3 },
        { name: 'mid', index: 4 },
        { name: 'hi', index: 3 },
      ],
      window: { from: 3, to: 3, label: 'Search Range' },
      marks: { ...rejected(3, 3), 4: 'done' },
      caption: '8 পাওয়া গেছে index 4-এ — কিন্তু আরও বাঁয়ে আছে কি?',
    },
  },

  {
    id: 'p1-it3',
    title: 'mid=3 → nums[3]=8 ম্যাচ! ans=3, hi=2',
    whatHappens:
      'mid = (3+3)>>1 = 3। nums[3]=8 === target! ans আপডেট হলো 3-এ। hi = mid−1 = 2 — এখন lo(3) > hi(2), লুপ শেষ।',
    whyItMatters:
      'এবার আর বাঁয়ে কেউ নেই — first occurrence নিশ্চিত: index 3।',
    highlightLines: [7, 8, 9, 10, 11],
    vars: [
      { name: 'phase', value: 'First' },
      { name: 'lo', value: 3 },
      { name: 'hi', value: 2 },
      { name: 'mid', value: 3 },
      { name: 'ans', value: 3 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'mid', index: 3 }],
      marks: { 0: 'reject', 1: 'reject', 2: 'reject', 3: 'done', 4: 'done', 5: 'reject' },
      caption: 'first = 3 — Phase 1 সমাপ্ত ✓',
    },
  },

  // ── Phase 2: Last Occurrence ──────────────────────────────────────────
  {
    id: 'p2-init',
    title: 'Phase 2 — শেষ occurrence খোঁজা শুরু',
    whatHappens:
      'isFirst = false দিয়ে আবার bound() কল। lo=0, hi=5, ans=−1 — আবার পুরো array থেকে শুরু।',
    whyItMatters:
      'এবার ম্যাচ পেলে lo বাড়াব — ডানে আরও 8 আছে কি না জানতে।',
    highlightLines: [3, 4, 5, 6],
    vars: [
      { name: 'phase', value: 'Last' },
      { name: 'lo', value: 0 },
      { name: 'hi', value: 5 },
      { name: 'ans', value: -1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 0 },
        { name: 'hi', index: 5 },
      ],
      window: { from: 0, to: 5, label: 'Search Range' },
      caption: 'Phase 2 — last occurrence খুঁজছি',
    },
  },

  {
    id: 'p2-it1',
    title: 'mid=2 → nums[2]=7 < 8 — ডানে',
    whatHappens:
      'mid=2, nums[2]=7 < 8 → lo = 3। Phase 1-এর মতোই বাম বাদ।',
    highlightLines: [7, 8, 9],
    vars: [
      { name: 'phase', value: 'Last' },
      { name: 'lo', value: 3 },
      { name: 'hi', value: 5 },
      { name: 'mid', value: 2 },
      { name: 'ans', value: -1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 3 },
        { name: 'mid', index: 2 },
        { name: 'hi', index: 5 },
      ],
      window: { from: 3, to: 5, label: 'Search Range' },
      marks: { ...rejected(3, 5), 2: 'active' },
      caption: '7 < 8 → lo সরলো ডানে',
    },
  },

  {
    id: 'p2-it2',
    title: 'mid=4 → nums[4]=8 ম্যাচ! ans=4, আরও ডানে',
    whatHappens:
      'mid=4, nums[4]=8 === target। ans=4। এবার isFirst=false, তাই lo = mid+1 = 5 — ডানে চাপ দিচ্ছি।',
    whyItMatters:
      'Phase 1-এর উল্টো: ম্যাচের পরেও ডানে খুঁজছি কারণ আরও ডানে 8 থাকতে পারে।',
    highlightLines: [7, 8, 9, 10, 12],
    vars: [
      { name: 'phase', value: 'Last' },
      { name: 'lo', value: 5 },
      { name: 'hi', value: 5 },
      { name: 'mid', value: 4 },
      { name: 'ans', value: 4 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 5 },
        { name: 'mid', index: 4 },
        { name: 'hi', index: 5 },
      ],
      window: { from: 5, to: 5, label: 'Search Range' },
      marks: { 0: 'reject', 1: 'reject', 2: 'reject', 4: 'done' },
      caption: '8 পাওয়া গেছে index 4-এ — ডানে আরও আছে কি?',
    },
  },

  {
    id: 'p2-it3',
    title: 'mid=5 → nums[5]=10 > 8 — hi=4, লুপ শেষ',
    whatHappens:
      'mid=5, nums[5]=10 > 8 → hi = mid−1 = 4। এখন lo(5) > hi(4) — লুপ থামলো। last = ans = 4।',
    highlightLines: [7, 8, 14],
    vars: [
      { name: 'phase', value: 'Last' },
      { name: 'lo', value: 5 },
      { name: 'hi', value: 4 },
      { name: 'mid', value: 5 },
      { name: 'ans', value: 4 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [{ name: 'mid', index: 5 }],
      marks: { 0: 'reject', 1: 'reject', 2: 'reject', 3: 'done', 4: 'done', 5: 'active' },
      caption: 'last = 4 — Phase 2 সমাপ্ত ✓',
    },
  },

  // ── Final ─────────────────────────────────────────────────────────────
  {
    id: 'done',
    title: 'ফলাফল: [3, 4]',
    whatHappens:
      'bound(true) = 3, bound(false) = 4 → return [3, 4]। target 8 index 3 ও 4-এ আছে, মোট ২ বার।',
    whyItMatters:
      'দুবার O(log n) সার্চ = O(log n)। একই কৌশল দিয়ে count = last − first + 1 = 2 বের করা যায়। brute-force-এর O(n) scan-এর দরকার নেই।',
    highlightLines: [16, 18],
    vars: [
      { name: 'first', value: 3 },
      { name: 'last', value: 4 },
      { name: 'count', value: 2 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'reject', 1: 'reject', 2: 'reject', 3: 'done', 4: 'done', 5: 'reject' },
      output: { title: 'result', values: [3, 4] },
      caption: 'searchRange([5,7,7,8,8,10], 8) = [3, 4]',
    },
  },
];

export const basicBinarySearchSim: PatternSimulation = {
  patternId: '2.1',
  input: 'nums = [5, 7, 7, 8, 8, 10], target = 8',
  output: '[3, 4]',
  steps,
};
