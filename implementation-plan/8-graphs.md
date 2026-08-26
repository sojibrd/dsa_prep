# Implementation Plan — Topic 8: Graphs (Pattern Simulations)

## এই ডকুমেন্ট কীভাবে পড়বেন

আপনি একটা AI যে এই কথোপকথনটা দেখেননি। শুরু করার আগে এই ক্রমে পড়ুন:

1. `d:\document-files\dsa_prep\AGENTS.md` — প্রজেক্টের ভাষা ও কাজের নিয়ম
2. `d:\document-files\dsa_prep\context\ui-tokens.md` ও `context\ui-rules.md` — Theme Contract (কম্পোনেন্টে কোনো ভিজ্যুয়াল ক্লাস নয়; সব রং/আকৃতি `--t-*` টোকেন ও role class-এ)
3. `d:\document-files\dsa_prep\context\ui-registry.md` — "🎬 Simulation" সেকশন
4. `d:\document-files\dsa_prep\app\lib\simulations\types.ts` — Scene কনট্র্যাক্ট
5. `d:\document-files\dsa_prep\implementation-plan\5-trees.md` — **গুরুত্বপূর্ণ রেফারেন্স।** ওখানে বর্ণিত `TreeScene`-এর কৌশল (SVG দিয়ে node-edge আঁকা, হিসাব করা position, `SceneAside` জোড়া) নিচে বর্ণিত `GraphScene`-এ ঠিক একইভাবে প্রয়োগ হবে। ৫ নম্বর টপিক আগে implement হয়ে থাকলে সরাসরি `app\components\simulation\TreeScene.tsx` ফাইলটাও দেখে নিন।
6. `d:\document-files\dsa_prep\implementation-plan\1-arrays-strings.md` — Scene কনট্র্যাক্টের ভিত্তি ও ডেটা ফাইলের reference স্টাইল (`1.1-two-pointers.ts`)
7. `d:\document-files\dsa_prep\context\dsa-workbook\8. Graphs\*.md` — এই টপিকের raw ডেটা

**এই প্ল্যান কী নয়:** চূড়ান্ত TypeScript কোড নয়। এখানে scene kind সিদ্ধান্ত, নতুন টাইপের ডিজাইন, আর প্রতিটা প্যাটার্নের **script দিয়ে যাচাই করা exact trace** আছে — কিন্তু `SimStep` object, বাংলা ব্যাখ্যা, আর নতুন `GraphScene.tsx` কম্পোনেন্টের JSX **আপনাকে লিখতে হবে**।

## প্রেক্ষাপট — Topic 8-এ ৭টা প্যাটার্ন

| id | নাম | Demo | Scene kind |
|---|---|---|---|
| 8.1 | BFS/DFS Traversal (Grid ও Components) | Number of Islands | `matrix` (পুনর্ব্যবহার) |
| 8.2 | Cycle Detection (Directed) | Course Schedule | **`graph` (নতুন)** |
| 8.3 | Topological Sort | Course Schedule II | **`graph` (নতুন)** |
| 8.4 | Union Find (Disjoint Set) | Redundant Connection | `array`/`table` (পুনর্ব্যবহার — নিচে ব্যাখ্যা) |
| 8.5 | Bipartite Check / Graph Coloring | Is Graph Bipartite? | **`graph` (নতুন)** |
| 8.6 | Dijkstra (Weighted Shortest Path) | Network Delay Time | **`graph` (নতুন)** |
| 8.7 | Minimum Spanning Tree (MST) | Min Cost to Connect All Points | **`graph` (নতুন)** |

এই টপিকের মূল কাজ: **একটা নতুন `GraphScene` বানানো** এবং পাঁচটা প্যাটার্নে ব্যবহার করা। বাকি দুটো (৮.১, ৮.৪) বিদ্যমান renderer-ই ব্যবহার করবে।

---

## অংশ ১ — নতুন Scene kind: `graph`

### কেন নতুন kind লাগছে, আর কেন `TreeScene` যথেষ্ট না

