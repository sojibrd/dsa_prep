import type { CellMark, PatternSimulation, SimStep, TreeNodeData } from '../types';

/* ============================================================================
   5.2 Tree Construction — Build Tree from Preorder and Inorder (LC 105)

   The tree GROWS here: each step's `nodes` holds only what has been created
   so far. The renderer derives layout from the nodes it is given, so a
   half-built tree needs no special handling — it simply lays out smaller.
   ========================================================================= */

const PREORDER = [3, 9, 20, 15, 7];
const INORDER = [9, 3, 15, 20, 7];

interface Created {
  id: string;
  val: number;
  /** inorder range this call owned. */
  lo: number;
  hi: number;
  /** Root's position inside inorder. */
  mid: number;
  leftId?: string;
  rightId?: string;
  /** Ranges handed to the two child calls. */
  leftRange: [number, number];
  rightRange: [number, number];
}

/** Verified by running the demo code and logging each node as it is made. */
const CREATED: Created[] = [
  { id: 'n3', val: 3, lo: 0, hi: 4, mid: 1, leftId: 'n9', rightId: 'n20', leftRange: [0, 0], rightRange: [2, 4] },
  { id: 'n9', val: 9, lo: 0, hi: 0, mid: 0, leftRange: [0, -1], rightRange: [1, 0] },
  { id: 'n20', val: 20, lo: 2, hi: 4, mid: 3, leftId: 'n15', rightId: 'n7', leftRange: [2, 2], rightRange: [4, 4] },
  { id: 'n15', val: 15, lo: 2, hi: 2, mid: 2, leftRange: [2, 1], rightRange: [3, 2] },
  { id: 'n7', val: 7, lo: 4, hi: 4, mid: 4, leftRange: [4, 3], rightRange: [5, 4] },
];

/** Only children created SO FAR may be linked, or the tree would jump ahead. */
function treeAfter(count: number): TreeNodeData[] {
  const madeIds = new Set(CREATED.slice(0, count).map((c) => c.id));
  return CREATED.slice(0, count).map((c) => ({
    id: c.id,
    val: c.val,
    leftId: c.leftId && madeIds.has(c.leftId) ? c.leftId : null,
    rightId: c.rightId && madeIds.has(c.rightId) ? c.rightId : null,
    mark: (c.id === CREATED[count - 1].id ? 'active' : 'done') as CellMark,
  }));
}

const rangeLabel = ([lo, hi]: [number, number]) =>
  lo > hi ? 'খালি → null' : `[${lo},${hi}]`;

function traversalTable(preIndex: number, lo: number, hi: number, mid?: number) {
  return {
    title: 'preorder ▸ / inorder ▾',
    entries: [
      ...PREORDER.map((value, i) => ({
        key: `pre${i}`,
        value,
        mark: (i < preIndex ? 'done' : i === preIndex ? 'active' : undefined) as
          | CellMark
          | undefined,
      })),
      ...INORDER.map((value, i) => ({
        key: `in${i}`,
        value,
        mark: (i === mid
          ? 'active'
          : i >= lo && i <= hi
            ? 'fill'
            : 'reject') as CellMark,
      })),
    ],
  };
}

