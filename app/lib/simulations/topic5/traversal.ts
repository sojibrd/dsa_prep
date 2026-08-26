import type { CellMark, PatternSimulation, SimStep, TreeNodeData } from '../types';

/* ============================================================================
   5.1 Tree Traversal — Binary Tree Zigzag Level Order (LC 103)
   ========================================================================= */

const SHAPE: { id: string; val: number; leftId?: string; rightId?: string }[] = [
  { id: 'n3', val: 3, leftId: 'n9', rightId: 'n20' },
  { id: 'n9', val: 9 },
  { id: 'n20', val: 20, leftId: 'n15', rightId: 'n7' },
  { id: 'n15', val: 15 },
  { id: 'n7', val: 7 },
];

/** Nodes grouped by depth — the queue's contents at each turn of the loop. */
const LEVELS = [['n3'], ['n9', 'n20'], ['n15', 'n7']];

const VAL: Record<string, number> = Object.fromEntries(
  SHAPE.map((node) => [node.id, node.val])
);

function tree(marks: Record<string, CellMark> = {}): TreeNodeData[] {
  return SHAPE.map((node) => ({ ...node, mark: marks[node.id] }));
}

/** Levels already emitted settle; the level being read is live. */
function marksFor(levelIndex: number): Record<string, CellMark> {
  const marks: Record<string, CellMark> = {};
  for (let i = 0; i < levelIndex; i++) {
    for (const id of LEVELS[i]) marks[id] = 'done';
  }
  for (const id of LEVELS[levelIndex] ?? []) marks[id] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '5.1-init',
    title: 'শুরু — queue-তে শুধু root',
    whatHappens:
      '`queue = [root]`, `leftToRight = true`, `res` খালি। প্রতিবার লুপ ঘুরলে queue-তে ঠিক **একটা গোটা level** থাকবে।',
    whyItMatters:
      'সাধারণ BFS-এ queue-তে বিভিন্ন level-এর নোড মিশে থাকে, তাই "কোথায় level শেষ" আলাদা করে গুনতে হয়। এখানে প্রতি iteration-এ পুরো queue-টাই এক level — তাই পরের queue বানানো হয় বর্তমান queue-এর সব সন্তান একসাথে নিয়ে। level-এর সীমানা তখন আপনাআপনি ঠিক থাকে।',
    highlightLines: [3, 4, 5],
    vars: [
      { name: 'queue', value: '[3]' },
      { name: 'leftToRight', value: 'true' },
    ],
    scene: {
      kind: 'tree',
      nodes: tree({ n3: 'active' }),
      rootId: 'n3',
      output: { title: 'res', values: [] },
      caption: 'zigzag: প্রথম level বাঁ→ডান, পরেরটা ডান→বাঁ, এভাবে পালা করে।',
    },
  },

  ...LEVELS.map((level, i): SimStep => {
    const raw = level.map((id) => VAL[id]);
    const leftToRight = i % 2 === 0;
    const out = leftToRight ? raw : [...raw].reverse();
    const emitted = LEVELS.slice(0, i + 1).map((lv, j) => {
      const values = lv.map((id) => VAL[id]);
      return j % 2 === 0 ? values : [...values].reverse();
    });

    return {
      id: `5.1-level-${i + 1}`,
      title: `Level ${i + 1} — ${leftToRight ? 'বাঁ → ডান' : 'ডান → বাঁ'}`,
      whatHappens: `queue-তে এখন এই level-এর নোডগুলো: [${raw.join(', ')}]। ${
        leftToRight
          ? `দিক বাঁ→ডান, তাই যেমন আছে তেমনই res-এ গেল: [${out.join(', ')}]।`
          : `দিক ডান→বাঁ, তাই উল্টে দিয়ে res-এ গেল: [${out.join(', ')}]।`
      } এরপর queue হয়ে গেল এদের সব সন্তান।`,
      whyItMatters:
        i === 0
          ? undefined
          : i === 1
            ? 'zigzag-এর জন্য গাছ ঘোরানো হয়নি, শুধু তালিকাটা উল্টে দেওয়া হয়েছে। traversal সবসময় একই — বাঁ থেকে ডানে; দিক বদলটা নিছক উপস্থাপনার, তাই সেটা শেষে সামলানোই সবচেয়ে সরল।'
            : 'পরের queue খালি হবে (এই দুটো leaf), তাই লুপ এখানেই শেষ।',
      highlightLines: [6, 7, 8, 9, 10],
      vars: [
        { name: 'level', value: `[${raw.join(', ')}]` },
        { name: 'leftToRight', value: leftToRight ? 'true' : 'false' },
      ],
      scene: {
        kind: 'tree',
        nodes: tree(marksFor(i)),
        rootId: 'n3',
        highlightPath: level,
        output: { title: 'res', values: emitted.map((lv) => `[${lv.join(',')}]`) },
        caption: `raw [${raw.join(', ')}] → out [${out.join(', ')}]`,
      },
    };
  }),

  {
    id: '5.1-done',
    title: 'শেষ — [[3], [20,9], [15,7]]',
    whatHappens: 'queue খালি, লুপ থামল। উত্তর `[[3], [20,9], [15,7]]`।',
    whyItMatters:
      'প্রতিটা নোড একবার queue-তে ঢোকে আর একবার বেরোয় — O(n) সময়, আর সবচেয়ে চওড়া level-এর সমান জায়গা। `flatMap` দিয়ে গোটা level এক ধাক্কায় বানানোই এই কোডটাকে এত ছোট রেখেছে।',
    highlightLines: [12],
    vars: [{ name: 'res', value: '[[3],[20,9],[15,7]]' }],
    scene: {
      kind: 'tree',
      nodes: tree({ n3: 'done', n9: 'done', n20: 'done', n15: 'done', n7: 'done' }),
      rootId: 'n3',
      output: { title: 'res', values: ['[3]', '[20,9]', '[15,7]'] },
      caption: 'তিনটে level, পালা করে দিক বদলে।',
    },
  },
];

export const treeTraversalSim: PatternSimulation = {
  patternId: '5.1',
  input: 'root = [3,9,20,null,null,15,7]',
  output: '[[3],[20,9],[15,7]]',
  steps,
};
