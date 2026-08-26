import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.9 Interval DP — Burst Balloons

   The one pattern that needed `MatrixScene.pointers`: three positions matter
   at once — `l` and `r` bound the interval, `k` is the split being tested —
   and a single unnamed cursor cannot say which is which.
   ========================================================================= */

const NUMS = [3, 1, 5];
/** Padded with virtual 1s at both ends, as the code does. */
const A = [1, 3, 1, 5, 1];
const SIZE = A.length;

interface Event {
  kind: 'candidate' | 'settle';
  l: number;
  r: number;
  k?: number;
  /** Candidate value, for `candidate`. */
  value?: number;
  /** Best for this interval after the event. */
  best: number;
  /** Whether this candidate beat the running best. */
  won?: boolean;
  /** dp cells settled before this event, as "l,r" keys. */
  settled: string[];
}

/** Verified by running the demo code and logging all 16 events. */
const EVENTS: Event[] = [
  { kind: 'candidate', l: 0, r: 2, k: 1, value: 3, best: 3, won: true, settled: [] },
  { kind: 'settle', l: 0, r: 2, best: 3, settled: [] },
  { kind: 'candidate', l: 1, r: 3, k: 2, value: 15, best: 15, won: true, settled: ['0,2'] },
  { kind: 'settle', l: 1, r: 3, best: 15, settled: ['0,2'] },
  { kind: 'candidate', l: 2, r: 4, k: 3, value: 5, best: 5, won: true, settled: ['0,2', '1,3'] },
  { kind: 'settle', l: 2, r: 4, best: 5, settled: ['0,2', '1,3'] },
  { kind: 'candidate', l: 0, r: 3, k: 1, value: 30, best: 30, won: true, settled: ['0,2', '1,3', '2,4'] },
  { kind: 'candidate', l: 0, r: 3, k: 2, value: 8, best: 30, won: false, settled: ['0,2', '1,3', '2,4'] },
  { kind: 'settle', l: 0, r: 3, best: 30, settled: ['0,2', '1,3', '2,4'] },
  { kind: 'candidate', l: 1, r: 4, k: 2, value: 8, best: 8, won: true, settled: ['0,2', '1,3', '2,4', '0,3'] },
  { kind: 'candidate', l: 1, r: 4, k: 3, value: 30, best: 30, won: true, settled: ['0,2', '1,3', '2,4', '0,3'] },
  { kind: 'settle', l: 1, r: 4, best: 30, settled: ['0,2', '1,3', '2,4', '0,3'] },
  { kind: 'candidate', l: 0, r: 4, k: 1, value: 33, best: 33, won: true, settled: ['0,2', '1,3', '2,4', '0,3', '1,4'] },
  { kind: 'candidate', l: 0, r: 4, k: 2, value: 9, best: 33, won: false, settled: ['0,2', '1,3', '2,4', '0,3', '1,4'] },
  { kind: 'candidate', l: 0, r: 4, k: 3, value: 35, best: 35, won: true, settled: ['0,2', '1,3', '2,4', '0,3', '1,4'] },
  { kind: 'settle', l: 0, r: 4, best: 35, settled: ['0,2', '1,3', '2,4', '0,3', '1,4'] },
];

/** Final value of every dp cell, so a settled cell can be drawn. */
const FINAL: Record<string, number> = {
  '0,2': 3, '1,3': 15, '2,4': 5, '0,3': 30, '1,4': 30, '0,4': 35,
};

/** The dp table: settled cells show their value, the live one shows `best`. */
function grid(event: Event, includeLive: boolean): (number | string)[][] {
  const table: (number | string)[][] = Array.from({ length: SIZE }, () =>
    new Array<number | string>(SIZE).fill('·')
  );
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j <= i; j++) table[i][j] = '';
  }
  for (const key of event.settled) {
    const [l, r] = key.split(',').map(Number);
    table[l][r] = FINAL[key];
  }
  if (includeLive) table[event.l][event.r] = event.best;
  return table;
}

