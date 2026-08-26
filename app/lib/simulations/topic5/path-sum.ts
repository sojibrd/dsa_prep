import type { CellMark, PatternSimulation, SimStep, TreeNodeData } from '../types';

/* ============================================================================
   5.3 Path Sum — Binary Tree Maximum Path Sum (LC 124)

   Post-order: the leaves resolve first and the answer climbs. Each node's
   annotation is the gain it hands its parent, so the numbers visibly travel
   upward one step at a time.
   ========================================================================= */

const SHAPE: { id: string; val: number; leftId?: string; rightId?: string }[] = [
  { id: 'nR', val: -10, leftId: 'n9', rightId: 'n20' },
  { id: 'n9', val: 9 },
  { id: 'n20', val: 20, leftId: 'n15', rightId: 'n7' },
  { id: 'n15', val: 15 },
  { id: 'n7', val: 7 },
];

interface Visit {
  id: string;
  val: number;
  isLeaf: boolean;
  left: number;
  right: number;
  /** Best path that BENDS at this node — uses both children. */
  turn: number;
  bestBefore: string;
  bestAfter: number;
  /** What the parent receives — one branch only. */
  returned: number;
}

/** Verified by running the demo code; post-order, so leaves come first. */
const VISITS: Visit[] = [
  { id: 'n9', val: 9, isLeaf: true, left: 0, right: 0, turn: 9, bestBefore: '−∞', bestAfter: 9, returned: 9 },
  { id: 'n15', val: 15, isLeaf: true, left: 0, right: 0, turn: 15, bestBefore: '9', bestAfter: 15, returned: 15 },
  { id: 'n7', val: 7, isLeaf: true, left: 0, right: 0, turn: 7, bestBefore: '15', bestAfter: 15, returned: 7 },
  { id: 'n20', val: 20, isLeaf: false, left: 15, right: 7, turn: 42, bestBefore: '15', bestAfter: 42, returned: 35 },
  { id: 'nR', val: -10, isLeaf: false, left: 9, right: 35, turn: 34, bestBefore: '42', bestAfter: 42, returned: 25 },
];

/** Gains settle as the recursion unwinds, so annotations accumulate. */
function tree(upTo: number, activeId?: string): TreeNodeData[] {
  const resolved = new Map(
    VISITS.slice(0, upTo).map((visit) => [visit.id, visit.returned])
  );
  return SHAPE.map((node) => ({
    ...node,
    mark: (node.id === activeId
      ? 'active'
      : resolved.has(node.id)
        ? 'done'
        : undefined) as CellMark | undefined,
    annotation: resolved.has(node.id) ? `gain ${resolved.get(node.id)}` : undefined,
  }));
}

