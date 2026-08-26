import type { CellMark, PatternSimulation, SimStep, TreeNodeData } from '../types';

/* ============================================================================
   5.4 Validation & Properties — Validate Binary Search Tree (LC 98)

   Pre-order: the range narrows on the way DOWN, the opposite direction from
   5.3. Each node's annotation is the window its value must fall inside.
   ========================================================================= */

const SHAPE: { id: string; val: number; leftId?: string; rightId?: string }[] = [
  { id: 'n5', val: 5, leftId: 'n1', rightId: 'n4' },
  { id: 'n1', val: 1 },
  { id: 'n4', val: 4, leftId: 'n3', rightId: 'n6' },
  { id: 'n3', val: 3 },
  { id: 'n6', val: 6 },
];

interface Visit {
  id: string;
  val: number;
  min: string;
  max: string;
  path: string[];
  violation: boolean;
}

/** Verified by running the demo code; it short-circuits at the third node. */
const VISITS: Visit[] = [
  { id: 'n5', val: 5, min: '−∞', max: '∞', path: ['n5'], violation: false },
  { id: 'n1', val: 1, min: '−∞', max: '5', path: ['n5', 'n1'], violation: false },
  { id: 'n4', val: 4, min: '5', max: '∞', path: ['n5', 'n4'], violation: true },
];

function tree(upTo: number, activeId?: string): TreeNodeData[] {
  const checked = new Map(
    VISITS.slice(0, upTo).map((visit) => [visit.id, `(${visit.min}, ${visit.max})`])
  );
  const current = VISITS.find((visit) => visit.id === activeId);

  return SHAPE.map((node) => ({
    ...node,
    mark: (node.id === activeId
      ? current?.violation
        ? 'reject'
        : 'active'
      : checked.has(node.id)
        ? 'done'
        : undefined) as CellMark | undefined,
    annotation:
      node.id === activeId && current
        ? `(${current.min}, ${current.max})`
        : checked.get(node.id),
  }));
}

