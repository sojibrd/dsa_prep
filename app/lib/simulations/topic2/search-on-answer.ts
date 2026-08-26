import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   2.2 Binary Search on Answer — Koko Eating Bananas (LC 875)

   The row drawn here is NOT `piles`. It is the space of candidate speeds,
   1 to max(piles) — because that is what the search actually halves. Drawing
   `piles` and putting lo/hi/mid over it would show three pointers indexing an
   array they never index, which is exactly the confusion this pattern breeds.

   `piles` still matters, so it rides in the side table with the hours each
   pile costs at the speed under test.
   ========================================================================= */

const PILES = [3, 6, 7, 11];
const HOURS_LIMIT = 8;

const MIN_SPEED = 1;
const MAX_SPEED = Math.max(...PILES);
/** Candidate speeds, in order. A speed's cell index is `speed - MIN_SPEED`. */
const SPEEDS = Array.from({ length: MAX_SPEED - MIN_SPEED + 1 }, (_, i) => i + MIN_SPEED);

const at = (speed: number) => speed - MIN_SPEED;

interface Probe {
  /** Bounds BEFORE the move. */
  lo: number;
  hi: number;
  mid: number;
  /** Hours each pile costs at speed `mid`. */
  perPile: number[];
  hours: number;
  canFinish: boolean;
  loAfter: number;
  hiAfter: number;
}

const PROBES: Probe[] = [
  { lo: 1, hi: 11, mid: 6, perPile: [1, 1, 2, 2], hours: 6, canFinish: true, loAfter: 1, hiAfter: 6 },
  { lo: 1, hi: 6, mid: 3, perPile: [1, 2, 3, 4], hours: 10, canFinish: false, loAfter: 4, hiAfter: 6 },
  { lo: 4, hi: 6, mid: 5, perPile: [1, 2, 2, 3], hours: 8, canFinish: true, loAfter: 4, hiAfter: 5 },
  { lo: 4, hi: 5, mid: 4, perPile: [1, 2, 2, 3], hours: 8, canFinish: true, loAfter: 4, hiAfter: 4 },
];

function pilesTable(perPile?: number[], speed?: number) {
  return {
    title: perPile ? `piles — speed ${speed}-এ কত ঘণ্টা` : 'piles',
    entries: PILES.map((pile, i) => ({
      key: String(pile),
      value: perPile?.[i],
      mark: (perPile ? 'fill' : undefined) as CellMark | undefined,
    })),
  };
}