`TreeScene` কড়াভাবে **binary** (প্রতি নোডে সর্বোচ্চ `leftId`/`rightId`, root থেকে শুরু করে in-order x-position + depth y-position হিসাব করে)। গ্রাফে:
- একটা নোডের ৩+ প্রতিবেশী থাকতে পারে (directed/undirected, weight-সহ)
- **cycle** থাকতে পারে (tree-তে কখনো থাকে না)
- কোনো নির্দিষ্ট "root" নেই — edge-এর দিক অনুযায়ী visited/unvisited state-ই গুরুত্বপূর্ণ

তাই আলাদা টাইপ দরকার, কিন্তু **আঁকার কৌশল একই থাকবে**: React Flow নয়, প্লেইন SVG + একটা ছোট deterministic layout ফাংশন — ঠিক `5-trees.md`-এ বর্ণিত `TreeScene`-এর precedent অনুসরণ করে। এই demo গ্রাফগুলো সব ছোট (≤৭ নোড), তাই circular layout (নোডগুলো একটা বৃত্তে সমান কোণে বসানো) যথেষ্ট — pan/zoom বা force-directed লাইব্রেরির দরকার নেই।

### `types.ts`-এ যোগ করুন

```ts
/** A single node in a graph scene. */
export interface GraphNodeData {
  id: string;
  label: string | number;
  mark?: CellMark;
  /** Shown under the node — e.g. a distance, a color, an indegree count. */
  annotation?: string;
}

/** A single edge in a graph scene. */
export interface GraphEdgeData {
  id: string;
  from: string;
  to: string;
  /** Omit for undirected; present for directed (arrowhead drawn at `to`). */
  directed?: boolean;
  weight?: number | string;
  mark?: CellMark;
}

/**
 * A node-link graph — cycle detection, topological sort, shortest path, MST.
 *
 * Laid out on a circle by node order (same idea as `TreeScene`'s computed
 * positions: deterministic, no manual coordinates in a data file, no pan/zoom
 * dependency). Small demo graphs (this workbook never exceeds ~7 nodes) read
 * fine this way; a data file never places a node itself.
 */
export interface GraphScene extends SceneBase {
  kind: 'graph';
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  activeNodeId?: string;
  activeEdgeId?: string;
  /** Named cursors standing on nodes — e.g. Dijkstra's "currently popped". */
  pointers?: { name: string; nodeId: string }[];
}
```

আর `Scene` union-এ যোগ করুন:

```ts
export type Scene = ArrayScene | MatrixScene | IntervalsScene | LinkedListScene | TreeScene | GraphScene;
```

`SceneView.tsx`-এ নতুন `case 'graph': return <GraphScene scene={scene} />;` যোগ করুন। **এখন `Scene` union ছয় সদস্যের — এখানেই `SceneView`-এর সেই `_never` exhaustiveness guard ফিরিয়ে আনার কথা ছিল (আগের একটা কমেন্টে লেখা আছে); আপনি যদি চান, `default:` কেসে `const _never: never = scene` বসিয়ে টাইপচেক করে নিন।**

### `GraphScene.tsx` — কী আঁকতে হবে

`5-trees.md`-এ বর্ণিত `TreeScene`-এর গঠন অনুকরণ করুন:
1. নোডগুলোকে ID অনুযায়ী একটা বৃত্তে বসান: `angle = (2π / n) × index`, `x = centerX + radius × cos(angle)`, `y = centerY + radius × sin(angle)`।
2. প্রতিটা edge-কে দুই নোডের মাঝে একটা লাইন (directed হলে arrowhead — SVG `marker` বা ছোট polygon দিয়ে)।
3. নোড = `<circle>` + টেক্সট label, `data-mark` অনুযায়ী `sim-cell`-এর মতো রঙ (নতুন role class দরকার হতে পারে — নিচে দেখুন)।
4. Edge-এর `weight` থাকলে লাইনের মাঝখানে ছোট label।
5. `pointers` থাকলে নোডের পাশে নাম-লেবেল (ঠিক `ArrayScene`-এর `sim-pointer`-এর ধাঁচে)।
6. শেষে `<SceneAside table={table} output={output} />` জুড়ুন (ঠিক `MatrixScene`-এর মতো)।

### নতুন role class লাগবে কি না

