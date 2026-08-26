import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   1.3 Prefix Sum — Subarray Sum Equals K (LC 560)
   ========================================================================= */

const NUMS = [1, 1, 1];
const K = 2;

interface Tick {
  index: number;
  sum: number;
  /** `sum - k` — the earlier prefix that would complete a subarray. */
  wanted: number;
  found: number;
  count: number;
  /** `seen` AFTER this iteration's insert. */
  seen: [number, number][];
}

const TICKS: Tick[] = [
  { index: 0, sum: 1, wanted: -1, found: 0, count: 0, seen: [[0, 1], [1, 1]] },
  { index: 1, sum: 2, wanted: 0, found: 1, count: 1, seen: [[0, 1], [1, 1], [2, 1]] },
  { index: 2, sum: 3, wanted: 1, found: 1, count: 2, seen: [[0, 1], [1, 1], [2, 1], [3, 1]] },
];

function seenTable(entries: [number, number][], wanted?: number) {
  return {
    title: 'seen — prefix sum কতবার দেখা গেছে',
    entries: entries.map(([key, value]) => ({
      key: String(key),
      value,
      mark: (key === wanted ? 'active' : 'done') as CellMark,
    })),
  };
}

/** Everything before the cursor is consumed; the cursor itself is live. */
function marksUpTo(current: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (let i = 0; i < current; i++) marks[i] = 'done';
  marks[current] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '1.3-init',
    title: 'শুরু — খালি prefix আগেই গোনা',
    whatHappens:
      '`seen` শুরু হয় `{0: 1}` দিয়ে — অর্থাৎ "যোগফল 0" একবার দেখা গেছে, index শুরুর আগেই। `sum = 0`, `count = 0`।',
    whyItMatters:
      'ওই `{0: 1}` এন্ট্রিটাই সবচেয়ে সহজে ভুল হয়। এটা না থাকলে array-র একদম শুরু থেকে শুরু হওয়া subarray-গুলো কখনো গোনা হতো না — কারণ তাদের ক্ষেত্রে "আগের prefix" মানে কিছুই না, অর্থাৎ 0।',
    highlightLines: [2, 3, 4],
    vars: [
      { name: 'sum', value: 0 },
      { name: 'count', value: 0 },
      { name: 'k', value: K },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      table: seenTable([[0, 1]]),
      caption: 'লক্ষ্য: যত subarray-র যোগফল ঠিক 2, তাদের সংখ্যা গোনা।',
    },
  },

  ...TICKS.map((tick, i): SimStep => {
    const gained = tick.count - (TICKS[i - 1]?.count ?? 0);
    return {
      id: `1.3-tick-${i + 1}`,
      title: `index ${tick.index} — sum হলো ${tick.sum}`,
      whatHappens: `x = ${NUMS[tick.index]} যোগ হয়ে চলমান sum দাঁড়াল ${tick.sum}। প্রশ্ন: আগে কোথাও prefix sum ${tick.wanted} (= ${tick.sum} − ${K}) ছিল? seen বলছে ${tick.found} বার। তাই count বেড়ে ${tick.count}।`,
      whyItMatters:
        i === 0
          ? 'কেন `sum − k` খুঁজি? কারণ কোনো subarray-র যোগফল k হওয়া মানে তার শুরুর ঠিক আগের prefix sum ছিল `sum − k`। অর্থাৎ "যোগফল খোঁজা" প্রশ্নটা "আগে এই সংখ্যাটা দেখেছি কি" প্রশ্নে বদলে যায় — যেটা map-এ O(1)।'
          : gained > 0
            ? `prefix sum ${tick.wanted} আগে ${tick.found} বার হয়েছিল, তাই এখানে শেষ হওয়া ${gained}টা subarray-র যোগফল ঠিক ${K}।`
            : undefined,
      highlightLines: [5, 6, 7, 8],
      vars: [
        { name: 'x', value: NUMS[tick.index] },
        { name: 'sum', value: tick.sum },
        { name: 'sum − k', value: tick.wanted },
        { name: 'count', value: tick.count },
      ],
      scene: {
        kind: 'array',
        values: NUMS,
        marks: marksUpTo(tick.index),
        table: seenTable(tick.seen, tick.wanted),
        caption: `এ পর্যন্ত পাওয়া subarray সংখ্যা: ${tick.count}`,
      },
    };
  }),

  {
    id: '1.3-done',
    title: 'শেষ — উত্তর 2',
    whatHappens:
      'array শেষ। যোগফল 2 হওয়া subarray দুটো: `[1,1]` (index 0‑1) এবং `[1,1]` (index 1‑2)।',
    whyItMatters:
      'এক পাসেই উত্তর — O(n) সময়। প্রতিটা শুরু-শেষ জোড়া ধরে ধরে যোগ করলে O(n²) লাগত, আর array বড় হলে সেটাই টাইম-লিমিটে আটকায়।',
    highlightLines: [10],
    vars: [{ name: 'count', value: 2 }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'done', 1: 'done', 2: 'done' },
      table: seenTable([[0, 1], [1, 1], [2, 1], [3, 1]]),
      output: { title: 'উত্তর', values: [2] },
      caption: 'দুটো subarray-র যোগফল ঠিক 2।',
    },
  },
];

export const prefixSumSim: PatternSimulation = {
  patternId: '1.3',
  input: 'nums = [1,1,1], k = 2',
  output: '2',
  steps,
};
