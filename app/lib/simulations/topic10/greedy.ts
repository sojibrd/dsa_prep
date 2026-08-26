import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   10.1 Greedy — Candy

   The row is `candies` (what the algorithm mutates) with `ratings` beneath
   each cell as `subValues`. That is the same use Kadane makes of it: a second
   number that genuinely belongs to each index, not a running scalar.
   ========================================================================= */

const RATINGS = [1, 0, 2, 1, 3];

interface Change {
  pass: 'ltr' | 'rtl';
  i: number;
  /** candies after this change. */
  candies: number[];
  /** Neighbour index the comparison used. */
  neighbour: number;
}

/** Verified by running the demo code; only the passes that change anything. */
const CHANGES: Change[] = [
  { pass: 'ltr', i: 2, neighbour: 1, candies: [1, 1, 2, 1, 1] },
  { pass: 'ltr', i: 4, neighbour: 3, candies: [1, 1, 2, 1, 2] },
  { pass: 'rtl', i: 0, neighbour: 1, candies: [2, 1, 2, 1, 2] },
];

const ratingsUnder = Object.fromEntries(RATINGS.map((value, i) => [i, value]));

function marksFor(i: number, neighbour: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  marks[neighbour] = 'fill';
  marks[i] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '10.1-init',
    title: 'শুরু — প্রত্যেকে অন্তত একটা',
    whatHappens:
      '`candies` array-এর সব ঘরে 1। এটাই প্রথম শর্ত: প্রতিটা বাচ্চা অন্তত একটা চকলেট পাবে।',
    whyItMatters:
      'দুটো শর্ত মেটাতে হবে — প্রত্যেকে অন্তত ১টা, আর প্রতিবেশীর চেয়ে বেশি rating হলে বেশি চকলেট। এক পাসে দুটোই মেটানো যায় না, কারণ "প্রতিবেশী" মানে দুই দিকের প্রতিবেশী। তাই দুটো পাস: একবার বাঁ থেকে ডানে (বাঁ প্রতিবেশীর শর্ত), একবার ডান থেকে বাঁয়ে (ডান প্রতিবেশীর শর্ত)।',
    highlightLines: [2, 3],
    vars: [
      { name: 'ratings', value: `[${RATINGS.join(',')}]` },
      { name: 'candies', value: '[1,1,1,1,1]' },
    ],
    scene: {
      kind: 'array',
      values: [1, 1, 1, 1, 1],
      subValues: ratingsUnder,
      subLabel: 'rating',
      caption: 'সারিটা candies; নিচে প্রতিটা বাচ্চার rating।',
    },
  },

  ...CHANGES.map((change, i): SimStep => {
    const isLtr = change.pass === 'ltr';
    return {
      id: `10.1-${i + 1}`,
      title: `${isLtr ? 'বাঁ → ডান' : 'ডান → বাঁ'} পাস, i = ${change.i} → ${change.candies[change.i]}টা`,
      whatHappens: isLtr
        ? `rating[${change.i}] = ${RATINGS[change.i]} > rating[${change.neighbour}] = ${RATINGS[change.neighbour]}, তাই বাঁ প্রতিবেশীর চেয়ে একটা বেশি দিতে হবে: candies[${change.i}] = ${change.candies[change.neighbour]} + 1 = ${change.candies[change.i]}।`
        : `rating[${change.i}] = ${RATINGS[change.i]} > rating[${change.neighbour}] = ${RATINGS[change.neighbour]}, তাই ডান প্রতিবেশীর চেয়েও বেশি দিতে হবে। কিন্তু প্রথম পাসের ফল নষ্ট করা যাবে না, তাই \`max\` — max(${CHANGES[i - 1]?.candies[change.i] ?? 1}, ${change.candies[change.neighbour]} + 1) = ${change.candies[change.i]}।`,
      whyItMatters:
        i === 0
          ? 'প্রথম পাসে শুধু বাঁ দিকে তাকানো হয়, ডান দিক সম্পূর্ণ উপেক্ষিত। এটা ইচ্ছাকৃত — একবারে একটা শর্ত সামলানোই এই কৌশলের সরলতা।'
          : i === 2
            ? '`Math.max` না লিখে সরাসরি বসিয়ে দিলে প্রথম পাসের কষ্ট মুছে যেত। দ্বিতীয় পাসের কাজ শর্ত **যোগ** করা, প্রতিস্থাপন নয় — তাই সবসময় বড়টা রাখা। এই এক লাইনেই দুই পাসের ফল একসাথে টিকে থাকে।'
            : undefined,
      highlightLines: isLtr ? [4, 5] : [6, 7, 8],
      vars: [
        { name: 'পাস', value: isLtr ? 'বাঁ → ডান' : 'ডান → বাঁ' },
        { name: 'i', value: change.i },
        { name: 'candies', value: `[${change.candies.join(',')}]` },
      ],
      scene: {
        kind: 'array',
        values: change.candies,
        subValues: ratingsUnder,
        subLabel: 'rating',
        marks: marksFor(change.i, change.neighbour),
        caption: `নীল ঘরটাই তুলনার প্রতিবেশী (index ${change.neighbour})।`,
      },
    };
  }),

  {
    id: '10.1-done',
    title: 'শেষ — মোট ৮টা চকলেট',
    whatHappens:
      '`candies = [2, 1, 2, 1, 2]`, যোগফল `8`। index ১ ও ৩ কখনো বাড়েনি — তারা দুই প্রতিবেশীর চেয়েই কম rating পেয়েছে।',
    whyItMatters:
      'দুটো পাস, O(n) সময়। লোভী পদ্ধতি এখানে কাজ করে কারণ প্রতিটা শর্ত স্থানীয় (শুধু পাশের জনের সাথে তুলনা), আর দুই দিক আলাদা পাসে সামলানো যায়। একবারে দুই দিক মেলানোর চেষ্টা করলে চক্রাকার নির্ভরতা তৈরি হতো এবং লোভী পদ্ধতি ভেঙে পড়ত।',
    highlightLines: [9],
    vars: [{ name: 'মোট', value: 8 }],
    scene: {
      kind: 'array',
      values: [2, 1, 2, 1, 2],
      subValues: ratingsUnder,
      subLabel: 'rating',
      marks: { 0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'done' },
      output: { title: 'মোট', values: [8] },
      caption: '2 + 1 + 2 + 1 + 2 = 8',
    },
  },
];

export const greedySim: PatternSimulation = {
  patternId: '10.1',
  input: 'ratings = [1,0,2,1,3]',
  output: '8',
  steps,
};
