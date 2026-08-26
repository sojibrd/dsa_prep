# Implementation Plan — Topic 5: Trees (Pattern Simulations)

## এই ডকুমেন্ট কীভাবে পড়বেন

1. `d:\document-files\dsa_prep\AGENTS.md`
2. `d:\document-files\dsa_prep\implementation-plan\1-arrays-strings.md` — **আগে পড়ুন।** Scene কনট্র্যাক্ট, `usePatternSim`, কম্পোনেন্ট গঠন এখানে সংজ্ঞায়িত।
3. `d:\document-files\dsa_prep\implementation-plan\3-linked-lists.md` — `linked-list` scene-এর ডিজাইন এখানে; একই ধরনের "নোড + id + pointer" চিন্তা এই টপিকেও কাজে লাগবে।
4. `d:\document-files\dsa_prep\context\ui-registry.md`, `context\ui-tokens.md`
5. `d:\document-files\dsa_prep\context\dsa-workbook\5. Trees\*.md` — raw ডেটা

এই টপিকে একটা **নতুন scene kind — `tree`** লাগবে।

---

## নতুন Scene kind: `tree`

### কেন প্লেইন SVG + হিসাব করা layout, React Flow নয়

এই workbook-এর demo tree-গুলো সব ছোট (≤৭ নোড)। React Flow-এর মতো লাইব্রেরি (pan/zoom, drag, minimap) আনলে অপ্রয়োজনীয় ওজন যোগ হয়, আর প্রতিটা নোডের `position: {x,y}` ডেটা ফাইলে হাতে লিখতে হতো — যেটা Scene কনট্র্যাক্টের মূল নীতি ভঙ্গ করে ("ডেটা ফাইল কখনো renderer-এর বাস্তবায়ন জানবে না")। তার বদলে:

- **in-order traversal দিয়ে x, depth দিয়ে y** — deterministic, কোনো manual coordinate লাগে না।
- SVG `<line>`/`<circle>`/`<text>` দিয়ে আঁকা, `ArrayScene`-এর মতোই role class + টোকেন।

### `types.ts`-এ যোগ করুন

```ts
export interface TreeNodeData {
  id: string;
  val: string | number;
  leftId?: string | null;
  rightId?: string | null;
  mark?: CellMark;
  /** Small text under/beside the node — a computed value, a gain, a range. */
  annotation?: string;
}

/**
 * A binary tree — traversal, construction, path-sum, validation, LCA.
 * Layout is computed (in-order x, depth y), never supplied by a data file.
 */
export interface TreeScene extends SceneBase {
  kind: 'tree';
  nodes: TreeNodeData[];
  rootId?: string; // অনুপস্থিত হলে renderer নিজে বের করবে (কোনো নোড child হিসেবে referenced না হলে সে-ই root)
  activeNodeId?: string;
  /** Root→node path to highlight, e.g. the current recursion stack. */
  highlightPath?: string[];
  pointers?: { name: string; nodeId: string }[];
}

export type Scene = ArrayScene | MatrixScene | IntervalsScene | LinkedListScene | TreeScene;
```

### `TreeScene.tsx` — কী আঁকতে হবে

1. `nodeMap` বানান (`id → TreeNodeData`)।
2. Root বের করুন: `rootId` দেওয়া থাকলে সেটা, নাহলে যে নোড কারো `leftId`/`rightId` হিসেবে referenced হয়নি সে-ই root।
3. **in-order DFS** চালিয়ে প্রতিটা নোডের x-position ঠিক করুন (visited ক্রম অনুযায়ী কলাম), আর recursion depth থেকে y-position।
4. প্রতিটা parent-child জোড়ার মাঝে একটা `<line>`।
5. প্রতিটা নোড একটা `<circle>` (বা বর্গ) + `<text>` মান, `mark`/`activeNodeId`/`highlightPath` অনুযায়ী `data-mark` অ্যাট্রিবিউট।
6. `annotation` থাকলে নোডের নিচে ছোট টেক্সট (gain, range ইত্যাদি)।
7. শেষে `<SceneAside table={table} output={output} />`।

নতুন role class লাগবে (`.sim-tree-node`, `.sim-tree-edge`) — বিদ্যমান `--t-sim-*` টোকেন পুনর্ব্যবহার করুন, নতুন hex রং নয়। প্যাটার্ন ঠিক `ArrayScene`/`LinkedListScene`-এর role class-গুলোর মতোই।

