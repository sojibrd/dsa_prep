import type { PatternSimulation, SimStep, LinkedListNode } from '../types';

/**
 * 3.2 Dummy Node Technique — mergeTwoLists (LC 21: Merge Two Sorted Lists).
 *
 * A dummy sentinel node simplifies the merge: `tail` always has somewhere
 * to append, so the head never needs special-casing. We show both input
 * lists as nodes in the same scene, with pointers `a`, `b`, and `tail`
 * indicating where we are and where the merged chain is growing.
 *
 * Concrete input: list1 = [1, 2, 4], list2 = [1, 3, 4]
 * Output: [1, 1, 2, 3, 4, 4]
 */

// Node ids — a1/a2/a4 for list1, b1/b3/b4 for list2
const A1 = 'a1';
const A2 = 'a2';
const A4 = 'a4';
const B1 = 'b1';
const B3 = 'b3';
const B4 = 'b4';
const DUM = 'dum';

/** Build nodes showing the current merge state via marks. */
function mkNodes(merged: string[]): LinkedListNode[] {
  const all = [
    { id: A1, val: 1 },
    { id: A2, val: 2 },
    { id: A4, val: 4 },
    { id: B1, val: 1 },
    { id: B3, val: 3 },
    { id: B4, val: 4 },
  ];

  // Build nextId chain based on merged order
  const result: LinkedListNode[] = [];
  for (const item of all) {
    const idx = merged.indexOf(item.id);
    const nextMerged = idx >= 0 && idx < merged.length - 1 ? merged[idx + 1] : undefined;
    result.push({
      id: item.id,
      val: item.val,
      nextId: idx >= 0 ? (nextMerged ?? null) : undefined,
      mark: idx >= 0 ? 'done' as const : undefined,
    });
  }
  return result;
}

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — dummy নোড তৈরি, tail = dummy',
    whatHappens:
      'dummy = {next: null}, tail = dummy। a → list1-এর head (1), b → list2-এর head (1)।',
    whyItMatters:
      'dummy থাকায় tail.next = ... লিখতে পারি — head কোনটা হবে সেই চিন্তা লুপের মধ্যে করতে হয় না। শেষে dummy.next রিটার্ন করলেই হয়।',
    highlightLines: [2, 3],
    vars: [
      { name: 'a', value: 1 },
      { name: 'b', value: 1 },
      { name: 'tail', value: 'dum' },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: A1, val: 1, nextId: A2 },
        { id: A2, val: 2, nextId: A4 },
        { id: A4, val: 4 },
        { id: B1, val: 1, nextId: B3 },
        { id: B3, val: 3, nextId: B4 },
        { id: B4, val: 4 },
      ],
      dummy: { id: DUM, val: 'D', nextId: null },
      pointers: [
        { name: 'a', nodeId: A1 },
        { name: 'b', nodeId: B1 },
        { name: 'tail', nodeId: DUM },
      ],
      caption: 'list1 = [1,2,4], list2 = [1,3,4] — dummy দিয়ে শুরু',
    },
  },

  {
    id: 'it-1',
    title: 'a.val(1) ≤ b.val(1) → a নোড জুড়লো',
    whatHappens:
      'a.val=1 ≤ b.val=1, তাই tail.next = a (নোড a1)। a এগিয়ে a2-এ। tail এগিয়ে a1-এ।',
    whyItMatters:
      'সমান হলে a (list1) থেকে নেওয়া — stable merge, মূল ক্রম বজায়।',
    highlightLines: [4, 5, 6, 7, 12],
    vars: [
      { name: 'a', value: 2 },
      { name: 'b', value: 1 },
      { name: 'tail', value: 1 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: A1, val: 1, nextId: null, mark: 'done' },
        { id: A2, val: 2, nextId: A4 },
        { id: A4, val: 4 },
        { id: B1, val: 1, nextId: B3 },
        { id: B3, val: 3, nextId: B4 },
        { id: B4, val: 4 },
      ],
      dummy: { id: DUM, val: 'D', nextId: A1 },
      pointers: [
        { name: 'a', nodeId: A2 },
        { name: 'b', nodeId: B1 },
        { name: 'tail', nodeId: A1 },
      ],
      output: { title: 'merged', values: [1] },
      caption: 'D → [1] — a1 জুড়লো',
    },
  },

  {
    id: 'it-2',
    title: 'a.val(2) > b.val(1) → b নোড জুড়লো',
    whatHappens:
      'a.val=2 > b.val=1, তাই tail.next = b (নোড b1)। b এগিয়ে b3-এ। tail এগিয়ে b1-এ।',
    highlightLines: [4, 8, 9, 10, 12],
    vars: [
      { name: 'a', value: 2 },
      { name: 'b', value: 3 },
      { name: 'tail', value: 1 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: A1, val: 1, nextId: B1, mark: 'done' },
        { id: A2, val: 2, nextId: A4 },
        { id: A4, val: 4 },
        { id: B1, val: 1, nextId: null, mark: 'done' },
        { id: B3, val: 3, nextId: B4 },
        { id: B4, val: 4 },
      ],
      dummy: { id: DUM, val: 'D', nextId: A1 },
      pointers: [
        { name: 'a', nodeId: A2 },
        { name: 'b', nodeId: B3 },
        { name: 'tail', nodeId: B1 },
      ],
      output: { title: 'merged', values: [1, 1] },
      caption: 'D → [1] → [1] — b1 জুড়লো',
    },
  },

  {
    id: 'it-3',
    title: 'a.val(2) ≤ b.val(3) → a2 জুড়লো',
    whatHappens:
      'a.val=2 ≤ b.val=3, তাই tail.next = a (নোড a2)। a এগিয়ে a4-এ। tail এগিয়ে a2-এ।',
    highlightLines: [4, 5, 6, 7, 12],
    vars: [
      { name: 'a', value: 4 },
      { name: 'b', value: 3 },
      { name: 'tail', value: 2 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: A1, val: 1, nextId: B1, mark: 'done' },
        { id: A2, val: 2, nextId: null, mark: 'done' },
        { id: A4, val: 4 },
        { id: B1, val: 1, nextId: A2, mark: 'done' },
        { id: B3, val: 3, nextId: B4 },
        { id: B4, val: 4 },
      ],
      dummy: { id: DUM, val: 'D', nextId: A1 },
      pointers: [
        { name: 'a', nodeId: A4 },
        { name: 'b', nodeId: B3 },
        { name: 'tail', nodeId: A2 },
      ],
      output: { title: 'merged', values: [1, 1, 2] },
      caption: 'D → [1] → [1] → [2] — a2 জুড়লো',
    },
  },

  {
    id: 'it-4',
    title: 'a.val(4) > b.val(3) → b3 জুড়লো',
    whatHappens:
      'a.val=4 > b.val=3, তাই tail.next = b (নোড b3)। b এগিয়ে b4-এ। tail এগিয়ে b3-এ।',
    highlightLines: [4, 8, 9, 10, 12],
    vars: [
      { name: 'a', value: 4 },
      { name: 'b', value: 4 },
      { name: 'tail', value: 3 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: A1, val: 1, nextId: B1, mark: 'done' },
        { id: A2, val: 2, nextId: B3, mark: 'done' },
        { id: A4, val: 4 },
        { id: B1, val: 1, nextId: A2, mark: 'done' },
        { id: B3, val: 3, nextId: null, mark: 'done' },
        { id: B4, val: 4 },
      ],
      dummy: { id: DUM, val: 'D', nextId: A1 },
      pointers: [
        { name: 'a', nodeId: A4 },
        { name: 'b', nodeId: B4 },
        { name: 'tail', nodeId: B3 },
      ],
      output: { title: 'merged', values: [1, 1, 2, 3] },
      caption: 'D → [1] → [1] → [2] → [3] — b3 জুড়লো',
    },
  },

  {
    id: 'it-5',
    title: 'a.val(4) ≤ b.val(4) → a4 জুড়লো',
    whatHappens:
      'a.val=4 ≤ b.val=4, তাই tail.next = a (নোড a4)। a = null। tail এগিয়ে a4-এ।',
    highlightLines: [4, 5, 6, 7, 12],
    vars: [
      { name: 'a', value: 'null' },
      { name: 'b', value: 4 },
      { name: 'tail', value: 4 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: A1, val: 1, nextId: B1, mark: 'done' },
        { id: A2, val: 2, nextId: B3, mark: 'done' },
        { id: A4, val: 4, nextId: null, mark: 'done' },
        { id: B1, val: 1, nextId: A2, mark: 'done' },
        { id: B3, val: 3, nextId: A4, mark: 'done' },
        { id: B4, val: 4 },
      ],
      dummy: { id: DUM, val: 'D', nextId: A1 },
      pointers: [
        { name: 'b', nodeId: B4 },
        { name: 'tail', nodeId: A4 },
      ],
      output: { title: 'merged', values: [1, 1, 2, 3, 4] },
      caption: 'a শেষ — b-এর বাকিটা জুড়ে দেব',
    },
  },

  {
    id: 'it-6',
    title: 'a === null → tail.next = b (বাকি অংশ জুড়লো)',
    whatHappens:
      'while লুপ শেষ (a === null)। tail.next = a || b = b4। শেষ নোড b4 জুড়ে গেল।',
    highlightLines: [13, 14],
    vars: [
      { name: 'tail', value: 4 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: A1, val: 1, nextId: B1, mark: 'done' },
        { id: A2, val: 2, nextId: B3, mark: 'done' },
        { id: A4, val: 4, nextId: B4, mark: 'done' },
        { id: B1, val: 1, nextId: A2, mark: 'done' },
        { id: B3, val: 3, nextId: A4, mark: 'done' },
        { id: B4, val: 4, nextId: null, mark: 'done' },
      ],
      dummy: { id: DUM, val: 'D', nextId: A1 },
      pointers: [
        { name: 'tail', nodeId: B4 },
      ],
      output: { title: 'merged', values: [1, 1, 2, 3, 4, 4] },
      caption: 'D → [1] → [1] → [2] → [3] → [4] → [4] — সম্পূর্ণ!',
    },
  },

  {
    id: 'done',
    title: 'ফলাফল: [1, 1, 2, 3, 4, 4]',
    whatHappens:
      'return dummy.next → [1,1,2,3,4,4]। দুটো sorted list একটি sorted list-এ merge হলো।',
    whyItMatters:
      'dummy node pattern — head কোনটা হবে সেই special case লুপে handle করতে হলো না। O(m+n) time, O(1) space (নতুন নোড বানানো হয়নি, পুরনো নোডের pointer বদলানো হয়েছে)।',
    highlightLines: [15],
    vars: [],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: A1, val: 1, nextId: B1, mark: 'done' },
        { id: A2, val: 2, nextId: B3, mark: 'done' },
        { id: A4, val: 4, nextId: B4, mark: 'done' },
        { id: B1, val: 1, nextId: A2, mark: 'done' },
        { id: B3, val: 3, nextId: A4, mark: 'done' },
        { id: B4, val: 4, nextId: null, mark: 'done' },
      ],
      dummy: { id: DUM, val: 'D', nextId: A1 },
      output: { title: 'result', values: [1, 1, 2, 3, 4, 4] },
      caption: 'mergeTwoLists([1,2,4], [1,3,4]) = [1,1,2,3,4,4]',
    },
  },
];

export const dummyNodeSim: PatternSimulation = {
  patternId: '3.2',
  input: 'list1 = [1, 2, 4], list2 = [1, 3, 4]',
  output: '[1, 1, 2, 3, 4, 4]',
  steps,
};
