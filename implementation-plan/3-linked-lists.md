# Implementation Plan — Topic 3: Linked Lists (Pattern Simulations)

## এই ডকুমেন্ট কীভাবে পড়বেন

1. `d:\document-files\dsa_prep\AGENTS.md`
2. `d:\document-files\dsa_prep\implementation-plan\1-arrays-strings.md` — **আগে পড়ুন।** Scene কনট্র্যাক্ট, `usePatternSim`, কম্পোনেন্ট গঠন, theme role class-এর ভিত্তি এখানে।
3. `d:\document-files\dsa_prep\context\ui-registry.md`, `context\ui-tokens.md`
4. `d:\document-files\dsa_prep\context\dsa-workbook\3. Linked Lists\*.md` — raw ডেটা

এই টপিকে একটা **নতুন scene kind — `linked-list`** লাগবে, কারণ কোনো নোড chain-এ `next` পয়েন্টার বদলানো (reversal, merge, cycle) `array`/`matrix` দিয়ে স্বাভাবিকভাবে দেখানো যায় না।

---

## নতুন Scene kind: `linked-list`

### `types.ts`-এ যোগ করুন

```ts
/** A single node in a linked list scene. */
export interface LinkedListNode {
  id: string;
  val: string | number;
  /** The `id` of the next node, or `null`/omitted for the tail. */
  nextId?: string | null;
  mark?: CellMark;
}

/**
 * A chain of nodes connected by pointers — traversal, reversal, merge, cycle
 * detection. Visually: `[ val | • ] → [ val | • ] → …`
 */
export interface LinkedListScene extends SceneBase {
  kind: 'linked-list';
  /** All nodes present in this step, left-to-right in array order. */
  nodes: LinkedListNode[];
  /** Named cursors sitting on a node, identified by `nodeId`. */
  pointers?: { name: string; nodeId: string }[];
  /** An optional dummy/sentinel node shown at the head of the chain. */
  dummy?: { id: string; val: string | number; nextId?: string | null };
  /** If the list has a cycle, the `id` of the node the tail connects back to. */
  cycleTargetId?: string;
}

export type Scene = ArrayScene | MatrixScene | IntervalsScene | LinkedListScene;
```

### `LinkedListScene.tsx` — কী আঁকতে হবে

- প্রতিটা নোড = একটা বক্স, ভেতরে `val` + একটা ছোট "পরবর্তী" ইঙ্গিত (dot/arrow slot)। বক্স-থেকে-বক্সে একটা তীর (`→`)।
- `dummy` থাকলে সবার আগে একটা আলাদা style-এর (dashed border, বা `t-faint`) বক্স।
- `pointers` থাকলে সংশ্লিষ্ট নোডের উপরে নাম-লেবেল (`ArrayScene`-এর `sim-pointer`-এর ধাঁচে)।
- `cycleTargetId` থাকলে শেষ নোড থেকে সেই আইডির নোডে **বাঁকানো তীর** ফিরে যায় (SVG path বা CSS দিয়ে একটা loop-back curve) — এটাই cycle visually দেখানোর একমাত্র উপায়।
- `marks` প্রতিটা নোডে (`LinkedListNode.mark`): visited `done`, বর্তমান cursor `active`, বাদ পড়া (merge-এ ব্যবহৃত না হওয়া) `reject`।
- শেষে `<SceneAside table={table} output={output} />`।

নতুন role class লাগতে পারে (`.sim-node`, `.sim-link-arrow`) — `ArrayScene`-এর `sim-cell`/`sim-pointer`-এর প্যাটার্ন অনুসরণ করুন, নতুন hex রং নয়, বিদ্যমান `--t-sim-*` টোকেন পুনর্ব্যবহার করুন।

---

## সাধারণ নিয়ম — লিংকড লিস্টের স্টেপ কীভাবে ভাঙবেন

- **প্রতিটা pointer move (`slow=slow.next` ইত্যাদি) বা প্রতিটা `next` reassignment = একটা স্টেপ।**
- নোডের `id` demo-তে যা আছে তা-ই ধারাবাহিকভাবে ব্যবহার করুন (নিচে প্রতিটা প্যাটার্নে id কনভেনশন দেওয়া আছে) — implementing AI নতুন id বানানোর দরকার নেই, নিচের টেবিলগুলোই সরাসরি ট্রান্সক্রাইব করা যায়।

---

## 3.1 Fast & Slow Pointers

