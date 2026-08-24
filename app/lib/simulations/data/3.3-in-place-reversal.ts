import type { PatternSimulation, SimStep, LinkedListNode } from '../types';

/**
 * 3.3 In-Place Reversal — reverseKGroup (LC 25).
 *
 * Reverse nodes in groups of k. The simulation shows the pointer dance
 * (prev/cur/next) as links flip direction within each group, then groups
 * are stitched together. k=2, so groups of 2 are reversed; the lone node 5
 * at the end stays as-is.
 *
 * Concrete input: [1] → [2] → [3] → [4] → [5], k = 2
 * Output: [2] → [1] → [4] → [3] → [5]
 */

const N1 = 'n1';
const N2 = 'n2';
const N3 = 'n3';
const N4 = 'n4';
const N5 = 'n5';

const steps: SimStep[] = [
  {
    id: 'init',
    title: 'শুরু — k=2 নোড আছে কি গুনে দেখি',
    whatHappens:
      'node = head (1), count=0। while (node && count < k): node→2→3, count=2। k=2 আছে — রিভার্স করা যাবে।',
    whyItMatters:
      'k-এর কম নোড বাকি থাকলে সেই গ্রুপ অপরিবর্তিত রাখতে হবে — তাই আগে গুনে দেখা জরুরি।',
    highlightLines: [2, 3, 4, 5, 6, 7],
    vars: [
      { name: 'k', value: 2 },
      { name: 'count', value: 2 },
      { name: 'group', value: '1' },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: N1, val: 1, nextId: N2 },
        { id: N2, val: 2, nextId: N3, mark: 'active' },
        { id: N3, val: 3, nextId: N4 },
        { id: N4, val: 4, nextId: N5 },
        { id: N5, val: 5 },
      ],
      pointers: [
        { name: 'head', nodeId: N1 },
        { name: 'node', nodeId: N3 },
      ],
      caption: '[1] → [2] → [3] → [4] → [5] — প্রথম গ্রুপ [1,2] রিভার্স করব',
    },
  },

  {
    id: 'g1-recurse',
    title: 'পরের গ্রুপ আগে সমাধান (recursion)',
    whatHappens:
      'prev = reverseKGroup(node=3, k=2)। recursion-এর ফলাফল ধরে নিচ্ছি prev-এ — পরে ফিরে আসবে।',
    whyItMatters:
      'recursive approach: পেছন থেকে সমাধান করে সামনের দিকে জোড়া লাগানো — এতে প্রতি গ্রুপের "next reversed group"-এর head পাওয়া সহজ।',
    highlightLines: [8],
    vars: [
      { name: 'group', value: '1' },
      { name: 'prev', value: '(recurse)' },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: N1, val: 1, nextId: N2, mark: 'active' },
        { id: N2, val: 2, nextId: N3, mark: 'active' },
        { id: N3, val: 3, nextId: N4 },
        { id: N4, val: 4, nextId: N5 },
        { id: N5, val: 5 },
      ],
      pointers: [
        { name: 'cur', nodeId: N1 },
      ],
      caption: 'Recursion — ভেতরের গ্রুপ আগে সমাধান হবে',
    },
  },

  {
    id: 'g2-count',
    title: 'গ্রুপ ২: [3,4] — k=2 আছে',
    whatHappens:
      'node=3 থেকে গোনা: 3→4→5, count=2 ≥ k=2। এই গ্রুপও রিভার্স হবে।',
    highlightLines: [3, 4, 5, 6, 7],
    vars: [
      { name: 'group', value: '2' },
      { name: 'count', value: 2 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: N1, val: 1, nextId: N2 },
        { id: N2, val: 2, nextId: N3 },
        { id: N3, val: 3, nextId: N4, mark: 'active' },
        { id: N4, val: 4, nextId: N5, mark: 'active' },
        { id: N5, val: 5 },
      ],
      pointers: [
        { name: 'head', nodeId: N3 },
        { name: 'node', nodeId: N5 },
      ],
      caption: 'গ্রুপ ২: [3,4] — রিভার্স হবে',
    },
  },

  {
    id: 'g3-base',
    title: 'গ্রুপ ৩: [5] — k-এর কম, অপরিবর্তিত',
    whatHappens:
      'node=5, count=1 < k=2। return head=5 — এই অংশ যেমন আছে তেমনই।',
    whyItMatters:
      'base case: k-এর কম নোড বাকি থাকলে রিভার্স না করে head রিটার্ন। এটাই recursion থামায়।',
    highlightLines: [7],
    vars: [
      { name: 'group', value: '3' },
      { name: 'count', value: 1 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: N1, val: 1, nextId: N2 },
        { id: N2, val: 2, nextId: N3 },
        { id: N3, val: 3, nextId: N4 },
        { id: N4, val: 4, nextId: N5 },
        { id: N5, val: 5, mark: 'fill' },
      ],
      pointers: [{ name: 'return', nodeId: N5 }],
      caption: '[5] একা — k=2 হয়নি, অপরিবর্তিত',
    },
  },

  {
    id: 'g2-rev',
    title: 'গ্রুপ ২ রিভার্স: [3,4] → [4,3]',
    whatHappens:
      'prev=5 (base case থেকে), cur=3। ১ম: next=4, 3.next=5(prev), prev=3, cur=4। ২য়: next=5, 4.next=3(prev), prev=4, cur=5। return prev=4। চেইন: [4]→[3]→[5]।',
    whyItMatters:
      'standard 3-pointer reversal (prev/cur/next): প্রতি ধাপে cur.next কে prev-এর দিকে ঘুরিয়ে দাও।',
    highlightLines: [9, 10, 11, 12, 13, 14, 15],
    vars: [
      { name: 'group', value: '2' },
      { name: 'prev', value: 4 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: N1, val: 1, nextId: N2 },
        { id: N2, val: 2, nextId: N3 },
        { id: N4, val: 4, nextId: N3, mark: 'done' },
        { id: N3, val: 3, nextId: N5, mark: 'done' },
        { id: N5, val: 5, mark: 'fill' },
      ],
      pointers: [{ name: 'return', nodeId: N4 }],
      caption: 'গ্রুপ ২ রিভার্স: [4] → [3] → [5]',
    },
  },

  {
    id: 'g1-rev',
    title: 'গ্রুপ ১ রিভার্স: [1,2] → [2,1]',
    whatHappens:
      'prev=4 (গ্রুপ ২-র head), cur=1। ১ম: next=2, 1.next=4(prev), prev=1, cur=2। ২য়: next=3, 2.next=1(prev), prev=2, cur=3। return prev=2। চেইন: [2]→[1]→[4]→[3]→[5]।',
    highlightLines: [9, 10, 11, 12, 13, 14, 15],
    vars: [
      { name: 'group', value: '1' },
      { name: 'prev (new head)', value: 2 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: N2, val: 2, nextId: N1, mark: 'done' },
        { id: N1, val: 1, nextId: N4, mark: 'done' },
        { id: N4, val: 4, nextId: N3, mark: 'done' },
        { id: N3, val: 3, nextId: N5, mark: 'done' },
        { id: N5, val: 5, mark: 'fill' },
      ],
      pointers: [{ name: 'return', nodeId: N2 }],
      caption: 'গ্রুপ ১ রিভার্স: [2] → [1] → [4] → [3] → [5]',
    },
  },

  {
    id: 'done',
    title: 'ফলাফল: [2, 1, 4, 3, 5]',
    whatHappens:
      'return 2 (নতুন head)। প্রতি জোড়া উল্টে গেছে, একলা নোড 5 যেমন ছিল তেমনই।',
    whyItMatters:
      'recursive approach: O(n) time, O(n/k) stack space। iterative করলে O(1) space, কিন্তু কোড বেশি জটিল। মূলনীতি একই — prev/cur/next তিন pointer-এর নাচ।',
    highlightLines: [16],
    vars: [{ name: 'new head', value: 2 }],
    scene: {
      kind: 'linked-list',
      nodes: [
        { id: N2, val: 2, nextId: N1, mark: 'done' },
        { id: N1, val: 1, nextId: N4, mark: 'done' },
        { id: N4, val: 4, nextId: N3, mark: 'done' },
        { id: N3, val: 3, nextId: N5, mark: 'done' },
        { id: N5, val: 5, mark: 'done' },
      ],
      output: { title: 'result', values: [2, 1, 4, 3, 5] },
      caption: 'reverseKGroup([1,2,3,4,5], 2) = [2,1,4,3,5]',
    },
  },
];

export const inPlaceReversalSim: PatternSimulation = {
  patternId: '3.3',
  input: 'head = [1, 2, 3, 4, 5], k = 2',
  output: '[2, 1, 4, 3, 5]',
  steps,
};
