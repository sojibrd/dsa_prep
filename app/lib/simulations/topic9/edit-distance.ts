import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.6 Edit Distance

   "cat" → "cut" instead of the workbook's "horse" → "ros": 9 cells rather
   than 15, and the answer is a single replace, which makes the three
   operations easy to tell apart on screen.
   ========================================================================= */

const W1 = 'cat';
const W2 = 'cut';

type Op = 'copy' | 'replace' | 'delete' | 'insert' | 'tie';

interface Fill {
  i: number;
  j: number;
  match: boolean;
  replace: number;
  del: number;
  insert: number;
  op: Op;
  value: number;
}

/** Verified by running the demo code cell by cell. */
const FILLS: Fill[] = [
  { i: 1, j: 1, match: true, replace: 0, del: 1, insert: 1, op: 'copy', value: 0 },
  { i: 1, j: 2, match: false, replace: 1, del: 2, insert: 0, op: 'insert', value: 1 },
  { i: 1, j: 3, match: false, replace: 2, del: 3, insert: 1, op: 'insert', value: 2 },
  { i: 2, j: 1, match: false, replace: 1, del: 0, insert: 2, op: 'delete', value: 1 },
  { i: 2, j: 2, match: false, replace: 0, del: 1, insert: 1, op: 'replace', value: 1 },
  { i: 2, j: 3, match: false, replace: 1, del: 2, insert: 1, op: 'tie', value: 2 },
  { i: 3, j: 1, match: false, replace: 2, del: 1, insert: 3, op: 'delete', value: 2 },
  { i: 3, j: 2, match: false, replace: 1, del: 1, insert: 2, op: 'tie', value: 2 },
  { i: 3, j: 3, match: true, replace: 1, del: 2, insert: 2, op: 'copy', value: 1 },
];

const OP_LABEL: Record<Op, string> = {
  copy: 'অক্ষর মিলল — খরচ নেই',
  replace: 'বদলানো (replace)',
  delete: 'মোছা (delete)',
  insert: 'ঢোকানো (insert)',
  tie: 'একাধিক অপারেশন সমান',
};