সম্ভবত **না** — `sim-cell[data-mark]`-এর প্যালেট (active=amber, done=green, reject=faded) নোডের ভেতরের টেক্সট/বৃত্তেও খাটে। শুধু SVG-তে `<circle>`-এর fill/stroke বসাতে inline style-এর বদলে **নতুন role class** লাগবে, কারণ Theme Contract অনুযায়ী কম্পোনেন্টে hardcoded রং নিষেধ:

```css
/* globals.css-এ, .sim-cell-এর কাছেই */
.sim-node {
  fill: var(--t-sim-cell-bg);
  stroke: var(--t-sim-cell-border);
  stroke-width: var(--t-sim-cell-border-width);
}
.sim-node[data-mark="active"] { fill: var(--t-sim-active-bg); stroke: var(--t-sim-active-border); }
.sim-node[data-mark="done"] { stroke: var(--t-sim-done-border); }
.sim-node[data-mark="reject"] { opacity: var(--t-sim-reject-opacity); }
.sim-node-label { fill: var(--t-sim-cell-fg); font-family: var(--t-font-mono); font-size: var(--t-sim-cell-text); }
.sim-edge { stroke: var(--t-sim-cell-border); stroke-width: 1.5; }
.sim-edge[data-mark="active"] { stroke: var(--t-sim-active-border); stroke-width: 2; }
.sim-edge-weight { fill: var(--t-sim-index-fg); font-family: var(--t-font-mono); font-size: var(--t-sim-index-text); }
```

(টোকেনগুলো ইতিমধ্যে `control-room.css`-এ আছে — শুধু নতুন role class-গুলো `globals.css`-এ যোগ করা লাগবে, কোনো নতুন `--t-*` ভেরিয়েবল নয়।)

---

## অংশ ২ — প্রতিটা প্যাটার্ন

### 8.1 BFS/DFS Traversal (Grid ও Components) — `matrix` পুনর্ব্যবহার

**Demo:** Number of Islands — কোড অপরিবর্তিত:

```js
function numIslands(grid) {
  const m = grid.length,
    n = grid[0].length;
  let count = 0;
  const sink = (i, j) => {
    if (i < 0 || i >= m || j < 0 || j >= n || grid[i][j] !== "1") return;
    grid[i][j] = "0"; // visited = ডুবিয়ে দিন
    sink(i + 1, j);
    sink(i - 1, j);
    sink(i, j + 1);
    sink(i, j - 1);
  };
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      if (grid[i][j] === "1") {
        count++;
        sink(i, j);
      }
  return count;
}
```

লাইন: ১=function, ২-৩=m,n, ৪=count, ৫=sink declare, ৬=বাউন্ডারি/পানি চেক, ৭=grid mark '0', ৮-১১=চার দিকে sink, ১৩-১৪=for লুপ, ১৫-১৭=if '1' → count++, sink কল।

**Scene:** `matrix`, `values`=grid (string cell), `cursor`=বর্তমান sink হওয়া cell, `marks`: '0' হয়ে যাওয়া cell `done`, বর্তমান sink `active`। `vars`: `count`।

**Demo input (workbook-এর ডিফল্টের চেয়ে ছোট, প্রস্তাবিত):**

```
grid = [["1","1","0"],
        ["1","0","0"],
        ["0","0","1"]]
```

**সম্পূর্ণ ট্রেস (৬টা স্টেপ, script দিয়ে যাচাই করা):**

| # | event | (i,j) | note |
|---|---|---|---|
| 1 | new-island | (0,0) | count → 1, sink শুরু |
| 2 | sink | (0,0) | '1'→'0' |
| 3 | sink | (1,0) | '1'→'0' (নিচে) |
| 4 | sink | (0,1) | '1'→'0' (ডানে) |
| 5 | new-island | (2,2) | count → 2, sink শুরু |
| 6 | sink | (2,2) | '1'→'0' |

চূড়ান্ত উত্তর: **count = 2**।

---

### 8.2 Cycle Detection (Directed) — `graph`

**Demo:** Course Schedule — কোড অপরিবর্তিত:

