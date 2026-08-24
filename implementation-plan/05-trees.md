# Implementation Plan — Topic 5: Trees

> **লক্ষ্য:** টপিক ৫-এর ৫টি প্যাটার্নের (`5.1` থেকে `5.5`) জন্য `TreeScene` কম্পোনেন্ট আর্কিটেকচার এবং সিমুলেশন ডেটা তৈরি করা।
> **ফাইল লোকেশন:** `app/lib/simulations/data/5.1-tree-traversal.ts` থেকে `5.5-lowest-common-ancestor.ts`

---

## ১. আর্কিটেকচার ও Scene Kind

- **নতুন Scene Kind:** `TreeScene`
- **`app/lib/simulations/types.ts`-এ যুক্ত হবে:**
  ```typescript
  export interface TreeNodeData {
    id: string;
    val: string | number;
    leftId?: string | null;
    rightId?: string | null;
    mark?: CellMark;
    annotation?: string; // e.g. "maxGain = 15" or "[min, max]" range
  }

  export interface TreeScene extends SceneBase {
    kind: 'tree';
    nodes: TreeNodeData[];
    rootId: string;
    activeNodeId?: string;
    highlightPath?: string[]; // নোড আইডির তালিকা যা একটি পাথ নির্দেশ করে
  }
  ```
- **নতুন কম্পোনেন্ট:** `app/components/simulation/TreeScene.tsx`
  - ট্রি লেআউট: নোডগুলো বাইনারি ট্রি আকারে সারিবদ্ধ হবে এবং প্যারেন্ট-চাইল্ডের মধ্যে কানেক্টিং লাইন/এজ থাকবে।
  - `mark`: `active` (বর্তমান নোড), `done` (ভিজিট সম্পন্ন), `reject` (অকার্যকর শাখা)।
  - `SceneAside`: রিকার্শন কল স্ট্যাক বা BFS কিউ প্রদর্শনের জন্য `table` বা `output` ব্যবহার করবে।

---

## ২. প্যাটার্ন স্পেসিফিকেশন

### Pattern 5.1: Tree Traversal (DFS / BFS)
- **ডেমো কোড:** `zigzagLevelOrder(root)` [LC 103]
- **Concrete Input:** `root = [3, 9, 20, null, null, 15, 7]`
- **Output:** `[[3], [20, 9], [15, 7]]`
- **Visuals:**
  - ট্রি ভিউ: `3` (রুট) → বামে `9`, ডানে `20` → `20`-এর নিচে `15` ও `7`।
  - সাইড প্যানেল: `queue` এবং `output` 2D অ্যারে।
- **ধাপসমূহ:**
  - Level 0: Queue=[3], leftToRight=true → level=[3], res=[[3]], Queue=[9, 20]
  - Level 1: Queue=[9, 20], leftToRight=false → level=[9, 20] reversed to [20, 9], res=[[3], [20, 9]], Queue=[15, 7]
  - Level 2: Queue=[15, 7], leftToRight=true → level=[15, 7], res=[[3], [20, 9], [15, 7]], Queue=[]

### Pattern 5.2: Tree Construction
- **ডেমো কোড:** `buildTree(preorder, inorder)` [LC 105]
- **Concrete Input:** `preorder = [3, 9, 20, 15, 7]`, `inorder = [9, 3, 15, 20, 7]`
- **Output:** Construct tree `[3, 9, 20, null, null, 15, 7]`
- **Visuals:**
  - উপরের প্যানেল: `preorder` এবং `inorder` অ্যারে (উইন্ডো স্প্যান সহ)।
  - নিচের প্যানেল: ধীরে ধীরে নির্মিত ট্রি গ্রাফ।
- **ধাপসমূহ:**
  - `root=3`: inorder-এ `3`-এর ইনডেক্স ১। বাম সাবট্রি inorder `[9]`, ডান সাবট্রি `[15, 20, 7]`।
  - বাম চাইল্ড `9` তৈরি।
  - ডান চাইল্ড `20` তৈরি, যার নিচে `15` ও `7` যুক্ত হবে।

### Pattern 5.3: Path Sum
- **ডেমো কোড:** `maxPathSum(root)` [LC 124: Binary Tree Maximum Path Sum]
- **Concrete Input:** `[-10, 9, 20, null, null, 15, 7]`
- **Output:** `42` (পাথ: `15 → 20 → 7`)
- **Visuals:**
  - প্রতিটি নোডে রিকার্সিভ রিটার্ন ভ্যালু (`gain`) `annotation` আকারে দেখানো।
  - `highlightPath`: সর্বোচ্চ পাথের নোডগুলো (`15, 20, 7`) সোনালী/অ্যাকসেন্ট রঙে চিহ্নিত।
- **ধাপসমূহ:**
  - `gain(9) = 9`, `gain(15) = 15`, `gain(7) = 7`
  - Node 20-এ: `15 + 20 + 7 = 42` (Max sum আপডেট!), রিটার্ন `20 + max(15, 7) = 35`
  - Node -10-এ: `-10 + 9 + 35 = 34` (< 42)
  - চূড়ান্ত গ্লোবাল ম্যাক্স = `42`।

### Pattern 5.4: Validation Properties
- **ডেমো কোড:** `isValidBST(root)` [LC 98]
- **Concrete Input:** `[5, 1, 4, null, null, 3, 6]` (Invalid BST)
- **Output:** `false` (কারণ `4`-এর বামে `3` হলেও তা রুটের মান `5`-এর চেয়ে ছোট নয় বরং ডান সাবট্রিতে `5`-এর চেয়ে বড় হওয়ার কথা)
- **Visuals:** প্রতিটি নোডের জন্য ভ্যালিড রেঞ্জ `(min, max)` দেখানো।
- **ধাপসমূহ:**
  - Node 5: range `(-∞, +∞)` → Valid
  - Node 1: range `(-∞, 5)` → Valid
  - Node 4: range `(5, +∞)` → Invalid! কারণ `4 <= 5`। সাথে সাথে `false` রিটার্ন ও শাখা `reject` মার্ক।

### Pattern 5.5: Lowest Common Ancestor LCA
- **ডেমো কোড:** `lowestCommonAncestor(root, p, q)` [LC 236]
- **Concrete Input:** ট্রি `[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]`, `p = 5`, `q = 1`
- **Output:** Node `3`
- **Visuals:** `p` এবং `q` নোড আলাদা রঙে হাইলাইট, রিকার্শন স্ট্যাকে দুই দিক থেকেই নোড ফিরে এলে LCA নোড `3` নিশ্চিত করা।

---

## ৩. ফাইল তৈরির তালিকা

1. `app/components/simulation/TreeScene.tsx` (নতুন রেন্ডারার)
2. `app/lib/simulations/types.ts` (`TreeScene` ইউনিয়ন যুক্ত করা)
3. `app/components/simulation/SceneView.tsx` (`case 'tree'` যুক্ত করা)
4. `app/lib/simulations/data/5.1-tree-traversal.ts`
5. `app/lib/simulations/data/5.2-tree-construction.ts`
6. `app/lib/simulations/data/5.3-path-sum.ts`
7. `app/lib/simulations/data/5.4-validation-properties.ts`
8. `app/lib/simulations/data/5.5-lowest-common-ancestor.ts`
9. `app/lib/simulations/index.ts` (রেজিস্ট্রেশন)
