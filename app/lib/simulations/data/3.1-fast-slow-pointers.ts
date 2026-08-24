import type { PatternSimulation, SimStep, LinkedListNode } from '../types';

/**
 * 3.1 Fast & Slow Pointers — detectCycle (LC 142: Linked List Cycle II).
 *
 * Two phases:
 * Phase 1: slow moves 1 step, fast moves 2 steps — when they meet, a cycle
 *          exists.
 * Phase 2: one pointer resets to head, both move 1 step — where they meet
 *          is the cycle start.
 *
 * Concrete input: [3] → [2] → [0] → [-4] ↺ back to [2]
 * Output: Node with value 2 (cycle start)
 */

/** Fixed node ids for the 4-node cycle list. */
const N3 = 'n3';
const N2 = 'n2';
const N0 = 'n0';
const N4 = 'n-4';

/** The list structure — never changes across steps, only marks and pointers do. */
function nodes(marks?: Partial<Record<string, 'active' | 'done' | 'fill'>>): LinkedListNode[] {
  return [
    { id: N3, val: 3, nextId: N2, mark: marks?.[N3] },
    { id: N2, val: 2, nextId: N0, mark: marks?.[N2] },
    { id: N0, val: 0, nextId: N4, mark: marks?.[N0] },
    { id: N4, val: -4, nextId: N2, mark: marks?.[N4] }, // cycle back to n2
  ];
}

