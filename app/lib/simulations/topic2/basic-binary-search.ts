import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   2.1 Basic Binary Search — Find First and Last Position (LC 34)

   Two passes over the same array with the same code, differing only in which
   way a match pushes the boundary. Drawn as two sub-timelines with an intro
   step between them, because a viewer who misses the hand-off reads the
   second pass as the first one starting over for no reason.
   ========================================================================= */

const NUMS = [5, 7, 7, 8, 8, 10];
const TARGET = 8;

interface Probe {
  pass: 'first' | 'last';
  /** Pointer positions BEFORE the move — where the labels are drawn. */
  lo: number;
  hi: number;
  mid: number;
  outcome: 'match' | 'small' | 'big';
  /** Best index recorded so far in this pass. */
  ans: number;
  loAfter: number;
  hiAfter: number;
}

const PROBES: Probe[] = [
  { pass: 'first', lo: 0, hi: 5, mid: 2, outcome: 'small', ans: -1, loAfter: 3, hiAfter: 5 },
  { pass: 'first', lo: 3, hi: 5, mid: 4, outcome: 'match', ans: 4, loAfter: 3, hiAfter: 3 },
  { pass: 'first', lo: 3, hi: 3, mid: 3, outcome: 'match', ans: 3, loAfter: 3, hiAfter: 2 },
  { pass: 'last', lo: 0, hi: 5, mid: 2, outcome: 'small', ans: -1, loAfter: 3, hiAfter: 5 },
  { pass: 'last', lo: 3, hi: 5, mid: 4, outcome: 'match', ans: 4, loAfter: 5, hiAfter: 5 },
  { pass: 'last', lo: 5, hi: 5, mid: 5, outcome: 'big', ans: 4, loAfter: 5, hiAfter: 4 },
];

/** Outside the live range is eliminated; `mid` is what is being tested. */
function marksFor(probe: Probe): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (let i = 0; i < NUMS.length; i++) {
    if (i < probe.lo || i > probe.hi) marks[i] = 'reject';
  }
  if (probe.ans >= 0) marks[probe.ans] = 'done';
  marks[probe.mid] = 'active';
  return marks;
}

function highlightFor(probe: Probe): number[] {
  if (probe.outcome === 'small') return [6, 7, 8, 13];
  if (probe.outcome === 'big') return [6, 7, 8, 13, 14];
  return probe.pass === 'first' ? [6, 7, 8, 9, 10, 11] : [6, 7, 8, 9, 10, 12];
}

function probeStep(probe: Probe, index: number): SimStep {
  const value = NUMS[probe.mid];
  const pushes = probe.pass === 'first' ? 'বামে' : 'ডানে';

  const whatHappens =
    probe.outcome === 'match'
      ? `mid = (${probe.lo} + ${probe.hi}) >> 1 = ${probe.mid}, nums[${probe.mid}] = ${value} — target পাওয়া গেল। ans = ${probe.mid} রেকর্ড হলো, কিন্তু থামা হলো না: ${pushes} চেপে দেখা হচ্ছে আরও একটা ${value} আছে কি না। তাই ${probe.pass === 'first' ? `hi = ${probe.mid} − 1 = ${probe.hiAfter}` : `lo = ${probe.mid} + 1 = ${probe.loAfter}`}।`
      : probe.outcome === 'small'
        ? `mid = ${probe.mid}, nums[${probe.mid}] = ${value} < ${TARGET} — target ডান পাশে। lo = ${probe.mid} + 1 = ${probe.loAfter}, বাঁ অর্ধেকটা বাদ।`
        : `mid = ${probe.mid}, nums[${probe.mid}] = ${value} > ${TARGET} — target বাঁ পাশে। hi = ${probe.mid} − 1 = ${probe.hiAfter}, ডান অর্ধেকটা বাদ।`;

  const whyItMatters =
    index === 1
      ? 'সাধারণ binary search এখানেই থেমে যেত। কিন্তু প্রশ্ন "target আছে কি" নয়, "প্রথমটা কোথায়" — তাই match পেয়েও থামা যায় না, বরং সেটা মনে রেখে আরও বামে খোঁজা চালাতে হয়। এই "রেকর্ড করে চালিয়ে যাও" চালটাই boundary খোঁজার কেন্দ্র।'
      : index === 2
        ? 'hi এখন lo-এর বাঁয়ে চলে গেল, তাই লুপ থামল। সর্বশেষ রেকর্ড হওয়া ans-ই প্রথম occurrence — কারণ প্রতিবার আরও বামে গিয়েই নতুন ans লেখা হয়েছে।'
        : index === 5
          ? 'দুই pass মিলিয়ে খরচ 2 × O(log n), যা এখনো O(log n)। গুনতে চাইলে `last − first + 1` — পুরো array না ঘেঁটেই।'
          : undefined;

  return {
    id: `2.1-${probe.pass}-${index}`,
    title:
      probe.outcome === 'match'
        ? `mid = ${probe.mid} — পাওয়া গেল, তবু ${pushes} চাপুন`
        : probe.outcome === 'small'
          ? `mid = ${probe.mid} — ছোট, ডানে যান`
          : `mid = ${probe.mid} — বড়, বামে যান`,
    whatHappens,
    whyItMatters,
    highlightLines: highlightFor(probe),
    vars: [
      { name: 'pass', value: probe.pass === 'first' ? 'first' : 'last' },
      { name: 'lo', value: probe.loAfter },
      { name: 'hi', value: probe.hiAfter },
      { name: 'mid', value: probe.mid },
      { name: 'ans', value: probe.ans },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: probe.lo },
        { name: 'hi', index: probe.hi },
        { name: 'mid', index: probe.mid },
      ],
      window: probe.lo <= probe.hi ? { from: probe.lo, to: probe.hi } : undefined,
      marks: marksFor(probe),
      caption:
        probe.ans >= 0
          ? `${probe.pass === 'first' ? 'প্রথম' : 'শেষ'} occurrence-এর সেরা প্রার্থী: index ${probe.ans}`
          : 'এখনো কোনো প্রার্থী পাওয়া যায়নি।',
    },
  };
}