const steps: SimStep[] = [
  {
    id: '5.3-init',
    title: 'শুরু — best = −∞',
    whatHappens:
      '`best = -Infinity`। `gain(root)` ডাকা হলো, কিন্তু কোনো হিসাব এখনো হয়নি — recursion আগে একদম নিচে নামবে।',
    whyItMatters:
      'প্রতিটা নোড দুটো আলাদা প্রশ্নের উত্তর দেয়, আর এই দুটো গুলিয়ে ফেলাই সবচেয়ে সাধারণ ভুল। (১) **এখানে বাঁক নিলে** সবচেয়ে ভালো path কত — `node + left + right`; এটা `best`-এ জমা হয়। (২) **parent-কে কী দেব** — `node + max(left, right)`; কারণ parent-এর path এখান দিয়ে গেলে সে একটাই দিক ব্যবহার করতে পারবে, দুই দিক নিলে সেটা আর path থাকে না, কাঁটা হয়ে যায়।',
    highlightLines: [2, 10],
    vars: [{ name: 'best', value: '−∞' }],
    scene: {
      kind: 'tree',
      nodes: tree(0),
      rootId: 'nR',
      caption: 'root-এর মান −10 — তাই সেরা path সম্ভবত root ছুঁবেই না।',
    },
  },

  ...VISITS.map((visit, i): SimStep => {
    const improved = visit.bestBefore !== String(visit.bestAfter);
    return {
      id: `5.3-visit-${i + 1}`,
      title: visit.isLeaf
        ? `leaf ${visit.val} — দুই পাশই শূন্য`
        : `${visit.val} — দুই সন্তানের gain হাতে এল`,
      whatHappens: visit.isLeaf
        ? `${visit.val} একটা leaf, তাই দুই সন্তানই null — দুই দিকের gain 0। এখানে বাঁক নিলে path-এর যোগফল ${visit.val} + 0 + 0 = ${visit.turn}। best ${visit.bestBefore} → ${visit.bestAfter}। parent-কে ফেরত যাবে ${visit.returned}।`
        : `বাঁ দিক থেকে এল ${visit.left}, ডান দিক থেকে ${visit.right}। এখানে বাঁক নিলে যোগফল ${visit.val} + ${visit.left} + ${visit.right} = ${visit.turn}। best ${visit.bestBefore} → ${visit.bestAfter}${improved ? ' — নতুন রেকর্ড' : ' (অপরিবর্তিত)'}। parent-কে যাবে ${visit.val} + max(${visit.left}, ${visit.right}) = ${visit.returned}।`,
      whyItMatters:
        i === 0
          ? '`Math.max(gain(...), 0)` — এই শূন্যটাই ঋণাত্মক শাখা বাদ দেওয়ার কৌশল। কোনো দিক ক্ষতি করলে সেটা না নেওয়াই ভালো, আর "না নেওয়া" মানে অবদান 0।'
          : i === 3
            ? 'এখানেই উত্তর তৈরি হলো: 15 → 20 → 7, যোগফল 42। খেয়াল করুন এই path root ছোঁয় না। তাই উত্তর কেবল root-এ খুঁজলে চলত না — প্রতিটা নোডে "এখানে বাঁক নিলে কত" প্রশ্নটা করতে হয়েছে।'
            : i === 4
              ? 'root-এর মান −10 হওয়ায় তাকে জুড়লে যোগফল কমে যায় (34 < 42)। তবু recursion এখানে আসতেই হতো — না এলে ডান দিক থেকে 35 আসত না, আর 42-ও কখনো হিসাব হতো না।'
              : undefined,
      highlightLines: visit.isLeaf ? [4, 5, 6, 7, 8] : [5, 6, 7, 8],
      vars: [
        { name: 'node', value: visit.val },
        { name: 'left', value: visit.left },
        { name: 'right', value: visit.right },
        { name: 'বাঁক', value: visit.turn },
        { name: 'best', value: visit.bestAfter },
      ],
      scene: {
        kind: 'tree',
        nodes: tree(i, visit.id),
        rootId: 'nR',
        activeNodeId: visit.id,
        caption: `parent-কে ফেরত: ${visit.returned} · এ পর্যন্ত সেরা: ${visit.bestAfter}`,
      },
    };
  }),

  {
    id: '5.3-done',
    title: 'শেষ — সর্বোচ্চ path sum 42',
    whatHappens:
      'recursion শেষ। উত্তর `42`, path `15 → 20 → 7`। প্রতিটা নোডের নিচে লেখা সংখ্যাটা সে তার parent-কে যা দিয়েছিল।',
    whyItMatters:
      'প্রতিটা নোডে একবার করে যাওয়া — O(n) সময়, আর গভীরতার সমান স্ট্যাক। মূল কৌশল ছিল "উত্তর কোথায়" না খুঁজে প্রতিটা নোডকে জিজ্ঞেস করা "তোমার মধ্য দিয়ে সেরা path কত"; সবচেয়ে বড় উত্তরটাই মোট উত্তর।',
    highlightLines: [11],
    vars: [{ name: 'best', value: 42 }],
    scene: {
      kind: 'tree',
      nodes: tree(5).map((node) => ({
        ...node,
        mark: (['n15', 'n20', 'n7'].includes(node.id) ? 'active' : 'reject') as CellMark,
      })),
      rootId: 'nR',
      highlightPath: ['n15', 'n20', 'n7'],
      output: { title: 'সেরা path', values: [15, 20, 7] },
      caption: '15 + 20 + 7 = 42 — root বাদ পড়েছে, কারণ −10 জুড়লে কমে যেত।',
    },
  },
];

export const pathSumSim: PatternSimulation = {
  patternId: '5.3',
  input: 'root = [-10,9,20,null,null,15,7]',
  output: '42',
  steps,
};
