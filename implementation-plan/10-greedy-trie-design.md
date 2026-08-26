# Implementation Plan — Topic 10: Greedy, Trie & Design (Pattern Simulations)

## এই ডকুমেন্ট কীভাবে পড়বেন

আপনি একটা AI যে এই কথোপকথনটা দেখেননি। শুরু করার আগে এই ক্রমে পড়ুন:

1. `d:\document-files\dsa_prep\AGENTS.md`
2. `d:\document-files\dsa_prep\context\ui-tokens.md` ও `context\ui-rules.md` — Theme Contract
3. `d:\document-files\dsa_prep\context\ui-registry.md` — "🎬 Simulation" সেকশন
4. `d:\document-files\dsa_prep\app\lib\simulations\types.ts` — Scene কনট্র্যাক্ট
5. `d:\document-files\dsa_prep\implementation-plan\5-trees.md` — নতুন `TrieScene`-এর জন্য layout কৌশলের রেফারেন্স (SVG + হিসাব করা position, React Flow নয়); আগে implement হয়ে থাকলে `app\components\simulation\TreeScene.tsx`-ও দেখুন
6. `d:\document-files\dsa_prep\implementation-plan\3-linked-lists.md` — `LinkedListScene`/`LinkedListNode`-এর ডিজাইন, ১০.৩-এ এটাই পুনর্ব্যবহার হবে
7. `d:\document-files\dsa_prep\implementation-plan\1-arrays-strings.md` — Scene কনট্র্যাক্টের ভিত্তি ও reference স্টাইল
8. `d:\document-files\dsa_prep\context\dsa-workbook\10. Greedy, Trie & Design\*.md` — raw ডেটা

**এই প্ল্যান কী নয়:** চূড়ান্ত TypeScript কোড নয়। scene kind সিদ্ধান্ত, একটা নতুন টাইপের ডিজাইন, আর প্রতিটা প্যাটার্নের যাচাই-করা trace আছে — `SimStep` object ও বাংলা ব্যাখ্যা আপনাকে লিখতে হবে।

## প্রেক্ষাপট — Topic 10-এ ৩টা প্যাটার্ন

| id | নাম | Demo | Scene kind |
|---|---|---|---|
| 10.1 | Greedy | Candy | `array` (পুনর্ব্যবহার) |
| 10.2 | Trie (Prefix Tree) | Implement Trie | **`trie` (নতুন)** |
| 10.3 | Design (Cache ও Data Structure Composition) | LRU Cache | `linked-list` (পুনর্ব্যবহার — নিচে ব্যাখ্যা) |

---

## 10.1 Greedy — `array` পুনর্ব্যবহার

**Demo:** Candy — কোড অপরিবর্তিত:

```js
function candy(ratings) {
  const n = ratings.length;
  const candies = new Array(n).fill(1);
  for (let i = 1; i < n; i++)
    if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;
  for (let i = n - 2; i >= 0; i--)
    if (ratings[i] > ratings[i + 1])
      candies[i] = Math.max(candies[i], candies[i + 1] + 1);
  return candies.reduce((a, b) => a + b, 0);
}
```

লাইন: ১=function, ২=n, ৩=candies init (সব ১), ৪-৫=বাম→ডান পাস, ৬-৮=ডান→বাম পাস, ৯=return sum।

**Scene:** `array`, দুইটা সমান্তরাল সারি দরকার — `ratings` (input, অপরিবর্তিত) আর `candies` (চলমান)। যেহেতু `ArrayScene`-এ একটাই `values` থাকে, **`values` = `candies`** রাখুন (এটাই মূল গল্প — কে কত চকলেট পাচ্ছে) এবং `ratings`-কে `subValues`/`subLabel="rating"` দিয়ে প্রতিটা cell-এর নিচে দেখান (এটা ঠিক Kadane ১.৬-এর `subValues` ব্যবহারের মতোই বৈধ — এখানে `ratings` প্রতিটা index-এর নিজস্ব দ্বিতীয় মান, স্কেলার running state নয়)। `marks[i]='active'` বর্তমান index।

