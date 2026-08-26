import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   7.2 N-Queens & Board Puzzles — N-Queens (LC 51)

   The raw recursion for n = 4 fires 78 events, which no one wants to scrub
   through. These 27 are the machine-consolidated version: a run of rejected
   columns collapses into the placement that follows it, and a chain of undos
   with nothing left to try collapses into one backtrack. Every board and
   every set below came out of running the demo code, not out of hand-tracing.
   ========================================================================= */

interface Sets {
  cols: number[];
  d1: number[];
  d2: number[];
}

type Event =
  | { t: 'place'; row: number; col: number; rej: number[]; board: string; sets: Sets }
  | { t: 'dead'; row: number; rej: number[]; board: string; sets: Sets }
  | { t: 'solution'; idx: number; board: string; sets: Sets }
  | {
      t: 'backtrack';
      chain: ({ undo: number; col: number } | { deadRow: number; rej: number[] })[];
      board: string;
      sets: Sets;
    };

const EVENTS: Event[] = [
  { t: 'place', row: 0, col: 0, rej: [], board: 'Q.../..../..../....', sets: { cols: [0], d1: [0], d2: [0] } },
  { t: 'place', row: 1, col: 2, rej: [0, 1], board: 'Q.../..Q./..../....', sets: { cols: [0, 2], d1: [-1, 0], d2: [0, 3] } },
  { t: 'dead', row: 2, rej: [0, 1, 2, 3], board: 'Q.../..Q./..../....', sets: { cols: [0, 2], d1: [-1, 0], d2: [0, 3] } },
  { t: 'place', row: 1, col: 3, rej: [], board: 'Q.../...Q/..../....', sets: { cols: [0, 3], d1: [-2, 0], d2: [0, 4] } },
  { t: 'place', row: 2, col: 1, rej: [0], board: 'Q.../...Q/.Q../....', sets: { cols: [0, 1, 3], d1: [-2, 0, 1], d2: [0, 3, 4] } },
  { t: 'dead', row: 3, rej: [0, 1, 2, 3], board: 'Q.../...Q/.Q../....', sets: { cols: [0, 1, 3], d1: [-2, 0, 1], d2: [0, 3, 4] } },
  { t: 'backtrack', chain: [{ undo: 2, col: 1 }, { deadRow: 2, rej: [2, 3] }, { undo: 1, col: 3 }, { undo: 0, col: 0 }], board: '..../..../..../....', sets: { cols: [], d1: [], d2: [] } },
  { t: 'place', row: 0, col: 1, rej: [], board: '.Q../..../..../....', sets: { cols: [1], d1: [-1], d2: [1] } },
  { t: 'place', row: 1, col: 3, rej: [0, 1, 2], board: '.Q../...Q/..../....', sets: { cols: [1, 3], d1: [-2, -1], d2: [1, 4] } },
  { t: 'place', row: 2, col: 0, rej: [], board: '.Q../...Q/Q.../....', sets: { cols: [0, 1, 3], d1: [-2, -1, 2], d2: [1, 2, 4] } },
  { t: 'place', row: 3, col: 2, rej: [0, 1], board: '.Q../...Q/Q.../..Q.', sets: { cols: [0, 1, 2, 3], d1: [-2, -1, 1, 2], d2: [1, 2, 4, 5] } },
  { t: 'solution', idx: 1, board: '.Q../...Q/Q.../..Q.', sets: { cols: [0, 1, 2, 3], d1: [-2, -1, 1, 2], d2: [1, 2, 4, 5] } },
  { t: 'backtrack', chain: [{ undo: 3, col: 2 }, { deadRow: 3, rej: [3] }, { undo: 2, col: 0 }, { deadRow: 2, rej: [1, 2, 3] }, { undo: 1, col: 3 }, { undo: 0, col: 1 }], board: '..../..../..../....', sets: { cols: [], d1: [], d2: [] } },
  { t: 'place', row: 0, col: 2, rej: [], board: '..Q./..../..../....', sets: { cols: [2], d1: [-2], d2: [2] } },
  { t: 'place', row: 1, col: 0, rej: [], board: '..Q./Q.../..../....', sets: { cols: [0, 2], d1: [-2, 1], d2: [1, 2] } },
  { t: 'place', row: 2, col: 3, rej: [0, 1, 2], board: '..Q./Q.../...Q/....', sets: { cols: [0, 2, 3], d1: [-2, -1, 1], d2: [1, 2, 5] } },
  { t: 'place', row: 3, col: 1, rej: [0], board: '..Q./Q.../...Q/.Q..', sets: { cols: [0, 1, 2, 3], d1: [-2, -1, 1, 2], d2: [1, 2, 4, 5] } },
  { t: 'solution', idx: 2, board: '..Q./Q.../...Q/.Q..', sets: { cols: [0, 1, 2, 3], d1: [-2, -1, 1, 2], d2: [1, 2, 4, 5] } },
  { t: 'backtrack', chain: [{ undo: 3, col: 1 }, { deadRow: 3, rej: [2, 3] }, { undo: 2, col: 3 }, { undo: 1, col: 0 }, { deadRow: 1, rej: [1, 2, 3] }, { undo: 0, col: 2 }], board: '..../..../..../....', sets: { cols: [], d1: [], d2: [] } },
  { t: 'place', row: 0, col: 3, rej: [], board: '...Q/..../..../....', sets: { cols: [3], d1: [-3], d2: [3] } },
  { t: 'place', row: 1, col: 0, rej: [], board: '...Q/Q.../..../....', sets: { cols: [0, 3], d1: [-3, 1], d2: [1, 3] } },
  { t: 'place', row: 2, col: 2, rej: [0, 1], board: '...Q/Q.../..Q./....', sets: { cols: [0, 2, 3], d1: [-3, 0, 1], d2: [1, 3, 4] } },
  { t: 'dead', row: 3, rej: [0, 1, 2, 3], board: '...Q/Q.../..Q./....', sets: { cols: [0, 2, 3], d1: [-3, 0, 1], d2: [1, 3, 4] } },
  { t: 'backtrack', chain: [{ undo: 2, col: 2 }, { deadRow: 2, rej: [3] }, { undo: 1, col: 0 }], board: '...Q/..../..../....', sets: { cols: [3], d1: [-3], d2: [3] } },
  { t: 'place', row: 1, col: 1, rej: [], board: '...Q/.Q../..../....', sets: { cols: [1, 3], d1: [-3, 0], d2: [2, 3] } },
  { t: 'dead', row: 2, rej: [0, 1, 2, 3], board: '...Q/.Q../..../....', sets: { cols: [1, 3], d1: [-3, 0], d2: [2, 3] } },
  { t: 'backtrack', chain: [{ undo: 1, col: 1 }, { deadRow: 1, rej: [2, 3] }, { undo: 0, col: 3 }], board: '..../..../..../....', sets: { cols: [], d1: [], d2: [] } },
];

