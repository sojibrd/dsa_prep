import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   1.4 Hashing / Frequency Counting — Longest Consecutive Sequence (LC 128)
   ========================================================================= */

const NUMS = [100, 4, 200, 1, 3, 2];

/** Where each value sits in `nums`, so a marked run lights the right cells. */
const INDEX_OF = new Map(NUMS.map((value, index) => [value, index]));

interface Visit {
  x: number;
  /** A run only starts where `x - 1` is absent. */
  isStart: boolean;
  /** Values walked from `x` upwards (empty when skipped). */
  run: number[];
  best: number;
}

const VISITS: Visit[] = [
  { x: 100, isStart: true, run: [100], best: 1 },
  { x: 4, isStart: false, run: [], best: 1 },
  { x: 200, isStart: true, run: [200], best: 1 },
  { x: 1, isStart: true, run: [1, 2, 3, 4], best: 4 },
  { x: 3, isStart: false, run: [], best: 4 },
  { x: 2, isStart: false, run: [], best: 4 },
];

const SET_TABLE = {
  title: 'set — O(1) সদস্যপদ পরীক্ষা',
  entries: NUMS.map((value) => ({ key: String(value) })),
};

const steps: SimStep[] = [
  {
    id: '1.4-init',
    title: 'শুরু — সব সংখ্যা একটা Set-এ',
    whatHappens:
      'পুরো array একটা `Set`-এ ঢালা হলো, `best = 0`। এখন "অমুক সংখ্যাটা আছে কি?" প্রশ্নের উত্তর O(1)-এ পাওয়া যায়।',
    whyItMatters:
      'সাজিয়ে নিলেও (`sort`) কাজ হতো, কিন্তু সেটা O(n log n)। Set ব্যবহার করলে ক্রমের দরকারই পড়ে না — শুধু প্রতিবেশী আছে কি নেই, সেই প্রশ্নটাই যথেষ্ট।',
    highlightLines: [2, 3],
    vars: [{ name: 'best', value: 0 }],
    scene: {
      kind: 'array',
      values: NUMS,
      table: SET_TABLE,
      caption: 'লক্ষ্য: সবচেয়ে লম্বা টানা সংখ্যার সিকোয়েন্স কত লম্বা।',
    },
  },

  ...VISITS.map((visit, i): SimStep => {
    const marks: Record<number, CellMark> = {};

    // Everything settled by earlier visits stays visible as history.
    for (const past of VISITS.slice(0, i)) {
      if (past.isStart) {
        for (const value of past.run) marks[INDEX_OF.get(value)!] = 'done';
      } else {
        marks[INDEX_OF.get(past.x)!] = 'reject';
      }
    }

    if (visit.isStart) {
      for (const value of visit.run) marks[INDEX_OF.get(value)!] = 'done';
    }
    marks[INDEX_OF.get(visit.x)!] = visit.isStart ? 'active' : 'reject';

    return {
      id: `1.4-visit-${i + 1}`,
      title: visit.isStart
        ? `x = ${visit.x} — সিকোয়েন্সের শুরু`
        : `x = ${visit.x} — শুরু নয়, skip`,
      whatHappens: visit.isStart
        ? `${visit.x - 1} set-এ নেই, তাই ${visit.x} কোনো সিকোয়েন্সের প্রথম সংখ্যা। এখান থেকে উপরে গোনা হলো: ${visit.run.join(' → ')}${visit.run.length > 1 ? ` — কিন্তু ${visit.run[visit.run.length - 1] + 1} নেই, তাই থামল` : ''}। len = ${visit.run.length}, best = ${visit.best}।`
        : `${visit.x - 1} set-এ আছে, মানে ${visit.x} কোনো সিকোয়েন্সের মাঝখানে। এখান থেকে গুনলে ওই সিকোয়েন্সেরই একটা ছোট অংশ পাওয়া যাবে — তাই সোজা skip।`,
      whyItMatters:
        i === 0
          ? 'শুধু সিকোয়েন্সের শুরু থেকেই গোনা — এই একটা শর্তই অ্যালগরিদমটাকে O(n)-এ রাখে। প্রতিটা সংখ্যা `while` লুপে ঠিক একবারই ছোঁয়া হয়, কারণ প্রতিটা সংখ্যার সিকোয়েন্সে শুরু মাত্র একটাই।'
          : i === 3
            ? 'বাইরে থেকে দেখলে nested লুপ মনে হয়, কিন্তু ভেতরের `while` মোট মিলিয়ে সব সংখ্যা একবারই ছোঁয় — তাই মোট খরচ O(n²) নয়, O(n)।'
            : undefined,
      highlightLines: visit.isStart ? [4, 6, 7, 8] : [4, 5],
      vars: [
        { name: 'x', value: visit.x },
        { name: 'len', value: visit.isStart ? visit.run.length : '—' },
        { name: 'best', value: visit.best },
      ],
      scene: {
        kind: 'array',
        values: NUMS,
        marks,
        table: SET_TABLE,
        caption: visit.isStart
          ? `সিকোয়েন্স পাওয়া গেল: ${visit.run.join(', ')}`
          : `${visit.x} বাদ — এর আগের সংখ্যা ${visit.x - 1} আছে।`,
      },
    };
  }),

  {
    id: '1.4-done',
    title: 'শেষ — সবচেয়ে লম্বা সিকোয়েন্স 4',
    whatHappens: 'সব সংখ্যা দেখা শেষ। সবচেয়ে লম্বা টানা সিকোয়েন্স `1, 2, 3, 4` — দৈর্ঘ্য 4।',
    whyItMatters:
      'array-টা সাজানোই ছিল না, তবু সাজাতে হয়নি। "ক্রম" নয়, "প্রতিবেশী আছে কি না" — প্রশ্নটা এভাবে বদলে ফেলাই এই প্যাটার্নের মূল চাল।',
    highlightLines: [10],
    vars: [{ name: 'best', value: 4 }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'done', 5: 'done' },
      table: SET_TABLE,
      output: { title: 'সবচেয়ে লম্বা সিকোয়েন্স', values: [1, 2, 3, 4] },
      caption: 'উত্তর: 4',
    },
  },
];

export const hashingSim: PatternSimulation = {
  patternId: '1.4',
  input: 'nums = [100, 4, 200, 1, 3, 2]',
  output: '4',
  steps,
};