**Demo:** Linked List Cycle II — [LC 142](https://leetcode.com/problems/linked-list-cycle-ii/) — কোড:

```js
function detectCycle(head) {
  let slow = head,
    fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      // cycle পাওয়া গেছে
      let p = head;
      while (p !== slow) {
        p = p.next;
        slow = slow.next;
      }
      return p; // cycle-এর শুরুর নোড
    }
  }
  return null;
}
```

লাইন: ১=function, ২-৩=slow/fast init, ৪=while, ৫=slow=slow.next, ৬=fast=fast.next.next, ৭=if slow===fast, ৮=comment, ৯=p=head, ১০=while p!==slow, ১১=p=p.next, ১২=slow=slow.next, ১৩=return p (comment)।

**Scene:** `linked-list`, নোড id `n0,n1,n2,n3` (মান 3,2,0,-4)। `n3.nextId = "n1"` (cycle)। `cycleTargetId = "n1"`। `pointers`: `slow`, `fast`, phase ২-তে `p`।

**Demo input:** `head = [3,2,0,-4]`, tail connects to index 1 (মান 2) — workbook-এর নিজস্ব উদাহরণ। নোড: `n0=3, n1=2, n2=0, n3=-4`, `n3.next → n1`।

**সম্পূর্ণ ট্রেস (৬টা স্টেপ, script দিয়ে যাচাই করা):**

| # | ঘটনা | slow | fast | p |
|---|---|---|---|---|
| 1 | move | n1 | n2 | — |
| 2 | move | n2 | n1 | — |
| 3 | move | n3 | n3 | — |
| 4 | **মিলল!** | n3 | n3 | — |
| 5 | phase2 শুরু | n3 | — | n0 |
| 6 | **উত্তর** | — | — | **n1** |

**চূড়ান্ত উত্তর: node `n1` (মান 2)** — এটাই cycle শুরুর নোড।

---

## 3.2 Dummy Node Technique

**Demo:** Merge Two Sorted Lists — [LC 21](https://leetcode.com/problems/merge-two-sorted-lists/) — কোড:

```js
function mergeTwoLists(a, b) {
  const dummy = { next: null };
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}
```

লাইন: ১=function, ২=dummy init, ৩=tail init, ৪=while a&&b, ৫=if a.val≤b.val, ৬=tail.next=a, ৭=a=a.next, ৮=else, ৯=tail.next=b, ১০=b=b.next, ১২=tail=tail.next, ১৪=tail.next=a||b, ১৫=return dummy.next।

**Scene:** `linked-list`, দুটো ইনপুট লিস্টের নোড `a0,a1,a2` (list1) আর `b0,b1,b2` (list2), আর `dummy` ফিল্ডে একটা সেন্টিনেল নোড যা থেকে ফলাফল chain তৈরি হচ্ছে। **এটা একটু জটিল কারণ দুটো সোর্স লিস্ট + একটা তৈরি হতে থাকা output লিস্ট একসাথে দেখাতে হয়** — সহজ সমাধান: `nodes` ফিল্ডে **output chain**-টাই রাখুন (যেটা ধীরে ধীরে গড়ে ওঠে), আর `caption`/`table`-এ "বাকি list1"/"বাকি list2" হিসেবে যা এখনো ব্যবহার হয়নি সেটা টেক্সট আকারে দেখান।

**Demo input:** `list1 = [1,2,4]`, `list2 = [1,3,4]` (workbook-এর নিজস্ব উদাহরণ)। নোড id: `a0=1,a1=2,a2=4` (list1), `b0=1,b1=3,b2=4` (list2)।

**সম্পূর্ণ ট্রেস (৬টা স্টেপ, script দিয়ে যাচাই করা):**

| # | তুলনা (এখন a, b কারা) | সিদ্ধান্ত | output chain (এই স্টেপের পরে) |
|---|---|---|---|
| 1 | a=a0(1), b=b0(1) — `1≤1` সত্য | a0 নেওয়া হলো, a→a1 | `[a0]` |
| 2 | a=a1(2), b=b0(1) — `2≤1` মিথ্যা | b0 নেওয়া হলো, b→b1 | `[a0, b0]` |
| 3 | a=a1(2), b=b1(3) — `2≤3` সত্য | a1 নেওয়া হলো, a→a2 | `[a0, b0, a1]` |
| 4 | a=a2(4), b=b1(3) — `4≤3` মিথ্যা | b1 নেওয়া হলো, b→b2 | `[a0, b0, a1, b1]` |
| 5 | a=a2(4), b=b2(4) — `4≤4` সত্য | a2 নেওয়া হলো, a→null (list1 শেষ) | `[a0, b0, a1, b1, a2]` |
| 6 | a শেষ (`a && b` মিথ্যা, লুপ থামল) | বাকি অংশ (b2) সরাসরি জুড়ে দিন | `[a0, b0, a1, b1, a2, b2]` |

**চূড়ান্ত উত্তর chain: `1,1,2,3,4,4`।**

---

## 3.3 In-Place Reversal

**Demo:** Reverse Nodes in k-Group — [LC 25](https://leetcode.com/problems/reverse-nodes-in-k-group/) — কোড:

```js
function reverseKGroup(head, k) {
  let count = 0,
    node = head;
  while (node && count < k) {
    node = node.next;
    count++;
  }
  if (count < k) return head; // k-এর কম বাকি → যেমন আছে
  let prev = reverseKGroup(node, k); // পরের গ্রুপ আগে সমাধান
  let cur = head;
  while (count--) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}
```

লাইন: ১=function, ২-৩=count/node init, ৪=while (গণনা), ৫=node=node.next, ৬=count++, ৭=if count<k → return head (comment), ৮=prev=recurse (comment), ৯=cur=head, ১০=while count--, ১১=next=cur.next, ১২=cur.next=prev, ১৩=prev=cur, ১৪=cur=next, ১৬=return prev।

**⚠️ এই প্যাটার্ন recursion + in-place pointer reversal — একটু জটিল। নিচের ট্রেসে `depth` দিয়ে recursion-এর স্তর বোঝানো হয়েছে; scene-এর `caption`-এ প্রতি স্টেপে কোন recursion depth-এ আছি সেটা লিখুন।**

**Scene:** `linked-list`, নোড `n1..n5` (মান 1..5)। প্রতি স্টেপে `nodes[].nextId` বদলে বদলে চেইনের বর্তমান অবস্থা দেখান। `pointers`: `cur`, `prev`, `next` (temp)। `vars`: `depth` (recursion স্তর), `count`।

**Demo input:** `head = [1,2,3,4,5]`, `k = 2` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৭টা স্টেপ, script দিয়ে যাচাই করা):**

| # | depth | ঘটনা | detail |
|---|---|---|---|
| 1 | 1 | recurse-into-next-group | n1 থেকে ২টা গুনে n3-এ পৌঁছালাম (boundary), recurse `reverseKGroup(n3, 2)` কল |
| 2 | 2 | recurse-into-next-group | n3 থেকে ২টা গুনে n5-এ পৌঁছালাম, recurse `reverseKGroup(n5, 2)` কল |
| 3 | 3 | insufficient | n5 থেকে শুধু ১টা নোড বাকি (`count<k`) → **`return n5` (অপরিবর্তিত)** |
| 4 | 2 | relink | `cur=n3`: `n3.next = n5` (prev শুরুতে n5), prev=n3 |
| 5 | 2 | relink | `cur=n4`: `n4.next = n3`, prev=n4 → **depth ২ থেকে return `n4`** (এখন chain: n4→n3→n5) |
| 6 | 1 | relink | `cur=n1`: `n1.next = n4` (prev=n4 আগের রিটার্ন থেকে), prev=n1 |
| 7 | 1 | relink | `cur=n2`: `n2.next = n1`, prev=n2 → **চূড়ান্ত return `n2`** |

**চূড়ান্ত chain (নতুন head `n2` থেকে): `n2 → n1 → n4 → n3 → n5`, মানে মান `[2,1,4,3,5]`।**

---

## যাচাই (implement করার পর)

```bash
cd d:\document-files\dsa_prep
npx tsc --noEmit
npx eslint app --ext .ts,.tsx
npx next build
```

## শেষে যা আপডেট করবেন

- `app/lib/simulations/types.ts` — `LinkedListNode`, `LinkedListScene`, `Scene` union
- `app/components/simulation/LinkedListScene.tsx` — নতুন ফাইল
- `app/components/simulation/SceneView.tsx` — নতুন `case 'linked-list'`
- `app/lib/simulations/index.ts` — ৩টা import + `ALL` array
- `context/ui-registry.md` — `<LinkedListScene>`-এর এন্ট্রি
- `context/progress-tracker.md` — টপিক ৩-এর এন্ট্রি