```js
function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) adj[b].push(a);
  const state = new Array(numCourses).fill(0); // 0=new, 1=visiting, 2=done
  const hasCycle = (u) => {
    if (state[u] === 1) return true;
    if (state[u] === 2) return false;
    state[u] = 1;
    for (const v of adj[u]) if (hasCycle(v)) return true;
    state[u] = 2;
    return false;
  };
  for (let i = 0; i < numCourses; i++) if (hasCycle(i)) return false;
  return true;
}
```

লাইন: ১=function, ২-৩=adj build, ৪=state array, ৫=hasCycle declare, ৬=if state===1 (cycle!), ৭=if state===2 (skip), ৮=state=1 (enter), ৯=for adj[u] → recurse, ১০=state=2 (finish), ১১=return false, ১৩=main loop।

**Scene:** `graph`, নোড = কোর্স (0..numCourses-1), edge `a→b` মানে "b করতে হলে a লাগে" অর্থাৎ `adj[b].push(a)` — **ডকুমেন্টে সতর্কতা: প্রশ্নের `prerequisites=[a,b]` মানে "a করতে b লাগে", তাই adjacency graph-এ edge টানা হয় `b → a`** (dependency থেকে dependent-এর দিকে) — এটাই DFS চালানোর দিক। `marks`: state 0 (কিছু না), state 1 = `active` (বর্তমান recursion path-এ), state 2 = `done`।

**Demo input (workbook-এর ডিফল্ট ২-নোড উদাহরণ খুব ছোট — ৪-নোড cycle প্রস্তাবিত):**

```
numCourses = 4
prerequisites = [[1,0],[2,1],[3,2],[1,3]]
```

মানে: 1 needs 0, 2 needs 1, 3 needs 2, 1 needs 3 — অর্থাৎ `0→1→2→3→1` একটা cycle।

**সম্পূর্ণ ট্রেস (৯টা স্টেপ, script দিয়ে যাচাই করা):**

| # | event | node/edge | note |
|---|---|---|---|
| 1 | enter | u=0 | state[0]=1 (visiting), `active` |
| 2 | visit-edge | 0→1 | adj[0] অনুসরণ করে recurse |
| 3 | enter | u=1 | state[1]=1 |
| 4 | visit-edge | 1→2 | |
| 5 | enter | u=2 | state[2]=1 |
| 6 | visit-edge | 2→3 | |
| 7 | enter | u=3 | state[3]=1 |
| 8 | visit-edge | 3→1 | adj[3] তে 1 আছে |
| 9 | cycle-found | u=1 | state[1] ইতিমধ্যে 1 (visiting) — **cycle!** `canFinish = false` |

---

### 8.3 Topological Sort — `graph`

**Demo:** Course Schedule II — কোড অপরিবর্তিত:

```js
function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indegree[a]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) queue.push(i);
  const order = [];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const v of adj[u]) if (--indegree[v] === 0) queue.push(v);
  }
  return order.length === numCourses ? order : []; // cycle → []
}
```

লাইন: ১=function, ২-৩=adj/indegree init, ৪-৭=build (adj.push, indegree++), ৯=queue init, ১০=seed (indegree 0), ১২=order init, ১৩=while queue, ১৪=shift, ১৫=order.push, ১৬=neighbor indegree কমানো + queue push, ১৮=return।

**Scene:** `graph`, নোড = কোর্স, edge `b→a` (আগেরটার মতো)। `marks`: queue-তে অপেক্ষারত `active`, order-এ চলে যাওয়া `done`। `table`: `indegree` array (index→মান)। `output`: `order`।

**Demo input:** `numCourses=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]` (workbook-এর নিজস্ব উদাহরণ, ইতিমধ্যেই ছোট)।

**সম্পূর্ণ ট্রেস (১৩টা স্টেপ, script দিয়ে যাচাই করা):**