---

## সাধারণ নিয়ম — ট্রি রিকার্শনের স্টেপ কীভাবে ভাঙবেন

- **প্রতিটা নোড visit (recursion-এ ঢোকা) বা প্রতিটা গুরুত্বপূর্ণ সিদ্ধান্ত (best আপডেট, LCA পাওয়া, violation) = একটা স্টেপ।**
- `null` চাইল্ডে পৌঁছানো সাধারণত আলাদা স্টেপ বানানোর দরকার নেই (base case), যদি না সেটাই গল্পের গুরুত্বপূর্ণ অংশ হয়।
- Recursion-এর "কোন branch-এ আছি" বোঝাতে `path` (যেমন `"root→L→R"`) `caption`-এ দেখান।

---

## 5.1 Tree Traversal (DFS / BFS)

**Demo:** Binary Tree Zigzag Level Order Traversal — [LC 103](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/) — কোড:

```js
function zigzagLevelOrder(root) {
  if (!root) return [];
  const res = [];
  let queue = [root],
    leftToRight = true;
  while (queue.length) {
    const level = queue.map((n) => n.val);
    res.push(leftToRight ? level : level.reverse());
    queue = queue.flatMap((n) => [n.left, n.right].filter(Boolean));
    leftToRight = !leftToRight;
  }
  return res;
}
```

লাইন: ১=function, ২=if !root, ৩=res init, ৪-৫=queue/leftToRight init, ৬=while, ৭=level=queue.map, ৮=res.push (ternary), ৯=queue=flatMap (পরের level), ১০=leftToRight উল্টানো।

**Scene:** `tree`, `activeNodeId` না — বরং প্রতিটা স্টেপে **এক level**-এর সব নোড একসাথে `active`। `output`: `res` (এ পর্যন্ত তৈরি হওয়া levels)।

**Demo input:** `root = [3,9,20,null,null,15,7]` (workbook-এর নিজস্ব উদাহরণ)। নোড id: `n3`(root, val 3), `n9`(val 9, n3-এর left), `n20`(val 20, n3-এর right), `n15`(val 15, n20-এর left), `n7`(val 7, n20-এর right)।

**সম্পূর্ণ ট্রেস (৩টা স্টেপ, script দিয়ে যাচাই করা):**

| # | level (raw) | দিক | out |
|---|---|---|---|
| 1 | `[3]` | L→R | `[3]` |
| 2 | `[9, 20]` | R→L (উল্টানো) | `[20, 9]` |
| 3 | `[15, 7]` | L→R | `[15, 7]` |

**চূড়ান্ত উত্তর: `[[3], [20,9], [15,7]]`।**

---

## 5.2 Tree Construction

**Demo:** Construct Binary Tree from Preorder and Inorder — [LC 105](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) — কোড:

```js
function buildTree(preorder, inorder) {
  const idx = new Map(inorder.map((v, i) => [v, i]));
  let pre = 0;
  const build = (lo, hi) => {
    // inorder-এর [lo, hi] অংশ
    if (lo > hi) return null;
    const root = new TreeNode(preorder[pre++]);
    const mid = idx.get(root.val);
    root.left = build(lo, mid - 1);
    root.right = build(mid + 1, hi);
    return root;
  };
  return build(0, inorder.length - 1);
}
```

লাইন: ১=function, ২=idx map, ৩=pre init, ৪=build declare, ৫=comment, ৬=if lo>hi → null, ৭=root তৈরি, ৮=mid, ৯=root.left=build (বাম দিকে recurse), ১০=root.right=build (ডান দিকে recurse), ১১=return root, ১৩=return build(0,...)।

**Scene:** `tree`, **এই প্যাটার্নে tree ধীরে ধীরে গড়ে ওঠে** — প্রতি স্টেপে `nodes` array-তে যতগুলো নোড এখন পর্যন্ত তৈরি হয়েছে ততগুলোই থাকবে। `caption`-এ `[lo,hi]` রেঞ্জ দেখান।

**Demo input:** `preorder = [3,9,20,15,7]`, `inorder = [9,3,15,20,7]` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৫টা "create-node" স্টেপ + null-leaf ঘটনাগুলো ব্যাখ্যায় সংক্ষেপে বলুন, script দিয়ে যাচাই করা):**