const EMPTY_BOARD = '..../..../..../....';

const grid = (board: string) => board.split('/').map((row) => row.split(''));

const setLabel = (values: number[]) => (values.length ? `{${values.join(',')}}` : '{}');

function setVars(sets: Sets) {
  return [
    { name: 'cols', value: setLabel(sets.cols) },
    { name: 'diag ↘', value: setLabel(sets.d1) },
    { name: 'diag ↙', value: setLabel(sets.d2) },
  ];
}

/** Queens on the board settle; the columns just refused go faint. */
function marksFor(board: string, rejects: { row: number; cols: number[] }[] = [], queen?: { row: number; col: number }) {
  const marks: Record<string, CellMark> = {};
  grid(board).forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell === 'Q') marks[`${r},${c}`] = 'done';
    })
  );
  for (const { row, cols } of rejects) {
    for (const col of cols) marks[`${row},${col}`] = 'reject';
  }
  if (queen) marks[`${queen.row},${queen.col}`] = 'active';
  return marks;
}

/** Solutions recorded up to and including event `index`. */
function solutionsAt(index: number): string[] {
  return EVENTS.slice(0, index + 1)
    .filter((event): event is Extract<Event, { t: 'solution' }> => event.t === 'solution')
    .map((event) => event.board.split('/').join(' · '));
}