| # | event | detail |
|---|---|---|
| 1 | init | indegree = [0,1,1,2] |
| 2 | seed-queue | queue = [0] (একমাত্র indegree 0) |
| 3 | pop | u=0, order=[0] |
| 4 | decrement | edge 0→1, indegree[1]: 1→0 |
| 5 | enqueue | v=1, queue=[1] |
| 6 | decrement | edge 0→2, indegree[2]: 1→0 |
| 7 | enqueue | v=2, queue=[1,2] |
| 8 | pop | u=1, order=[0,1] |
| 9 | decrement | edge 1→3, indegree[3]: 2→1 (0 হয়নি, enqueue না) |
| 10 | pop | u=2, order=[0,1,2] |
| 11 | decrement | edge 2→3, indegree[3]: 1→0 |
| 12 | enqueue | v=3, queue=[3] |
| 13 | pop | u=3, order=[0,1,2,3] |

**চূড়ান্ত উত্তর: `order = [0,1,2,3]`।**

---

### 8.4 Union Find (Disjoint Set) — `array`/`table` পুনর্ব্যবহার (নতুন scene লাগে না)

**গুরুত্বপূর্ণ ডিজাইন সিদ্ধান্ত:** Union-Find visually একটা গ্রাফ নয় — এটা একটা `parent[]` array যেখানে প্রতিটা index একটা "group"-এর প্রতিনিধি নির্দেশ করে। এটা `GraphScene` দিয়ে আঁকার (child→parent তীর) দরকার নেই; **`array` scene + `table`** দিয়েই স্পষ্ট হয়:

- `values`: `parent` array নিজেই (index অনুযায়ী মান)
- `marks`: বর্তমান `find(x)` কল হওয়া index `active`
- `table`: `{title: "find(a), find(b)", entries: [{key:"ra", value:...}, {key:"rb", value:...}]}`

**Demo:** Redundant Connection — কোড অপরিবর্তিত:

```js
function findRedundantConnection(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x]))); // path compression
  for (const [a, b] of edges) {
    const ra = find(a),
      rb = find(b);
    if (ra === rb) return [a, b]; // আগেই connected → cycle
    parent[ra] = rb; // union
  }
}
```

লাইন: ১=function, ২=parent init, ৩=find declare, ৪=for edges, ৫-৬=ra,rb, ৭=if ra===rb → return, ৮=union।

**Demo input:** `edges = [[1,2],[1,3],[2,3]]` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৬টা স্টেপ, script দিয়ে যাচাই করা):**

| # | event | detail |
|---|---|---|
| 1 | check | edge (1,2): find(1)=1, find(2)=2 |
| 2 | union | ra=1, rb=2 → parent=[0,2,2,3] |
| 3 | check | edge (1,3): find(1)=2, find(3)=3 |
| 4 | union | ra=2, rb=3 → parent=[0,2,3,3] |
| 5 | check | edge (2,3): find(2)=3, find(3)=3 |
| 6 | redundant | ra===rb===3 → **এই edge-ই বাদ দিতে হবে: `[2,3]`** |

---

### 8.5 Bipartite Check / Graph Coloring — `graph`

**Demo:** Is Graph Bipartite? — কোড অপরিবর্তিত:

```js
function isBipartite(graph) {
  const color = new Array(graph.length).fill(0);
  for (let start = 0; start < graph.length; start++) {
    if (color[start] !== 0) continue;
    color[start] = 1;
    const queue = [start];
    while (queue.length) {
      const u = queue.shift();
      for (const v of graph[u]) {
        if (color[v] === color[u]) return false;
        if (color[v] === 0) {
          color[v] = -color[u];
          queue.push(v);
        }
      }
    }
  }
  return true;
}
```

লাইন: ১=function, ২=color array, ৩=for start, ৪=if already colored skip, ৫=color[start]=1, ৬=queue init, ৭=while, ৮=shift, ৯=for neighbors, ১০=if conflict → false, ১১-১৩=if uncolored → alternate color + enqueue।

**Scene:** `graph`, undirected edges, `marks`/`annotation` দিয়ে রঙ দেখান (color 1 বনাম -1 — দুটো ভিন্ন `mark` value দরকার, `CellMark`-এ `active`/`done` দুটো ব্যবহার করুন: color=1 → `active`, color=-1 → `done`, uncolored → mark নেই)।

**Demo input:** `graph = [[1,3],[0,2],[1,3],[0,2]]` (workbook-এর নিজস্ব উদাহরণ, ৪ নোড)।

