import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.4 Longest Common Subsequence — LCS

   Smaller than the workbook's "abcde"/"ace" (24 cells) so every cell earns a
   step: "ABC" against "AC" fills six.
   ========================================================================= */

const S1 = 'ABC';
const S2 = 'AC';

interface Fill {
  i: number;
  j: number;
  match: boolean;
  up: number;
  left: number;
  diag: number;
  value: number;
}

/** Verified by running the demo code cell by cell. */
const FILLS: Fill[] = [
  { i: 1, j: 1, match: true, up: 0, left: 0, diag: 0, value: 1 },
  { i: 1, j: 2, match: false, up: 0, left: 1, diag: 0, value: 1 },
  { i: 2, j: 1, match: false, up: 1, left: 0, diag: 0, value: 1 },
  { i: 2, j: 2, match: false, up: 1, left: 1, diag: 1, value: 1 },
  { i: 3, j: 1, match: false, up: 1, left: 0, diag: 0, value: 1 },
  { i: 3, j: 2, match: true, up: 1, left: 1, diag: 1, value: 2 },
];

/**
 * The dp grid after `count` fills. Row 0 and column 0 are the empty-string
 * base cases; unfilled cells read `·` so progress is visible.
 */
function grid(count: number): (number | string)[][] {
  const table: (number | string)[][] = Array.from({ length: S1.length + 1 }, () =>
    new Array<number | string>(S2.length + 1).fill('·')
  );
  for (let i = 0; i <= S1.length; i++) table[i][0] = 0;
  for (let j = 0; j <= S2.length; j++) table[0][j] = 0;
  for (const fill of FILLS.slice(0, count)) table[fill.i][fill.j] = fill.value;
  return table;
}

