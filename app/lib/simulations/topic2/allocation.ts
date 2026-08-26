import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   2.3 Allocation Problems — Split Array Largest Sum (LC 410)

   Same shape as 2.2: the row is the space of candidate caps, not `nums`. The
   only real difference is where the bounds come from — `max(nums)` at the
   bottom (one part must at least hold the biggest element) and `sum(nums)` at
   the top (one part holding everything).
   ========================================================================= */

const NUMS = [7, 2, 5, 10, 8];
const K = 2;

const MIN_CAP = Math.max(...NUMS);
const MAX_CAP = NUMS.reduce((a, b) => a + b, 0);
/** Candidate caps, in order. A cap's cell index is `cap - MIN_CAP`. */
const CAPS = Array.from({ length: MAX_CAP - MIN_CAP + 1 }, (_, i) => i + MIN_CAP);

const at = (cap: number) => cap - MIN_CAP;

interface Probe {
  /** Bounds BEFORE the move. */
  lo: number;
  hi: number;
  mid: number;
  /** Greedy split at cap `mid`. */
  groups: number[][];
  parts: number;
  canSplit: boolean;
  loAfter: number;
  hiAfter: number;
}

const PROBES: Probe[] = [
  {
    lo: 10, hi: 32, mid: 21,
    groups: [[7, 2, 5], [10, 8]], parts: 2, canSplit: true,
    loAfter: 10, hiAfter: 21,
  },
  {
    lo: 10, hi: 21, mid: 15,
    groups: [[7, 2, 5], [10], [8]], parts: 3, canSplit: false,
    loAfter: 16, hiAfter: 21,
  },
  {
    lo: 16, hi: 21, mid: 18,
    groups: [[7, 2, 5], [10, 8]], parts: 2, canSplit: true,
    loAfter: 16, hiAfter: 18,
  },
  {
    lo: 16, hi: 18, mid: 17,
    groups: [[7, 2, 5], [10], [8]], parts: 3, canSplit: false,
    loAfter: 18, hiAfter: 18,
  },
];

const groupLabel = (group: number[]) => `${group.join('+')}=${group.reduce((a, b) => a + b, 0)}`;

function numsTable() {
  return {
    title: 'nums — যে ক্রম ভাঙা যাবে না',
    entries: NUMS.map((value) => ({ key: String(value) })),
  };
}