/** The grid after `count` fills, with the base row and column pre-filled. */
function grid(count: number): (number | string)[][] {
  const table: (number | string)[][] = Array.from({ length: W1.length + 1 }, (_, i) =>
    Array.from({ length: W2.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : ('·' as number | string)
    )
  );
  for (const fill of FILLS.slice(0, count)) table[fill.i][fill.j] = fill.value;
  return table;
}

function marksFor(fill: Fill, count: number): Record<string, CellMark> {
  const marks: Record<string, CellMark> = {};
  for (const past of FILLS.slice(0, count - 1)) marks[`${past.i},${past.j}`] = 'done';

  // Light only the source(s) that actually won.
  if (fill.match || fill.op === 'replace') marks[`${fill.i - 1},${fill.j - 1}`] = 'fill';
  if (fill.op === 'delete') marks[`${fill.i - 1},${fill.j}`] = 'fill';
  if (fill.op === 'insert') marks[`${fill.i},${fill.j - 1}`] = 'fill';
  if (fill.op === 'tie') {
    marks[`${fill.i - 1},${fill.j - 1}`] = 'fill';
    marks[`${fill.i - 1},${fill.j}`] = 'fill';
  }
  marks[`${fill.i},${fill.j}`] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '9.6-init',
    title: 'শুরু — ভিত্তি সারি ও কলাম ভরা',
    whatHappens:
      'dp টেবিল `4 × 4`। প্রথম সারি `0,1,2,3` — খালি string থেকে j অক্ষরের string বানাতে j-টা insert লাগে। প্রথম কলামও একই যুক্তিতে `0,1,2,3` — i অক্ষর মুছে ফেলতে i-টা delete।',
    whyItMatters:
      'অন্য DP-তে ভিত্তি সারি শূন্য থাকে; এখানে থাকে না, কারণ খালি string-এ যাওয়াও একটা খরচ। এই ভিত্তিটা ভুল বসালে গোটা টেবিল ভুল হয়ে যায় অথচ কোথাও কোনো এরর দেখা যায় না।',
    highlightLines: [2, 3, 4, 5, 6],
    vars: [
      { name: 'w1', value: `"${W1}"` },
      { name: 'w2', value: `"${W2}"` },
    ],
    scene: {
      kind: 'matrix',
      values: grid(0),
      caption: 'সারি = c, a, t; কলাম = c, u, t। `dp[i][j]` = w1-এর i অক্ষরকে w2-এর j অক্ষরে বদলানোর খরচ।',
    },
  },

  ...FILLS.map((fill, i): SimStep => ({
    id: `9.6-${i + 1}`,
    title: `(${fill.i}, ${fill.j}) — '${W1[fill.i - 1]}' → '${W2[fill.j - 1]}': ${fill.value}`,
    whatHappens: fill.match
      ? `দুই অক্ষরই '${W1[fill.i - 1]}' — কিছু করার নেই। কোনাকুনি ঘরের মান হুবহু নেওয়া হলো: ${fill.replace}।`
      : `'${W1[fill.i - 1]}' ≠ '${W2[fill.j - 1]}', তাই একটা অপারেশন লাগবেই। তিনটে বিকল্পের খরচ: replace ${fill.replace} (কোনাকুনি), delete ${fill.del} (উপর), insert ${fill.insert} (বাঁ)। ${
          fill.op === 'tie'
            ? `দুটো সমানভাবে সস্তা — যেটাই নিন, ফল একই।`
            : `সবচেয়ে সস্তা ${OP_LABEL[fill.op]}।`
        } তার সাথে ১ যোগ করে ${fill.value}।`,
    whyItMatters:
      i === 0
        ? 'তিনটে দিক তিনটে অপারেশন, আর ম্যাপিংটা মনে রাখার মতো: **কোনাকুনি** = দুই অক্ষরই খরচ হলো (replace বা মিল), **উপর** = w1-এর অক্ষরটা মুছে ফেলা, **বাঁ** = w2-এর অক্ষরটা ঢুকিয়ে দেওয়া।'
        : i === 4
          ? "এটাই আসল উত্তরের ঘর: 'a' → 'u' একটা replace, খরচ 1। কোনাকুনি ঘরে ছিল 0 (কারণ 'c' মিলে গিয়েছিল), তাই মোট 1।"
          : i === 5
            ? 'replace আর insert দুটোই ১ খরচে দাঁড়াল। `Math.min` যেটাই বাছুক, ফল একই — DP-তে এমন সমতা প্রায়ই থাকে, আর তার মানে একাধিক সমান-সস্তা সম্পাদনা-পথ আছে।'
            : i === 8
              ? "শেষ ঘরে 't' মিলে গেল, তাই কোনাকুনি ঘরের 1-ই উত্তর। ওই 1 এসেছিল 'a' → 'u' replace থেকে।"
              : undefined,
    highlightLines: fill.match ? [7, 8, 9, 10, 11] : [7, 8, 9, 10, 12, 13, 14, 15, 16],
    vars: [
      { name: 'w1[i−1]', value: W1[fill.i - 1] },
      { name: 'w2[j−1]', value: W2[fill.j - 1] },
      { name: 'op', value: OP_LABEL[fill.op] },
      { name: 'dp[i][j]', value: fill.value },
    ],
    scene: {
      kind: 'matrix',
      values: grid(i + 1),
      cursor: { row: fill.i, col: fill.j },
      marks: marksFor(fill, i + 1),
      caption: `replace ${fill.replace} · delete ${fill.del} · insert ${fill.insert} → ${fill.value}`,
    },
  })),

  {
    id: '9.6-done',
    title: 'শেষ — একটাই সম্পাদনা',
    whatHappens:
      '`dp[3][3] = 1`। "cat" থেকে "cut" — শুধু `a` কে `u` দিয়ে বদলানো।',
    whyItMatters:
      'খরচ O(m·n) সময় ও জায়গা (একটা সারি রেখে O(n)-এ নামানো যায়, তবে তখন পথটা আর পুনর্গঠন করা যায় না)। পেছন থেকে `(m, n)` থেকে হাঁটলে ঠিক কোন কোন সম্পাদনা লেগেছিল সেটাও বের করা যায় — এটাই diff টুলগুলোর ভিত্তি।',
    highlightLines: [18],
    vars: [{ name: 'উত্তর', value: 1 }],
    scene: {
      kind: 'matrix',
      values: grid(FILLS.length),
      marks: {
        '1,1': 'done', '2,2': 'done', '3,3': 'active',
      },
      output: { title: 'সম্পাদনা', values: ["'a' → 'u'"] },
      caption: 'কোনাকুনি সবুজ পথটাই সবচেয়ে সস্তা রূপান্তর।',
    },
  },
];

export const editDistanceSim: PatternSimulation = {
  patternId: '9.6',
  input: 'word1 = "cat", word2 = "cut"',
  output: '1',
  steps,
};