const steps: SimStep[] = [
  {
    id: '7.2-init',
    title: 'শুরু — খালি ৪×৪ বোর্ড',
    whatHappens:
      'বোর্ড খালি, তিনটে Set-ও খালি: `cols` (দখল করা column), `diag1` (`row − col`), `diag2` (`row + col`)। `place(0)` — সারি ০ থেকে শুরু।',
    whyItMatters:
      'প্রতি সারিতে ঠিক একটা queen বসবে, তাই সারি নিয়ে আলাদা হিসাব লাগে না। বাকি থাকে column আর দুই কোনাকুনি। মজাটা হলো একটা ↘ কোনাকুনির প্রতিটা ঘরে `row − col` একই, আর ↙-এ `row + col` একই — তাই "আক্রান্ত কি না" প্রশ্নটা তিনটে Set-এ তিনটে O(1) খোঁজায় নেমে আসে, বোর্ড স্ক্যান করার দরকারই পড়ে না।',
    highlightLines: [2, 3, 4, 5, 6, 26],
    vars: setVars({ cols: [], d1: [], d2: [] }),
    scene: {
      kind: 'matrix',
      values: grid(EMPTY_BOARD),
      output: { title: 'res', values: [] },
      caption: 'n = 4 — দুটো সমাধান আছে, কিন্তু খুঁজে পেতে অনেক ভুল পথ ঘুরতে হবে।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const solutions = solutionsAt(i);
    const base = {
      id: `7.2-${i + 1}`,
      vars: setVars(event.sets),
    };

    if (event.t === 'place') {
      const rejectNote = event.rej.length
        ? `column ${event.rej.join(', ')} আক্রান্ত (আগের কোনো queen-এর একই column বা কোনাকুনিতে), তাই বাদ। `
        : '';
      return {
        ...base,
        title: `সারি ${event.row} — queen বসল column ${event.col}-এ`,
        whatHappens: `${rejectNote}column ${event.col} মুক্ত, তাই সেখানে queen বসল। তিনটে Set-এ যোগ হলো: cols ${event.col}, ↘ ${event.row - event.col}, ↙ ${event.row + event.col}। এখন \`place(${event.row + 1})\`।`,
        whyItMatters:
          i === 0
            ? undefined
            : i === 1
              ? 'column 0 বাদ গেল সরাসরি সংঘর্ষে (উপরে 0-তেই queen আছে), আর column 1 বাদ গেল কোনাকুনিতে। তিনটে Set একসাথে দেখা মানে বোর্ডের কোনো ঘরই আলাদা করে পরীক্ষা করতে হচ্ছে না।'
              : undefined,
        highlightLines: [12, 13, 14, 15, 16, 17, 18, 19],
        scene: {
          kind: 'matrix',
          values: grid(event.board),
          cursor: { row: event.row, col: event.col },
          marks: marksFor(
            event.board,
            event.rej.length ? [{ row: event.row, cols: event.rej }] : [],
            { row: event.row, col: event.col }
          ),
          output: { title: 'res', values: solutions },
          caption: `সারি ${event.row} শেষ — এখন সারি ${event.row + 1}-এ নামা।`,
        },
      };
    }

    if (event.t === 'dead') {
      return {
        ...base,
        title: `সারি ${event.row} — কোনো column-ই খালি নেই`,
        whatHappens: `সারি ${event.row}-এর চারটে column (${event.rej.join(', ')}) একে একে দেখা হলো — প্রতিটাই উপরের কোনো না কোনো queen-এর নিশানায়। বসানোর জায়গা নেই, তাই এই শাখা মৃত; ফিরে যেতে হবে।`,
        whyItMatters:
          i === 2
            ? 'এটাই backtracking-এর আসল লাভ। এখান থেকে নিচের সারিগুলোর কোনো বিন্যাসই আর পরীক্ষা করা হবে না — একটা গোটা উপগাছ এক ধাক্কায় বাদ। সব বিন্যাস (৪⁴ = ২৫৬) ঘেঁটে দেখার তুলনায় এটাই সাশ্রয়।'
            : undefined,
        highlightLines: [12, 13, 14],
        scene: {
          kind: 'matrix',
          values: grid(event.board),
          marks: marksFor(event.board, [{ row: event.row, cols: event.rej }]),
          output: { title: 'res', values: solutions },
          caption: `সারি ${event.row} সম্পূর্ণ অবরুদ্ধ — শাখা বাতিল।`,
        },
      };
    }

    if (event.t === 'solution') {
      return {
        ...base,
        title: `সমাধান ${event.idx} পাওয়া গেল`,
        whatHappens: `\`row === n\` — চারটে সারিতেই queen বসে গেছে, কেউ কাউকে আক্রমণ করছে না। বোর্ডটা \`res\`-এ জমা হলো: ${event.board.split('/').join(' · ')}।`,
        whyItMatters:
          event.idx === 1
            ? 'খেয়াল করুন কোথাও "এটা কি বৈধ" বলে চূড়ান্ত পরীক্ষা হচ্ছে না। বৈধতা প্রতিটা ধাপেই রক্ষা করা হয়েছে — অবৈধ কিছু কখনো বসতেই দেওয়া হয়নি। তাই শেষ সারি পেরোনো মানেই সমাধান।'
            : 'দ্বিতীয় সমাধানটা প্রথমটার আয়না-প্রতিবিম্ব। n = 4-এ এই দুটোই সব।',
        highlightLines: [8, 9, 10],
        scene: {
          kind: 'matrix',
          values: grid(event.board),
          marks: marksFor(event.board),
          output: { title: 'res', values: solutions },
          caption: 'চারটে queen, কেউ কারো নিশানায় নেই।',
        },
      };
    }

    const undone = event.chain.filter(
      (link): link is { undo: number; col: number } => 'undo' in link
    );
    const deads = event.chain.filter(
      (link): link is { deadRow: number; rej: number[] } => 'deadRow' in link
    );
    const rows = undone.map((link) => `সারি ${link.undo}-এর column ${link.col}`).join(', ');

    return {
      ...base,
      title: `ফেরত — ${undone.length}টা queen সরানো হলো`,
      whatHappens: `${rows} — queen সরে গেল এবং তিনটে Set থেকেও মুছে গেল।${
        deads.length
          ? ` মাঝে ${deads.map((d) => `সারি ${d.deadRow}-এর বাকি column (${d.rej.join(', ')})`).join(' ও ')} চেষ্টা করা হয়েছিল, সেগুলোও আক্রান্ত।`
          : ''
      } তাই আরও উপরে ফিরে যেতে হলো।`,
      whyItMatters:
        i === 6
          ? 'undo মানে শুধু বোর্ড থেকে "Q" মোছা নয় — তিনটে Set থেকেও মুছতে হয়, ঠিক যা যা যোগ করা হয়েছিল। একটাও বাদ পড়লে পরের শাখাগুলো ভুতুড়ে বাধা দেখতে থাকত।'
          : undefined,
      highlightLines: [20, 21, 22, 23],
      scene: {
        kind: 'matrix',
        values: grid(event.board),
        marks: marksFor(
          event.board,
          deads.map((d) => ({ row: d.deadRow, cols: d.rej }))
        ),
        output: { title: 'res', values: solutions },
        caption: 'শাখা গুটিয়ে উপরে — এবার পরের column চেষ্টা হবে।',
      },
    };
  }),

  {
    id: '7.2-done',
    title: 'শেষ — দুটো সমাধান',
    whatHappens:
      'সারি ০-এর চারটে column-ই চেষ্টা হয়ে গেছে, শাখা আর বাকি নেই। `res`-এ দুটো সমাধান।',
    whyItMatters:
      'সবচেয়ে খারাপ ক্ষেত্রে খরচ O(n!)-এর কাছাকাছি, কিন্তু বাস্তবে অনেক কম — কারণ অবৈধ শাখা তাড়াতাড়ি কাটা পড়ে। এই "আগেভাগে কেটে ফেলা" (pruning) ছাড়া backtracking আর brute force-এর মধ্যে কোনো পার্থক্যই থাকত না।',
    highlightLines: [27],
    vars: [{ name: 'res', value: 2 }],
    scene: {
      kind: 'matrix',
      values: grid('.Q../...Q/Q.../..Q.'),
      marks: marksFor('.Q../...Q/Q.../..Q.'),
      output: { title: 'res', values: solutionsAt(EVENTS.length - 1) },
      caption: 'প্রথম সমাধানটা দেখানো হলো; দ্বিতীয়টা এর আয়না-প্রতিবিম্ব।',
    },
  },
];

export const nQueensSim: PatternSimulation = {
  patternId: '7.2',
  input: 'n = 4',
  output: '[".Q..","...Q","Q...","..Q."] ও ["..Q.","Q...","...Q",".Q.."]',
  steps,
};
