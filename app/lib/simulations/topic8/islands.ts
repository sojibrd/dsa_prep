import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   8.1 BFS/DFS Traversal (Grid & Components) — Number of Islands

   A grid IS a graph — every cell a node, every shared edge a link — so this
   one stays on `matrix` rather than moving to the new `graph` scene. Drawing
   nine cells as a circle of nine nodes would hide the adjacency the whole
   algorithm rests on.
   ========================================================================= */

const START = ['110', '100', '001'];

type Kind = 'island' | 'sink';

interface Event {
  kind: Kind;
  row: number;
  col: number;
  /** Grid after the event, one string per row. */
  grid: string[];
  count: number;
}

/** Verified by running the demo code and logging every sink. */
const EVENTS: Event[] = [
  { kind: 'island', row: 0, col: 0, grid: ['110', '100', '001'], count: 1 },
  { kind: 'sink', row: 0, col: 0, grid: ['010', '100', '001'], count: 1 },
  { kind: 'sink', row: 1, col: 0, grid: ['010', '000', '001'], count: 1 },
  { kind: 'sink', row: 0, col: 1, grid: ['000', '000', '001'], count: 1 },
  { kind: 'island', row: 2, col: 2, grid: ['000', '000', '001'], count: 2 },
  { kind: 'sink', row: 2, col: 2, grid: ['000', '000', '000'], count: 2 },
];

const grid = (rows: string[]) => rows.map((row) => row.split(''));

/** Cells already sunk in this run settle; the one being sunk is live. */
function marksFor(index: number): Record<string, CellMark> {
  const marks: Record<string, CellMark> = {};
  for (const past of EVENTS.slice(0, index)) {
    if (past.kind === 'sink') marks[`${past.row},${past.col}`] = 'done';
  }
  const event = EVENTS[index];
  marks[`${event.row},${event.col}`] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '8.1-init',
    title: 'শুরু — দুটো দ্বীপ, কিন্তু গোনা বাকি',
    whatHappens:
      'বাইরের দুটো লুপ প্রতিটা ঘর একবার করে দেখবে। `1` পেলেই একটা নতুন দ্বীপ, আর তার সাথে লাগোয়া সব `1` ডুবিয়ে দেওয়া হবে।',
    whyItMatters:
      'গ্রিড আসলে একটা গ্রাফ — প্রতিটা ঘর একটা নোড, পাশাপাশি ঘরদুটোর মধ্যে একটা edge। তাই adjacency list বানানোর দরকারই নেই, প্রতিবেশী মানে শুধু `i±1` আর `j±1`। "কয়টা দ্বীপ" প্রশ্নটা তখন হয়ে যায় "কয়টা connected component"।',
    highlightLines: [2, 3, 4, 13, 14],
    vars: [{ name: 'count', value: 0 }],
    scene: {
      kind: 'matrix',
      values: grid(START),
      output: { title: 'count', values: [0] },
      caption: '1 = ডাঙা, 0 = পানি। কোনাকুনি প্রতিবেশী গোনা হয় না।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const isIsland = event.kind === 'island';
    return {
      id: `8.1-${i + 1}`,
      title: isIsland
        ? `নতুন দ্বীপ ${event.count} — (${event.row}, ${event.col})`
        : `ডুবিয়ে দেওয়া — (${event.row}, ${event.col})`,
      whatHappens: isIsland
        ? `বাইরের লুপ (${event.row}, ${event.col})-এ একটা \`1\` পেল, যেটা এখনো ডোবানো হয়নি। মানে এটা একটা নতুন দ্বীপের প্রথম ঘর — \`count\` বেড়ে ${event.count}। এবার \`sink\` এখান থেকে পুরো দ্বীপটা মুছে দেবে।`
        : `(${event.row}, ${event.col})-এর \`1\` বদলে \`0\` হলো — এটাই এখানকার "visited" চিহ্ন। তারপর চার দিকে recursion: নিচে, উপরে, ডানে, বামে।`,
      whyItMatters:
        i === 0
          ? 'বাইরের লুপ প্রতিটা ঘর ছোঁয় ঠিকই, কিন্তু `count` বাড়ে কেবল তখনই যখন কোনো ঘর **এখনো ডোবানো হয়নি**। একই দ্বীপের বাকি ঘরগুলো তত ক্ষণে `0` হয়ে গেছে, তাই তারা আর দ্বিতীয়বার গোনা হয় না।'
          : i === 1
            ? 'গ্রিডটাই বদলে দেওয়া হচ্ছে — আলাদা `visited` matrix নেই। এতে জায়গা বাঁচে, কিন্তু ইনপুট নষ্ট হয়। ইন্টারভিউতে এটা বলে নেওয়া ভালো; না চাইলে আলাদা visited রাখাই নিরাপদ।'
            : i === 4
              ? 'প্রথম দ্বীপের তিনটে ঘরই এখন `0`। তাই লুপ যখন সেখানে ফিরে যাবে, কিছুই দেখতে পাবে না — (2,2)-ই পরের অচিহ্নিত ডাঙা।'
              : undefined,
      highlightLines: isIsland ? [13, 14, 15, 16, 17] : [5, 6, 7, 8, 9, 10, 11],
      vars: [
        { name: 'i, j', value: `${event.row}, ${event.col}` },
        { name: 'count', value: event.count },
      ],
      scene: {
        kind: 'matrix',
        values: grid(event.grid),
        cursor: { row: event.row, col: event.col },
        marks: marksFor(i),
        output: { title: 'count', values: [event.count] },
        caption: isIsland
          ? `নতুন component পাওয়া গেল — এখান থেকে ছড়িয়ে পড়া শুরু।`
          : `এই ঘরটা এখন পানি — আর গোনা হবে না।`,
      },
    };
  }),

  {
    id: '8.1-done',
    title: 'শেষ — দুটো দ্বীপ',
    whatHappens: 'পুরো গ্রিড এখন পানি। উত্তর `2`।',
    whyItMatters:
      'প্রতিটা ঘরে সর্বোচ্চ একবার — O(m·n)। বাইরের লুপ আর ভেতরের recursion মিলিয়ে দুবার হাঁটা মনে হলেও, প্রতিটা ঘর একবারই `1` থেকে `0` হয়। DFS-এর জায়গায় BFS (queue) দিলেও একই খরচ, শুধু গভীর গ্রিডে স্ট্যাক উপচে পড়ার ঝুঁকি থাকে না।',
    highlightLines: [19],
    vars: [{ name: 'count', value: 2 }],
    scene: {
      kind: 'matrix',
      values: grid(['000', '000', '000']),
      marks: {
        '0,0': 'done', '0,1': 'done', '1,0': 'done', '2,2': 'active',
      },
      output: { title: 'count', values: [2] },
      caption: 'সবুজ = প্রথম দ্বীপ (৩ ঘর), amber = দ্বিতীয় (১ ঘর)।',
    },
  },
];

export const islandsSim: PatternSimulation = {
  patternId: '8.1',
  input: 'grid = [[1,1,0],[1,0,0],[0,0,1]]',
  output: '2',
  steps,
};