| # | val তৈরি হলো | inorder রেঞ্জ [lo,hi] | mid (root-এর inorder position) | বাম subtree রেঞ্জ | ডান subtree রেঞ্জ |
|---|---|---|---|---|---|
| 1 | 3 (root) | [0,4] | 1 | [0,0] | [2,4] |
| 2 | 9 | [0,0] | 0 | [0,-1] (null) | [1,0] (null) |
| 3 | 20 | [2,4] | 3 | [2,2] | [4,4] |
| 4 | 15 | [2,2] | 2 | [2,1] (null) | [3,2] (null) |
| 5 | 7 | [4,4] | 4 | [4,3] (null) | [5,4] (null) |

**চূড়ান্ত tree:** root `3` (left=`9`, right=`20`), `20`-এর left=`15`, right=`7`। (মিলিয়ে দেখুন: এটাই ৫.১-এর demo tree-র মতো — কাকতালীয় নয়, একই বিখ্যাত উদাহরণ দুই জায়গায় ব্যবহৃত।)

---

## 5.3 Path Sum

**Demo:** Binary Tree Maximum Path Sum — [LC 124](https://leetcode.com/problems/binary-tree-maximum-path-sum/) — কোড:

```js
function maxPathSum(root) {
  let best = -Infinity;
  const gain = (node) => {
    if (!node) return 0;
    const left = Math.max(gain(node.left), 0); // negative হলে বাদ
    const right = Math.max(gain(node.right), 0);
    best = Math.max(best, node.val + left + right); // এখানে বাঁক
    return node.val + Math.max(left, right); // parent-কে এক দিক
  };
  gain(root);
  return best;
}
```

লাইন: ১=function, ২=best init, ৩=gain declare, ৪=if !node → 0, ৫=left (comment), ৬=right, ৭=best আপডেট (comment — বাঁক), ৮=return (comment — এক দিক পাঠানো)।

**⚠️ এটা post-order (bottom-up) — leaf থেকে শুরু হয়ে উপরে ওঠে, `highlightLines`-এ এটা স্পষ্ট করুন (recursive কল লাইন ৫-৬ আগে চলে, তারপর লাইন ৭-৮)।**

**Scene:** `tree`, `activeNodeId`=বর্তমান নোড, `annotation`=সেই নোডের `gain` মান (parent-কে যা ফেরত যাবে)। `vars`: `left`, `right` (branch gains), `best` (running global max)।

**Demo input:** `root = [-10,9,20,null,null,15,7]` (workbook-এর নিজস্ব উদাহরণ)। নোড id: `n_10`(root, val -10), `n9`, `n20`, `n15`, `n7` — গঠন ৫.১-এর মতোই, শুধু root-এর মান -10।

**সম্পূর্ণ ট্রেস (৫টা স্টেপ, post-order ক্রমে, script দিয়ে যাচাই করা):**

| # | নোড | left gain | right gain | turn value (node+left+right) | best (আগে→পরে) | parent-কে ফেরত |
|---|---|---|---|---|---|---|
| 1 | 9 (leaf) | 0 | 0 | 9 | −∞ → 9 | 9 |
| 2 | 15 (leaf) | 0 | 0 | 15 | 9 → 15 | 15 |
| 3 | 7 (leaf) | 0 | 0 | 7 | 15 → 15 | 7 |
| 4 | 20 | 15 | 7 | 20+15+7=**42** | 15 → **42** | 20+max(15,7)=35 |
| 5 | −10 (root) | 9 | 35 | −10+9+35=34 | 42 → 42 (34<42) | 24 |

**চূড়ান্ত উত্তর: `42`** (path `15 → 20 → 7`, নোড ৪-এই সর্বোচ্চ মান রেকর্ড হয়েছে, root পর্যন্ত ওঠার দরকার হয়নি)।

---

## 5.4 Validation & Properties

**Demo:** Validate Binary Search Tree — [LC 98](https://leetcode.com/problems/validate-binary-search-tree/) — কোড:

```js
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return (
    isValidBST(root.left, min, root.val) &&
    isValidBST(root.right, root.val, max)
  );
}
```

লাইন: ১=function, ২=if !root → true, ৩=if range violation → false, ৪-৭=return (বাম ও ডান দুই recurse, &&)।

**⚠️ এটা pre-order (top-down) — root থেকে শুরু হয়ে min/max রেঞ্জ সংকুচিত হতে হতে নিচে নামে।**

**Scene:** `tree`, `activeNodeId`=বর্তমান নোড, `annotation`=`(min, max)` রেঞ্জ যেটার মধ্যে এই নোডের মান থাকতে হবে।

**Demo input:** `root = [5,1,4,null,null,3,6]` (workbook-এর নিজস্ব উদাহরণ)। নোড id: `n5`(root), `n1`(left of n5), `n4`(right of n5), `n3`(left of n4), `n6`(right of n4)।

**সম্পূর্ণ ট্রেস (৫টা স্টেপ, script দিয়ে যাচাই করা):**

| # | নোড | রেঞ্জ (min, max) | ফলাফল |
|---|---|---|---|
| 1 | 5 (root) | (−∞, ∞) | ✅ ঠিক আছে |
| 2 | 1 | (−∞, 5) | ✅ ঠিক আছে |
| 3 | (n1-এর left, right) | — | null, `true` |
| 4 | 4 | (5, ∞) | ❌ **violation!** `4 ≤ 5` (min হওয়া উচিত ছিল, কিন্তু 4 নিজেই 5-এর চেয়ে ছোট, range-এ পড়ে না) |

(n4-এ পৌঁছানোর পরপরই `4 ≤ min(5)` সত্য হওয়ায় `false` রিটার্ন হয়ে যায় — n3, n6-এ recursion আর পৌঁছায় না, `&&`-এর short-circuit।)

**চূড়ান্ত উত্তর: `false`।**

---

## 5.5 Lowest Common Ancestor (LCA)

**Demo:** Lowest Common Ancestor of a Binary Tree — [LC 236](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) — কোড:

```js
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root; // দুই পাশে → এটাই LCA
  return left || right;
}
```

লাইন: ১=function, ২=if base case → return root, ৩=left recurse, ৪=right recurse, ৫=if both found → return root (comment), ৬=return left||right।

**Scene:** `tree`, `activeNodeId`=বর্তমান নোড। `pointers`: `p`, `q` (টার্গেট নোড দুটো সবসময় দেখান, স্থির)।

**Demo input:** `root = [3,5,1,6,2,0,8]`, `p=5, q=1` (workbook-এর নিজস্ব উদাহরণ)। নোড id: `n3`(root), `n5`(left of n3), `n1`(right of n3), `n6`(left of n5), `n2`(right of n5), `n0`(left of n1), `n8`(right of n1)।

**সম্পূর্ণ ট্রেস (৩টা মূল স্টেপ — `n6`, `n2`, `n0`, `n8`-এ পৌঁছানো `null`/base-case, আলাদা স্টেপ না বানিয়ে সংক্ষেপে বলুন, script দিয়ে যাচাই করা):**

| # | নোড | ঘটনা | detail |
|---|---|---|---|
| 1 | n5 | found-target | `root === p` (5) → সরাসরি `n5` রিটার্ন, আর নিচে recurse করে না |
| 2 | n1 | found-target | `root === q` (1) → সরাসরি `n1` রিটার্ন |
| 3 | n3 (root) | both-sides-found-LCA | left=`n5` (সত্য), right=`n1` (সত্য) → **দুই পাশেই পাওয়া গেছে, `n3`-ই LCA** |

**চূড়ান্ত উত্তর: node `3`।**

---

## যাচাই (implement করার পর)

```bash
cd d:\document-files\dsa_prep
npx tsc --noEmit
npx eslint app --ext .ts,.tsx
npx next build
```

## শেষে যা আপডেট করবেন

- `app/lib/simulations/types.ts` — `TreeNodeData`, `TreeScene`, `Scene` union
- `app/components/simulation/TreeScene.tsx` — নতুন ফাইল
- `app/components/simulation/SceneView.tsx` — নতুন `case 'tree'`
- `app/lib/simulations/index.ts` — ৫টা import + `ALL` array
- `context/ui-registry.md` — `<TreeScene>`-এর এন্ট্রি
- `context/progress-tracker.md` — টপিক ৫-এর এন্ট্রি; এখানেই টপিক ১-৫ সম্পূর্ণ হবে (টপিক ৬ বাদে, যার সোর্স ডেটা workbook-এ নেই — দেখুন `implementation-plan/9-dynamic-programming.md`-এর নোট)