const steps: SimStep[] = [
  {
    id: '5.2-init',
    title: 'শুরু — দুটো traversal, কোনো গাছ নেই',
    whatHappens:
      '`preorder = [3,9,20,15,7]`, `inorder = [9,3,15,20,7]`। inorder-এর প্রতিটা মান কোন index-এ আছে তা একটা map-এ তুলে রাখা হলো, আর `pre = 0` — preorder-এ কতদূর এগোনো হয়েছে তার হিসাব।',
    whyItMatters:
      'দুটো traversal দুটো আলাদা প্রশ্নের উত্তর দেয়। preorder বলে **কে root** — সবসময় পরের অব্যবহৃত মানটাই। inorder বলে **root-এর দুপাশে কারা** — তার আগের সব বাঁয়ে, পরের সব ডানে। একটা দিয়ে গাছ বানানো যায় না; দুটো একসাথে ঠিক একটাই গাছ নির্দিষ্ট করে।',
    highlightLines: [2, 3, 13],
    vars: [
      { name: 'pre', value: 0 },
      { name: 'range', value: '[0,4]' },
    ],
    scene: {
      kind: 'tree',
      nodes: [],
      table: traversalTable(0, 0, 4),
      caption: 'inorder-এর সবুজ অংশ = এখন যে টুকরোটা নিয়ে কাজ হচ্ছে।',
    },
  },

  ...CREATED.map((made, i): SimStep => {
    const leftEmpty = made.leftRange[0] > made.leftRange[1];
    const rightEmpty = made.rightRange[0] > made.rightRange[1];

    return {
      id: `5.2-make-${i + 1}`,
      title: `${made.val} তৈরি — inorder [${made.lo},${made.hi}]-এর root`,
      whatHappens: `preorder-এর পরের অব্যবহৃত মান ${made.val}, তাই এই টুকরোর root সে-ই। inorder-এ ${made.val} আছে index ${made.mid}-এ। তাই বাঁ subtree পাবে ${rangeLabel(made.leftRange)}, ডান subtree পাবে ${rangeLabel(made.rightRange)}।${
        leftEmpty && rightEmpty ? ' দুই পাশই খালি — এটা একটা leaf।' : ''
      }`,
      whyItMatters:
        i === 0
          ? 'preorder-এর প্রথম মানই গোটা গাছের root — এটাই preorder-এর সংজ্ঞা। আর inorder-এ তার অবস্থান পাওয়া মাত্রই সমস্যাটা দুটো ছোট সমস্যায় ভেঙে যায়। map না থাকলে প্রতিবার inorder-এ খুঁজতে O(n) লাগত, মোট O(n²)।'
          : i === 1
            ? '`pre` কখনো পেছায় না — এটা একটা টানা কাউন্টার। কারণ preorder ঠিক সেই ক্রমেই নোডগুলো সাজায় যে ক্রমে এই recursion তাদের বানায়: আগে root, তারপর গোটা বাঁ subtree, তারপর ডান।'
            : i === 2
              ? 'বাঁ দিকটা (মান 9) পুরো শেষ হওয়ার পরেই `pre` 20-এ পৌঁছেছে। তাই ডান subtree-র root হিসেবে 20-ই সঠিক — ক্রমটা নিজেই হিসাব রেখেছে।'
              : undefined,
      highlightLines: [4, 6, 7, 8, 9, 10, 11],
      vars: [
        { name: 'pre', value: i + 1 },
        { name: 'range', value: `[${made.lo},${made.hi}]` },
        { name: 'mid', value: made.mid },
      ],
      scene: {
        kind: 'tree',
        nodes: treeAfter(i + 1),
        rootId: 'n3',
        activeNodeId: made.id,
        table: traversalTable(i + 1, made.lo, made.hi, made.mid),
        caption: `বাঁ: ${rangeLabel(made.leftRange)} · ডান: ${rangeLabel(made.rightRange)}`,
      },
    };
  }),

  {
    id: '5.2-done',
    title: 'শেষ — গাছ সম্পূর্ণ',
    whatHappens:
      'preorder-এর পাঁচটা মানই ব্যবহার হয়ে গেছে। গাছ দাঁড়াল: root `3`, বাঁয়ে `9`, ডানে `20`; আর `20`-এর বাঁয়ে `15`, ডানে `7`।',
    whyItMatters:
      'প্রতিটা নোড ঠিক একবার তৈরি হয়েছে, আর inorder-এ অবস্থান খোঁজা O(1) — তাই মোট O(n)। খেয়াল করুন কোনো নোডের অবস্থান কেউ হাতে ঠিক করেনি; recursion-এর গঠনই গাছটা বানিয়েছে।',
    highlightLines: [13],
    vars: [{ name: 'নোড', value: 5 }],
    scene: {
      kind: 'tree',
      nodes: treeAfter(5).map((node) => ({ ...node, mark: 'done' as CellMark })),
      rootId: 'n3',
      table: traversalTable(5, 0, 4),
      caption: '3(9, 20(15, 7)) — এটাই একমাত্র গাছ যার preorder ও inorder এই দুটো।',
    },
  },
];

export const treeConstructionSim: PatternSimulation = {
  patternId: '5.2',
  input: 'preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]',
  output: '3(9, 20(15, 7))',
  steps,
};
