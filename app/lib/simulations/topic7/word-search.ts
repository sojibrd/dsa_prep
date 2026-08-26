import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   7.3 Word Search (Grid Backtracking) — Word Search (LC 79)

   The workbook's default is a 3×4 board with "ABCCED", which runs long. This
   uses a 3×3 board and "ABCC" instead — same shape of search, short enough
   that every probe including the failures is worth a step.
   ========================================================================= */

const BOARD = [
  ['A', 'B', 'C'],
  ['S', 'F', 'C'],
  ['A', 'D', 'E'],
];
const WORD = 'ABCC';

type Kind = 'visit' | 'fail' | 'complete';

interface Event {
  kind: Kind;
  row: number;
  col: number;
  k: number;
  /** Path of cells marked '#' at this moment. */
  path: string[];
  /** Why a probe failed. */
  reason?: 'oob' | 'mismatch';
  /** What sat in the cell, for a mismatch. */
  got?: string;
}

/** Verified by running the demo code and logging every dfs call. */
const EVENTS: Event[] = [
  { kind: 'visit', row: 0, col: 0, k: 0, path: ['0,0'] },
  { kind: 'fail', row: 1, col: 0, k: 1, path: ['0,0'], reason: 'mismatch', got: 'S' },
  { kind: 'fail', row: -1, col: 0, k: 1, path: ['0,0'], reason: 'oob' },
  { kind: 'visit', row: 0, col: 1, k: 1, path: ['0,0', '0,1'] },
  { kind: 'fail', row: 1, col: 1, k: 2, path: ['0,0', '0,1'], reason: 'mismatch', got: 'F' },
  { kind: 'fail', row: -1, col: 1, k: 2, path: ['0,0', '0,1'], reason: 'oob' },
  { kind: 'visit', row: 0, col: 2, k: 2, path: ['0,0', '0,1', '0,2'] },
  { kind: 'visit', row: 1, col: 2, k: 3, path: ['0,0', '0,1', '0,2', '1,2'] },
  { kind: 'complete', row: 2, col: 2, k: 4, path: ['0,0', '0,1', '0,2', '1,2'] },
];

/** The path so far is settled; the newest cell is live; a failed probe is faint. */
function marksFor(event: Event): Record<string, CellMark> {
  const marks: Record<string, CellMark> = {};
  for (const key of event.path) marks[key] = 'done';

  if (event.kind === 'visit') {
    marks[`${event.row},${event.col}`] = 'active';
  } else if (event.kind === 'fail' && event.reason === 'mismatch') {
    marks[`${event.row},${event.col}`] = 'reject';
  }
  return marks;
}

const pathLabel = (path: string[]) =>
  path.map((key) => {
    const [r, c] = key.split(',').map(Number);
    return BOARD[r][c];
  });