const steps: SimStep[] = [
  {
    id: '5.4-init',
    title: 'শুরু — root-এর জন্য কোনো সীমা নেই',
    whatHappens:
      '`isValidBST(root, -Infinity, Infinity)` — root-এর মান যেকোনো কিছু হতে পারে, তাই শুরুর জানালা সীমাহীন।',
    whyItMatters:
      'সহজ ভুল সমাধান: প্রতিটা নোডে শুধু "বাঁ সন্তান ছোট, ডান সন্তান বড়" যাচাই করা। কিন্তু BST-র শর্ত স্থানীয় নয় — বাঁ subtree-র **সব** নোডকে root-এর চেয়ে ছোট হতে হবে, শুধু তার সরাসরি সন্তানকে নয়। তাই নিচে নামার সময় একটা জানালা (min, max) সঙ্গে নিয়ে যেতে হয়, যা প্রতি ধাপে সংকুচিত হয়।',
    highlightLines: [1, 2],
    vars: [
      { name: 'min', value: '−∞' },
      { name: 'max', value: '∞' },
    ],
    scene: {
      kind: 'tree',
      nodes: tree(0),
      rootId: 'n5',
      caption: 'প্রতিটা নোডের নিচে লেখা থাকবে তার অনুমোদিত জানালা।',
    },
  },

  ...VISITS.map((visit, i): SimStep => ({
    id: `5.4-visit-${i + 1}`,
    title: visit.violation
      ? `${visit.val} — জানালার বাইরে, নিয়ম ভাঙল`
      : `${visit.val} — জানালা (${visit.min}, ${visit.max})-এর মধ্যে`,
    whatHappens: visit.violation
      ? `এই নোডে পৌঁছে জানালা দাঁড়িয়েছে (${visit.min}, ${visit.max}) — কারণ এটা 5-এর ডান দিকে, তাই একে 5-এর চেয়ে বড় হতেই হবে। কিন্তু মান ${visit.val} ≤ ${visit.min}। শর্ত ভাঙল, সাথে সাথে \`false\` রিটার্ন।`
      : `মান ${visit.val} জানালা (${visit.min}, ${visit.max})-এর ভেতরেই। ${
          i === 0
            ? 'তাই বাঁ দিকে যাওয়ার সময় max হবে 5, আর ডান দিকে যাওয়ার সময় min হবে 5।'
            : 'এর দুই সন্তানই null, তাই এই শাখা `true` ফেরত দিল।'
        }`,
    whyItMatters:
      i === 0
        ? 'বাঁয়ে নামলে max সংকুচিত হয় (root-এর চেয়ে ছোট থাকতে হবে), ডানে নামলে min বাড়ে। min আর max দুটোই বয়ে নিয়ে যাওয়ায় যেকোনো গভীরতার নোডও তার সব পূর্বপুরুষের শর্ত মেনে চলতে বাধ্য।'
        : i === 2
          ? 'এখানেই সেই ফাঁদ যা স্থানীয় পরীক্ষায় ধরা পড়ত না: 4 তার নিজের parent-এর নিয়ম মানছে ঠিকই — কিন্তু সে 5-এর **ডান** subtree-তে, আর 4 < 5। জানালা সেটা ধরে ফেলল। `&&` short-circuit করায় n3 আর n6-এ recursion আর যায়ইনি।'
          : undefined,
    highlightLines: visit.violation ? [3] : [2, 3, 4, 5, 6, 7],
    vars: [
      { name: 'node', value: visit.val },
      { name: 'min', value: visit.min },
      { name: 'max', value: visit.max },
      { name: 'ফল', value: visit.violation ? 'false' : 'ঠিক আছে' },
    ],
    scene: {
      kind: 'tree',
      nodes: tree(i, visit.id),
      rootId: 'n5',
      activeNodeId: visit.id,
      highlightPath: visit.path,
      caption: visit.violation
        ? `${visit.val} ≤ ${visit.min} — 5-এর ডান দিকে থেকেও 5-এর চেয়ে ছোট।`
        : `path: ${visit.path.length === 1 ? 'root' : 'root → ' + (visit.id === 'n1' ? 'বাঁ' : 'ডান')}`,
    },
  })),

  {
    id: '5.4-done',
    title: 'শেষ — এটা BST নয়',
    whatHappens:
      'উত্তর `false`। কারণ নোড 4 আছে 5-এর ডান subtree-তে, অথচ 4 < 5 — BST-র শর্ত ভাঙে।',
    whyItMatters:
      'সবচেয়ে খারাপ ক্ষেত্রে O(n), কিন্তু violation তাড়াতাড়ি পাওয়া গেলে আরও কম — এখানে ৫টার মধ্যে ৩টা নোড দেখেই শেষ। বিকল্প পদ্ধতি: in-order traversal করলে BST-র মানগুলো সাজানো ক্রমে আসার কথা; সেটাও চলে, কিন্তু জানালার পদ্ধতিতে ভাঙা জায়গাটা ঠিক কোথায় তা সাথে সাথেই বলা যায়।',
    highlightLines: [3],
    vars: [{ name: 'উত্তর', value: 'false' }],
    scene: {
      kind: 'tree',
      nodes: SHAPE.map((node) => ({
        ...node,
        mark: (node.id === 'n4' ? 'reject' : node.id === 'n5' ? 'active' : 'done') as CellMark,
        annotation: node.id === 'n4' ? '4 < 5 ✗' : node.id === 'n5' ? 'root' : undefined,
      })),
      rootId: 'n5',
      highlightPath: ['n5', 'n4'],
      caption: 'n3 ও n6-এ recursion কখনো পৌঁছায়নি — && short-circuit করেছে।',
    },
  },
];

export const validationSim: PatternSimulation = {
  patternId: '5.4',
  input: 'root = [5,1,4,null,null,3,6]',
  output: 'false',
  steps,
};
