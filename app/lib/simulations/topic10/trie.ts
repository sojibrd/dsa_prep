import type {
  CellMark,
  PatternSimulation,
  SimStep,
  TrieEdgeData,
  TrieNodeData,
} from '../types';

/* ============================================================================
   10.2 Trie (Prefix Tree) — Implement Trie

   Two short words rather than the workbook's single "apple": "at" and "as"
   share a prefix, so the branch actually branches — which is the one thing a
   trie picture needs to show.
   ========================================================================= */

/** Node ids are their own paths, so a trace line reads without a lookup. */
const NODES = {
  root: 'root',
  a: 'a',
  at: 'a-t',
  as: 'a-s',
} as const;

const EDGE_A = { id: 'e-a', fromId: NODES.root, toId: NODES.a, char: 'a' };
const EDGE_T = { id: 'e-a-t', fromId: NODES.a, toId: NODES.at, char: 't' };
const EDGE_S = { id: 'e-a-s', fromId: NODES.a, toId: NODES.as, char: 's' };

interface Frame {
  /** Which nodes exist at this point. */
  present: string[];
  /** Which of them have `isEnd` set. */
  ends: string[];
  activeNodeId?: string;
  /** Edges lit as part of the current walk. */
  walked: string[];
  pathSoFar: string;
}

function trie(frame: Frame): { nodes: TrieNodeData[]; edges: TrieEdgeData[] } {
  const nodes: TrieNodeData[] = frame.present.map((id) => ({
    id,
    isEnd: frame.ends.includes(id),
    mark: (frame.ends.includes(id) && id !== frame.activeNodeId
      ? 'done'
      : undefined) as CellMark | undefined,
  }));

  const edges = [EDGE_A, EDGE_T, EDGE_S]
    .filter((edge) => frame.present.includes(edge.toId))
    .map((edge) => ({
      ...edge,
      mark: (frame.walked.includes(edge.id) ? 'active' : undefined) as
        | CellMark
        | undefined,
    }));

  return { nodes, edges };
}