const steps: SimStep[] = [
  // ── Phase 1: Find Intersection ────────────────────────────────────────
  {
    id: 'init',
    title: 'শুরু — slow ও fast দুটোই head-এ',
    whatHappens:
      'slow = head (3), fast = head (3)। দুই পয়েন্টার একই নোড থেকে যাত্রা শুরু।',
    whyItMatters:
      'fast ২ ধাপ, slow ১ ধাপ — সাইকেল থাকলে fast একসময় slow-কে ধরে ফেলবে (পার্থক্য প্রতি ধাপে ১ কমে)।',
    highlightLines: [2, 3],
    vars: [
      { name: 'slow', value: 3 },
      { name: 'fast', value: 3 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: nodes(),
      pointers: [
        { name: 'slow', nodeId: N3 },
        { name: 'fast', nodeId: N3 },
      ],
      cycleTargetId: N2,
      caption: '[3] → [2] → [0] → [-4] ↺ [2] — সাইকেল আছে কি?',
    },
  },

  {
    id: 'p1-1',
    title: 'ধাপ ১ — slow→2, fast→0',
    whatHappens:
      'slow ১ ধাপ: 3→2। fast ২ ধাপ: 3→2→0। এখনো আলাদা।',
    highlightLines: [4, 5, 6],
    vars: [
      { name: 'slow', value: 2 },
      { name: 'fast', value: 0 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: nodes({ [N3]: 'done' }),
      pointers: [
        { name: 'slow', nodeId: N2 },
        { name: 'fast', nodeId: N0 },
      ],
      cycleTargetId: N2,
      caption: 'slow=2, fast=0 — এখনো মিলেনি',
    },
  },

  {
    id: 'p1-2',
    title: 'ধাপ ২ — slow→0, fast→2 (সাইকেল ঘুরে)',
    whatHappens:
      'slow ১ ধাপ: 2→0। fast ২ ধাপ: 0→(-4)→2 (সাইকেল ঘুরে)। এখনো আলাদা।',
    highlightLines: [4, 5, 6],
    vars: [
      { name: 'slow', value: 0 },
      { name: 'fast', value: 2 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: nodes({ [N3]: 'done' }),
      pointers: [
        { name: 'slow', nodeId: N0 },
        { name: 'fast', nodeId: N2 },
      ],
      cycleTargetId: N2,
      caption: 'slow=0, fast=2 — fast সাইকেলে ঢুকে ঘুরছে',
    },
  },

  {
    id: 'p1-3',
    title: 'ধাপ ৩ — slow→-4, fast→-4 — মিলে গেছে!',
    whatHappens:
      'slow ১ ধাপ: 0→(-4)। fast ২ ধাপ: 2→0→(-4)। slow === fast! সাইকেল নিশ্চিত।',
    whyItMatters:
      'মিলনবিন্দু মানেই সাইকেল আছে — কিন্তু এটি সাইকেলের শুরুর নোড নাও হতে পারে। শুরুটা বের করতে Phase 2 লাগবে।',
    highlightLines: [4, 5, 6, 7],
    vars: [
      { name: 'slow', value: -4 },
      { name: 'fast', value: -4 },
      { name: 'মিলন?', value: '✓' },
    ],
    scene: {
      kind: 'linked-list',
      nodes: nodes({ [N3]: 'done', [N4]: 'active' }),
      pointers: [
        { name: 'slow', nodeId: N4 },
        { name: 'fast', nodeId: N4 },
      ],
      cycleTargetId: N2,
      caption: 'slow === fast (-4) — সাইকেল নিশ্চিত!',
    },
  },

  // ── Phase 2: Find Cycle Start ─────────────────────────────────────────
  {
    id: 'p2-init',
    title: 'Phase 2 — p=head, slow থাকে -4-এ',
    whatHappens:
      'নতুন পয়েন্টার p = head (3)। slow আগের জায়গায় (-4)। এবার দুজনেই ১ ধাপ করে এগোবে।',
    whyItMatters:
      'গণিতের নিয়ম: head থেকে cycle start-এর দূরত্ব = meeting point থেকে cycle start-এর দূরত্ব (mod cycle length)। তাই একসাথে ১ ধাপে চললে ঠিক cycle start-এ মিলবে।',
    highlightLines: [8, 9],
    vars: [
      { name: 'p', value: 3 },
      { name: 'slow', value: -4 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: nodes(),
      pointers: [
        { name: 'p', nodeId: N3 },
        { name: 'slow', nodeId: N4 },
      ],
      cycleTargetId: N2,
      caption: 'Phase 2 — দুজনেই ১ ধাপ করে চলবে',
    },
  },

  {
    id: 'p2-1',
    title: 'p→2, slow→2 — মিলে গেছে! Cycle start = 2',
    whatHappens:
      'p ১ ধাপ: 3→2। slow ১ ধাপ: (-4)→2 (সাইকেল ঘুরে)। p === slow = নোড 2! return 2।',
    whyItMatters:
      'মাত্র ১ ধাপেই মিলন হলো — কারণ head→cycle start দূরত্ব ১, আর meeting→cycle start দূরত্বও ১ (mod 3)।',
    highlightLines: [9, 10, 11, 12, 13],
    vars: [
      { name: 'p', value: 2 },
      { name: 'slow', value: 2 },
      { name: 'মিলন?', value: '✓' },
    ],
    scene: {
      kind: 'linked-list',
      nodes: nodes({ [N2]: 'done' }),
      pointers: [
        { name: 'p', nodeId: N2 },
        { name: 'slow', nodeId: N2 },
      ],
      cycleTargetId: N2,
      caption: 'p === slow = নোড 2 — সাইকেলের শুরু পাওয়া গেছে!',
    },
  },

  {
    id: 'done',
    title: 'ফলাফল: সাইকেলের শুরু = নোড 2',
    whatHappens:
      'return p → নোড 2। সম্পূর্ণ অ্যালগরিদম O(n) time, O(1) space — কোনো Set বা visited array ছাড়াই।',
    whyItMatters:
      'Floyd\'s Cycle Detection — Phase 1 সাইকেল আছে কিনা জানায়, Phase 2 কোথায় শুরু তা বলে। দুই ফেজ মিলিয়ে constant space-এ পূর্ণ সমাধান।',
    highlightLines: [13],
    vars: [{ name: 'cycle start', value: 2 }],
    scene: {
      kind: 'linked-list',
      nodes: nodes({ [N2]: 'done' }),
      pointers: [{ name: 'start', nodeId: N2 }],
      cycleTargetId: N2,
      caption: 'detectCycle([3,2,0,-4]) = নোড 2',
    },
  },
];

export const fastSlowPointersSim: PatternSimulation = {
  patternId: '3.1',
  input: 'head = [3,2,0,-4], tail→index 1',
  output: 'node with value 2',
  steps,
};
