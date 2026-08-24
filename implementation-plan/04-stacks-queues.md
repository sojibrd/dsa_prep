# Implementation Plan — Topic 4: Stacks & Queues

> **লক্ষ্য:** টপিক ৪-এর ৪টি প্যাটার্নের (`4.1` থেকে `4.4`) সিমুলেশন ডেটা এবং স্ট্যাক/ডিকিউ কম্পোনেন্ট সাপোর্ট তৈরি করা।
> **ফাইল লোকেশন:** `app/lib/simulations/data/4.1-monotonic-stack.ts` থেকে `4.4-sliding-window-maximum.ts`

---

## ১. আর্কিটেকচার ও Scene Kind

- **Scene Kind:** `ArrayScene` + `SceneBase.table` / `SceneBase.output` (অথবা ডেডিকেটেড `StackScene`)।
- **নতুন Scene Kind (ঐচ্ছিক/প্রস্তাবিত):** `StackScene`
  ```typescript
  export interface StackScene extends SceneBase {
    kind: 'stack';
    mainArray?: {
      values: (number | string)[];
      cursor?: number;
      pointers?: ScenePointer[];
      asBars?: boolean;
    };
    stack: {
      items: (string | number | [string | number, string | number])[];
      topLabel?: string;
    };
    deque?: {
      items: (string | number)[];
      headLabel?: string;
      tailLabel?: string;
    };
  }
  ```
- **সহজ অ্যাপ্রোচ:** বিদ্যমান `ArrayScene`-এ প্রধান অ্যারে/স্ট্রিং দেখিয়ে `table`-এর মাধ্যমে স্ট্যাক বা ডিকিউ স্টেট রেন্ডার করা (যেমন: `table: { title: 'Stack', entries: [...] }`), অথবা ডেডিকেটেড স্ট্যাক কন্টেইনার যোগ করা।

---

## ২. প্যাটার্ন স্পেসিফিকেশন

### Pattern 4.1: Monotonic Stack
- **ডেমো কোড:** `largestRectangleArea(heights)` [LC 84: Largest Rectangle in Histogram]
- **Concrete Input:** `heights = [2, 1, 5, 6, 2, 3]` (sentinel `0` শেষে)
- **Output:** `10`
- **Visuals:**
  - প্রধান দৃশ্য: `ArrayScene` (`asBars: true`), বারগুলোর উচ্চতা গ্রাফিকাল দেখা যাবে।
  - সাইড প্যানেল: `Stack` (ইনডেক্স জমা, increasing height)।
  - `subValues`: প্রতি পপে ক্যালকুলেট করা `area = height * (i - left)`।
- **ধাপসমূহ:**
  - `i=0 (h=2)`: stack=[0]
  - `i=1 (h=1)`: 2 >= 1 → pop 0 (`h=2, w=1, area=2`). stack=[1]
  - `i=2 (h=5)`: stack=[1, 2]
  - `i=3 (h=6)`: stack=[1, 2, 3]
  - `i=4 (h=2)`: 6 >= 2 → pop 3 (`h=6, w=1, area=6`). 5 >= 2 → pop 2 (`h=5, w=2, area=10` — max!). stack=[1, 4]
  - `i=5 (h=3)`: stack=[1, 4, 5]
  - `i=6 (sentinel h=0)`: সব pop হয়ে ফাইনাল ম্যাক্সিমাম এরিয়া `10` নিশ্চিত।

### Pattern 4.2: Expression Evaluation / Parentheses
- **ডেমো কোড:** `longestValidParentheses(s)` [LC 32]
- **Concrete Input:** `s = ") ( ) ( ) )"`
- **Output:** `4`
- **Visuals:**
  - স্ট্রিং ক্যারেক্টার অ্যারে `[')', '(', ')', '(', ')', ')']`
  - `pointers`: `i`
  - `table`: স্ট্যাক উপাদান `[-1]` (বেস ইনডেক্স সহ)
- **ধাপসমূহ:**
  - `i=0 ')'`: pop -1 → stack খালি → নতুন base `stack=[0]`
  - `i=1 '('`: push 1 → `stack=[0, 1]`
  - `i=2 ')'`: pop 1 → `len = 2 - 0 = 2`, `best = 2`
  - `i=3 '('`: push 3 → `stack=[0, 3]`
  - `i=4 ')'`: pop 3 → `len = 4 - 0 = 4`, `best = 4`
  - `i=5 ')'`: pop 0 → stack খালি → নতুন base `stack=[5]`

### Pattern 4.3: Design Problems (Custom Stack/Queue)
- **ডেমো কোড:** `MinStack` [LC 155]
- **Concrete Input:** অপারেশন সিকোয়েন্স: `push(-2) → push(0) → push(-3) → getMin() → pop() → top() → getMin()`
- **Output:** `getMin() = -3`, `top() = 0`, `getMin() = -2`
- **Visuals:**
  - স্ট্যাক টেবিল: কলাম `[Value | MinSoFar]`
  - অপারেশন কল ও তার লাইভ ইফেক্ট।

### Pattern 4.4: Sliding Window Maximum (Monotonic Deque)
- **ডেমো কোড:** `maxSlidingWindow(nums, k)` [LC 239]
- **Concrete Input:** `nums = [1, 3, -1, -3, 5, 3, 6, 7]`, `k = 3`
- **Output:** `[3, 3, 5, 5, 6, 7]`
- **Visuals:**
  - প্রধান অ্যারে: `nums`, `window: { from: i - k + 1, to: i }`
  - `table`: `Deque` (indices and their values in decreasing order)
  - `output`: চলমান ম্যাক্সিমাম রেজাল্ট অ্যারে।
- **ধাপসমূহ:**
  - `i=0 (1)`: deque=[0]
  - `i=1 (3)`: 1 <= 3 pop 0 → deque=[1]
  - `i=2 (-1)`: deque=[1, 2], `res.push(nums[1]=3)`
  - `i=3 (-3)`: deque=[1, 2, 3], `res.push(3)`
  - `i=4 (5)`: 5 বড়, সব pop → deque=[4], `res.push(5)`
  - ক্রমান্বয়ে বাকি উইন্ডোগুলো প্রসেস হবে।

---

## ৩. ফাইল তৈরির তালিকা

1. `app/lib/simulations/data/4.1-monotonic-stack.ts`
2. `app/lib/simulations/data/4.2-expression-evaluation.ts`
3. `app/lib/simulations/data/4.3-custom-stack-queue.ts`
4. `app/lib/simulations/data/4.4-sliding-window-maximum.ts`
5. `app/lib/simulations/index.ts` (রেজিস্ট্রেশন)
