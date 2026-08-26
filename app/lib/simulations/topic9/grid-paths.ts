import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.8 Grid Paths — Unique Paths

   The code keeps ONE rolling row (space-optimised); the scene shows the full
   m×n grid. That gap is deliberate: the rolling row is the 2D table with
   everything but the live row discarded, and the 2D picture is what makes
   "up plus left" legible. The code is not changed to match the picture.
   ========================================================================= */

const M = 3;
const N = 3;

interface Fill {
  i: number;
  j: number;
  up: number;
  left: number;
  value: number;
}

/** Verified by running the demo code, read as a full grid. */
const FILLS: Fill[] = [
  { i: 1, j: 1, up: 1, left: 1, value: 2 },
  { i: 1, j: 2, up: 1, left: 2, value: 3 },
  { i: 2, j: 1, up: 2, left: 1, value: 3 },
  { i: 2, j: 2, up: 3, left: 3, value: 6 },
];

/** The grid after `count` fills; the first row and column are all 1. */
function grid(count: number): (number | string)[][] {
  const table: (number | string)[][] = Array.from({ length: M }, (_, i) =>
    Array.from({ length: N }, (_, j) => (i === 0 || j === 0 ? 1 : ('·' as number | string)))
  );
  for (const fill of FILLS.slice(0, count)) table[fill.i][fill.j] = fill.value;
  return table;
}

function marksFor(fill: Fill, count: number): Record<string, CellMark> {
  const marks: Record<string, CellMark> = {};
  for (const past of FILLS.slice(0, count - 1)) marks[`${past.i},${past.j}`] = 'done';
  marks[`${fill.i - 1},${fill.j}`] = 'fill';
  marks[`${fill.i},${fill.j - 1}`] = 'fill';
  marks[`${fill.i},${fill.j}`] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '9.8-init',
    title: 'শুরু — প্রথম সারি ও কলাম সব ১',
    whatHappens:
      'উপরের সারির প্রতিটা ঘরে পৌঁছানোর উপায় একটাই — সোজা ডানে হেঁটে যাওয়া। বাঁ কলামেও একই, সোজা নিচে। তাই সব ১।',
    whyItMatters:
      'রোবট শুধু ডানে বা নিচে যেতে পারে। তাই `(i, j)` ঘরে ঢোকার উপায় মাত্র দুটো — উপর থেকে নেমে, বা বাঁ থেকে এসে। এই দুই পথ পরস্পরছেদী নয় (একটায় শেষ পদক্ষেপ নিচে, অন্যটায় ডানে), তাই সরাসরি যোগ করা যায়।',
    highlightLines: [2],
    vars: [
      { name: 'm', value: M },
      { name: 'n', value: N },
    ],
    scene: {
      kind: 'matrix',
      values: grid(0),
      caption: 'প্রতিটা ঘরের মান = উপরের-বাঁ কোণা থেকে ওখানে পৌঁছানোর উপায়সংখ্যা।',
    },
  },

  ...FILLS.map((fill, i): SimStep => ({
    id: `9.8-${i + 1}`,
    title: `(${fill.i}, ${fill.j}) — ${fill.up} + ${fill.left} = ${fill.value}`,
    whatHappens: `উপরের ঘরে ${fill.up}টা পথ, বাঁ ঘরে ${fill.left}টা। এই ঘরে ঢোকার উপায় দুটোর যোগফল — ${fill.value}।`,
    whyItMatters:
      i === 0
        ? '`dp[j] += dp[j-1]` — এক লাইনেই দুটো উৎস। কারণ আপডেটের **আগে** `dp[j]` এখনো উপরের সারির মান (পুরনো), আর `dp[j-1]` এই সারিতে সদ্য লেখা মান (বাঁ)। একই array দুটো ভূমিকা পালন করছে, শুধু সময়ের পার্থক্যে।'
        : i === 3
          ? 'শেষ ঘর: 3 + 3 = 6। ৩×৩ গ্রিডে ৪ পদক্ষেপে ২ নিচে ও ২ ডানে — গণিতে C(4,2) = 6। DP সেই একই সংখ্যাটাই গুনে বের করল।'
          : undefined,
    highlightLines: [3],
    vars: [
      { name: 'i, j', value: `${fill.i}, ${fill.j}` },
      { name: 'উপর', value: fill.up },
      { name: 'বাঁ', value: fill.left },
    ],
    scene: {
      kind: 'matrix',
      values: grid(i + 1),
      cursor: { row: fill.i, col: fill.j },
      marks: marksFor(fill, i + 1),
      caption: 'নীল ঘর দুটোই উৎস — উপর আর বাঁ।',
    },
  })),

  {
    id: '9.8-done',
    title: 'শেষ — ৬টা পথ',
    whatHappens: 'নিচ-ডানের ঘরে `6`। উত্তর `6`।',
    whyItMatters:
      'সময় O(m·n), জায়গা O(n) — কারণ কোড একটাই সারি রাখে। বাধা (obstacle) থাকলে এই একই ছাঁচ খাটে, শুধু বাধার ঘরে ০ বসিয়ে দিতে হয়: ওখানে পৌঁছানোর কোনো পথ নেই।',
    highlightLines: [4],
    vars: [{ name: 'উত্তর', value: 6 }],
    scene: {
      kind: 'matrix',
      values: grid(FILLS.length),
      marks: {
        '1,1': 'done', '1,2': 'done', '2,1': 'done', '2,2': 'active',
      },
      output: { title: 'উত্তর', values: [6] },
      caption: 'পুরো গ্রিড ভরা — প্রতিটা ঘরে তার নিজের পথসংখ্যা।',
    },
  },
];

export const gridPathsSim: PatternSimulation = {
  patternId: '9.8',
  input: 'm = 3, n = 3',
  output: '6',
  steps,
};
