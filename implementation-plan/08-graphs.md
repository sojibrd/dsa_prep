# Implementation Plan — Topic 8: Graphs

> **লক্ষ্য:** টপিক ৮-এর ৭টি প্যাটার্নের (`8.1` থেকে `8.7`) জন্য `GraphScene` আর্কিটেকচার এবং সিমুলেশন ডেটা তৈরি করা।
> **ফাইল লোকেশন:** `app/lib/simulations/data/8.1-grid-components.ts` থেকে `8.7-minimum-spanning-tree.ts`

---

## ১. আর্কিটেকচার ও Scene Kind

- **Scene Kind:**
  - `8.1 Grid Components (Islands)`: `MatrixScene` (বিদ্যমান গ্রিড রেন্ডারার)।
  - `8.2` থেকে `8.7`: **নতুন `GraphScene`**।
- **`app/lib/simulations/types.ts`-এ যুক্ত হবে:**
  ```typescript
  export interface GraphNodeData {
    id: string;
    label?: string;
    mark?: CellMark;
    annotation?: string; // e.g. "inDegree=0", "dist=4", "color=A"
  }

  export interface GraphEdgeData {
    from: string;
    to: string;
    weight?: number | string;
    directed?: boolean;
    mark?: CellMark; // 'active', 'done', 'reject'
  }

  export interface GraphScene extends SceneBase {
    kind: 'graph';
    nodes: GraphNodeData[];
    edges: GraphEdgeData[];
    activeNodeId?: string;
  }
  ```
- **নতুন কম্পোনেন্ট:** `app/components/simulation/GraphScene.tsx`
  - নোড ও এজ SVG সার্কেল ও লাইন দিয়ে রেন্ডার হবে (অটো-পজিশনিং বা প্রি-ক্যালকুলেটেড সার্কুলার লেআউটে)।
  - নোডের অ্যানোটেশন (`dist`, `color`, `inDegree`) নোডের পাশে/নিচে ব্যাজ হিসেবে প্রদর্শিত হবে।

---

## ২. প্যাটার্ন স্পেসিফিকেশন

### Pattern 8.1: BFS/DFS Traversal (Grid Components)
- **ডেমো কোড:** `numIslands(grid)` [LC 200: Number of Islands]
- **Concrete Input:** `grid = [["1","1","0"],["1","0","0"],["0","0","1"]]`
- **Output:** `2`
- **Scene:** `MatrixScene`
- **ধাপসমূহ:**
  - `(0,0) = "1"` → Island count = 1. DFS চালিয়ে `(0,0)`, `(0,1)`, `(1,0)` সবগুলো `"0"` (ভিজিটেড) রূপান্তর।
  - গ্রিড স্ক্যান অব্যাহত।
  - `(2,2) = "1"` → Island count = 2. DFS চালিয়ে `(2,2)` ভিজিট ও সিঙ্ক।
  - মোট দ্বীপ সংখ্যা = `2`।

### Pattern 8.2: Cycle Detection (Directed Graph)
- **ডেমো কোড:** `canFinish(numCourses, prerequisites)` [LC 207: Course Schedule]
- **Concrete Input:** `numCourses = 2`, `prerequisites = [[1,0], [0,1]]` (0 → 1 এবং 1 → 0)
- **Output:** `false` (সাইকেল বিদ্যমান)
- **Scene:** `GraphScene`
- **Visuals:** 3-কালার DFS (0=Unvisited, 1=Visiting/Grey, 2=Visited/Black)। নোড `0` visiting থাকা অবস্থায় আবার `0`-তে ব্যাক-এজ এলে সাইকেল ডিটেক্টেড ও এজ `reject` মার্ক।

### Pattern 8.3: Topological Sort (Kahn's Algorithm)
- **ডেমো কোড:** `findOrder(numCourses, prerequisites)` [LC 210]
- **Concrete Input:** `4` কোর্স, `[[1,0],[2,0],[3,1],[3,2]]`
- **Output:** `[0, 1, 2, 3]` (বা `[0, 2, 1, 3]`)
- **Visuals:**
  - প্রতিটি নোডের `inDegree` অ্যানোটেশনে দেখানো।
  - `Queue` ও `output` তালিকা সাইড প্যানেলে।