**Demo input:** `ratings = [1, 0, 2, 1, 3]` (workbook-এর ডিফল্ট `[1,0,2]`-এর চেয়ে সামান্য বড়, দুই পাসই স্পষ্ট দেখানোর জন্য)।

**সম্পূর্ণ ট্রেস (৪টা পরিবর্তনকারী স্টেপ, script দিয়ে যাচাই করা — বাকি index-এ কোনো পরিবর্তন হয় না, তাই স্টেপ বানানোর দরকার নেই):**

| # | পাস | i | candies (এই স্টেপের পরে) |
|---|---|---|---|
| 0 (init) | — | — | `[1,1,1,1,1]` |
| 1 | বাম→ডান | 2 | `[1,1,2,1,1]` (rating[2]=2 > rating[1]=0) |
| 2 | বাম→ডান | 4 | `[1,1,2,1,2]` (rating[4]=3 > rating[3]=1) |
| 3 | ডান→বাম | 0 | `[2,1,2,1,2]` (rating[0]=1 > rating[1]=0, candies[0]=max(1,1+1)=2) |

(index ১, ৩-এ কোনো পাসেই পরিবর্তন হয় না — ওরা `1` থেকেই থাকে, কারণ প্রতিবেশীর চেয়ে rating কম/সমান।)

**চূড়ান্ত: `candies=[2,1,2,1,2]`, total = 8`।**

---

## 10.2 Trie (Prefix Tree) — নতুন scene kind `trie`

### কেন `TreeScene` যথেষ্ট না

`TreeScene` strictly **binary** (`leftId`/`rightId`)। Trie-র একটা নোডে ২৬টা পর্যন্ত সন্তান থাকতে পারে (প্রতিটা alphabet অক্ষরের জন্য একটা), আর সন্তানের দিকে যাওয়ার "কী" (character) নিজেই গুরুত্বপূর্ণ তথ্য — edge-এর গায়ে label লাগবে, যা `TreeScene`-এ নেই। তাই আলাদা টাইপ।

### `types.ts`-এ যোগ করুন

```ts
/** One node in a trie — no value of its own, only whether a word ends here. */
export interface TrieNodeData {
  id: string;
  /** `true` once a complete word has been inserted ending at this node. */
  isEnd?: boolean;
  mark?: CellMark;
}

/** One character-labelled edge from a parent node to a child. */
export interface TrieEdgeData {
  id: string;
  fromId: string;
  toId: string;
  /** The single character this edge represents. */
  char: string;
  mark?: CellMark;
}

/**
 * A prefix tree — insert/search/startsWith walks, character by character.
 *
 * Laid out the same way `TreeScene` lays out a binary tree (computed x/y, no
 * manual coordinates in a data file) but n-ary: a node's children fan out
 * under it in insertion order rather than left/right.
 */
export interface TrieScene extends SceneBase {
  kind: 'trie';
  nodes: TrieNodeData[];
  edges: TrieEdgeData[];
  rootId: string;
  /** The node the walk is standing on right now. */
  activeNodeId?: string;
  /** The characters already consumed on this walk, e.g. for a caption. */
  pathSoFar?: string;
}
```

`Scene` union-এ যোগ করুন (`GraphScene`-ও যদি একই সময়ে implement করছেন, দুটোই এক লাইনে):

```ts
export type Scene =
  | ArrayScene | MatrixScene | IntervalsScene | LinkedListScene | TreeScene | TrieScene /* | GraphScene */;
