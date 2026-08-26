import type { CellMark, PatternSimulation, SimStep, TreeNodeData } from '../types';

/* ============================================================================
   5.5 Lowest Common Ancestor — LCA of a Binary Tree (LC 236)
   ========================================================================= */

const SHAPE: { id: string; val: number; leftId?: string; rightId?: string }[] = [
  { id: 'n3', val: 3, leftId: 'n5', rightId: 'n1' },
  { id: 'n5', val: 5, leftId: 'n6', rightId: 'n2' },
  { id: 'n1', val: 1, leftId: 'n0', rightId: 'n8' },
  { id: 'n6', val: 6 },
  { id: 'n2', val: 2 },
  { id: 'n0', val: 0 },
  { id: 'n8', val: 8 },
];

const P = 'n5';
const Q = 'n1';

/** p and q stay labelled on every step — the question never moves. */
const TARGETS = [
  { name: 'p', nodeId: P },
  { name: 'q', nodeId: Q },
];

function tree(marks: Record<string, CellMark>, annotations: Record<string, string> = {}) {
  return SHAPE.map(
    (node): TreeNodeData => ({
      ...node,
      mark: marks[node.id],
      annotation: annotations[node.id],
    })
  );
}

const steps: SimStep[] = [
  {
    id: '5.5-init',
    title: 'শুরু — root থেকে নামা',
    whatHappens:
      '`p = 5`, `q = 1` — দুটোই root-এর সরাসরি সন্তান। recursion শুরু root (3) থেকে; সে target নয়, তাই দুই দিকেই নামবে।',
    whyItMatters:
      'এই কোডে কোথাও "কে কার পূর্বপুরুষ" হিসাব হয় না, path-ও জমা রাখা হয় না। প্রতিটা নোড শুধু একটা প্রশ্নের উত্তর উপরে পাঠায়: "আমার subtree-তে p বা q-এর কোনো চিহ্ন পেলে?" এই একটা সংকেতই যথেষ্ট।',
    highlightLines: [1, 2],
    vars: [
      { name: 'p', value: 5 },
      { name: 'q', value: 1 },
    ],
    scene: {
      kind: 'tree',
      nodes: tree({ n3: 'active' }),
      rootId: 'n3',
      pointers: TARGETS,
      caption: 'লক্ষ্য: 5 ও 1 — দুজনেরই সবচেয়ে নিচের সাধারণ পূর্বপুরুষ কে?',
    },
  },

  {
    id: '5.5-found-p',
    title: 'বাঁ দিকে — 5 নিজেই target',
    whatHappens:
      'বাঁ দিকে নেমে পাওয়া গেল নোড 5, যেটা `p`। শর্তে `root === p` সত্য, তাই সাথে সাথে `5` ফেরত — এর নিচের 6 ও 2-তে recursion আর নামেই না।',
    whyItMatters:
      'target পেয়েই থেমে যাওয়াটা কেবল গতির জন্য নয়, শুদ্ধতার জন্যও। যদি q আসলে p-এর subtree-র ভেতরে থাকত, তবু উত্তর p-ই হতো (একটা নোড নিজের পূর্বপুরুষ হিসেবেই গণ্য) — এখানে থেমে যাওয়ায় সেই ক্ষেত্রটা আলাদা করে সামলাতে হয় না।',
    highlightLines: [2, 3],
    vars: [
      { name: 'node', value: 5 },
      { name: 'ফেরত', value: 5 },
    ],
    scene: {
      kind: 'tree',
      nodes: tree(
        { n3: 'done', n5: 'active', n6: 'reject', n2: 'reject' },
        { n5: 'p পাওয়া গেল' }
      ),
      rootId: 'n3',
      activeNodeId: 'n5',
      highlightPath: ['n3', 'n5'],
      pointers: TARGETS,
      caption: '6 ও 2 ম্লান — ওখানে recursion পৌঁছায়নি।',
    },
  },

  {
    id: '5.5-found-q',
    title: 'ডান দিকে — 1 নিজেই target',
    whatHappens:
      'এবার ডান দিক। নোড 1 হলো `q`, তাই সেও সাথে সাথে `1` ফেরত দিল — 0 ও 8-এ নামা হলো না।',
    highlightLines: [2, 4],
    vars: [
      { name: 'node', value: 1 },
      { name: 'ফেরত', value: 1 },
    ],
    scene: {
      kind: 'tree',
      nodes: tree(
        {
          n3: 'done', n5: 'done', n6: 'reject', n2: 'reject',
          n1: 'active', n0: 'reject', n8: 'reject',
        },
        { n5: 'p', n1: 'q পাওয়া গেল' }
      ),
      rootId: 'n3',
      activeNodeId: 'n1',
      highlightPath: ['n3', 'n1'],
      pointers: TARGETS,
      caption: 'দুই দিক থেকেই একটা করে সংকেত উপরে যাচ্ছে।',
    },
  },

  {
    id: '5.5-lca',
    title: 'root-এ ফিরে — দুই পাশেই সংকেত',
    whatHappens:
      'root (3)-এ ফিরে দেখা গেল বাঁ দিক থেকে এসেছে `5`, ডান দিক থেকে `1` — দুটোই না-খালি। `left && right` সত্য, তাই root নিজেই LCA।',
    whyItMatters:
      'দুই পাশে দুটো আলাদা সংকেত মানে p আর q দুটো ভিন্ন subtree-তে — তাই তাদের মিলনস্থল এই নোডেই, এর নিচে আর হতে পারে না। আর যদি সংকেত আসত এক পাশ থেকেই, তার মানে দুজনেই ওই পাশে, তাই উত্তরটা নিচেই কোথাও — তখন `left || right` সেই উত্তরটাকেই উপরে পাঠিয়ে দেয়।',
    highlightLines: [5, 6],
    vars: [
      { name: 'left', value: 5 },
      { name: 'right', value: 1 },
      { name: 'LCA', value: 3 },
    ],
    scene: {
      kind: 'tree',
      nodes: tree(
        {
          n3: 'active', n5: 'done', n1: 'done',
          n6: 'reject', n2: 'reject', n0: 'reject', n8: 'reject',
        },
        { n3: 'দুই পাশেই ✓', n5: 'p', n1: 'q' }
      ),
      rootId: 'n3',
      activeNodeId: 'n3',
      highlightPath: ['n3', 'n5', 'n1'],
      pointers: TARGETS,
      caption: 'left = 5, right = 1 — দুটোই সত্য, তাই এখানেই মিলন।',
    },
  },

  {
    id: '5.5-done',
    title: 'শেষ — LCA হলো 3',
    whatHappens: 'উত্তর: নোড `3`।',
    whyItMatters:
      'সবচেয়ে খারাপ ক্ষেত্রে প্রতিটা নোডে একবার — O(n), আর বাড়তি জায়গা শুধু recursion স্ট্যাক। বিকল্প: দুটো নোডের root থেকে path বের করে তুলনা করা; সেটাও O(n), কিন্তু দুটো তালিকা জমা রাখতে হয়। এখানে "পেয়েছি/পাইনি" এই এক টুকরো তথ্য উপরে পাঠানোই যথেষ্ট হয়েছে।',
    highlightLines: [5],
    vars: [{ name: 'উত্তর', value: 3 }],
    scene: {
      kind: 'tree',
      nodes: tree(
        {
          n3: 'active', n5: 'done', n1: 'done',
          n6: 'reject', n2: 'reject', n0: 'reject', n8: 'reject',
        },
        { n3: 'LCA' }
      ),
      rootId: 'n3',
      pointers: TARGETS,
      output: { title: 'LCA', values: [3] },
      caption: '৭টা নোডের মধ্যে মাত্র ৩টায় যেতে হয়েছে।',
    },
  },
];

export const lcaSim: PatternSimulation = {
  patternId: '5.5',
  input: 'root = [3,5,1,6,2,0,8], p = 5, q = 1',
  output: '3',
  steps,
};