- **ধাপসমূহ:**
  - শুরুতে `inDegree`: `0: 0`, `1: 1`, `2: 1`, `3: 2`।
  - Queue-তে ঢুকবে `0`।
  - `0` pop → output-এ `0` যোগ → চাইল্ড `1` ও `2`-এর inDegree কমে `0` হবে।
  - Queue-তে ঢুকবে `1, 2`। ক্রমান্বয়ে পুরো টপোলজিক্যাল অর্ডার তৈরি হবে।

### Pattern 8.4: Union-Find (Disjoint Set)
- **ডেমো কোড:** `findRedundantConnection(edges)` [LC 684]
- **Concrete Input:** `edges = [[1,2], [1,3], [2,3]]`
- **Output:** `[2, 3]`
- **Visuals:**
  - টেবিল: `parent` অ্যারে `[0, 1, 2, 3]`।
  - এজ `1-2` যুক্ত → parent আপডেট।
  - এজ `1-3` যুক্ত → parent আপডেট।
  - এজ `2-3` চেক → উভয়ের রুট `1` (একই কম্পোনেন্ট!) → সাইকেল সৃষ্টিকারী এজ `[2, 3]` রিটার্ন।

### Pattern 8.5: Bipartite Check (Graph Coloring)
- **ডেমো কোড:** `isBipartite(graph)` [LC 785]
- **Concrete Input:** `graph = [[1,3],[0,2],[1,3],[0,2]]` (4-সাইকেল)
- **Output:** `true`
- **Visuals:** নোডগুলো দুটি বিপরীত রঙে (Color A ও Color B) রাঙানো হবে। সংলগ্ন নোডে একই রঙ না পড়লে Bipartite সফল।

### Pattern 8.6: Dijkstra (Weighted Shortest Path)
- **ডেমো কোড:** `networkDelayTime(times, n, k)` [LC 743]
- **Concrete Input:** `times = [[2,1,1],[2,3,1],[3,4,1]]`, `n = 4`, `k = 2`
- **Output:** `2`
- **Visuals:**
  - নোডের পাশে `dist` ব্যাজ: শুরুতে `dist = {2: 0, 1: ∞, 3: ∞, 4: ∞}`।
  - Min-Heap / Priority Queue সাইড প্যানেলে।
  - রিলাক্সেশনের সাথে সাথে `dist` আপডেট এবং শর্টেস্ট পাথ এজগুলো `done` মার্ক হবে।

### Pattern 8.7: Minimum Spanning Tree (MST - Kruskal / Prim)
- **ডেমো কোড:** `minCostConnectPoints(points)` [LC 1584]
- **Concrete Input:** ৪টি পয়েন্টের গ্রাফ।
- **Visuals:** ছোট ওজনের এজগুলো একে একে সিলেক্ট হবে এবং সাইকেল না থাকলে MST-তে যুক্ত হয়ে `done` মার্ক হবে।

---

## ৩. ফাইল তৈরির তালিকা

1. `app/components/simulation/GraphScene.tsx` (নতুন রেন্ডারার)
2. `app/lib/simulations/types.ts` (`GraphScene` ইউনিয়ন যুক্ত করা)
3. `app/components/simulation/SceneView.tsx` (`case 'graph'` যুক্ত করা)
4. `app/lib/simulations/data/8.1-grid-components.ts`
5. `app/lib/simulations/data/8.2-cycle-detection.ts`
6. `app/lib/simulations/data/8.3-topological-sort.ts`
7. `app/lib/simulations/data/8.4-union-find.ts`
8. `app/lib/simulations/data/8.5-bipartite-check.ts`
9. `app/lib/simulations/data/8.6-dijkstra-shortest-path.ts`
10. `app/lib/simulations/data/8.7-minimum-spanning-tree.ts`
11. `app/lib/simulations/index.ts` (রেজিস্ট্রেশন)