function marksFor(fill: Fill, count: number): Record<string, CellMark> {
  const marks: Record<string, CellMark> = {};
  for (const past of FILLS.slice(0, count - 1)) marks[`${past.i},${past.j}`] = 'done';

  // Only the sources this cell actually read are lit.
  if (fill.match) {
    marks[`${fill.i - 1},${fill.j - 1}`] = 'fill';
  } else {
    marks[`${fill.i - 1},${fill.j}`] = 'fill';
    marks[`${fill.i},${fill.j - 1}`] = 'fill';
  }
  marks[`${fill.i},${fill.j}`] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '9.4-init',
    title: 'শুরু — খালি সারি ও কলাম',
    whatHappens:
      'dp টেবিল `4 × 3`। প্রথম সারি ও প্রথম কলাম সব শূন্য — একটা string খালি হলে সাধারণ subsequence-ও খালি।',
    whyItMatters:
      '`dp[i][j]` মানে `s1`-এর প্রথম i অক্ষর আর `s2`-এর প্রথম j অক্ষরের LCS কত লম্বা। বাড়তি একটা সারি ও কলাম রাখা হয় ঠিক এই কারণেই — "খালি string" ঘটনাটাকে আলাদা `if` না লিখে টেবিলের অংশ বানিয়ে ফেলা। index তখন এক ঘর সরে যায় (`s1[i-1]`), সেটাই এই ছাঁচের একমাত্র অস্বস্তি।',
    highlightLines: [2, 3, 4],
    vars: [
      { name: 's1', value: `"${S1}"` },
      { name: 's2', value: `"${S2}"` },
    ],
    scene: {
      kind: 'matrix',
      values: grid(0),
      caption: 'সারি = A, B, C (উপর থেকে); কলাম = A, C (বাঁ থেকে)। সারি/কলাম ০ খালি string।',
    },
  },

  ...FILLS.map((fill, i): SimStep => ({
    id: `9.4-${i + 1}`,
    title: `(${fill.i}, ${fill.j}) — '${S1[fill.i - 1]}' বনাম '${S2[fill.j - 1]}' ${fill.match ? 'মিলল' : 'মিলল না'}`,
    whatHappens: fill.match
      ? `দুই অক্ষরই '${S1[fill.i - 1]}'। তাই কোনাকুনি ঘরের মান নিয়ে এক বাড়ানো হলো: ${fill.diag} + 1 = ${fill.value}।`
      : `'${S1[fill.i - 1]}' ≠ '${S2[fill.j - 1]}'। তাই দুটো বিকল্পের বড়টা নেওয়া হলো — উপরের ঘর (${fill.up}, মানে s1-এর এই অক্ষরটা বাদ) বনাম বাঁ ঘর (${fill.left}, মানে s2-এরটা বাদ)। max = ${fill.value}।`,
    whyItMatters:
      i === 0
        ? 'অক্ষর মিললে কোনাকুনি ঘর কেন? কারণ দুটো অক্ষরই ব্যবহার হয়ে গেল, তাই বাকি প্রশ্নটা দুই string-এই এক ঘর ছোট — ঠিক কোনাকুনি ঘরটাই সেই ছোট প্রশ্নের উত্তর।'
        : i === 1
          ? 'না মিললে অন্তত একটা অক্ষর বাদ দিতেই হবে — কোনটা, তা আগে থেকে বলা যায় না। তাই দুটোই চেষ্টা করে বড়টা নেওয়া। কোনাকুনি ঘরটা এখানে দেখাই হয় না, কারণ সেটা "দুটোই বাদ" — যা কখনো ভালো হতে পারে না।'
          : i === 5
            ? "শেষ ঘরে আবার মিল — 'C'। কোনাকুনি ঘরের 1-এর সাথে যোগ হয়ে 2। ওই 1 এসেছিল 'A' মেলা থেকে, তাই LCS হলো \"AC\"।"
            : undefined,
    highlightLines: fill.match ? [5, 6, 7, 8, 9] : [5, 6, 7, 8, 10],
    vars: [
      { name: 's1[i−1]', value: S1[fill.i - 1] },
      { name: 's2[j−1]', value: S2[fill.j - 1] },
      { name: 'dp[i][j]', value: fill.value },
    ],
    scene: {
      kind: 'matrix',
      values: grid(i + 1),
      cursor: { row: fill.i, col: fill.j },
      marks: marksFor(fill, i + 1),
      caption: fill.match
        ? `নীল ঘর = কোনাকুনি উৎস (${fill.diag})`
        : `নীল ঘর দুটো = উপর (${fill.up}) ও বাঁ (${fill.left}), বড়টা জিতল`,
    },
  })),

  {
    id: '9.4-done',
    title: 'শেষ — LCS-এর দৈর্ঘ্য 2',
    whatHappens:
      '`dp[3][2] = 2`। সবচেয়ে লম্বা সাধারণ subsequence `"AC"`, দৈর্ঘ্য `2`।',
    whyItMatters:
      'খরচ O(m·n) সময় ও জায়গা। subsequence মানে টানা হতে হবে না — `"AC"` "ABC"-তে টানা নয়, মাঝে B আছে। substring হলে সূত্র আলাদা হতো: না মিললে সরাসরি 0, কারণ ধারাবাহিকতা ভেঙে গেছে।',
    highlightLines: [11],
    vars: [{ name: 'উত্তর', value: 2 }],
    scene: {
      kind: 'matrix',
      values: grid(FILLS.length),
      marks: {
        '1,1': 'done', '3,2': 'active',
        '1,2': 'done', '2,1': 'done', '2,2': 'done', '3,1': 'done',
      },
      output: { title: 'LCS', values: ['A', 'C'] },
      caption: 'নিচ-ডানের ঘরটাই উত্তর — দুই string-ই পুরো ব্যবহার করে।',
    },
  },
];

export const lcsSim: PatternSimulation = {
  patternId: '9.4',
  input: 's1 = "ABC", s2 = "AC"',
  output: '2',
  steps,
};
