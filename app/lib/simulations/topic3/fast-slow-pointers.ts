import type { CellMark, LinkedListNode, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   3.1 Fast & Slow Pointers — Linked List Cycle II (LC 142)
   ========================================================================= */

const VALUES: Record<string, number> = { n0: 3, n1: 2, n2: 0, n3: -4 };
const ORDER = ['n0', 'n1', 'n2', 'n3'];
/** The tail loops back to n1 — this list has no end. */
const NEXT: Record<string, string> = { n0: 'n1', n1: 'n2', n2: 'n3', n3: 'n1' };

function chain(marks: Record<string, CellMark> = {}): LinkedListNode[] {
  return ORDER.map((id) => ({
    id,
    val: VALUES[id],
    nextId: NEXT[id],
    mark: marks[id],
  }));
}

/** Cursors on the same node stack up rather than overwrite each other. */
function scene(
  cursors: { name: string; nodeId: string }[],
  marks: Record<string, CellMark>,
  caption: string
) {
  return {
    kind: 'linked-list' as const,
    nodes: chain(marks),
    pointers: cursors,
    cycleTargetId: 'n1',
    caption,
  };
}

interface Move {
  slow: string;
  fast: string;
}

/** Verified by running the demo code over the cyclic list. */
const MOVES: Move[] = [
  { slow: 'n1', fast: 'n2' },
  { slow: 'n2', fast: 'n1' },
  { slow: 'n3', fast: 'n3' },
];

const steps: SimStep[] = [
  {
    id: '3.1-init',
    title: 'শুরু — দুজনেই head-এ',
    whatHappens:
      '`slow` ও `fast` দুটোই `head` (মান 3)-এ। এই লিস্টের শেষ নোড (−4) আবার মান 2-এর নোডে ফিরে যায় — তাই এর কোনো শেষ নেই।',
    whyItMatters:
      'শেষ না থাকায় সাধারণ traversal অসীমভাবে ঘুরবে। আবার প্রতিটা নোড একটা Set-এ রাখলে কাজ হয়, কিন্তু O(n) বাড়তি মেমরি লাগে। দুই গতির pointer সেটা O(1)-এ করে ফেলে।',
    highlightLines: [2, 3],
    vars: [
      { name: 'slow', value: '3' },
      { name: 'fast', value: '3' },
    ],
    scene: scene(
      [
        { name: 'slow', nodeId: 'n0' },
        { name: 'fast', nodeId: 'n0' },
      ],
      { n0: 'active' },
      'লক্ষ্য: cycle-টা কোন নোড থেকে শুরু, সেটা বের করা।'
    ),
  },

  ...MOVES.map((move, i): SimStep => {
    const met = move.slow === move.fast;
    const marks: Record<string, CellMark> = { [move.slow]: 'active', [move.fast]: 'active' };

    return {
      id: `3.1-move-${i + 1}`,
      title: met
        ? `${i + 1} ধাপ — দুজনে একই নোডে`
        : `${i + 1} ধাপ — slow এক ঘর, fast দুই ঘর`,
      whatHappens: `slow এগোল মান ${VALUES[move.slow]}-এ, fast এগোল দুই ঘর — মান ${VALUES[move.fast]}-এ।${
        met ? ' দুজনেই একই নোডে — লুপে ধরা পড়ল।' : ' এখনো আলাদা।'
      }`,
      whyItMatters:
        i === 0
          ? 'গতির পার্থক্য ঠিক ১ ঘর প্রতি ধাপে। তাই লুপের ভেতরে ঢুকে গেলে fast প্রতি ধাপে slow-এর দিকে এক ঘর করে এগোয় — কখনোই টপকে যেতে পারে না, মিলবেই। ট্র্যাকে দ্রুত দৌড়বিদ ধীরটাকে ল্যাপ করে ফেলার মতো।'
          : undefined,
      highlightLines: [4, 5, 6],
      vars: [
        { name: 'slow', value: VALUES[move.slow] },
        { name: 'fast', value: VALUES[move.fast] },
      ],
      scene: scene(
        [
          { name: 'slow', nodeId: move.slow },
          { name: 'fast', nodeId: move.fast },
        ],
        marks,
        met ? 'দুজনেই একই নোডে দাঁড়িয়ে।' : 'এখনো দূরত্ব আছে।'
      ),
    };
  }),

  {
    id: '3.1-met',
    title: 'মিলে গেল — cycle আছে, নিশ্চিত',
    whatHappens:
      '`slow === fast` — দুজনে একই নোডে (মান −4)। এটাই প্রমাণ যে লুপ আছে। কিন্তু এই মিলনস্থলটা cycle-এর **শুরু** নয়।',
    whyItMatters:
      'মিলনস্থল আর cycle-এর শুরু এক নয় — এটাই সবচেয়ে বড় ভুল বোঝাবুঝি। কিন্তু গণিতটা সুন্দর: head থেকে cycle-শুরু পর্যন্ত দূরত্ব আর মিলনস্থল থেকে cycle-শুরু পর্যন্ত দূরত্ব সবসময় সমান। তাই এখন দুটো pointer — একটা head থেকে, একটা মিলনস্থল থেকে — সমান গতিতে ছাড়লে তারা ঠিক cycle-এর শুরুতে মিলবে।',
    highlightLines: [7, 8],
    vars: [
      { name: 'slow', value: -4 },
      { name: 'fast', value: -4 },
    ],
    scene: scene(
      [
        { name: 'slow', nodeId: 'n3' },
        { name: 'fast', nodeId: 'n3' },
      ],
      { n3: 'active' },
      'মিলনস্থল পাওয়া গেল — কিন্তু cycle শুরু হয় আরও আগে।'
    ),
  },

  {
    id: '3.1-phase2-init',
    title: 'দ্বিতীয় পর্ব — head থেকে আরেকজন',
    whatHappens:
      '`p` বসল `head`-এ (মান 3), আর `slow` রইল মিলনস্থলে (মান −4)। এবার দুজনেই **সমান গতিতে** এক ঘর করে এগোবে।',
    whyItMatters:
      'এবার আর দুই গতি নয় — দুজনেই এক ঘর করে। কারণ এখন খোঁজা হচ্ছে না "লুপ আছে কি"; খোঁজা হচ্ছে "কোথায় শুরু", আর সেই দুটো দূরত্ব ইতিমধ্যেই সমান হয়ে আছে।',
    highlightLines: [9, 10],
    vars: [
      { name: 'p', value: 3 },
      { name: 'slow', value: -4 },
    ],
    scene: scene(
      [
        { name: 'p', nodeId: 'n0' },
        { name: 'slow', nodeId: 'n3' },
      ],
      { n0: 'active', n3: 'active' },
      'দুজনেই এখন সমান গতিতে এগোবে।'
    ),
  },

  {
    id: '3.1-phase2-step',
    title: 'এক ধাপ — দুজনেই মিলল',
    whatHappens:
      '`p` এগোল মান 2-এ, `slow` এগোল −4 থেকে (লুপ ধরে) মান 2-এ। দুজনেই একই নোডে — `p !== slow` আর সত্যি নয়, লুপ থামল।',
    highlightLines: [10, 11, 12],
    vars: [
      { name: 'p', value: 2 },
      { name: 'slow', value: 2 },
    ],
    scene: scene(
      [
        { name: 'p', nodeId: 'n1' },
        { name: 'slow', nodeId: 'n1' },
      ],
      { n0: 'done', n1: 'active' },
      'ঠিক এক ধাপেই দেখা — এটাই cycle-এর শুরু।'
    ),
  },

  {
    id: '3.1-done',
    title: 'শেষ — cycle শুরু মান 2-এর নোডে',
    whatHappens: 'উত্তর: মান 2-এর নোড (index 1) — এখান থেকেই লুপ শুরু।',
    whyItMatters:
      'সব মিলিয়ে O(n) সময়, O(1) জায়গা — নোডগুলো একটা Set-এ জমা করার দরকারই পড়ল না। দুই গতির pointer শুধু cycle খুঁজতে নয়, লিস্টের মাঝখান বের করা বা শেষ থেকে k-তম নোড পেতেও একই ছাঁচে কাজে লাগে।',
    highlightLines: [14],
    vars: [{ name: 'উত্তর', value: 'মান 2-এর নোড' }],
    scene: scene(
      [{ name: 'উত্তর', nodeId: 'n1' }],
      { n0: 'reject', n1: 'done', n2: 'done', n3: 'done' },
      'সবুজ অংশটাই cycle — শুরু মান 2-এর নোডে।'
    ),
  },
];

export const fastSlowPointersSim: PatternSimulation = {
  patternId: '3.1',
  input: 'head = [3,2,0,-4], tail → index 1',
  output: 'মান 2-এর নোড (index 1)',
  steps,
};
