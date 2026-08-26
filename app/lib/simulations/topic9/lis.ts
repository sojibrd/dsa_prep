import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.5 Longest Increasing Subsequence — patience sorting, O(n log n)

   The row is `tails`, not `nums`: `tails` is what the algorithm actually
   mutates, and watching it get shorter-but-smaller is the whole insight.
   `nums` rides in the table with the cursor on the value being placed.
   ========================================================================= */

const NUMS = [3, 1, 4, 1, 5, 9, 2, 6];

interface Place {
  x: number;
  /** Index binary search landed on. */
  lo: number;
  /** Value overwritten, or undefined when appending. */
  replaced?: number;
  tails: number[];
}

/** Verified by running the demo code. */
const PLACES: Place[] = [
  { x: 3, lo: 0, tails: [3] },
  { x: 1, lo: 0, replaced: 3, tails: [1] },
  { x: 4, lo: 1, tails: [1, 4] },
  { x: 1, lo: 0, replaced: 1, tails: [1, 4] },
  { x: 5, lo: 2, tails: [1, 4, 5] },
  { x: 9, lo: 3, tails: [1, 4, 5, 9] },
  { x: 2, lo: 1, replaced: 4, tails: [1, 2, 5, 9] },
  { x: 6, lo: 3, replaced: 9, tails: [1, 2, 5, 6] },
];

function numsTable(index: number) {
  return {
    title: 'nums — যা পড়া হচ্ছে',
    entries: NUMS.map((value, i) => ({
      key: String(i),
      value,
      mark: (i < index ? 'done' : i === index ? 'active' : undefined) as CellMark | undefined,
    })),
  };
}

const steps: SimStep[] = [
  {
    id: '9.5-init',
    title: 'শুরু — খালি tails',
    whatHappens:
      '`tails` খালি। এই array-তে `tails[i]` রাখবে: দৈর্ঘ্য `i+1`-এর সব বাড়তি subsequence-এর মধ্যে সবচেয়ে **ছোট শেষ উপাদান**।',
    whyItMatters:
      'এটাই সবচেয়ে বেশি ভুল বোঝা জিনিস: **`tails` নিজে কোনো LIS নয়** — শুধু তার দৈর্ঘ্যটা সঠিক। শেষ উপাদান যত ছোট রাখা যায়, ভবিষ্যতে তার পিঠে আরও কিছু জোড়ার সম্ভাবনা তত বেশি। তাই প্রতিটা দৈর্ঘ্যের জন্য সবচেয়ে "উদার" শেষটা ধরে রাখা হয়।',
    highlightLines: [2, 3],
    vars: [{ name: 'tails', value: '[]' }],
    scene: {
      kind: 'array',
      values: [],
      table: numsTable(0),
      caption: 'সারিটা `tails` — input array নয়। input পাশের প্যানেলে।',
    },
  },

  ...PLACES.map((place, i): SimStep => {
    const appended = place.replaced === undefined;
    const marks: Record<number, CellMark> = {};
    place.tails.forEach((_, idx) => {
      marks[idx] = 'done';
    });
    marks[place.lo] = 'active';

    return {
      id: `9.5-${i + 1}`,
      title: appended
        ? `x = ${place.x} — সবার চেয়ে বড়, tails লম্বা হলো`
        : `x = ${place.x} — ${place.replaced}-এর জায়গায় বসল`,
      whatHappens: appended
        ? `binary search বলল index ${place.lo} — অর্থাৎ tails-এর কোনো মানই ${place.x}-এর সমান বা বড় নয়। তাই ${place.x} শেষে যোগ হলো, LIS-এর দৈর্ঘ্য বেড়ে ${place.tails.length}।`
        : `binary search বলল index ${place.lo} — সেখানে ছিল ${place.replaced}, যা ${place.x}-এর সমান বা বড়। তাই ${place.x} তার জায়গা নিল। দৈর্ঘ্য অপরিবর্তিত (${place.tails.length}), কিন্তু ওই দৈর্ঘ্যের শেষটা এখন ছোট।`,
      whyItMatters:
        i === 0
          ? undefined
          : i === 1
            ? '1 এসে 3-কে হটিয়ে দিল। দৈর্ঘ্য এখনো ১, কিন্তু "১ লম্বা subsequence-এর সবচেয়ে ছোট শেষ" এখন 1 — যার পিঠে অনেক বেশি সংখ্যা বসতে পারবে। কিছু হারায়নি, সম্ভাবনা বেড়েছে।'
            : i === 3
              ? 'একই 1 আবার এল, নিজের জায়গাতেই বসল — কিছুই বদলাল না। `tails[i] >= x` শর্তটা `>` নয় বলেই সমান মান নতুন দৈর্ঘ্য তৈরি করে না; LIS কঠোরভাবে বাড়তি হতে হয়।'
              : i === 6
                ? 'এখানেই দেখা যায় tails নিজে LIS নয়। এখন tails = [1, 2, 5, 9], কিন্তু `1, 2, 5, 9` মূল array-তে এই ক্রমে নেই — 2 এসেছে 5 আর 9-এর পরে। দৈর্ঘ্য ৪ তবু সঠিক।'
                : undefined,
      highlightLines: appended ? [3, 4, 5, 6, 8, 9, 10, 12] : [3, 6, 8, 9, 10, 12],
      vars: [
        { name: 'x', value: place.x },
        { name: 'lo', value: place.lo },
        { name: 'tails', value: `[${place.tails.join(',')}]` },
      ],
      scene: {
        kind: 'array',
        values: place.tails,
        pointers: [{ name: 'lo', index: place.lo }],
        marks,
        table: numsTable(i),
        caption: appended
          ? `দৈর্ঘ্য ${place.tails.length}-এ পৌঁছাল।`
          : `দৈর্ঘ্য ${place.tails.length}-ই, কিন্তু শেষটা ${place.replaced} থেকে ${place.x}-এ নামল।`,
      },
    };
  }),

  {
    id: '9.5-done',
    title: 'শেষ — LIS-এর দৈর্ঘ্য 4',
    whatHappens:
      '`tails = [1, 2, 5, 6]`, তাই উত্তর `4`। প্রকৃত একটা LIS: `1, 4, 5, 9` (বা `1, 4, 5, 6`)।',
    whyItMatters:
      'প্রতিটা উপাদানে একটা করে binary search — O(n log n)। সরল DP (`dp[i] = 1 + max(dp[j])`) O(n²)। tails কখনো ছোট হয় না, শুধু বাড়ে বা একই থাকে — তাই তার দৈর্ঘ্যই উত্তর। প্রকৃত subsequence-টা লাগলে প্রতিটা উপাদান কোন index-এ বসেছিল তা আলাদা করে রাখতে হয়।',
    highlightLines: [14],
    vars: [{ name: 'tails.length', value: 4 }],
    scene: {
      kind: 'array',
      values: [1, 2, 5, 6],
      marks: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' },
      table: numsTable(NUMS.length),
      output: { title: 'একটা প্রকৃত LIS', values: [1, 4, 5, 9] },
      caption: 'tails ≠ LIS — দৈর্ঘ্যটাই কেবল এক।',
    },
  },
];

export const lisSim: PatternSimulation = {
  patternId: '9.5',
  input: 'nums = [3,1,4,1,5,9,2,6]',
  output: '4',
  steps,
};