const steps: SimStep[] = [
  {
    id: '2.1-init',
    title: 'Pass ১ — প্রথম occurrence খোঁজা',
    whatHappens:
      '`bound(true)` চালু। `lo = 0`, `hi = 5`, `ans = -1`। লক্ষ্য: 8 প্রথম কোথায় আছে।',
    whyItMatters:
      'array সাজানো, তাই সমান মানগুলো পাশাপাশিই থাকবে। একই কোড দুবার — একবার match পেলে বামে চেপে, একবার ডানে চেপে — দুই প্রান্ত বের করে আনে। দুটো আলাদা ফাংশন লিখতে হয় না।',
    highlightLines: [1, 2, 3, 4, 5],
    vars: [
      { name: 'pass', value: 'first' },
      { name: 'lo', value: 0 },
      { name: 'hi', value: 5 },
      { name: 'ans', value: -1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 0 },
        { name: 'hi', index: 5 },
      ],
      window: { from: 0, to: 5 },
      caption: 'nums = [5,7,7,8,8,10], target = 8 — 8 আছে index 3 ও 4-এ।',
    },
  },

  ...PROBES.slice(0, 3).map((probe, i) => probeStep(probe, i)),

  {
    id: '2.1-pass2',
    title: 'Pass ২ — এবার শেষ occurrence',
    whatHappens:
      '`first = 3` পাওয়া গেল। এখন `bound(false)` — একই কোড, শুধু match পেলে এবার ডানে চাপা হবে। lo, hi, ans আবার শুরুর অবস্থায়।',
    whyItMatters:
      '`isFirst` পতাকাটাই একমাত্র পার্থক্য। match পেলে কোন দিকে চাপব — এই এক সিদ্ধান্ত উল্টে দিলেই "প্রথম খোঁজা" হয়ে যায় "শেষ খোঁজা"।',
    highlightLines: [18, 3, 4, 5],
    vars: [
      { name: 'first', value: 3 },
      { name: 'pass', value: 'last' },
      { name: 'lo', value: 0 },
      { name: 'hi', value: 5 },
      { name: 'ans', value: -1 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 0 },
        { name: 'hi', index: 5 },
      ],
      window: { from: 0, to: 5 },
      marks: { 3: 'done' },
      caption: 'প্রথম occurrence = index 3। এখন শেষটা খোঁজা হবে।',
    },
  },

  ...PROBES.slice(3).map((probe, i) => probeStep(probe, i + 3)),

  {
    id: '2.1-done',
    title: 'শেষ — উত্তর [3, 4]',
    whatHappens:
      'দ্বিতীয় pass-ও শেষ, `last = 4`। উত্তর `[3, 4]` — অর্থাৎ 8 আছে index 3 থেকে 4 পর্যন্ত, মোট 2 বার।',
    whyItMatters:
      'boundary খোঁজার এই ছাঁচটা "প্রথম/শেষ" ছাড়াও কাজে লাগে — "target-এর চেয়ে বড় প্রথম উপাদান" (lower/upper bound) একই কোড, শুধু শর্তটা বদলে।',
    highlightLines: [18],
    vars: [
      { name: 'first', value: 3 },
      { name: 'last', value: 4 },
      { name: 'গণনা', value: 2 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      window: { from: 3, to: 4, label: 'target-এর পুরো ব্যাপ্তি' },
      marks: { 0: 'reject', 1: 'reject', 2: 'reject', 3: 'done', 4: 'done', 5: 'reject' },
      output: { title: 'উত্তর', values: [3, 4] },
      caption: '8 আছে index 3 ও 4-এ — গণনা = 4 − 3 + 1 = 2।',
    },
  },
];

export const basicBinarySearchSim: PatternSimulation = {
  patternId: '2.1',
  input: 'nums = [5,7,7,8,8,10], target = 8',
  output: '[3, 4]',
  steps,
};