function marksFor(lo: number, hi: number, mid?: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (const cap of CAPS) {
    if (cap < lo || cap > hi) marks[at(cap)] = 'reject';
  }
  if (mid !== undefined) marks[at(mid)] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '2.3-init',
    title: 'শুরু — সম্ভাব্য cap-এর সীমা',
    whatHappens: `সবচেয়ে ছোট সম্ভাব্য cap = \`max(nums)\` = ${MIN_CAP} (একটা ভাগে অন্তত সবচেয়ে বড় সংখ্যাটা ধরতেই হবে), সবচেয়ে বড় = \`sum(nums)\` = ${MAX_CAP} (সব একটাই ভাগে)। তাই \`lo = ${MIN_CAP}\`, \`hi = ${MAX_CAP}\`।`,
    whyItMatters:
      'সীমা দুটো যেমন-তেমন বাছা নয় — দুটোই প্রমাণসাপেক্ষ। এর নিচে কোনো cap অসম্ভব, এর উপরে কোনো cap অপ্রয়োজনীয়। ভুল সীমা দিলে উত্তর পরিসরের বাইরে পড়ে যেতে পারে, আর binary search সেটা কখনোই খুঁজে পাবে না।',
    highlightLines: [14, 15],
    vars: [
      { name: 'lo', value: MIN_CAP },
      { name: 'hi', value: MAX_CAP },
      { name: 'k', value: K },
    ],
    scene: {
      kind: 'array',
      values: CAPS,
      pointers: [
        { name: 'lo', index: at(MIN_CAP) },
        { name: 'hi', index: at(MAX_CAP) },
      ],
      window: { from: at(MIN_CAP), to: at(MAX_CAP), label: 'সম্ভাব্য cap' },
      table: numsTable(),
      caption: `উপরের সারি nums নয় — এগুলো সম্ভাব্য **cap** (এক ভাগের সর্বোচ্চ যোগফল)। লক্ষ্য: ${K} ভাগে ভাঙলে সবচেয়ে বড় ভাগটা যত ছোট রাখা যায়।`,
    },
  },

  ...PROBES.map((probe, i): SimStep => {
    const split = probe.groups.map(groupLabel).join(' | ');
    return {
      id: `2.3-probe-${i + 1}`,
      title: probe.canSplit
        ? `cap = ${probe.mid} — ${probe.parts} ভাগে হয়, আরও চাপা যায়`
        : `cap = ${probe.mid} — ${probe.parts} ভাগ লাগে, বড্ড কড়া`,
      whatHappens: `mid = ${probe.mid}। বাঁ থেকে লোভীভাবে ভরতে থাকলে ভাগ হয়: ${split} — মোট ${probe.parts} ভাগ। ${
        probe.canSplit
          ? `${probe.parts} ≤ ${K}, তাই এই cap চলে। আরও ছোট cap-ও হতে পারে, তাই hi = mid = ${probe.hiAfter}।`
          : `${probe.parts} > ${K}, তাই এই cap খুব ছোট। lo = mid + 1 = ${probe.loAfter}।`
      }`,
      whyItMatters:
        i === 0
          ? 'ভেতরের `canSplit` লোভী (greedy) — যতক্ষণ cap ছাড়ায় না ততক্ষণ ভরে যায়, তারপর নতুন ভাগ। এটাই ন্যূনতম ভাগসংখ্যা দেয়, কারণ আগেভাগে ভাগ করলে ভাগ কমে না, বাড়েই। তাই "এই cap-এ k ভাগে হয় কি" প্রশ্নের উত্তর এক পাসেই পাওয়া যায়।'
          : i === 1
            ? 'cap কমালে ভাগ বাড়ে, কখনো কমে না — এই একঘেয়ে সম্পর্কটাই binary search-কে বৈধ করে। এটা না থাকলে অর্ধেক বাদ দেওয়ার কোনো ভিত্তি থাকত না।'
            : i === 3
              ? 'cap 17-এ ৩ ভাগ লেগে গেল, তাই lo উঠে 18-এ ঠেকল — আর hi-ও 18। পরিসরে একটাই মান বাকি, লুপ থামে।'
              : undefined,
      highlightLines: probe.canSplit ? [16, 17, 18] : [16, 17, 19],
      vars: [
        { name: 'mid (cap)', value: probe.mid },
        { name: 'parts', value: probe.parts },
        { name: 'canSplit', value: probe.canSplit ? 'true' : 'false' },
        { name: 'lo', value: probe.loAfter },
        { name: 'hi', value: probe.hiAfter },
      ],
      scene: {
        kind: 'array',
        values: CAPS,
        pointers: [
          { name: 'lo', index: at(probe.lo) },
          { name: 'hi', index: at(probe.hi) },
          { name: 'mid', index: at(probe.mid) },
        ],
        window: { from: at(probe.loAfter), to: at(probe.hiAfter), label: 'এখনো বাকি পরিসর' },
        marks: marksFor(probe.lo, probe.hi, probe.mid),
        table: numsTable(),
        output: { title: `cap ${probe.mid}-এ ভাগ`, values: probe.groups.map(groupLabel) },
        caption: `${probe.parts} ভাগ ${probe.canSplit ? '≤' : '>'} k = ${K}`,
      },
    };
  }),

  {
    id: '2.3-done',
    title: 'শেষ — সবচেয়ে ছোট cap 18',
    whatHappens:
      '`lo === hi === 18`, লুপ থামল। ভাগ দুটো: `7+2+5 = 14` আর `10+8 = 18` — সবচেয়ে বড় ভাগ 18। cap 17-এ ২ ভাগে হতো না।',
    whyItMatters:
      '২৩টা সম্ভাব্য cap-এর মধ্যে পরীক্ষা করতে হলো মাত্র ৪টা। খরচ O(n · log(sum)) — সরাসরি সব ভাগ-বিন্যাস দেখলে সেটা exponential হতো। "উত্তরটা কী" খোঁজার বদলে "এই উত্তরটা কি চলে" যাচাই করা — এই উল্টে দেওয়াটাই পুরো পরিবারটার চাল।',
    highlightLines: [21],
    vars: [{ name: 'উত্তর', value: 18 }],
    scene: {
      kind: 'array',
      values: CAPS,
      marks: { ...marksFor(18, 18), [at(18)]: 'done' },
      pointers: [{ name: 'lo·hi', index: at(18) }],
      table: numsTable(),
      output: { title: 'চূড়ান্ত ভাগ', values: ['7+2+5=14', '10+8=18'] },
      caption: 'সবচেয়ে বড় ভাগটার যোগফল 18 — এর চেয়ে ছোট করা যায় না।',
    },
  },
];

export const allocationSim: PatternSimulation = {
  patternId: '2.3',
  input: 'nums = [7,2,5,10,8], k = 2',
  output: '18',
  steps,
};