/** Speeds outside the live range are eliminated; `mid` is under test. */
function marksFor(lo: number, hi: number, mid?: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (const speed of SPEEDS) {
    if (speed < lo || speed > hi) marks[at(speed)] = 'reject';
  }
  if (mid !== undefined) marks[at(mid)] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '2.2-init',
    title: 'শুরু — উত্তরের পুরো পরিসর',
    whatHappens:
      'সবচেয়ে ধীর সম্ভাব্য গতি 1, আর সবচেয়ে দ্রুত দরকারি গতি `max(piles) = 11` (এর বেশি গতি থাকলেও প্রতি গুচ্ছে এক ঘণ্টার কমে খাওয়া যায় না)। তাই `lo = 1`, `hi = 11`।',
    whyItMatters:
      'এখানে binary search চলছে **array-র উপর নয়, উত্তরের উপর**। মূল শর্ত: গতি বাড়লে লাগা সময় কখনো বাড়ে না — অর্থাৎ "পারবে/পারবে না" একদিকেই বদলায়। এই একঘেয়ে (monotonic) আচরণটাই অর্ধেক করে ফেলার অধিকার দেয়।',
    highlightLines: [3, 4],
    vars: [
      { name: 'lo', value: 1 },
      { name: 'hi', value: 11 },
      { name: 'h', value: HOURS_LIMIT },
    ],
    scene: {
      kind: 'array',
      values: SPEEDS,
      pointers: [
        { name: 'lo', index: at(1) },
        { name: 'hi', index: at(11) },
      ],
      window: { from: at(1), to: at(11), label: 'সম্ভাব্য গতির পরিসর' },
      table: pilesTable(),
      caption:
        'উপরের সারি piles নয় — এগুলো সম্ভাব্য **গতি** (কলা/ঘণ্টা)। lo, hi, mid এই গতিগুলোকেই দেখাচ্ছে।',
    },
  },

  ...PROBES.map((probe, i): SimStep => {
    const sum = probe.perPile.join(' + ');
    return {
      id: `2.2-probe-${i + 1}`,
      title: probe.canFinish
        ? `গতি ${probe.mid} — হয়ে যায়, আরও ধীরে চেষ্টা`
        : `গতি ${probe.mid} — হয় না, দ্রুততর লাগবে`,
      whatHappens: `mid = (${probe.lo} + ${probe.hi}) >> 1 = ${probe.mid}। এই গতিতে প্রতি গুচ্ছে লাগে ${sum} = ${probe.hours} ঘণ্টা, সীমা ${HOURS_LIMIT}। ${
        probe.canFinish
          ? `${probe.hours} ≤ ${HOURS_LIMIT} — হয়ে যায়। কিন্তু আরও ধীর গতিতেও হতে পারে, তাই hi = mid = ${probe.hiAfter} (mid নিজেও প্রার্থী, তাই বাদ দেওয়া হয় না)।`
          : `${probe.hours} > ${HOURS_LIMIT} — হয় না। তাই ${probe.mid} ও তার চেয়ে ধীর সব গতি বাদ, lo = mid + 1 = ${probe.loAfter}।`
      }`,
      whyItMatters:
        i === 0
          ? '`hi = mid`, `hi = mid − 1` নয় — এটাই এই ছাঁচের সবচেয়ে বড় ফাঁদ। mid নিজেই কাজ করেছে, তাই সে এখনো সেরা উত্তরের প্রার্থী; বাদ দিয়ে দিলে সঠিক উত্তরটাই হারিয়ে যেতে পারে।'
          : i === 1
            ? 'উল্টো দিকে, "হয় না" মানে mid নিশ্চিতভাবে বাদ — তাই সেখানে `lo = mid + 1` লেখা নিরাপদ। এই অসমতাই লুপকে থামতে দেয়; দুই পাশেই `mid` রেখে দিলে অসীম লুপ হতো।'
            : i === 3
              ? '`lo === hi` হয়ে গেল, পরিসরে একটাই গতি বাকি — সেটাই উত্তর। `while (lo < hi)` শর্তে লুপ এখানে নিজে থেকেই থামে।'
              : undefined,
      highlightLines: probe.canFinish ? [5, 6, 7, 8, 2] : [5, 6, 7, 9, 2],
      vars: [
        { name: 'mid (গতি)', value: probe.mid },
        { name: 'ঘণ্টা', value: probe.hours },
        { name: 'canFinish', value: probe.canFinish ? 'true' : 'false' },
        { name: 'lo', value: probe.loAfter },
        { name: 'hi', value: probe.hiAfter },
      ],
      scene: {
        kind: 'array',
        values: SPEEDS,
        pointers: [
          { name: 'lo', index: at(probe.lo) },
          { name: 'hi', index: at(probe.hi) },
          { name: 'mid', index: at(probe.mid) },
        ],
        window: { from: at(probe.loAfter), to: at(probe.hiAfter), label: 'এখনো বাকি পরিসর' },
        marks: marksFor(probe.lo, probe.hi, probe.mid),
        table: pilesTable(probe.perPile, probe.mid),
        caption: `${probe.hours} ঘণ্টা ${probe.canFinish ? '≤' : '>'} ${HOURS_LIMIT} — ${probe.canFinish ? 'এই গতি চলে' : 'এই গতি যথেষ্ট নয়'}।`,
      },
    };
  }),

  {
    id: '2.2-done',
    title: 'শেষ — সবচেয়ে ধীর কার্যকর গতি 4',
    whatHappens:
      '`lo === hi === 4`, লুপ থামল। গতি 4-এ লাগে ঠিক 8 ঘণ্টা — সীমার সমান। গতি 3-এ লাগত 10 ঘণ্টা, যা বেশি। তাই উত্তর `4`।',
    whyItMatters:
      '১১টা গতি একে একে পরীক্ষা করলে ১১ বার `canFinish` চালাতে হতো; এখানে লাগল মাত্র ৪ বার। মোট খরচ O(n · log(max piles)) — যেখানে log-টা উত্তরের পরিসরের, array-র দৈর্ঘ্যের নয়।',
    highlightLines: [11],
    vars: [{ name: 'উত্তর', value: 4 }],
    scene: {
      kind: 'array',
      values: SPEEDS,
      marks: { ...marksFor(4, 4), [at(4)]: 'done' },
      pointers: [{ name: 'lo·hi', index: at(4) }],
      table: pilesTable([1, 2, 2, 3], 4),
      output: { title: 'সবচেয়ে ধীর কার্যকর গতি', values: [4] },
      caption: 'গতি 4 → 1 + 2 + 2 + 3 = 8 ঘণ্টা, ঠিক সীমার মধ্যে।',
    },
  },
];

export const searchOnAnswerSim: PatternSimulation = {
  patternId: '2.2',
  input: 'piles = [3,6,7,11], h = 8',
  output: '4',
  steps,
};