```

`SceneView.tsx`-এ `case 'trie': return <TrieScene scene={scene} />;` যোগ করুন।

### `TrieScene.tsx` — কী আঁকতে হবে

`5-trees.md`-এ বর্ণিত `TreeScene`-এর গঠন অনুসরণ করুন কিন্তু n-ary:
1. রুট থেকে BFS/DFS করে প্রতিটা নোডের depth (y) আর ভাইদের মধ্যে ক্রম (x, in-order-এর মতো কিন্তু children ১-২টা না হয়ে যতগুলো থাকে ততগুলো সমান ভাগে ছড়ানো) হিসাব করুন।
2. প্রতিটা নোড = ছোট বৃত্ত/বর্গ, `isEnd=true` হলে ভিন্ন mark (double-ring বা `data-mark="done"`)।
3. প্রতিটা edge-এ **character label** — এটাই এই scene-এর মূল ভিজ্যুয়াল উপাদান, `TreeScene`-এর edge-এ কোনো label থাকে না, এখানে অবশ্যই থাকতে হবে (`<text>` edge-এর মাঝে)।
4. `activeNodeId` থাকলে সেই নোড `active` মার্ক।
5. `pathSoFar` থাকলে ক্যাপশনে দেখান ("এখন পর্যন্ত পড়া হয়েছে: `ap`")।
6. `<SceneAside table={table} output={output} />` জুড়ুন।

নতুন role class লাগবে যদি নোডের ভেতরে `isEnd` মার্কার আলাদা দেখাতে চান (যেমন ভরাট বৃত্ত বনাম ফাঁকা বৃত্ত) — Theme Contract মেনে `--t-sim-*` টোকেন দিয়েই, hardcoded রং নয়।

### Demo

**Demo:** Implement Trie — কোড অপরিবর্তিত:

```js
class Trie {
  constructor() {
    this.root = {};
  }
  insert(word) {
    let node = this.root;
    for (const c of word) node = node[c] ??= {};
    node.isEnd = true;
  }
  search(word) {
    const node = this._walk(word);
    return !!node && node.isEnd === true;
  }
  startsWith(prefix) {
    return this._walk(prefix) !== null;
  }
  _walk(s) {
    let node = this.root;
    for (const c of s) {
      node = node[c];
      if (!node) return null;
    }
    return node;
  }
}
```

লাইন: ১=class, ২-৪=constructor, ৫=insert declare, ৬-৭=insert body (for char, node=node[c]??={}), ৮=isEnd=true, ৯=search declare, ১০-১১=search body, ১২=startsWith declare, ১৩=startsWith body, ১৪=_walk declare, ১৫-১৮=_walk body (for char, node lookup, null check), ১৯=return node।

**Scene:** `trie`, নোড আইডি `root`, `root-a`, `root-a-t` ইত্যাদি (path অনুযায়ী নাম দিন যাতে readable হয়)। `activeNodeId` = বর্তমান walk-এর অবস্থান।

**Demo input — call sequence:**

```
insert("at")
insert("as")
search("at")     → true
search("a")      → false
startsWith("a")  → true
```

(workbook-এর ডিফল্ট `insert("apple")` একটাই শব্দ, branching দেখানোর জন্য দুটো ছোট শব্দ প্রস্তাবিত যাতে trie-র "শাখা ভাগ হওয়া" (branching) স্পষ্ট দেখা যায়।)

### সম্পূর্ণ ট্রেস (৬টা স্টেপ, হাতে হিসাব করা — deterministic, structure-এ কোনো দ্বিধা নেই)

| # | call | ঘটনা | নোড তৈরি/mark |
|---|---|---|---|
| 1 | insert("at") | root→'a' নোড তৈরি (আগে ছিল না) | নতুন নোড `a` |
| 2 | insert("at") | 'a'→'t' নোড তৈরি, `isEnd=true` | নতুন নোড `a-t`, `isEnd` |
| 3 | insert("as") | root→'a' (আগে থেকেই আছে, পুনর্ব্যবহার), 'a'→'s' নতুন নোড, `isEnd=true` | নতুন নোড `a-s`, `isEnd` |
| 4 | search("at") | root→a→t walk করে, শেষে `isEnd===true` | `activeNodeId` শেষে `a-t` → **true** |
| 5 | search("a") | root→a walk করে (node পাওয়া গেছে), কিন্তু `a`-এর `isEnd` **false** | `activeNodeId`=`a` → **false** |
| 6 | startsWith("a") | root→a walk করে, node null নয় | `activeNodeId`=`a` → **true** |

চূড়ান্ত trie গঠন: `root` → child `'a'` → children `'t'` (isEnd) ও `'s'` (isEnd)। মোট ৩টা নোড + root।

---

## 10.3 Design (Cache ও Data Structure Composition) — `linked-list` পুনর্ব্যবহার

### কেন নতুন scene লাগছে না

LRU Cache-এর demo code জাভাস্ক্রিপ্টের `Map`-এর **insertion order**-কে recency হিসেবে ব্যবহার করে — এটা conceptually একটা chain: সামনে সবচেয়ে কম-সম্প্রতি-ব্যবহৃত (LRU, evict হবে), পেছনে সবচেয়ে বেশি-সম্প্রতি-ব্যবহৃত (MRU)। এটা হুবহু `LinkedListScene`-এর গঠন — প্রতিটা `LinkedListNode` একটা cache entry (`val = "key:value"`), `nextId` দিয়ে chain, নতুন scene kind লাগবে না।

**Demo:** LRU Cache — কোড অপরিবর্তিত:

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // insertion order = recency
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val); // most-recent করে দিন
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity)
      this.map.delete(this.map.keys().next().value); // least-recent বাদ
  }
}
```

