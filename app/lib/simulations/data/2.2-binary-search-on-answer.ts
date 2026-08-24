import type { PatternSimulation, SimStep } from '../types';

/**
 * 2.2 Binary Search on Answer — minEatingSpeed (LC 875: Koko Eating Bananas).
 *
 * Instead of searching through the data array, we search the ANSWER SPACE:
 * speed 1..max(piles). A virtual array [1, 2, …, 11] is the main scene;
 * a side table shows how many hours each pile takes at the current `mid` speed,
 * and whether totalHours ≤ h (feasible).
 *
 * Concrete input: piles = [3, 6, 7, 11], h = 8 → answer = 4
 */

const PILES = [3, 6, 7, 11];
const H = 8;
const MAX_PILE = 11;

/** The virtual speed array 1..11 */
const SPEEDS = Array.from({ length: MAX_PILE }, (_, i) => i + 1);

/** Calculate hours for each pile at a given speed, and total. */
function hoursDetail(speed: number) {
  const perPile = PILES.map((p) => Math.ceil(p / speed));
  const total = perPile.reduce((a, b) => a + b, 0);
  return { perPile, total, feasible: total <= H };
}

/** Build the side table showing per-pile hours at current speed. */
function pilesTable(speed: number) {
  const { perPile, total, feasible } = hoursDetail(speed);
  return {
    title: `piles @ speed=${speed}`,
    entries: [
      ...PILES.map((p, i) => ({
        key: `pile[${i}]=${p}`,
        value: `⌈${p}/${speed}⌉ = ${perPile[i]}h`,
      })),
      {
        key: 'মোট',
        value: `${total}h ${feasible ? '≤' : '>'} ${H}`,
        mark: feasible ? ('done' as const) : ('reject' as const),
      },
    ],
  };
}

