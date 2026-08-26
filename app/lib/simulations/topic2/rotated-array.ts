import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   2.4 Bitonic / Rotated Array — Search in Rotated Sorted Array (LC 33)

   The array as a whole is not sorted, so the usual "compare with mid and pick
   a side" is unavailable. What rescues it: cutting at `mid` always leaves at
   least ONE half sorted, and a sorted half can be range-checked in O(1).
   That is why the sorted half is marked on every step — it is the half the
   decision is actually made from.
   ========================================================================= */

const NUMS = [4, 5, 6, 7, 0, 1, 2];
const TARGET = 0;

interface Probe {
  /** Bounds BEFORE the move. */
  lo: number;
  hi: number;
  mid: number;
  /** Which half `mid` leaves in sorted order. */
  sortedHalf: 'left' | 'right';
  /** Does the target fall inside that sorted half's range? */
  inSorted: boolean;
  matched: boolean;
  loAfter: number;
  hiAfter: number;
}

const PROBES: Probe[] = [
  { lo: 0, hi: 6, mid: 3, sortedHalf: 'left', inSorted: false, matched: false, loAfter: 4, hiAfter: 6 },
  { lo: 4, hi: 6, mid: 5, sortedHalf: 'left', inSorted: true, matched: false, loAfter: 4, hiAfter: 4 },
  { lo: 4, hi: 4, mid: 4, sortedHalf: 'left', inSorted: true, matched: true, loAfter: 4, hiAfter: 4 },
];

function marksFor(probe: Probe): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};

  // Outside the live range is already eliminated.
  for (let i = 0; i < NUMS.length; i++) {
    if (i < probe.lo || i > probe.hi) marks[i] = 'reject';
  }

  // The half that is in order — the one the range check can be trusted on.
  const [from, to] =
    probe.sortedHalf === 'left' ? [probe.lo, probe.mid] : [probe.mid, probe.hi];
  for (let i = from; i <= to; i++) marks[i] = 'done';

  marks[probe.mid] = 'active';
  return marks;
}

function highlightFor(probe: Probe): number[] {
  if (probe.matched) return [4, 5, 6];
  if (probe.sortedHalf === 'left') return probe.inSorted ? [4, 5, 7, 8, 9] : [4, 5, 7, 8, 10];
  return probe.inSorted ? [4, 5, 11, 12, 13] : [4, 5, 11, 12, 14];
}