**সম্পূর্ণ ট্রেস (৪টা স্টেপ, script দিয়ে যাচাই করা):**

| # | event | detail |
|---|---|---|
| 1 | seed | start=0, color[0]=1 (`active`) |
| 2 | color | 0→1: color[1]=-1 (`done`) |
| 3 | color | 0→3: color[3]=-1 (`done`) |
| 4 | color | 1→2: color[2]=1 (`active`) |

সব নোড রঙ পেয়ে গেছে, কোনো conflict নেই → **`bipartite = true`**।

---

### 8.6 Dijkstra (Weighted Shortest Path) — `graph`

**Demo:** Network Delay Time — কোড অপরিবর্তিত (নোট: `MinHeap` ক্লাস টপিক ৬-এ ছিল, যেটা এই workbook-এ **অনুপস্থিত** — দেখুন নিচের সতর্কতা):

```js
function networkDelayTime(times, n, k) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) adj[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const heap = new MinHeap((a, b) => a[0] - b[0]); // [dist, node]
  heap.push([0, k]);
  while (heap.size) {
    const [d, u] = heap.pop();
    if (d > dist[u]) continue; // stale এন্ট্রি
    for (const [v, w] of adj[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        heap.push([dist[v], v]);
      }
    }
  }
  const ans = Math.max(...dist.slice(1));
  return ans === Infinity ? -1 : ans;
}
```

**⚠️ সতর্কতা:** এই demo code `MinHeap` নামের একটা ক্লাস ব্যবহার করে যেটা workbook-এর টপিক ৬ (Heaps/Priority Queues)-এ সংজ্ঞায়িত হওয়ার কথা ছিল। কিন্তু টপিক ৬-এর সোর্স ফাইল workbook-এ **অনুপস্থিত** (আলাদা ডেটা-গ্যাপ, এই সিমুলেশন প্রজেক্টের বাইরের সমস্যা)। `pattern.demoCode`-এ যা আছে তা-ই দেখাতে হবে (`MinHeap` কনস্ট্রাক্টরের সংজ্ঞা ছাড়া) — সিমুলেশনে `heap` কে conceptually "sorted list of [dist, node]" হিসেবে ট্রিট করুন, `table`-এ heap-এর বর্তমান কন্টেন্ট দেখান। কোড না বদলে, শুধু scene-এর `table`/`vars`-এ heap state দেখিয়ে দিন — highlightLines এখনো উপরের কোডের লাইন নম্বরই ব্যবহার করবে।

লাইন: ১=function, ২-৩=adj build, ৪-৫=dist init, ৬-৭=heap init+push, ৮=while, ৯=pop [d,u], ১০=if stale → continue, ১১=for neighbors, ১২=if relax করা যায়, ১৩-১৪=dist আপডেট + heap push, ১৭-১৮=answer।

**Scene:** `graph`, directed weighted edges (`weight` field ব্যবহার করুন)। `marks`: popped/settled নোড `done`, বর্তমান পপ করা নোড `active`। `table`: `{title:"heap", entries:[...]}` — প্রতিটা এন্ট্রি `"[dist,node]"`। `output`: চূড়ান্ত `dist` array।