function marksFor(event: Event): Record<string, CellMark> {
  const marks: Record<string, CellMark> = {};
  for (const key of event.settled) marks[key] = 'done';

  if (event.kind === 'candidate' && event.k !== undefined) {
    // The two sub-intervals this candidate is built from.
    marks[`${event.l},${event.k}`] = 'fill';
    marks[`${event.k},${event.r}`] = 'fill';
  }
  marks[`${event.l},${event.r}`] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '9.9-init',
    title: 'শুরু — দুই প্রান্তে কল্পিত ১',
    whatHappens:
      '`nums = [3, 1, 5]`-এর দুই পাশে একটা করে কল্পিত `1` বসিয়ে `a = [1, 3, 1, 5, 1]`। dp টেবিল `5 × 5`, সব শূন্য।',
    whyItMatters:
      'সবচেয়ে বড় ফাঁদ: "কোন বেলুন **আগে** ফাটাব" ভাবলে সমস্যাটা ভাঙে না, কারণ একটা ফাটালে বাকিরা পাশাপাশি এসে পড়ে আর দুই পাশ বদলে যায়। উল্টে ভাবতে হয় — "কোন বেলুন **সবশেষে** ফাটাব"। শেষেরটা যদি k হয়, তবে তার দুই পাশে তখন থাকবে কেবল l আর r — যারা অটুট। তাই বাঁ ও ডান অংশ স্বাধীন হয়ে যায়। কল্পিত ১ দুটো প্রান্তের বিশেষ ক্ষেত্র মুছে দেয়।',
    highlightLines: [2, 3, 4],
    vars: [
      { name: 'nums', value: `[${NUMS.join(',')}]` },
      { name: 'a', value: `[${A.join(',')}]` },
    ],
    scene: {
      kind: 'matrix',
      values: grid({ kind: 'settle', l: 0, r: 0, best: 0, settled: [] }, false),
      pointers: [],
      table: {
        title: 'a — padded',
        entries: A.map((value, i) => ({
          key: String(i),
          value,
          mark: (i === 0 || i === SIZE - 1 ? 'fill' : undefined) as CellMark | undefined,
        })),
      },
      caption: 'dp[l][r] = খোলা ব্যবধি (l, r)-এর ভেতরের সব বেলুন ফাটিয়ে সর্বোচ্চ কত কয়েন।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const base = {
      id: `9.9-${i + 1}`,
      vars: [
        { name: 'l', value: event.l },
        { name: 'r', value: event.r },
        ...(event.k !== undefined ? [{ name: 'k', value: event.k }] : []),
        { name: 'dp[l][r]', value: event.best },
      ],
    };

    if (event.kind === 'candidate') {
      const k = event.k as number;
      return {
        ...base,
        title: `(${event.l}, ${event.r}) — k = ${k} সবশেষে ফাটালে ${event.value}`,
        whatHappens: `ধরা যাক ${k}-এর বেলুন (${A[k]}) সবশেষে ফাটে। তখন তার দুই পাশে থাকবে ${A[event.l]} আর ${A[event.r]}, তাই সে দেয় ${A[event.l]} × ${A[k]} × ${A[event.r]} = ${A[event.l] * A[k] * A[event.r]}। তার সাথে বাঁ অংশ dp[${event.l}][${k}] আর ডান অংশ dp[${k}][${event.r}] — মোট ${event.value}। ${
          event.won ? 'এটাই এখন পর্যন্ত সেরা।' : `আগের সেরা ${event.best}-এর চেয়ে কম, তাই বাতিল।`
        }`,
        whyItMatters:
          i === 0
            ? 'দুটো নীল ঘরই আগে থেকে সমাধান হয়ে আছে — এখানে দুটোই খালি ব্যবধি, তাই ০। লুপ `len` ছোট থেকে বড় দিকে চলে ঠিক এই কারণেই: বড় ব্যবধির উত্তর লাগলে ছোটগুলো আগেই তৈরি থাকতে হবে।'
            : i === 6
              ? 'এখানে বাঁ অংশ খালি (dp[0][1] = 0) কিন্তু ডান অংশ dp[1][3] = 15 — আগেই হিসাব করা। ছোট ব্যবধির খাটুনি বড়টায় সরাসরি কাজে লাগছে।'
              : i === 14
                ? 'চূড়ান্ত প্রার্থী: 5-এর বেলুন সবশেষে। তার আগে (0,3) ব্যবধির 30, আর সে নিজে দেয় 1 × 5 × 1 = 5 — মোট 35। এটাই উত্তর।'
                : undefined,
        highlightLines: [5, 6, 7, 8, 9, 10],
        scene: {
          kind: 'matrix',
          values: grid(event, true),
          pointers: [
            { name: 'l', row: event.l, col: event.l },
            { name: 'r', row: event.l, col: event.r },
            { name: 'k', row: event.l, col: k },
          ],
          marks: marksFor(event),
          table: {
            title: 'a — padded',
            entries: A.map((value, idx) => ({
              key: String(idx),
              value,
              mark: (idx === k
                ? 'active'
                : idx === event.l || idx === event.r
                  ? 'fill'
                  : undefined) as CellMark | undefined,
            })),
          },
          caption: `dp[${event.l}][${k}] + ${A[event.l]}·${A[k]}·${A[event.r]} + dp[${k}][${event.r}] = ${event.value}`,
        },
      };
    }

    return {
      ...base,
      title: `dp[${event.l}][${event.r}] চূড়ান্ত = ${event.best}`,
      whatHappens: `ব্যবধি (${event.l}, ${event.r})-এর ভেতরের সব k পরীক্ষা করা শেষ। সেরা মান ${event.best}।`,
      whyItMatters:
        i === 15
          ? 'এটাই মূল উত্তর — dp[0][4], অর্থাৎ পুরো padded array-র দুই প্রান্তের মাঝের সবটা। খরচ O(n³): n² ব্যবধি, প্রতিটায় n-টা করে split।'
          : undefined,
      highlightLines: [5, 6, 7],
      scene: {
        kind: 'matrix',
        values: grid({ ...event, settled: [...event.settled, `${event.l},${event.r}`] }, false),
        pointers: [
          { name: 'l', row: event.l, col: event.l },
          { name: 'r', row: event.l, col: event.r },
        ],
        marks: { ...marksFor(event), [`${event.l},${event.r}`]: 'done' },
        caption: 'এই ঘরটা এখন সেটল — বড় ব্যবধিগুলো একে ব্যবহার করবে।',
      },
    };
  }),

  {
    id: '9.9-done',
    title: 'শেষ — সর্বোচ্চ 35 কয়েন',
    whatHappens:
      '`dp[0][4] = 35`। সবশেষে ফাটে 5-এর বেলুন; তার আগের সেরা ক্রমে 1, তারপর 3।',
    whyItMatters:
      'ক্রমটা: 1 ফাটাও (3×1×5 = 15), তারপর 3 (1×3×5 = 15), শেষে 5 (1×5×1 = 5) — মোট 35। খেয়াল করুন লোভী পদ্ধতি (সবচেয়ে বড়টা আগে বা পরে) এখানে কাজ করে না; "সবশেষে কে" ধরে ভাগ করাই একমাত্র পথ যা উপ-সমস্যাগুলোকে স্বাধীন রাখে।',
    highlightLines: [14],
    vars: [{ name: 'উত্তর', value: 35 }],
    scene: {
      kind: 'matrix',
      values: grid(
        { kind: 'settle', l: 0, r: 4, best: 35, settled: Object.keys(FINAL) },
        false
      ),
      marks: Object.fromEntries(
        Object.keys(FINAL).map((key) => [key, key === '0,4' ? 'active' : ('done' as CellMark)])
      ),
      output: { title: 'ফাটানোর ক্রম', values: [1, 3, 5] },
      caption: 'উপরের-ডানের ঘরটাই উত্তর — পুরো ব্যবধি।',
    },
  },
];

export const intervalDpSim: PatternSimulation = {
  patternId: '9.9',
  input: 'nums = [3,1,5]',
  output: '35',
  steps,
};
