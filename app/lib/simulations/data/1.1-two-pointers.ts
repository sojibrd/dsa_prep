import type { PatternSimulation, SimStep } from '../types';

/**
 * 1.1 Two Pointers — Trapping Rain Water (LC 42).
 *
 * Drawn as BARS, not boxes: the whole insight is that water rests on top of a
 * column up to the height of the shorter wall, and a row of numbered squares
 * cannot show a thing resting on top of anything.
 *
 * `fills` carries the water settled on each index so far, so the puddle grows
 * across the run instead of appearing all at once at the end.
 */

const HEIGHT = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];

/** Water settled by the end of each step, keyed by index. */
const water: Record<number, number> = {};

/** Cells the pointers have already passed and settled. */
const settled = (l: number, r: number): Record<number, 'done'> => {
  const marks: Record<number, 'done'> = {};
  for (let i = 0; i < l; i++) marks[i] = 'done';
  for (let i = HEIGHT.length - 1; i > r; i--) marks[i] = 'done';
  return marks;
};

/**
 * One iteration of the loop. Written as a helper because the twelve steps
 * differ only in their numbers and their sentence — spelling each one out in
 * full would bury that under four hundred lines of near-identical object.
 */
function iteration(args: {
  id: string;
  l: number;
  r: number;
  side: 'L' | 'R';
  leftMax: number;
  rightMax: number;
  added: number;
  total: number;
  title: string;
  whatHappens: string;
  whyItMatters?: string;
}): SimStep {
  const { id, l, r, side, leftMax, rightMax, added, total, title, whatHappens, whyItMatters } =
    args;
  const cursor = side === 'L' ? l : r;
  if (added > 0) water[cursor] = added;

  return {
    id,
    title,
    whatHappens,
    whyItMatters,
    highlightLines: side === 'L' ? [8, 9, 10, 11] : [12, 13, 14, 15],
    vars: [
      { name: 'l', value: l },
      { name: 'r', value: r },
      { name: 'leftMax', value: leftMax },
      { name: 'rightMax', value: rightMax },
      { name: 'water', value: total },
    ],
    scene: {
      kind: 'array',
      values: HEIGHT,
      asBars: true,
      pointers: [
        { name: 'l', index: l },
        { name: 'r', index: r },
      ],
      marks: { ...settled(l, r), [cursor]: 'active' },
      fills: { ...water },
      caption:
        added > 0
          ? `index ${cursor}-এ ${added} একক পানি জমল — মোট ${total}`
          : `index ${cursor}-এ পানি জমার জায়গা নেই — মোট ${total}`,
    },
  };
}

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — দুই প্রান্তে দুই pointer',
    whatHappens:
      'l বসল একদম বাঁ প্রান্তে (index 0), r বসল ডান প্রান্তে (index 11)। leftMax, rightMax আর water — তিনটাই ০ থেকে শুরু।',
    whyItMatters:
      'পুরো array একবারে না দেখে দুই দিক থেকে ভেতরের দিকে এগোব। প্রতিটা ঘরে পানি জমে min(leftMax, rightMax) − height[i] — কিন্তু দুটো max একসাথে জানার দরকার নেই, সেটাই এই প্যাটার্নের চাল।',
    highlightLines: [2, 3, 4, 5, 6],
    vars: [
      { name: 'l', value: 0 },
      { name: 'r', value: 11 },
      { name: 'leftMax', value: 0 },
      { name: 'rightMax', value: 0 },
      { name: 'water', value: 0 },
    ],
    scene: {
      kind: 'array',
      values: HEIGHT,
      asBars: true,
      pointers: [
        { name: 'l', index: 0 },
        { name: 'r', index: 11 },
      ],
      caption: 'height = প্রতিটা বারের উচ্চতা। মাঝের গর্তগুলোতেই পানি জমবে।',
    },
  },

  iteration({
    id: 'it-1',
    l: 0,
    r: 11,
    side: 'L',
    leftMax: 0,
    rightMax: 0,
    added: 0,
    total: 0,
    title: 'height[0]=0 < height[11]=1 — বাঁ দিক ছোট',
    whatHappens:
      'বাঁ দিকের বার ছোট, তাই l নিয়ে কাজ। leftMax = max(0, 0) = 0, পানি জমল 0 − 0 = 0। l এগিয়ে ১-এ।',
    whyItMatters:
      'বাঁ দিক ছোট মানে বাঁ দিকের দেয়ালই bottleneck — ডান দিকে যত উঁচু দেয়ালই থাক, এই ঘরের পানির উচ্চতা leftMax-ই ঠিক করবে। তাই rightMax না জেনেই সিদ্ধান্ত নেওয়া নিরাপদ।',
  }),

  iteration({
    id: 'it-2',
    l: 1,
    r: 11,
    side: 'R',
    leftMax: 0,
    rightMax: 1,
    added: 0,
    total: 0,
    title: 'height[1]=1, height[11]=1 — সমান, তাই ডান দিক',
    whatHappens:
      'শর্তটা <, তাই সমান হলে else শাখা চলে — r নিয়ে কাজ। rightMax = max(0, 1) = 1, পানি জমল 1 − 1 = 0। r পিছিয়ে ১০-এ।',
    whyItMatters:
      'সমান হলে কোন দিক বাছবেন তাতে ফল বদলায় না — দুই দিকের দেয়ালই সমান bottleneck। শুধু ধারাবাহিক থাকাটা জরুরি, নইলে একই ঘর দুবার গোনা হতে পারে।',
  }),

  iteration({
    id: 'it-3',
    l: 1,
    r: 10,
    side: 'L',
    leftMax: 1,
    rightMax: 1,
    added: 0,
    total: 0,
    title: 'height[1]=1 < height[10]=2 — বাঁ দিক',
    whatHappens: 'leftMax = max(0, 1) = 1। পানি 1 − 1 = 0, কারণ বারটা নিজেই এখন সর্বোচ্চ। l এগিয়ে ২-এ।',
    whyItMatters: 'যে বার নিজেই leftMax, তার উপরে পানি জমে না — সে দেয়াল, গর্ত নয়।',
  }),

  iteration({
    id: 'it-4',
    l: 2,
    r: 10,
    side: 'L',
    leftMax: 1,
    rightMax: 1,
    added: 1,
    total: 1,
    title: 'প্রথম পানি — index 2-এ ১ একক',
    whatHappens: 'height[2] = 0, কিন্তু leftMax = 1। পানি জমল 1 − 0 = 1। মোট water = 1। l এগিয়ে ৩-এ।',
    whyItMatters:
      'এই ঘরটা বাঁয়ে ১ উঁচু দেয়াল আর ডানে ২ উঁচু দেয়ালের মাঝে — ছোটটা (১) পর্যন্তই পানি ওঠে। এটাই min(leftMax, rightMax) নিয়ম, শুধু rightMax গুনতে হলো না।',
  }),

  iteration({
    id: 'it-5',
    l: 3,
    r: 10,
    side: 'R',
    leftMax: 1,
    rightMax: 2,
    added: 0,
    total: 1,
    title: 'height[3]=2, height[10]=2 — সমান, ডান দিক',
    whatHappens: 'rightMax = max(1, 2) = 2। পানি 2 − 2 = 0। r পিছিয়ে ৯-এ।',
  }),

  iteration({
    id: 'it-6',
    l: 3,
    r: 9,
    side: 'R',
    leftMax: 1,
    rightMax: 2,
    added: 1,
    total: 2,
    title: 'height[9]=1 < rightMax=2 — ১ একক জমল',
    whatHappens: 'ডান দিক ছোট (1 < 2), তাই r নিয়ে কাজ। পানি জমল 2 − 1 = 1। মোট water = 2। r পিছিয়ে ৮-এ।',
    whyItMatters:
      'এখন আয়নার প্রতিচ্ছবি — ডান দিক ছোট, তাই rightMax-ই bottleneck, leftMax না জেনেই চলবে।',
  }),

  iteration({
    id: 'it-7',
    l: 3,
    r: 8,
    side: 'R',
    leftMax: 1,
    rightMax: 2,
    added: 0,
    total: 2,
    title: 'height[8]=2 — নিজেই rightMax ছুঁলো',
    whatHappens: 'rightMax = max(2, 2) = 2, পানি 2 − 2 = 0। r পিছিয়ে ৭-এ।',
  }),

  iteration({
    id: 'it-8',
    l: 3,
    r: 7,
    side: 'L',
    leftMax: 2,
    rightMax: 2,
    added: 0,
    total: 2,
    title: 'height[3]=2 < height[7]=3 — বাঁ দিকে ফিরল',
    whatHappens:
      'ডানে সবচেয়ে উঁচু বার (3) পাওয়ায় বাঁ দিকই এখন ছোট। leftMax = max(1, 2) = 2। পানি 2 − 2 = 0। l এগিয়ে ৪-এ।',
    whyItMatters:
      'pointer কোন দিকে যাবে তা আগে থেকে ঠিক নয় — প্রতিটা ধাপে ছোট দিকটাই এগোয়। এভাবেই দুই pointer একসাথে বাকি গর্তগুলোর দিকে চাপ দেয়।',
  }),

  iteration({
    id: 'it-9',
    l: 4,
    r: 7,
    side: 'L',
    leftMax: 2,
    rightMax: 2,
    added: 1,
    total: 3,
    title: 'index 4 — ১ একক জমল',
    whatHappens: 'height[4] = 1, leftMax = 2। পানি 2 − 1 = 1। মোট water = 3। l এগিয়ে ৫-এ।',
  }),

  iteration({
    id: 'it-10',
    l: 5,
    r: 7,
    side: 'L',
    leftMax: 2,
    rightMax: 2,
    added: 2,
    total: 5,
    title: 'সবচেয়ে গভীর গর্ত — index 5-এ ২ একক',
    whatHappens: 'height[5] = 0, leftMax = 2। পানি 2 − 0 = 2। মোট water = 5। l এগিয়ে ৬-এ।',
    whyItMatters:
      'বার যত নিচু, পানি তত বেশি — কিন্তু সীমা সবসময় দুই পাশের ছোট দেয়াল, নিজের গভীরতা নয়।',
  }),

  iteration({
    id: 'it-11',
    l: 6,
    r: 7,
    side: 'L',
    leftMax: 2,
    rightMax: 2,
    added: 1,
    total: 6,
    title: 'শেষ ঘর — index 6-এ ১ একক',
    whatHappens: 'height[6] = 1, leftMax = 2। পানি 2 − 1 = 1। মোট water = 6। l এগিয়ে ৭-এ — এখন l === r।',
  }),

  {
    id: 'done',
    title: 'l আর r মিলে গেল — লুপ শেষ',
    whatHappens:
      'l ও r দুটোই এখন index 7-এ, তাই while (l < r) মিথ্যা হয়ে গেল। উত্তর: water = 6।',
    whyItMatters:
      'প্রতিটা index ঠিক একবার করে দেখা হয়েছে — তাই O(n) time, আর মাত্র পাঁচটা ভেরিয়েবল লেগেছে — O(1) space। একই কাজ prefix-max/suffix-max array দিয়ে করলে O(n) extra memory লাগত।',
    highlightLines: [18],
    vars: [
      { name: 'l', value: 7 },
      { name: 'r', value: 7 },
      { name: 'leftMax', value: 2 },
      { name: 'rightMax', value: 2 },
      { name: 'water', value: 6 },
    ],
    scene: {
      kind: 'array',
      values: HEIGHT,
      asBars: true,
      pointers: [
        { name: 'l', index: 7 },
        { name: 'r', index: 7 },
      ],
      marks: Object.fromEntries(HEIGHT.map((_, i) => [i, 'done' as const])),
      fills: { ...water },
      caption: 'মোট আটকানো পানি = 1 + 1 + 1 + 2 + 1 = 6',
    },
  },
];

export const twoPointersSim: PatternSimulation = {
  patternId: '1.1',
  input: '[0,1,0,2,1,0,1,3,2,1,2,1]',
  output: '6',
  steps,
};