লাইন: ১=class, ২-৫=constructor, ৬=get declare, ৭=miss check, ৮-৯=val বের করে delete, ১০=set (front থেকে সরিয়ে back-এ), ১১=return, ১২=put declare, ১৩=আগে থাকলে delete, ১৪=set, ১৫-১৬=capacity ছাড়ালে সবচেয়ে পুরনোটা (Map-এর প্রথম key) বাদ।

**Scene:** `linked-list`, `nodes` = cache entries, **array-তে front = LRU (বাদ দেওয়ার প্রার্থী), back = MRU**। `pointers`: `[{name:"LRU", nodeId: front-এর id}, {name:"MRU", nodeId: back-এর id}]`। get/put-এ move হওয়া entry `marks='active'`, evict হওয়া entry `marks='reject'` (evict হওয়ার স্টেপেই দেখান, পরের স্টেপে সরিয়ে ফেলুন)।

**Demo input — call sequence (workbook-এর নিজস্ব উদাহরণ, capacity=2):**

```
put(1, 1)
put(2, 2)
get(1)      → 1
put(3, 3)   → evicts key 2
```

### সম্পূর্ণ ট্রেস (৪টা স্টেপ, হাতে হিসাব করা — deterministic)

| # | call | chain (front→back, আগে) | ঘটনা | chain (পরে) |
|---|---|---|---|---|
| 1 | put(1,1) | (খালি) | নতুন নোড `1:1` যোগ (একমাত্র entry) | `[1:1]` |
| 2 | put(2,2) | `[1:1]` | নতুন নোড `2:2` back-এ যোগ | `[1:1, 2:2]` |
| 3 | get(1) | `[1:1, 2:2]` | key 1 পাওয়া গেছে (val=1), front থেকে সরিয়ে back-এ বসানো হলো (most-recent) | `[2:2, 1:1]` → **return 1** |
| 4 | put(3,3) | `[2:2, 1:1]` | নতুন entry যোগ করলে size (৩) > capacity (২) — front-এর (`2:2`, এখন LRU) entry evict, তারপর `3:3` back-এ যোগ | `[1:1, 3:3]` |

**চূড়ান্ত chain: `[1:1, 3:3]`** — key 2 বাদ পড়েছে, এটাই workbook-এর প্রত্যাশিত ফলাফল।

---

## যাচাই (implement করার পর)

```bash
cd d:\document-files\dsa_prep
npx tsc --noEmit
npx eslint app --ext .ts,.tsx
npx next build
```

## শেষে যা আপডেট করবেন

- `app/lib/simulations/types.ts` — `TrieNodeData`, `TrieEdgeData`, `TrieScene`, `Scene` union
- `app/components/simulation/TrieScene.tsx` — নতুন ফাইল
- `app/components/simulation/SceneView.tsx` — নতুন `case 'trie'`
- `app/lib/simulations/index.ts` — ৩টা নতুন import + `ALL` array
- `context/ui-registry.md` — "🎬 Simulation" সেকশনে `<TrieScene>`-এর এন্ট্রি
- `context/progress-tracker.md` — টপিক ১০-এর এন্ট্রি; এই মুহূর্তে **সব টপিক (১-১০, টপিক ৬ বাদে যার সোর্স ডেটা নেই) সম্পূর্ণ** হয়ে যাবে — এই সেকশনে সেটাও নোট করুন
