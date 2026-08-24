# Implementation Plan — Topic 3: Linked Lists

> **লক্ষ্য:** টপিক ৩-এর ৩টি প্যাটার্নের (`3.1` থেকে `3.3`) জন্য `LinkedListScene` কম্পোনেন্ট আর্কিটেকচার এবং হ্যান্ডরিটেন ডেটা তৈরি করা।
> **ফাইল লোকেশন:** `app/lib/simulations/data/3.1-fast-slow-pointers.ts` থেকে `3.3-in-place-reversal.ts`

---

## ১. আর্কিটেকচার ও Scene Kind

- **নতুন Scene Kind:** `LinkedListScene`
- **`app/lib/simulations/types.ts`-এ যুক্ত হবে:**
  ```typescript
  export interface LinkedListNode {
    id: string;
    val: string | number;
    nextId?: string | null;
    mark?: CellMark;
  }

  export interface LinkedListScene extends SceneBase {
    kind: 'linked-list';
    nodes: LinkedListNode[];
    pointers?: { name: string; nodeId: string }[];
    dummy?: { id: string; val: string | number; nextId?: string | null };
    cycleTargetId?: string; // সাইকেল থাকলে কানেকশন হাইলাইট
  }
  ```
- **নতুন কম্পোনেন্ট:** `app/components/simulation/LinkedListScene.tsx`
  - প্রতিটি নোড `[ val | • ] →` আকারে রেন্ডার হবে।
  - পয়েন্টারগুলো (`slow`, `fast`, `prev`, `cur`, `next`, `tail`) নোডের নিচে/উপরে অ্যারো ও লেবেল আকারে দেখাবে।
  - সাইকেল থাকলে শেষ নোড থেকে নির্দিষ্ট নোডে কার্ভড অ্যারো দেখাবে।

---

## ২. প্যাটার্ন স্পেসিফিকেশন

### Pattern 3.1: Fast & Slow Pointers
- **ডেমো কোড:** `detectCycle(head)` [LC 142: Linked List Cycle II]
- **Concrete Input:** `[3] → [2] → [0] → [-4] ↺ (যায় [2]-এ)`
- **Output:** Node with value `2`
- **ধাপসমূহ:**
  1. **Phase 1 (Intersection):** `slow` ও `fast` শুরু নোড `3`-এ।
     - ধাপ ১: `slow → 2`, `fast → 0`
     - ধাপ ২: `slow → 0`, `fast → 2`
     - ধাপ ৩: `slow → -4`, `fast → -4` (দুটো মিলে গেছে! সাইকেল নিশ্চিত)
  2. **Phase 2 (Cycle Start Finding):** `p = head (3)`, `slow` থাকে `-4`-এ।
     - ধাপ ৪: `p` এগোবে ১ ধাপ (`p → 2`), `slow` এগোবে ১ ধাপ (`slow → 2`)।
     - ধাপ ৫: `p === slow` (দুটোই নোড `2`-তে)। সাইকেলের শুরুর নোড `2` রিটার্ন।

### Pattern 3.2: Dummy Node Technique
- **ডেমো কোড:** `mergeTwoLists(a, b)` [LC 21: Merge Two Sorted Lists]
- **Concrete Input:** `list1 = [1, 2, 4]`, `list2 = [1, 3, 4]`
- **Output:** `[1, 1, 2, 3, 4, 4]`
- **Visuals:**
  - `dummy` নোড আলাদাভাবে শীর্ষে প্রদর্শিত হবে।
  - রানিং মার্জড চেইন `dummy → tail ...` নিচে তৈরি হবে।
  - পয়েন্টার: `a` (list1-এ), `b` (list2-এ), `tail` (মার্জড লিস্টের শেষে)।
- **ধাপসমূহ:**
  - তুলনা `a.val (1) <= b.val (1)` → `tail.next = a`, `a` এগোবে `[2]`, `tail` এগোবে।
  - তুলনা `a.val (2) > b.val (1)` → `tail.next = b`, `b` এগোবে `[3]`, `tail` এগোবে।
  - ক্রমান্বয়ে বাকি নোডগুলো মার্জ হবে।

### Pattern 3.3: In-Place Reversal
- **ডেমো কোড:** `reverseKGroup(head, k)` [LC 25]
- **Concrete Input:** `[1] → [2] → [3] → [4] → [5]`, `k = 2`
- **Output:** `[2] → [1] → [4] → [3] → [5]`
- **Visuals:**
  - পয়েন্টার: `cur`, `prev`, `next`, `node` (count tracker)
  - রিভার্সাল চলাকালীন প্রতিটি নোডের `nextId` লাইভ আপডেট হয়ে উল্টো দিকে পয়েন্ট করবে।
- **ধাপসমূহ:**
  - Group 1 (`[1, 2]`): `1` এবং `2` রিভার্স হয়ে `[2 → 1]`।
  - Group 2 (`[3, 4]`): `3` এবং `4` রিভার্স হয়ে `[4 → 3]`।
  - Group 3 (`[5]`): `k`-এর কম (১টি নোড), তাই অপরিবর্তিত।
  - চূড়ান্ত চেইন: `2 → 1 → 4 → 3 → 5`।

---

## ৩. ফাইল তৈরির তালিকা

1. `app/components/simulation/LinkedListScene.tsx` (নতুন রেন্ডারার)
2. `app/lib/simulations/types.ts` (`LinkedListScene` ইউনিয়ন যুক্ত করা)
3. `app/components/simulation/SceneView.tsx` (`case 'linked-list'` যুক্ত করা)
4. `app/lib/simulations/data/3.1-fast-slow-pointers.ts`
5. `app/lib/simulations/data/3.2-dummy-node.ts`
6. `app/lib/simulations/data/3.3-in-place-reversal.ts`
7. `app/lib/simulations/index.ts` (রেজিস্ট্রেশন)