**Demo input:** `times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৮টা স্টেপ, script দিয়ে যাচাই করা):**

| # | event | detail |
|---|---|---|
| 1 | init | dist=[-,-,0,-,-] (শুধু dist[2]=0, বাকি ∞) |
| 2 | pop | d=0, u=2 → `active` |
| 3 | relax | edge 2→1 (w=1): dist[1] = ∞→1 |
| 4 | relax | edge 2→3 (w=1): dist[3] = ∞→1 |
| 5 | pop | d=1, u=1 → `active`, node 2 এখন `done` |
| 6 | pop | d=1, u=3 → `active` |
| 7 | relax | edge 3→4 (w=1): dist[4] = ∞→2 |
| 8 | pop | d=2, u=4 → `active` |

**চূড়ান্ত: `dist=[-,1,0,1,2]`, `max(dist[1..4])=2` → উত্তর `2`।**

---

### 8.7 Minimum Spanning Tree (MST) — `graph`

**Demo:** Min Cost to Connect All Points — কোড অপরিবর্তিত:

```js
function minCostConnectPoints(points) {
  const n = points.length;
  const dist = new Array(n).fill(Infinity); // MST-তে ঢোকার খরচ
  const inMST = new Array(n).fill(false);
  dist[0] = 0;
  let total = 0;
  for (let step = 0; step < n; step++) {
    let u = -1;
    for (let i = 0; i < n; i++)
      if (!inMST[i] && (u === -1 || dist[i] < dist[u])) u = i;
    inMST[u] = true;
    total += dist[u];
    for (let v = 0; v < n; v++) {
      if (inMST[v]) continue;
      const d =
        Math.abs(points[u][0] - points[v][0]) +
        Math.abs(points[u][1] - points[v][1]);
      dist[v] = Math.min(dist[v], d);
    }
  }
  return total;
}
```

লাইন: ১=function, ২=n, ৩-৪=dist/inMST init, ৫=dist[0]=0, ৬=total, ৭=for step, ৮-১০=খুঁজুন সবচেয়ে সস্তা u, ১১=inMST[u]=true, ১২=total+=dist[u], ১৩-১৮=বাকি নোডের dist আপডেট।

**Scene:** `graph`, undirected, edge-এর weight সব pair-এর Manhattan distance (দেখানোর জন্য শুধু বর্তমান step-এ prospective edge-গুলো `active` মার্ক করুন, বাকি potential edges আঁকার দরকার নেই — নোডগুলোর `annotation`-এ `dist[i]` দেখান)। `marks`: `inMST` নোড `done`, বর্তমান যোগ হওয়া নোড `active`।

**Demo input (workbook-এর ৫-পয়েন্ট ডিফল্ট বড়, ৩-পয়েন্ট প্রস্তাবিত):**

```
points = [[0,0],[2,2],[3,10]]
```

**সম্পূর্ণ ট্রেস (৬টা স্টেপ, script দিয়ে যাচাই করা):**

| # | event | detail |
|---|---|---|
| 1 | add-to-mst | u=0, cost=0, total=0 (dist[0] শুরু থেকেই 0) |
| 2 | update-dist | 0→1: dist[1] = ∞→4 (Manhattan(0,0)-(2,2)) |
| 3 | update-dist | 0→2: dist[2] = ∞→13 (Manhattan(0,0)-(3,10)) |
| 4 | add-to-mst | u=1 (dist=4 সবচেয়ে ছোট), total=4 |
| 5 | update-dist | 1→2: dist[2] = 13→9 (Manhattan(2,2)-(3,10)=1+8=9, আগেরটার চেয়ে ছোট) |
| 6 | add-to-mst | u=2 (dist=9), total=13 |

**চূড়ান্ত উত্তর: `total = 13`।** (workbook-এর ৫-পয়েন্ট ডিফল্টে উত্তর ২০ — এই ৩-পয়েন্ট ছোট সংস্করণে ভিন্ন উত্তর হওয়া স্বাভাবিক, `output` টেক্সটে সেটাই লিখবেন।)

---

## যাচাই (implement করার পর)

```bash
cd d:\document-files\dsa_prep
npx tsc --noEmit
npx eslint app --ext .ts,.tsx
npx next build
```

## শেষে যা আপডেট করবেন

- `app/lib/simulations/types.ts` — `GraphNodeData`, `GraphEdgeData`, `GraphScene`, `Scene` union
- `app/components/simulation/GraphScene.tsx` — নতুন ফাইল
- `app/components/simulation/SceneView.tsx` — নতুন `case 'graph'`
- `app/globals.css` — `.sim-node`, `.sim-edge` ইত্যাদি role class
- `app/lib/simulations/index.ts` — ৭টা নতুন import + `ALL` array
- `context/ui-registry.md` — "🎬 Simulation" সেকশনে `<GraphScene>`-এর এন্ট্রি যোগ (ঠিক `<TreeScene>`-এর এন্ট্রির প্যাটার্নে)
- `context/progress-tracker.md` — টপিক ৮-এর এন্ট্রি