/** Mark indices outside [lo..hi] as reject in the speed array. */
function speedMarks(
  lo: number,
  hi: number,
  mid: number
): Record<number, 'reject' | 'active'> {
  const marks: Record<number, 'reject' | 'active'> = {};
  for (let i = 0; i < SPEEDS.length; i++) {
    if (i < lo || i > hi) marks[i] = 'reject';
  }
  marks[mid] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — উত্তরের স্পেসে সার্চ',
    whatHappens:
      'array-তে নয়, উত্তরের সম্ভাব্য মানের ওপর সার্চ করব। speed 1 থেকে max(piles)=11 — এই 11টি সম্ভাবনাই আমাদের "sorted array"। lo=1(index 0), hi=11(index 10)।',
    whyItMatters:
      '"Binary Search on Answer" প্যাটার্ন — canFinish(k) monotonic: speed k-তে সম্ভব হলে k+1-এও সম্ভব। তাই সবচেয়ে ছোট feasible speed বাইনারি সার্চে পাওয়া যায়।',
    highlightLines: [3, 4],
    vars: [
      { name: 'lo', value: 1 },
      { name: 'hi', value: 11 },
    ],
    scene: {
      kind: 'array',
      values: SPEEDS,
      pointers: [
        { name: 'lo', index: 0 },
        { name: 'hi', index: 10 },
      ],
      window: { from: 0, to: 10, label: 'Speed Range' },
      caption: 'piles = [3, 6, 7, 11], h = 8 — speed কত হলে 8 ঘণ্টায় শেষ?',
    },
  },

  {
    id: 'it-1',
    title: 'mid=6 → 6 ঘণ্টা ≤ 8 — Feasible! hi=6',
    whatHappens:
      'mid = (1+11)>>1 = 6। speed 6-এ: ⌈3/6⌉+⌈6/6⌉+⌈7/6⌉+⌈11/6⌉ = 1+1+2+2 = 6 ≤ 8। সম্ভব! আরও ছোট speed চেষ্টা করি — hi=6।',
    whyItMatters:
      'Feasible মানে এটা একটা candidate উত্তর — কিন্তু এর চেয়ে ছোট speed-ও কাজ করতে পারে, তাই hi কমিয়ে ছোটদের দিকে চাপ দিচ্ছি।',
    highlightLines: [5, 6, 7, 8],
    vars: [
      { name: 'lo', value: 1 },
      { name: 'hi', value: 6 },
      { name: 'mid', value: 6 },
      { name: 'hours', value: 6 },
    ],
    scene: {
      kind: 'array',
      values: SPEEDS,
      pointers: [
        { name: 'lo', index: 0 },
        { name: 'mid', index: 5 },
        { name: 'hi', index: 5 },
      ],
      window: { from: 0, to: 5, label: 'Speed Range' },
      marks: { ...speedMarks(0, 5, 5) },
      table: pilesTable(6),
      caption: 'speed=6 → 6h ≤ 8 ✓ — আরও কম speed-এ চলবে?',
    },
  },

  {
    id: 'it-2',
    title: 'mid=3 → 10 ঘণ্টা > 8 — Too slow! lo=4',
    whatHappens:
      'mid = (1+6)>>1 = 3। speed 3-এ: ⌈3/3⌉+⌈6/3⌉+⌈7/3⌉+⌈11/3⌉ = 1+2+3+4 = 10 > 8। সময় বেশি লাগছে — lo=4।',
    whyItMatters:
      '10 > 8 মানে speed 3 যথেষ্ট না। 3-এর নিচের সব speed-ও ব্যর্থ হবে (monotonic!) — তাই নিরাপদে lo বাড়ানো যায়।',
    highlightLines: [5, 6, 9],
    vars: [
      { name: 'lo', value: 4 },
      { name: 'hi', value: 6 },
      { name: 'mid', value: 3 },
      { name: 'hours', value: 10 },
    ],
    scene: {
      kind: 'array',
      values: SPEEDS,
      pointers: [
        { name: 'lo', index: 3 },
        { name: 'mid', index: 2 },
        { name: 'hi', index: 5 },
      ],
      window: { from: 3, to: 5, label: 'Speed Range' },
      marks: { ...speedMarks(3, 5, 2) },
      table: pilesTable(3),
      caption: 'speed=3 → 10h > 8 ✗ — speed বাড়াতে হবে',
    },
  },

  {
    id: 'it-3',
    title: 'mid=5 → 8 ঘণ্টা ≤ 8 — Feasible! hi=5',
    whatHappens:
      'mid = (4+6)>>1 = 5। speed 5-এ: ⌈3/5⌉+⌈6/5⌉+⌈7/5⌉+⌈11/5⌉ = 1+2+2+3 = 8 ≤ 8। ঠিক মতো খাপ খেলো! hi=5।',
    whyItMatters:
      'ঠিক h-এর সমান — feasible! কিন্তু speed 4-ও হয়তো কাজ করে, তাই এখনও থামছি না।',
    highlightLines: [5, 6, 7, 8],
    vars: [
      { name: 'lo', value: 4 },
      { name: 'hi', value: 5 },
      { name: 'mid', value: 5 },
      { name: 'hours', value: 8 },
    ],
    scene: {
      kind: 'array',
      values: SPEEDS,
      pointers: [
        { name: 'lo', index: 3 },
        { name: 'mid', index: 4 },
        { name: 'hi', index: 4 },
      ],
      window: { from: 3, to: 4, label: 'Speed Range' },
      marks: { ...speedMarks(3, 4, 4) },
      table: pilesTable(5),
      caption: 'speed=5 → 8h ≤ 8 ✓ — speed 4-ও চলে কি?',
    },
  },

  {
    id: 'it-4',
    title: 'mid=4 → 8 ঘণ্টা ≤ 8 — Feasible! hi=4',
    whatHappens:
      'mid = (4+5)>>1 = 4। speed 4-এ: ⌈3/4⌉+⌈6/4⌉+⌈7/4⌉+⌈11/4⌉ = 1+2+2+3 = 8 ≤ 8। Feasible! hi=4। এখন lo=hi=4 — লুপ শেষ।',
    whyItMatters:
      'speed 4 সবচেয়ে ছোট feasible speed — 3-এ 10 ঘণ্টা লাগত (too slow), কিন্তু 4-এ ঠিক 8 ঘণ্টায় শেষ।',
    highlightLines: [5, 6, 7, 8],
    vars: [
      { name: 'lo', value: 4 },
      { name: 'hi', value: 4 },
      { name: 'mid', value: 4 },
      { name: 'hours', value: 8 },
    ],
    scene: {
      kind: 'array',
      values: SPEEDS,
      pointers: [{ name: 'ans', index: 3 }],
      window: { from: 3, to: 3, label: 'Answer' },
      marks: { ...speedMarks(3, 3, 3) },
      table: pilesTable(4),
      caption: 'speed=4 → 8h ≤ 8 ✓ — lo=hi=4, থামলাম',
    },
  },

  {
    id: 'done',
    title: 'উত্তর: speed = 4',
    whatHappens:
      'lo = hi = 4 → return 4। Koko ঘণ্টায় 4টা করে কলা খেলে ঠিক 8 ঘণ্টায় সব পাইল শেষ।',
    whyItMatters:
      'মোট 11টি সম্ভাব্য speed-এর মধ্যে মাত্র 4 বার চেক করে উত্তর পেয়ে গেলাম — O(n × log(max)) যেখানে n=pile সংখ্যা, log(max)=সার্চ ধাপ। brute-force-এ 11×4 = 44 বার pile scan লাগত।',
    highlightLines: [11],
    vars: [{ name: 'answer', value: 4 }],
    scene: {
      kind: 'array',
      values: SPEEDS,
      marks: {
        0: 'reject', 1: 'reject', 2: 'reject',
        3: 'done',
        4: 'reject', 5: 'reject', 6: 'reject', 7: 'reject', 8: 'reject', 9: 'reject', 10: 'reject',
      },
      table: pilesTable(4),
      output: { title: 'result', values: [4] },
      caption: 'minEatingSpeed([3,6,7,11], 8) = 4',
    },
  },
];

export const binarySearchOnAnswerSim: PatternSimulation = {
  patternId: '2.2',
  input: 'piles = [3, 6, 7, 11], h = 8',
  output: '4',
  steps,
};
