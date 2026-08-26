import type { CellMark, LinkedListNode, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   10.3 Design — LRU Cache

   No new scene kind. The demo leans on a JS `Map`'s insertion order as
   recency, which IS a chain: front = least-recently-used (the eviction
   candidate), back = most-recent. That is exactly what `LinkedListScene`
   draws, so it draws it.
   ========================================================================= */

interface Entry {
  key: number;
  value: number;
}

interface Frame {
  /** Chain from LRU (front) to MRU (back). */
  chain: Entry[];
  /** Key just touched, drawn `active`. */
  touched?: number;
  /** Key being evicted this step, drawn `reject` before it disappears. */
  evicting?: number;
}

const CAPACITY = 2;

const nodeId = (entry: Entry) => `k${entry.key}`;

function chainNodes(frame: Frame): LinkedListNode[] {
  const all = frame.evicting !== undefined
    ? [{ key: frame.evicting, value: frame.evicting }, ...frame.chain]
    : frame.chain;

  return all.map((entry, i) => ({
    id: nodeId(entry),
    val: `${entry.key}:${entry.value}`,
    nextId: all[i + 1] ? nodeId(all[i + 1]) : null,
    mark: (entry.key === frame.evicting
      ? 'reject'
      : entry.key === frame.touched
        ? 'active'
        : 'done') as CellMark,
  }));
}

function ends(frame: Frame) {
  if (frame.chain.length === 0) return [];
  const front = frame.chain[0];
  const back = frame.chain[frame.chain.length - 1];
  if (front.key === back.key) {
    return [{ name: 'LRU·MRU', nodeId: nodeId(front) }];
  }
  return [
    { name: 'LRU', nodeId: nodeId(front) },
    { name: 'MRU', nodeId: nodeId(back) },
  ];
}

const steps: SimStep[] = [
  {
    id: '10.3-init',
    title: 'শুরু — খালি cache, ধারণক্ষমতা 2',
    whatHappens:
      '`capacity = 2`, `map` খালি। এই `Map`-এর **ঢোকার ক্রম**টাই recency — সামনে সবচেয়ে পুরনো ব্যবহার, পেছনে সবচেয়ে নতুন।',
    whyItMatters:
      'ক্লাসিক সমাধান hashmap + doubly-linked list জুড়ে বানানো হয়: hashmap দেয় O(1) খোঁজা, list দেয় O(1) সরানো। JS-এর `Map` দুটোই একসাথে দেয় — সে key-এর ক্রম মনে রাখে, আর `delete` + `set` করলে entry-টা পেছনে চলে যায়। তাই এখানে হাতে list বানানোর দরকার পড়ে না; কিন্তু ধারণাটা ঠিক সেই chain-ই।',
    highlightLines: [2, 3, 4],
    vars: [
      { name: 'capacity', value: CAPACITY },
      { name: 'size', value: 0 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: [],
      caption: 'চেইনের সামনে LRU (বাদ পড়ার প্রার্থী), পেছনে MRU।',
    },
  },

  {
    id: '10.3-put-1',
    title: 'put(1, 1) — প্রথম entry',
    whatHappens:
      'key 1 আগে ছিল না, তাই সরাসরি `map.set(1, 1)`। size এখন 1, ধারণক্ষমতার মধ্যেই।',
    highlightLines: [13, 14, 15],
    vars: [
      { name: 'size', value: 1 },
      { name: 'chain', value: '[1:1]' },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chainNodes({ chain: [{ key: 1, value: 1 }], touched: 1 }),
      pointers: ends({ chain: [{ key: 1, value: 1 }] }),
      caption: 'একটাই entry — সে-ই একসাথে LRU আর MRU।',
    },
  },

  {
    id: '10.3-put-2',
    title: 'put(2, 2) — cache ভরে গেল',
    whatHappens:
      'key 2 নতুন, তাই পেছনে যোগ হলো। chain এখন `[1:1, 2:2]` — 1 সামনে (পুরনো), 2 পেছনে (নতুন)। size = capacity, এখনো evict লাগেনি।',
    whyItMatters:
      'সদ্য যোগ হওয়া entry সবসময় পেছনে বসে, কারণ সে-ই এখন সবচেয়ে সাম্প্রতিক। এই এক নিয়মেই ক্রমটা নিজে নিজে ঠিক থাকে — আলাদা টাইমস্ট্যাম্প রাখতে হয় না।',
    highlightLines: [13, 14, 15, 16],
    vars: [
      { name: 'size', value: 2 },
      { name: 'chain', value: '[1:1, 2:2]' },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chainNodes({
        chain: [{ key: 1, value: 1 }, { key: 2, value: 2 }],
        touched: 2,
      }),
      pointers: ends({ chain: [{ key: 1, value: 1 }, { key: 2, value: 2 }] }),
      caption: 'ভরা cache — পরের নতুন entry কাউকে হটাবে।',
    },
  },

  {
    id: '10.3-get-1',
    title: 'get(1) → 1, আর 1 সরে গেল পেছনে',
    whatHappens:
      'key 1 আছে, মান 1। কিন্তু শুধু পড়েই ক্ষান্ত নয় — `delete` করে আবার `set` করা হলো, তাই 1 চেইনের পেছনে চলে গেল। chain এখন `[2:2, 1:1]`।',
    whyItMatters:
      'এটাই LRU-র সবচেয়ে সহজে ভুলে যাওয়া অংশ: **পড়াও একটা ব্যবহার**। get-এ recency আপডেট না করলে সদ্য-পড়া entry-ই পরের বার বাদ পড়ে যেত — আর cache-টা তখন LRU না হয়ে FIFO হয়ে যেত। `delete` + `set` জোড়াটাই Map-এ "পেছনে সরাও" লেখার উপায়।',
    highlightLines: [6, 7, 8, 9, 10, 11],
    vars: [
      { name: 'ফেরত', value: 1 },
      { name: 'chain', value: '[2:2, 1:1]' },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chainNodes({
        chain: [{ key: 2, value: 2 }, { key: 1, value: 1 }],
        touched: 1,
      }),
      pointers: ends({ chain: [{ key: 2, value: 2 }, { key: 1, value: 1 }] }),
      output: { title: 'ফেরত', values: [1] },
      caption: '1 এখন MRU, আর 2 সামনে সরে এসে বাদ পড়ার প্রার্থী হলো।',
    },
  },

  {
    id: '10.3-put-3-evict',
    title: 'put(3, 3) — 2 বাদ পড়ল',
    whatHappens:
      '3 যোগ করায় size দাঁড়াল 3, যা capacity 2-এর বেশি। তাই `map.keys().next().value` — অর্থাৎ চেইনের সামনের key (2) — মুছে ফেলা হলো।',
    whyItMatters:
      'ঠিক আগের ধাপে get(1) না হলে সামনে থাকত 1, আর 1-ই বাদ পড়ত। একটা পড়া গোটা সিদ্ধান্তটা উল্টে দিল — এটাই "least recently used"-এর মানে।',
    highlightLines: [16, 17],
    vars: [
      { name: 'evict', value: 'key 2' },
      { name: 'size', value: 2 },
    ],
    scene: {
      kind: 'linked-list',
      nodes: chainNodes({
        chain: [{ key: 1, value: 1 }, { key: 3, value: 3 }],
        touched: 3,
        evicting: 2,
      }),
      pointers: ends({ chain: [{ key: 1, value: 1 }, { key: 3, value: 3 }] }),
      caption: 'ম্লান নোডটাই বাদ পড়া 2 — পরের ফ্রেমে সে আর থাকবে না।',
    },
  },

  {
    id: '10.3-done',
    title: 'শেষ — chain হলো [1:1, 3:3]',
    whatHappens: 'key 2 বাদ পড়েছে। cache-এ এখন 1 আর 3।',
    whyItMatters:
      'চারটে অপারেশনই O(1) — `Map` দিয়ে খোঁজা, মোছা ও বসানো সবই ধ্রুব সময়ে। ইন্টারভিউতে `Map`-এর ক্রম-সংরক্ষণের উপর নির্ভর না করে hashmap + doubly-linked list হাতে বানাতে বলা হতে পারে; ধারণা এক, শুধু চেইনটা তখন নিজে সামলাতে হয় (এবং তখন 3.2-এর dummy নোডের কৌশল কাজে লাগে, প্রান্তের ক্ষেত্রগুলো মুছে দিতে)।',
    highlightLines: [17],
    vars: [{ name: 'chain', value: '[1:1, 3:3]' }],
    scene: {
      kind: 'linked-list',
      nodes: chainNodes({ chain: [{ key: 1, value: 1 }, { key: 3, value: 3 }] }),
      pointers: ends({ chain: [{ key: 1, value: 1 }, { key: 3, value: 3 }] }),
      output: { title: 'cache', values: ['1:1', '3:3'] },
      caption: 'পরের নতুন entry এলে 1 বাদ পড়বে — সে-ই এখন LRU।',
    },
  },
];

export const lruCacheSim: PatternSimulation = {
  patternId: '10.3',
  input: 'capacity = 2; put(1,1), put(2,2), get(1), put(3,3)',
  output: '[1:1, 3:3] — key 2 evicted',
  steps,
};
