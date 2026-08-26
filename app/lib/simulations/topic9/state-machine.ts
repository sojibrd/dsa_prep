import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   9.10 State Machine DP — Best Time to Buy/Sell with Cooldown
   ========================================================================= */

const PRICES = [1, 2, 3, 0, 2];
const NEG_INF = '−∞';

interface Tick {
  p: number;
  /** State before this day; `null` means −Infinity. */
  holdBefore: number | null;
  soldBefore: number | null;
  restBefore: number;
  hold: number | null;
  sold: number | null;
  rest: number;
}

/** Verified by running the demo code. */
const TICKS: Tick[] = [
  { p: 1, holdBefore: null, soldBefore: 0, restBefore: 0, hold: -1, sold: null, rest: 0 },
  { p: 2, holdBefore: -1, soldBefore: null, restBefore: 0, hold: -1, sold: 1, rest: 0 },
  { p: 3, holdBefore: -1, soldBefore: 1, restBefore: 0, hold: -1, sold: 2, rest: 1 },
  { p: 0, holdBefore: -1, soldBefore: 2, restBefore: 1, hold: 1, sold: -1, rest: 2 },
  { p: 2, holdBefore: 1, soldBefore: -1, restBefore: 2, hold: 1, sold: 3, rest: 2 },
];

const show = (value: number | null) => (value === null ? NEG_INF : value);

function marksFor(current: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (let i = 0; i < current; i++) marks[i] = 'done';
  marks[current] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '9.10-init',
    title: 'শুরু — তিনটে অবস্থা',
    whatHappens:
      '`hold = -∞` (হাতে শেয়ার আছে), `sold = 0` (আজই বিক্রি করলাম), `rest = 0` (হাত খালি, cooldown-ও শেষ)।',
    whyItMatters:
      'cooldown শর্তটা "গতকাল কী হয়েছিল" মনে রাখতে বাধ্য করে, তাই একটামাত্র সংখ্যা যথেষ্ট নয়। তিনটে অবস্থা রাখলে নিয়মটা সরল হয়ে যায়: কেনা যায় কেবল `rest` থেকে (`sold` থেকে নয় — সেটাই cooldown), আর `rest`-এ ফেরা যায় গতকালের `sold` থেকে। `hold` শুরুতে `-∞` কারণ প্রথম দিনের আগে শেয়ার হাতে থাকা অসম্ভব।',
    highlightLines: [2, 3, 4],
    vars: [
      { name: 'hold', value: NEG_INF },
      { name: 'sold', value: 0 },
      { name: 'rest', value: 0 },
    ],
    scene: {
      kind: 'array',
      values: PRICES,
      caption: 'সারিটা দাম, index = দিন। তিনটে অবস্থা vars-এ।',
    },
  },

  ...TICKS.map((tick, i): SimStep => ({
    id: `9.10-day-${i + 1}`,
    title: `দিন ${i} (দাম ${tick.p}) — hold ${show(tick.hold)}, sold ${show(tick.sold)}, rest ${tick.rest}`,
    whatHappens: `তিনটে আপডেট, এই ক্রমেই: **sold** = গতকালের hold + দাম = ${show(tick.holdBefore)} + ${tick.p} → ${show(tick.sold)}। **hold** = max(গতকালের hold, গতকালের rest − দাম) = max(${show(tick.holdBefore)}, ${tick.restBefore} − ${tick.p}) → ${show(tick.hold)}। **rest** = max(গতকালের rest, গতকালের sold) = max(${tick.restBefore}, ${show(tick.soldBefore)}) → ${tick.rest}।`,
    whyItMatters:
      i === 0
        ? '`prevSold` আলাদা করে ধরে রাখা জরুরি — কারণ `rest`-এর হিসাবে **গতকালের** `sold` লাগে, আর সেটা তার আগেই এই লাইনেই বদলে গেছে। ধরে না রাখলে আজকের বিক্রি থেকেই আজ rest-এ চলে আসা যেত, অর্থাৎ cooldown উধাও।'
        : i === 3
          ? 'দাম নেমে ০ হয়েছে, তাই কেনার আদর্শ দিন — গতকালের `rest` ছিল 1, তা থেকে দাম 0 বাদ দিয়ে `hold` উঠল 1-এ। আগের −1 থেকে বিশাল লাফ, আর সেটাই শেষ দিনের লাভ তৈরি করবে।'
          : i === 4
            ? 'শেষ দিনে বিক্রি: hold 1 + দাম 2 = 3। এটাই উত্তর।'
            : undefined,
    highlightLines: [5, 6, 7, 8, 9],
    vars: [
      { name: 'p', value: tick.p },
      { name: 'hold', value: show(tick.hold) },
      { name: 'sold', value: show(tick.sold) },
      { name: 'rest', value: tick.rest },
    ],
    scene: {
      kind: 'array',
      values: PRICES,
      marks: marksFor(i),
      caption: `এ পর্যন্ত সেরা: ${Math.max(tick.sold ?? -Infinity, tick.rest)}`,
    },
  })),

  {
    id: '9.10-done',
    title: 'শেষ — সর্বোচ্চ লাভ 3',
    whatHappens:
      '`max(sold, rest) = max(3, 2) = 3`। পথ: দিন ০-তে ১ টাকায় কিনে দিন ১-এ ২ টাকায় বেচা (+১), দিন ২ cooldown, দিন ৩-এ ০ টাকায় কিনে দিন ৪-এ ২ টাকায় বেচা (+২)।',
    whyItMatters:
      'O(n) সময়, O(1) জায়গা। শেষে `hold` বাদ দেওয়া হয় — হাতে শেয়ার নিয়ে শেষ করা কখনো লাভজনক নয়। এই ছাঁচটা যেকোনো নিয়মে খাটে: অবস্থাগুলো ঠিক করুন, তাদের মধ্যে কোন সরণ বৈধ তা ঠিক করুন, তারপর প্রতিটা সরণকে এক লাইনে লিখে ফেলুন।',
    highlightLines: [11],
    vars: [{ name: 'উত্তর', value: 3 }],
    scene: {
      kind: 'array',
      values: PRICES,
      marks: { 0: 'fill', 1: 'active', 2: 'reject', 3: 'fill', 4: 'active' },
      output: { title: 'লেনদেন', values: ['কিনি 1 → বেচি 2 (+1)', 'কিনি 0 → বেচি 2 (+2)'] },
      caption: 'নীল = কেনা, amber = বেচা, ম্লান = cooldown।',
    },
  },
];

export const stateMachineSim: PatternSimulation = {
  patternId: '9.10',
  input: 'prices = [1,2,3,0,2]',
  output: '3',
  steps,
};
