import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.3 Unbounded Knapsack — Coin Change

   Same skeleton as 9.2, one difference: the inner loop runs FORWARD. That
   single reversal is what lets a coin be reused, and it is the whole lesson.
   ========================================================================= */

const COINS = [1, 2, 5];
const AMOUNT = 6;
const INF = '∞';

interface Update {
  coin: number;
  a: number;
  /** dp[a] before, `null` meaning infinity. */
  before: number | null;
  source: number;
  after: number;
  /** dp after the update; `null` is infinity. */
  dp: (number | null)[];
}

/** Verified by running the demo code and logging every improvement. */
const UPDATES: Update[] = [
  { coin: 1, a: 1, before: null, source: 0, after: 1, dp: [0, 1, null, null, null, null, null] },
  { coin: 1, a: 2, before: null, source: 1, after: 2, dp: [0, 1, 2, null, null, null, null] },
  { coin: 1, a: 3, before: null, source: 2, after: 3, dp: [0, 1, 2, 3, null, null, null] },
  { coin: 1, a: 4, before: null, source: 3, after: 4, dp: [0, 1, 2, 3, 4, null, null] },
  { coin: 1, a: 5, before: null, source: 4, after: 5, dp: [0, 1, 2, 3, 4, 5, null] },
  { coin: 1, a: 6, before: null, source: 5, after: 6, dp: [0, 1, 2, 3, 4, 5, 6] },
  { coin: 2, a: 2, before: 2, source: 0, after: 1, dp: [0, 1, 1, 3, 4, 5, 6] },
  { coin: 2, a: 3, before: 3, source: 1, after: 2, dp: [0, 1, 1, 2, 4, 5, 6] },
  { coin: 2, a: 4, before: 4, source: 2, after: 2, dp: [0, 1, 1, 2, 2, 5, 6] },
  { coin: 2, a: 5, before: 5, source: 3, after: 3, dp: [0, 1, 1, 2, 2, 3, 6] },
  { coin: 2, a: 6, before: 6, source: 4, after: 3, dp: [0, 1, 1, 2, 2, 3, 3] },
  { coin: 5, a: 5, before: 3, source: 0, after: 1, dp: [0, 1, 1, 2, 2, 1, 3] },
  { coin: 5, a: 6, before: 3, source: 1, after: 2, dp: [0, 1, 1, 2, 2, 1, 2] },
];

const row = (dp: (number | null)[]) => dp.map((value) => (value === null ? INF : value));

function marksFor(update: Update): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  update.dp.forEach((value, i) => {
    if (value !== null) marks[i] = 'done';
  });
  marks[update.source] = 'fill';
  marks[update.a] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '9.3-init',
    title: 'শুরু — সবই অসীম, শুধু 0 ছাড়া',
    whatHappens:
      '`dp` array-এর সব ঘর `∞`, শুধু `dp[0] = 0`। মানে: 0 টাকা বানাতে শূন্যটা কয়েন লাগে; বাকি সবের উপায় এখনো জানা নেই।',
    whyItMatters:
      '`∞` মানে "এখনো কোনো উপায় পাওয়া যায়নি"। 0 বা −1 দিয়ে শুরু করলে `Math.min` ভুল উত্তর দিত — অজানা মানকে সবচেয়ে খারাপ হিসেবে রাখাই এই ছাঁচের নিয়ম। শেষে যদি `dp[amount]` তখনো `∞` থাকে, বুঝতে হবে ওই অঙ্ক বানানোই যায় না।',
    highlightLines: [2, 3],
    vars: [
      { name: 'coins', value: `[${COINS.join(',')}]` },
      { name: 'amount', value: AMOUNT },
    ],
    scene: {
      kind: 'array',
      values: row([0, null, null, null, null, null, null]),
      marks: { 0: 'done' },
      caption: 'index = অঙ্ক, মান = সেটা বানাতে সবচেয়ে কম কয়টা কয়েন।',
    },
  },

  ...UPDATES.map((update, i): SimStep => {
    const isNewCoin = i === 0 || UPDATES[i - 1].coin !== update.coin;
    return {
      id: `9.3-${i + 1}`,
      title: `coin ${update.coin}, অঙ্ক ${update.a} — ${update.before === null ? INF : update.before} থেকে ${update.after}`,
      whatHappens: `\`dp[${update.source}]\` = ${update.dp[update.source]}, তার সাথে একটা ${update.coin}-এর কয়েন যোগ করলে অঙ্ক ${update.a} হয় ${update.after} কয়েনে। আগের জানা ছিল ${update.before === null ? INF : update.before}, তাই এটা উন্নতি — \`dp[${update.a}]\` = ${update.after}।`,
      whyItMatters:
        i === 0
          ? 'ভেতরের লুপ **সোজা দিকে** চলে (`a = coin` থেকে উপরে) — 9.2-এর ঠিক উল্টো। সোজা দিকে গেলে `dp[a - coin]`-এ এই কয়েনের প্রভাব **আগেই** পড়ে গেছে, তাই একই কয়েন বারবার ব্যবহার হতে পারে। একটা লুপের দিক বদলেই 0/1 knapsack unbounded হয়ে যায়।'
          : i === 6 && isNewCoin
            ? '2-এর কয়েন এসে আগের হিসাব ভেঙে দিল: অঙ্ক 2-এ আগে লাগত দুটো ১-এর কয়েন, এখন একটাই। `Math.min` তাই আগের উত্তর ধরে রাখে না — উন্নতি হলেই বদলে দেয়।'
            : i === 11
              ? 'অঙ্ক 5 এক কয়েনেই — একটা ৫-এর কয়েন। আগের ৩ কয়েনের হিসাব বাতিল।'
              : undefined,
      highlightLines: [4, 5, 6, 7, 8, 9, 10],
      vars: [
        { name: 'coin', value: update.coin },
        { name: 'a', value: update.a },
        { name: 'dp[a − coin]', value: update.dp[update.source] as number },
      ],
      scene: {
        kind: 'array',
        values: row(update.dp),
        marks: marksFor(update),
        caption: `${update.dp[update.source]} + ১টা ${update.coin}-এর কয়েন = ${update.after}`,
      },
    };
  }),

  {
    id: '9.3-done',
    title: 'শেষ — ৬ বানাতে ২টা কয়েন',
    whatHappens:
      '`dp[6] = 2` — একটা ৫ আর একটা ১। উত্তর `2`।',
    whyItMatters:
      'খরচ O(coins × amount)। লোভী পদ্ধতি (সবচেয়ে বড় কয়েন আগে) এখানে কাজ করত, কিন্তু সব মুদ্রাব্যবস্থায় নয় — `coins = [1, 3, 4]`, `amount = 6`-এ লোভী দেয় 4+1+1 = ৩টা, অথচ সঠিক উত্তর 3+3 = ২টা। DP সব সম্ভাবনা দেখে বলেই এই ফাঁদে পড়ে না।',
    highlightLines: [11],
    vars: [{ name: 'dp[6]', value: 2 }],
    scene: {
      kind: 'array',
      values: row([0, 1, 1, 2, 2, 1, 2]),
      marks: {
        0: 'done', 1: 'done', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'active',
      },
      output: { title: 'কয়েন', values: [5, 1] },
      caption: 'পুরো dp টেবিল — প্রতিটা অঙ্কের সবচেয়ে কম কয়েনসংখ্যা।',
    },
  },
];

export const coinChangeSim: PatternSimulation = {
  patternId: '9.3',
  input: 'coins = [1,2,5], amount = 6',
  output: '2',
  steps,
};