const steps: SimStep[] = [
  {
    id: '10.2-init',
    title: 'শুরু — শুধু root',
    whatHappens:
      '`this.root = {}` — একটা খালি object। trie-তে root কোনো অক্ষর ধরে রাখে না; সে কেবল শুরুর বিন্দু।',
    whyItMatters:
      'trie-র নোডে কোনো মান থাকে না — একটা নোড **কী বোঝায়** তা ঠিক করে তার কাছে পৌঁছাতে যে অক্ষরগুলো পেরোতে হয়। তাই অক্ষরগুলো বসে edge-এ, নোডে নয়। এই কারণেই hashmap-এর তুলনায় trie-তে prefix খোঁজা সস্তা: একই prefix-ওয়ালা সব শব্দ আক্ষরিক অর্থেই একই পথ ভাগ করে নেয়।',
    highlightLines: [1, 2, 3, 4],
    vars: [{ name: 'নোড', value: 1 }],
    scene: {
      kind: 'trie',
      ...trie({ present: [NODES.root], ends: [], walked: [], pathSoFar: '' }),
      rootId: NODES.root,
      caption: 'root ছাড়া কিছু নেই।',
    },
  },

  {
    id: '10.2-insert-at-1',
    title: 'insert("at") — \'a\' নতুন নোড',
    whatHappens:
      "`node['a']` নেই, তাই `??=` একটা নতুন খালি object বসাল। `node` সরে এল সেই নতুন নোডে।",
    whyItMatters:
      '`??=` (nullish assignment) এক লাইনে দুটো কাজ করে: না থাকলে তৈরি করো, থাকলে যা আছে তা-ই রাখো। insert-এর পুরো লুপটা তাই এক লাইনে ধরে যায়।',
    highlightLines: [5, 6, 7],
    vars: [
      { name: 'c', value: 'a' },
      { name: 'নোড', value: 2 },
    ],
    scene: {
      kind: 'trie',
      ...trie({
        present: [NODES.root, NODES.a],
        ends: [],
        activeNodeId: NODES.a,
        walked: [EDGE_A.id],
        pathSoFar: 'a',
      }),
      rootId: NODES.root,
      activeNodeId: NODES.a,
      pathSoFar: 'a',
      caption: "root থেকে 'a' লেখা একটা edge গজাল।",
    },
  },

  {
    id: '10.2-insert-at-2',
    title: 'insert("at") — \'t\' নোড, আর শব্দ শেষ',
    whatHappens:
      "'a'-এর নিচে `'t'` নেই, তাই আরেকটা নতুন নোড। শব্দ শেষ, তাই এই নোডে `isEnd = true` বসল।",
    whyItMatters:
      '`isEnd` ছাড়া trie বলতে পারত না "at" একটা পূর্ণ শব্দ নাকি কেবল "ats"-এর অর্ধেক। কাঠামোটা পথ চেনে, কিন্তু কোথায় শব্দ **শেষ** হলো সেটা আলাদা করে চিহ্নিত করতেই হয় — নিচের সবুজ ভেতরের বৃত্তটাই সেই চিহ্ন।',
    highlightLines: [7, 8],
    vars: [
      { name: 'c', value: 't' },
      { name: 'নোড', value: 3 },
    ],
    scene: {
      kind: 'trie',
      ...trie({
        present: [NODES.root, NODES.a, NODES.at],
        ends: [NODES.at],
        activeNodeId: NODES.at,
        walked: [EDGE_A.id, EDGE_T.id],
        pathSoFar: 'at',
      }),
      rootId: NODES.root,
      activeNodeId: NODES.at,
      pathSoFar: 'at',
      output: { title: 'শব্দ', values: ['at'] },
      caption: 'ভেতরের সবুজ বৃত্ত = এখানে একটা শব্দ শেষ হয়েছে।',
    },
  },

  {
    id: '10.2-insert-as',
    title: 'insert("as") — \'a\' পুনর্ব্যবহার, \'s\' নতুন',
    whatHappens:
      "প্রথম অক্ষর `'a'` — নোডটা আগে থেকেই আছে, তাই `??=` কিছু বানাল না, শুধু নেমে গেল। দ্বিতীয় অক্ষর `'s'` নেই, তাই নতুন নোড, আর `isEnd = true`।",
    whyItMatters:
      'এখানেই trie-র আসল সাশ্রয় দেখা যায়। "at" আর "as" — দুটো শব্দ, কিন্তু \'a\' নোডটা একটাই। হাজারটা শব্দ একই prefix দিয়ে শুরু হলেও সেই prefix একবারই জমা থাকে। শাখা ভাগ হয় ঠিক সেখানেই যেখানে শব্দগুলো আলাদা হয়।',
    highlightLines: [5, 6, 7, 8],
    vars: [
      { name: 'c', value: 's' },
      { name: 'নোড', value: 4 },
    ],
    scene: {
      kind: 'trie',
      ...trie({
        present: [NODES.root, NODES.a, NODES.at, NODES.as],
        ends: [NODES.at, NODES.as],
        activeNodeId: NODES.as,
        walked: [EDGE_A.id, EDGE_S.id],
        pathSoFar: 'as',
      }),
      rootId: NODES.root,
      activeNodeId: NODES.as,
      pathSoFar: 'as',
      output: { title: 'শব্দ', values: ['at', 'as'] },
      caption: "'a' নোডটা দুই শব্দেরই — শাখা ভাগ হলো এখান থেকে।",
    },
  },

  {
    id: '10.2-search-at',
    title: 'search("at") → true',
    whatHappens:
      "`_walk(\"at\")` root থেকে 'a', তারপর 't' — দুটোই পাওয়া গেল, তাই নোড ফেরত এল। সেই নোডে `isEnd === true`, তাই উত্তর `true`।",
    whyItMatters:
      '`search`-এ দুটো আলাদা প্রশ্ন: পথটা আছে কি, আর সেখানে শব্দ শেষ হয় কি। প্রথমটা `_walk` দেখে, দ্বিতীয়টা `isEnd`। এই ভাগাভাগিই `search` ও `startsWith`-কে একই হাঁটা ভাগ করে নিতে দেয়।',
    highlightLines: [10, 11, 12, 17, 18, 19, 20, 21, 23],
    vars: [
      { name: 'পথ', value: 'at' },
      { name: 'isEnd', value: 'true' },
    ],
    scene: {
      kind: 'trie',
      ...trie({
        present: [NODES.root, NODES.a, NODES.at, NODES.as],
        ends: [NODES.at, NODES.as],
        activeNodeId: NODES.at,
        walked: [EDGE_A.id, EDGE_T.id],
        pathSoFar: 'at',
      }),
      rootId: NODES.root,
      activeNodeId: NODES.at,
      pathSoFar: 'at',
      output: { title: 'ফেরত', values: ['true'] },
      caption: 'পথও আছে, শব্দও শেষ হয় — তাই true।',
    },
  },

  {
    id: '10.2-search-a',
    title: 'search("a") → false',
    whatHappens:
      "`_walk(\"a\")` নোডটা ঠিকই খুঁজে পেল — কিন্তু সেই নোডে `isEnd` সেট করা নেই। তাই `false`।",
    whyItMatters:
      'নোড থাকা আর শব্দ থাকা এক নয়। \'a\' নোডটা কেবল "at" ও "as"-এ যাওয়ার পথ; সে নিজে কোনো শব্দ নয়। এই পার্থক্যটাই `search` আর `startsWith`-এর মধ্যে দূরত্ব — পরের ধাপে সেটা স্পষ্ট হবে।',
    highlightLines: [10, 11, 12],
    vars: [
      { name: 'পথ', value: 'a' },
      { name: 'isEnd', value: 'false' },
    ],
    scene: {
      kind: 'trie',
      ...trie({
        present: [NODES.root, NODES.a, NODES.at, NODES.as],
        ends: [NODES.at, NODES.as],
        activeNodeId: NODES.a,
        walked: [EDGE_A.id],
        pathSoFar: 'a',
      }),
      rootId: NODES.root,
      activeNodeId: NODES.a,
      pathSoFar: 'a',
      output: { title: 'ফেরত', values: ['false'] },
      caption: "'a' নোডে কোনো ভেতরের বৃত্ত নেই — এখানে কোনো শব্দ শেষ হয় না।",
    },
  },

  {
    id: '10.2-startswith-a',
    title: 'startsWith("a") → true',
    whatHappens:
      'একই হাঁটা, একই নোড — কিন্তু এবার `isEnd` দেখাই হয় না। নোড `null` নয়, তাই উত্তর `true`।',
    whyItMatters:
      'একই নোড, দুই প্রশ্ন, দুই উত্তর — আর কোডে পার্থক্য মাত্র একটা শর্ত। এখানেই trie hashmap-কে হারায়: hashmap-এ "কোন শব্দগুলো `a` দিয়ে শুরু" জানতে সব key ঘেঁটে দেখতে হতো; trie-তে prefix-এর নোডে পৌঁছানো মানেই নিচের গোটা উপগাছটা হাতে চলে আসা।',
    highlightLines: [14, 15],
    vars: [
      { name: 'পথ', value: 'a' },
      { name: 'নোড', value: 'null নয়' },
    ],
    scene: {
      kind: 'trie',
      ...trie({
        present: [NODES.root, NODES.a, NODES.at, NODES.as],
        ends: [NODES.at, NODES.as],
        activeNodeId: NODES.a,
        walked: [EDGE_A.id],
        pathSoFar: 'a',
      }),
      rootId: NODES.root,
      activeNodeId: NODES.a,
      pathSoFar: 'a',
      output: { title: 'ফেরত', values: ['true'] },
      caption: 'নিচে দুটো শব্দই আছে — "at" আর "as"।',
    },
  },

  {
    id: '10.2-done',
    title: 'শেষ — ৪টা নোড, ২টা শব্দ',
    whatHappens:
      'চূড়ান্ত গঠন: root → `a` → দুটো সন্তান `t` ও `s`, দুটোতেই `isEnd`।',
    whyItMatters:
      'প্রতিটা অপারেশনের খরচ O(L), যেখানে L শব্দের দৈর্ঘ্য — শব্দসংখ্যার সাথে কোনো সম্পর্ক নেই। জায়গা লাগে মোট অক্ষরসংখ্যার সমান, তবে ভাগ করা prefix-গুলো একবারই জমা হয়। autocomplete, বানান পরীক্ষা, IP রাউটিং — সবখানেই এই কাঠামো।',
    highlightLines: [23],
    vars: [
      { name: 'নোড', value: 4 },
      { name: 'শব্দ', value: 2 },
    ],
    scene: {
      kind: 'trie',
      ...trie({
        present: [NODES.root, NODES.a, NODES.at, NODES.as],
        ends: [NODES.at, NODES.as],
        walked: [],
        pathSoFar: '',
      }),
      rootId: NODES.root,
      output: { title: 'শব্দ', values: ['at', 'as'] },
      caption: "'a' একবারই জমা আছে, যদিও দুটো শব্দেই সে আছে।",
    },
  },
];

export const trieSim: PatternSimulation = {
  patternId: '10.2',
  input: 'insert("at"), insert("as"), search("at"), search("a"), startsWith("a")',
  output: 'true, false, true',
  steps,
};