const steps: SimStep[] = [
  {
    id: '7.3-init',
    title: 'শুরু — (0,0) থেকে খোঁজা',
    whatHappens:
      'বাইরের দুটো লুপ প্রতিটা ঘর থেকে একবার করে `dfs` চালায়। প্রথম চেষ্টা (0,0) থেকে, `k = 0` — অর্থাৎ শব্দের প্রথম অক্ষর `A` খোঁজা হচ্ছে।',
    whyItMatters:
      '`k` হলো শব্দের কতদূর মিলে গেছে তার হিসাব। প্রতিটা recursion এক ধাপ গভীরে যায় আর `k` এক বাড়ে — তাই "কোন অক্ষর এখন দরকার" প্রশ্নের উত্তর সবসময় `word[k]`, কোনো আলাদা হিসাব ছাড়াই।',
    highlightLines: [17, 18, 4],
    vars: [
      { name: 'k', value: 0 },
      { name: 'word[k]', value: WORD[0] },
    ],
    scene: {
      kind: 'matrix',
      values: BOARD,
      cursor: { row: 0, col: 0 },
      output: { title: 'path', values: [] },
      caption: `word = "${WORD}" — পাশাপাশি ঘর ধরে এই শব্দটা লেখা যায় কি না।`,
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const base = {
      id: `7.3-${i + 1}`,
      vars: [
        { name: 'k', value: event.k },
        { name: 'word[k]', value: WORD[event.k] ?? '—' },
        { name: 'path', value: pathLabel(event.path).join('') || '—' },
      ],
    };

    if (event.kind === 'visit') {
      return {
        ...base,
        title: `(${event.row}, ${event.col}) — '${WORD[event.k]}' মিলল`,
        whatHappens: `ঘরের অক্ষর '${BOARD[event.row][event.col]}', আর দরকার ছিল '${WORD[event.k]}' — মিলে গেল। ঘরটা \`'#'\` দিয়ে চিহ্নিত হলো (এই path-এ আর ব্যবহার করা যাবে না), \`k\` বেড়ে ${event.k + 1}। এবার চার দিকে খোঁজা: নিচে, উপরে, ডানে, বামে।`,
        whyItMatters:
          i === 0
            ? "ঘরটা `'#'` করে দেওয়াটাই এখানকার visited-চিহ্ন — আলাদা কোনো `visited` matrix নেই। এতে O(1) বাড়তি জায়গা লাগে, কিন্তু বিনিময়ে board-টা সাময়িকভাবে বদলে যায়, তাই ফেরার সময় অক্ষরটা ফিরিয়ে দেওয়া বাধ্যতামূলক।"
            : i === 6
              ? 'দুটো C পাশাপাশি আছে — (0,2) আর (1,2)। প্রথমটা নিলে দ্বিতীয়টা ঠিক নিচেই, তাই path সোজা নেমে যাবে।'
              : undefined,
        highlightLines: [6, 8, 9, 10, 11, 12, 13],
        scene: {
          kind: 'matrix',
          values: BOARD,
          cursor: { row: event.row, col: event.col },
          marks: marksFor(event),
          output: { title: 'path', values: pathLabel(event.path) },
          caption: `${event.k + 1}/${WORD.length} অক্ষর মিলেছে।`,
        },
      };
    }

    if (event.kind === 'fail') {
      return {
        ...base,
        title:
          event.reason === 'oob'
            ? `উপরে — বোর্ডের বাইরে`
            : `(${event.row}, ${event.col}) — '${event.got}' ≠ '${WORD[event.k]}'`,
        whatHappens:
          event.reason === 'oob'
            ? `উপরের দিকে যেতে গিয়ে row হয়ে গেল ${event.row} — বোর্ডের বাইরে। প্রথম শর্তেই ধরা পড়ে \`false\` ফেরত গেল।`
            : `এই দিকে ঘরের অক্ষর '${event.got}', কিন্তু দরকার ছিল '${WORD[event.k]}'। মিলল না, তাই \`false\` — এই ঘরটা কখনো চিহ্নিতই হয়নি, তাই undo করারও কিছু নেই।`,
        whyItMatters:
          i === 1
            ? 'বাউন্ডারি পরীক্ষা আর অক্ষর মেলানো — দুটোই একই `if`-এ, ফাংশনের একদম শুরুতে। এই ছাঁচটাই grid DFS-কে ছোট রাখে: প্রতিবার সীমানা যাচাই করে তবে কল করার বদলে, কল করে ফেলে ভেতরে গিয়ে যাচাই করা।'
            : undefined,
        highlightLines: [6, 7],
        scene: {
          kind: 'matrix',
          values: BOARD,
          cursor: event.reason === 'oob' ? undefined : { row: event.row, col: event.col },
          marks: marksFor(event),
          output: { title: 'path', values: pathLabel(event.path) },
          caption:
            event.reason === 'oob'
              ? 'বোর্ডের বাইরে — এই দিকটা বাদ।'
              : 'অক্ষর মিলল না — এই দিকটা বাদ।',
        },
      };
    }

    return {
      ...base,
      title: `k = ${event.k} — পুরো শব্দ মিলে গেছে`,
      whatHappens: `\`k === word.length\` — চারটে অক্ষরই পাওয়া গেছে। ফাংশন সাথে সাথে \`true\` ফেরত দিল, আর সেই \`true\` পুরো recursion চেইন বেয়ে উপরে চলে গেল।`,
      whyItMatters:
        'শেষ পরীক্ষাটা ঘরের অক্ষর দেখে হয় না — হয় `k` দেখে। তাই recursion বোর্ডের বাইরে চলে গেলেও সমস্যা নেই, কারণ `k === word.length` শর্তটা বাউন্ডারি পরীক্ষার **আগে**। ক্রম উল্টে দিলে এই ক্ষেত্রে ভুল উত্তর আসত।',
      highlightLines: [5],
      scene: {
        kind: 'matrix',
        values: BOARD,
        marks: marksFor(event),
        output: { title: 'path', values: pathLabel(event.path) },
        caption: `path: ${pathLabel(event.path).join(' → ')}`,
      },
    };
  }),

  {
    id: '7.3-done',
    title: 'শেষ — শব্দটা আছে',
    whatHappens:
      'উত্তর `true`। path: (0,0) → (0,1) → (0,2) → (1,2), অর্থাৎ `A → B → C → C`।',
    whyItMatters:
      'সবচেয়ে খারাপ ক্ষেত্রে প্রতিটা ঘর থেকে চার দিকে যাওয়ার সব সম্ভাবনা — O(m·n·4^L)। এখানে খুব দ্রুত মিলে গেল কারণ প্রথম ঘর থেকেই path সোজা এগিয়েছে। `"#"` দিয়ে চিহ্নিত করা ছাড়া একই ঘর বারবার ব্যবহার হয়ে অসীম লুপ তৈরি হতো।',
    highlightLines: [18],
    vars: [{ name: 'উত্তর', value: 'true' }],
    scene: {
      kind: 'matrix',
      values: BOARD,
      marks: {
        '0,0': 'done', '0,1': 'done', '0,2': 'done', '1,2': 'done',
        '1,0': 'reject', '1,1': 'reject', '2,0': 'reject', '2,1': 'reject', '2,2': 'reject',
      },
      output: { title: 'path', values: ['A', 'B', 'C', 'C'] },
      caption: 'উপরের সারি ধরে ডানে, তারপর এক ঘর নিচে।',
    },
  },
];

export const wordSearchSim: PatternSimulation = {
  patternId: '7.3',
  input: 'board = [[A,B,C],[S,F,C],[A,D,E]], word = "ABCC"',
  output: 'true',
  steps,
};