const steps: SimStep[] = [
  {
    id: '2.4-init',
    title: 'শুরু — array ঘোরানো, তাই সাজানো নয়',
    whatHappens:
      '`nums = [4,5,6,7,0,1,2]` — সাজানো array-টা index 4-এ ঘুরিয়ে দেওয়া হয়েছে। `lo = 0`, `hi = 6`। target = 0।',
    whyItMatters:
      'পুরোটা সাজানো না হওয়ায় "nums[mid] target-এর চেয়ে ছোট না বড়" প্রশ্নটা একা যথেষ্ট নয় — উত্তরটা যেকোনো পাশে থাকতে পারে। কিন্তু একটা জিনিস সবসময় সত্যি: mid দিয়ে কাটলে অন্তত একটা অর্ধেক সাজানো থাকবেই। সেই অর্ধেকটাতেই সিদ্ধান্ত নেওয়া যায়।',
    highlightLines: [2, 3],
    vars: [
      { name: 'lo', value: 0 },
      { name: 'hi', value: 6 },
      { name: 'target', value: TARGET },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      pointers: [
        { name: 'lo', index: 0 },
        { name: 'hi', index: 6 },
      ],
      window: { from: 0, to: 6 },
      caption: 'index 4-এ ভাঙা আছে — 7-এর পর হঠাৎ 0।',
    },
  },

  ...PROBES.map((probe, i): SimStep => {
    if (probe.matched) {
      return {
        id: `2.4-probe-${i + 1}`,
        title: `mid = ${probe.mid} — পাওয়া গেল`,
        whatHappens: `mid = ${probe.mid}, nums[${probe.mid}] = ${NUMS[probe.mid]} — ঠিক target। সরাসরি ${probe.mid} রিটার্ন।`,
        whyItMatters:
          'সাত উপাদানের ঘোরানো array-তে লাগল তিনটে probe। ঘোরানো থাকা সত্ত্বেও খরচ O(log n)-ই থাকল — প্রতিবার অন্তত অর্ধেক নিশ্চিতভাবে বাদ গেছে।',
        highlightLines: highlightFor(probe),
        vars: [
          { name: 'lo', value: probe.lo },
          { name: 'hi', value: probe.hi },
          { name: 'mid', value: probe.mid },
        ],
        scene: {
          kind: 'array',
          values: NUMS,
          pointers: [{ name: 'lo·hi·mid', index: probe.mid }],
          marks: marksFor(probe),
          caption: `nums[${probe.mid}] = ${TARGET} — target।`,
        },
      };
    }

    const sortedFrom = probe.sortedHalf === 'left' ? probe.lo : probe.mid;
    const sortedTo = probe.sortedHalf === 'left' ? probe.mid : probe.hi;
    const half = probe.sortedHalf === 'left' ? 'বাম' : 'ডান';
    const goesRight = probe.loAfter !== probe.lo;

    return {
      id: `2.4-probe-${i + 1}`,
      title: `mid = ${probe.mid} — ${half} অর্ধেক সাজানো`,
      whatHappens: `mid = (${probe.lo} + ${probe.hi}) >> 1 = ${probe.mid}, nums[${probe.mid}] = ${NUMS[probe.mid]} — target নয়। nums[${probe.lo}] = ${NUMS[probe.lo]} ≤ nums[${probe.mid}] = ${NUMS[probe.mid]}, তাই ${half} অর্ধেক (index ${sortedFrom}‥${sortedTo}, মান ${NUMS[sortedFrom]}‥${NUMS[sortedTo]}) সাজানো। target ${TARGET} কি ওই পরিসরে? ${
        probe.inSorted
          ? `হ্যাঁ — তাই ওই দিকেই খোঁজা, hi = ${probe.hiAfter}।`
          : `না — তাই সাজানো অর্ধেকটা পুরো বাদ, lo = ${probe.loAfter}।`
      }`,
      whyItMatters:
        i === 0
          ? 'সিদ্ধান্তটা সবসময় **সাজানো** অর্ধেকের উপরেই নেওয়া হয় — কারণ সেখানে "target এই পরিসরে আছে কি" প্রশ্নের উত্তর দুটো তুলনাতেই মেলে। অন্য অর্ধেকে ভাঙাটা লুকিয়ে আছে, সেখানে এমন কোনো নিশ্চয়তা নেই। target সাজানো অর্ধেকে না থাকলে সে বাকিটাতেই আছে — অর্থাৎ ভাঙা অর্ধেকে না ঢুকেও তাকে বেছে নেওয়া যায়।'
          : i === 1
            ? `এবার সাজানো অর্ধেকটা ${NUMS[sortedFrom]}‥${NUMS[sortedTo]} — target ${TARGET} ঠিক এর ভেতরে (শুরুর মানটাই)। তাই এবার ওই দিকেই যাওয়া।`
            : undefined,
      highlightLines: highlightFor(probe),
      vars: [
        { name: 'mid', value: probe.mid },
        { name: 'nums[mid]', value: NUMS[probe.mid] },
        { name: 'sorted', value: probe.sortedHalf },
        { name: 'lo', value: probe.loAfter },
        { name: 'hi', value: probe.hiAfter },
      ],
      scene: {
        kind: 'array',
        values: NUMS,
        pointers: [
          { name: 'lo', index: probe.lo },
          { name: 'hi', index: probe.hi },
          { name: 'mid', index: probe.mid },
        ],
        window: { from: probe.loAfter, to: probe.hiAfter, label: 'এখনো বাকি' },
        marks: marksFor(probe),
        caption: `সবুজ অংশটাই সাজানো অর্ধেক — সিদ্ধান্ত ওখান থেকেই। ${goesRight ? 'target ওখানে নেই, তাই ডানে।' : 'target ওখানেই, তাই ওদিকেই।'}`,
      },
    };
  }),

  {
    id: '2.4-done',
    title: 'শেষ — target index 4-এ',
    whatHappens: 'target `0` পাওয়া গেছে index 4-এ। উত্তর `4`।',
    whyItMatters:
      'ঘূর্ণন-বিন্দু আলাদা করে খুঁজতে হয়নি। অনেকে আগে pivot বের করে তারপর দুই টুকরোয় binary search চালান — সেটাও চলে, কিন্তু দুই পাস লাগে। এখানে প্রতিটা probe-এই সাজানো অর্ধেকটা চিনে নেওয়ায় এক পাসেই কাজ হয়ে গেল।',
    highlightLines: [6],
    vars: [{ name: 'উত্তর', value: 4 }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: {
        0: 'reject', 1: 'reject', 2: 'reject', 3: 'reject',
        4: 'done', 5: 'reject', 6: 'reject',
      },
      output: { title: 'উত্তর', values: [4] },
      caption: 'তিনটে probe-এই সাত উপাদানের ঘোরানো array-তে target পাওয়া গেল।',
    },
  },
];

export const rotatedArraySim: PatternSimulation = {
  patternId: '2.4',
  input: 'nums = [4,5,6,7,0,1,2], target = 0',
  output: '4',
  steps,
};
