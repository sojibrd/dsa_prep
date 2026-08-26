import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.11 Bitmask DP — Partition to K Equal Sum Subsets

   Four items instead of the workbook's seven, so the recursion tree fits in
   seven steps instead of hundreds.
   ========================================================================= */

/** Already sorted descending, as the code does before recursing. */
const NUMS = [4, 3, 2, 1];
const K = 2;
const TARGET = 5;

type Kind = 'take' | 'skip' | 'complete';

interface Event {
  kind: Kind;
  depth: number;
  i: number;
  /** Mask before the event. */
  mask: number;
  /** Mask after the event (same as `mask` for a skip). */
  maskAfter: number;
  sumBefore: number;
  sumAfter: number;
  /** Whether taking this item filled a bucket exactly. */
  bucketFull?: boolean;
}

/** Verified by running the demo code and logging every dfs branch. */
const EVENTS: Event[] = [
  { kind: 'take', depth: 0, i: 0, mask: 0b0000, maskAfter: 0b0001, sumBefore: 0, sumAfter: 4 },
  { kind: 'skip', depth: 1, i: 1, mask: 0b0001, maskAfter: 0b0001, sumBefore: 4, sumAfter: 4 },
  { kind: 'skip', depth: 1, i: 2, mask: 0b0001, maskAfter: 0b0001, sumBefore: 4, sumAfter: 4 },
  { kind: 'take', depth: 1, i: 3, mask: 0b0001, maskAfter: 0b1001, sumBefore: 4, sumAfter: 0, bucketFull: true },
  { kind: 'take', depth: 2, i: 1, mask: 0b1001, maskAfter: 0b1011, sumBefore: 0, sumAfter: 3 },
  { kind: 'take', depth: 3, i: 2, mask: 0b1011, maskAfter: 0b1111, sumBefore: 3, sumAfter: 0, bucketFull: true },
  { kind: 'complete', depth: 4, i: -1, mask: 0b1111, maskAfter: 0b1111, sumBefore: 0, sumAfter: 0 },
];

/** Bit i corresponds to NUMS[i]; printed most-significant first. */
const binary = (mask: number) => mask.toString(2).padStart(NUMS.length, '0');

/** A used item is settled; the one being tried is live. */
function marksFor(event: Event): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (let i = 0; i < NUMS.length; i++) {
    if (event.mask & (1 << i)) marks[i] = 'done';
  }
  if (event.i >= 0) marks[event.i] = event.kind === 'skip' ? 'reject' : 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '9.11-init',
    title: 'শুরু — লক্ষ্য প্রতি ভাগে 5',
    whatHappens:
      'মোট 10, `k = 2` — তাই প্রতি ভাগে 5। `nums` বড় থেকে ছোট ক্রমে সাজানো: `[4, 3, 2, 1]`। `mask = 0000` — কোনো সংখ্যা ব্যবহার হয়নি।',
    whyItMatters:
      '`mask`-এর প্রতিটা bit একটা সংখ্যার "ব্যবহার হয়েছে কি" প্রশ্নের উত্তর। ৪টা সংখ্যায় মাত্র ১৬টা সম্ভাব্য mask, তাই memo দিয়ে প্রতিটা অবস্থা একবারই সমাধান করা যায়। বড় থেকে ছোট সাজানোটাও কৌশল — বড় সংখ্যাগুলো আগে বসালে অসম্ভব শাখা তাড়াতাড়ি ধরা পড়ে।',
    highlightLines: [2, 3, 4, 5, 6, 7, 8, 21],
    vars: [
      { name: 'k', value: K },
      { name: 'target', value: TARGET },
      { name: 'mask', value: '0000' },
      { name: 'curSum', value: 0 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      caption: 'সারিটা sorted nums। mask-এর bit i মানে nums[i] ব্যবহৃত কি না।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const base = {
      id: `9.11-${i + 1}`,
      vars: [
        { name: 'depth', value: event.depth },
        { name: 'mask', value: binary(event.maskAfter) },
        { name: 'curSum', value: event.sumAfter },
      ],
    };

    if (event.kind === 'complete') {
      return {
        ...base,
        title: 'সব bit ব্যবহৃত — সফল',
        whatHappens: `\`mask === 1111\` — চারটে সংখ্যাই কোনো না কোনো ভাগে বসে গেছে। \`true\` ফেরত গেল।`,
        whyItMatters:
          'শেষে আলাদা করে "প্রতিটা ভাগের যোগফল কি 5" যাচাই করতে হয় না। কারণ `curSum` কখনো target ছাড়ায়নি, আর ভাগ পূর্ণ হলেই `% target` তাকে ০-এ নামিয়েছে — অর্থাৎ সব বিট ব্যবহৃত হওয়া মানেই ঠিক k-টা পূর্ণ ভাগ তৈরি হয়েছে।',
        highlightLines: [10],
        scene: {
          kind: 'array',
          values: NUMS,
          marks: { 0: 'done', 1: 'done', 2: 'done', 3: 'done' },
          caption: 'mask = 1111 — কিছু বাকি নেই।',
        },
      };
    }

    if (event.kind === 'skip') {
      return {
        ...base,
        title: `nums[${event.i}] = ${NUMS[event.i]} — জায়গা হবে না`,
        whatHappens: `চলতি ভাগে আছে ${event.sumBefore}, আর ${NUMS[event.i]} যোগ করলে হয় ${event.sumBefore + NUMS[event.i]} — যা target ${TARGET} ছাড়িয়ে যায়। তাই এই সংখ্যাটা এখন নেওয়া যাবে না।`,
        whyItMatters:
          i === 1
            ? 'এটাই একমাত্র ছাঁটাই (pruning) — target ছাড়ানো শাখায় ঢোকাই হয় না। এই একটা শর্ত ছাড়া অনুসন্ধান-গাছটা বহুগুণ বড় হয়ে যেত।'
            : undefined,
        highlightLines: [13, 14, 15],
        scene: {
          kind: 'array',
          values: NUMS,
          marks: marksFor(event),
          caption: `${event.sumBefore} + ${NUMS[event.i]} = ${event.sumBefore + NUMS[event.i]} > ${TARGET}`,
        },
      };
    }

    return {
      ...base,
      title: `nums[${event.i}] = ${NUMS[event.i]} নেওয়া হলো${event.bucketFull ? ' — ভাগ পূর্ণ' : ''}`,
      whatHappens: `${event.sumBefore} + ${NUMS[event.i]} = ${event.sumBefore + NUMS[event.i]} ≤ ${TARGET}, তাই নেওয়া গেল। mask ${binary(event.mask)} → ${binary(event.maskAfter)}। ${
        event.bucketFull
          ? `যোগফল ঠিক ${TARGET} হয়ে গেল, তাই \`% ${TARGET}\` তাকে ০-এ নামাল — নতুন ভাগ শুরু।`
          : `চলতি ভাগে এখন ${event.sumAfter}।`
      }`,
      whyItMatters:
        i === 0
          ? '`mask | (1 << i)` — i-তম bit জ্বালিয়ে দেওয়া। এটাই "এই সংখ্যাটা ব্যবহার হয়ে গেছে" লেখার সবচেয়ে সস্তা উপায়, আর গোটা অবস্থাটা একটাই সংখ্যায় ধরা থাকে বলে memo-র key হিসেবেও সরাসরি কাজে লাগে।'
          : event.bucketFull && i === 3
            ? '`% target` চালটা সুন্দর: যোগফল ঠিক target হলে ০, নইলে অপরিবর্তিত। ফলে "কয়টা ভাগ পূর্ণ হলো" আলাদা করে গুনতে হয় না — একই ফাংশন সব ভাগ সামলে ফেলে।'
            : i === 4
              ? 'নতুন ভাগ শুরু, তাই আবার সবচেয়ে বড় অব্যবহৃত সংখ্যা (3) থেকে শুরু। memo এখানে কাজে লাগত যদি একই mask অন্য পথে আগে দেখা হতো।'
              : undefined,
      highlightLines: [13, 14, 15, 16],
      scene: {
        kind: 'array',
        values: NUMS,
        marks: marksFor(event),
        caption: event.bucketFull
          ? `ভাগ পূর্ণ (${TARGET}) — পরের ভাগ শুরু।`
          : `চলতি ভাগ: ${event.sumAfter} / ${TARGET}`,
      },
    };
  }),

  {
    id: '9.11-done',
    title: 'শেষ — ভাগ করা সম্ভব',
    whatHappens:
      'উত্তর `true` — `[4, 1]` আর `[3, 2]`, দুটোরই যোগফল 5।',
    whyItMatters:
      'অবস্থা মাত্র 2ⁿ-টা, প্রতিটায় n-টা করে চেষ্টা — তাই memo সহ খরচ O(2ⁿ · n)। n ≤ ২০ পর্যন্ত এটা চলে; তার বেশি হলে bitmask আর কুলোয় না। মূল ধারণা: যখন "কোন কোনগুলো ব্যবহার হয়েছে" সেটাই পুরো অবস্থা, তখন সেই সেটটাকে একটা পূর্ণসংখ্যায় এনকোড করে ফেলা যায়।',
    highlightLines: [21],
    vars: [{ name: 'উত্তর', value: 'true' }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'active', 1: 'done', 2: 'done', 3: 'active' },
      output: { title: 'দুই ভাগ', values: ['4 + 1 = 5', '3 + 2 = 5'] },
      caption: 'amber = প্রথম ভাগ, সবুজ = দ্বিতীয়।',
    },
  },
];

export const bitmaskSim: PatternSimulation = {
  patternId: '9.11',
  input: 'nums = [4,3,2,1], k = 2',
  output: 'true',
  steps,
};
