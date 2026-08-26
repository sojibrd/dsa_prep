# Implementation Plan — Topic 4: Stacks & Queues (Pattern Simulations)

## এই ডকুমেন্ট কীভাবে পড়বেন

1. `d:\document-files\dsa_prep\AGENTS.md`
2. `d:\document-files\dsa_prep\implementation-plan\1-arrays-strings.md` — **আগে পড়ুন।** Scene কনট্র্যাক্ট, `usePatternSim`, কম্পোনেন্ট গঠন এখানে সংজ্ঞায়িত।
3. `d:\document-files\dsa_prep\context\ui-registry.md`, `context\ui-tokens.md`
4. `d:\document-files\dsa_prep\context\dsa-workbook\4. Stacks & Queues\*.md` — raw ডেটা

**কোনো নতুন scene kind লাগবে না।** স্ট্যাক/ডেক নিজেই একটা "সবসময় এক প্রান্তে বাড়ে-কমে" গঠন — এটা `array` scene-এর `table` (side panel) দিয়ে স্বাভাবিকভাবে দেখানো যায়: মূল array/string input `values`-এ, আর স্ট্যাক/ডেক-এর বর্তমান কন্টেন্ট `table.entries`-এ (উপর থেকে নিচে বা সামনে থেকে পেছনে ক্রমে)।

---

## 4.1 Monotonic Stack

**Demo:** Largest Rectangle in Histogram — [LC 84](https://leetcode.com/problems/largest-rectangle-in-histogram/) — কোড:

```js
function largestRectangleArea(heights) {
  const stack = []; // index জমা, height increasing
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i]; // শেষে sentinel
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      best = Math.max(best, height * (i - left));
    }
    stack.push(i);
  }
  return best;
}
```

লাইন: ১=function, ২=stack init (comment), ৩=best init, ৪=for i (`<=` length, sentinel পর্যন্ত), ৫=h হিসাব (comment), ৬=while, ৭=height=pop, ৮=left হিসাব, ৯=best আপডেট, ১১=stack.push(i)।

**Scene:** `array`, `values`=`heights` (bar মোড, `asBars: true` — উচ্চতাগুলো visually তুলনা করা সহজ হয়)। `table`: `{title:"stack (index)", entries: stack-এর বর্তমান কন্টেন্ট}`। `marks`: বর্তমান `i` `active`, popped index `reject` (মুহূর্তের জন্য), rectangle যেটার area হিসাব হলো সেটার span `fill`।

**Demo input:** `heights = [2, 1, 5, 6, 2, 3]` (workbook-এর নিজস্ব উদাহরণ, sentinel-সহ `i` ০ থেকে ৬ পর্যন্ত যায়)।

**সম্পূর্ণ ট্রেস (১৩টা স্টেপ, script দিয়ে যাচাই করা):**

| # | i | h | ঘটনা | detail | best |
|---|---|---|---|---|---|
| 1 | 0 | 2 | push | stack=[0] | 0 |
| 2 | 1 | 1 | pop | height=2 (idx0), left=0, area=2×(1-0)=2 | 2 |
| 3 | 1 | 1 | push | stack=[1] | 2 |
| 4 | 2 | 5 | push | stack=[1,2] | 2 |
| 5 | 3 | 6 | push | stack=[1,2,3] | 2 |
| 6 | 4 | 2 | pop | height=6 (idx3), left=3, area=6×(4-3)=6 | 6 |
| 7 | 4 | 2 | pop | height=5 (idx2), left=2, area=5×(4-2)=10 | 10 |
| 8 | 4 | 2 | push | stack=[1,4] | 10 |
| 9 | 5 | 3 | push | stack=[1,4,5] | 10 |
| 10 | 6 (sentinel) | 0 | pop | height=3 (idx5), left=5, area=3×(6-5)=3 | 10 |
| 11 | 6 | 0 | pop | height=2 (idx4), left=2, area=2×(6-2)=8 | 10 |
| 12 | 6 | 0 | pop | height=1 (idx1), left=0, area=1×(6-0)=6 | 10 |
| 13 | 6 | 0 | push | stack=[6] | 10 |

**চূড়ান্ত উত্তর: `10`।**

---

## 4.2 Expression Evaluation / Parentheses

**Demo:** Longest Valid Parentheses — [LC 32](https://leetcode.com/problems/longest-valid-parentheses/) — কোড:

```js
function longestValidParentheses(s) {
  const stack = [-1]; // base index
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") stack.push(i);
    else {
      stack.pop();
      if (stack.length === 0)
        stack.push(i); // নতুন base
      else best = Math.max(best, i - stack[stack.length - 1]);
    }
  }
  return best;
}
```

লাইন: ১=function, ২=stack init (comment), ৩=best init, ৪=for i, ৫=if '(' push, ৬=else, ৭=pop, ৮-৯=if empty → push i as new base (comment), ১০=else best আপডেট।

**Scene:** `array`, `values`=`s` (চার-বাই-চার string)। `table`: `{title:"stack (index)", entries: stack}`। `marks[i]='active'`।

**Demo input:** `s = ")()())"` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৬টা স্টেপ, script দিয়ে যাচাই করা):**

| # (i) | char | ঘটনা | detail | stack (পরে) | best |
|---|---|---|---|---|---|
| 0 | `)` | pop-empty-newbase | pop করে খালি হয়ে গেল → i=0 নতুন base | `[0]` | 0 |
| 1 | `(` | push | | `[0,1]` | 0 |
| 2 | `)` | pop-valid | pop, stack top=0, len=2-0=2 | `[0]` | 2 |
| 3 | `(` | push | | `[0,3]` | 2 |
| 4 | `)` | pop-valid | pop, stack top=0, len=4-0=4 | `[0]` | **4** |
| 5 | `)` | pop-empty-newbase | pop করে খালি → i=5 নতুন base | `[5]` | 4 |

**চূড়ান্ত উত্তর: `4`।**

---

## 4.3 Design Problems (Custom Stack/Queue)

**Demo:** Min Stack — [LC 155](https://leetcode.com/problems/min-stack/) — কোড:

```js
class MinStack {
  constructor() {
    this.stack = [];
  } // [value, minSoFar] জোড়া
  push(val) {
    const min = this.stack.length ? Math.min(val, this.getMin()) : val;
    this.stack.push([val, min]);
  }
  pop() {
    this.stack.pop();
  }
  top() {
    return this.stack[this.stack.length - 1][0];
  }
  getMin() {
    return this.stack[this.stack.length - 1][1];
  }
}
```

লাইন: ১=class, ২-৪=constructor (comment সহ), ৫=push declare, ৬=min হিসাব, ৭=stack.push, ৮=pop declare, ৯=stack.pop, ১০=top declare, ১১=return top value, ১২=getMin declare, ১৩=return min value।

**এই প্যাটার্ন array/loop নয় — একটা **call sequence**। Scene-এ `values` field-এর দরকার নেই আসলে; পুরো গল্পটা `table`-এই ("stack" যার প্রতিটা entry `[value, minSoFar]` জোড়া)। `values`-এ একটা placeholder (খালি array বা call-এর নাম) রাখতে পারেন, মূল ফোকাস `table`।**

**Demo input — call sequence (workbook-এর নিজস্ব উদাহরণ):**

```
push(-2)
push(0)
push(-3)
getMin()   → -3
pop()
top()      → 0
getMin()   → -2
```

**সম্পূর্ণ ট্রেস (৭টা স্টেপ, script দিয়ে যাচাই করা):**

| # | call | stack (পরে, `[val,min]` জোড়া) | ফেরত মান |
|---|---|---|---|
| 1 | push(-2) | `[[-2,-2]]` | — |
| 2 | push(0) | `[[-2,-2],[0,-2]]` | — |
| 3 | push(-3) | `[[-2,-2],[0,-2],[-3,-3]]` | — |
| 4 | getMin() | (অপরিবর্তিত) | **-3** |
| 5 | pop() | `[[-2,-2],[0,-2]]` | — |
| 6 | top() | (অপরিবর্তিত) | **0** |
| 7 | getMin() | (অপরিবর্তিত) | **-2** |

**লক্ষণীয়:** `pop()`-এর পর `getMin()` স্বয়ংক্রিয়ভাবে আগের min (-2)-এ ফিরে যায় — এটাই এই প্যাটার্নের মূল কৌশল (প্রতিটা এন্ট্রি নিজের সাথে "তখনকার min" বহন করে)।

---

## 4.4 Sliding Window Maximum (Monotonic Deque)

**Demo:** Sliding Window Maximum — [LC 239](https://leetcode.com/problems/sliding-window-maximum/) — কোড:

```js
function maxSlidingWindow(nums, k) {
  const deque = []; // index, মান decreasing
  const res = [];
  for (let i = 0; i < nums.length; i++) {
    if (deque.length && deque[0] <= i - k) deque.shift(); // window-এর বাইরে
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i])
      deque.pop();
    deque.push(i);
    if (i >= k - 1) res.push(nums[deque[0]]);
  }
  return res;
}
```

লাইন: ১=function, ২=deque init (comment), ৩=res init, ৪=for i, ৫=if front out of window → shift (comment), ৬-৭=while back smaller → pop, ৮=deque.push(i), ৯=if window ready → record max।

**Scene:** `array`, `values`=`nums`, `window`={from: i-k+1, to: i} (যখন window ready)। `table`: `{title:"deque (index)", entries: deque}`। `marks`: বর্তমান `i` `active`, deque-এ থাকা index `done`।

**Demo input:** `nums = [1, 3, -1, -3, 5, 3, 6, 7]`, `k = 3` (workbook-এর নিজস্ব উদাহরণ)।

**⚠️ এই ট্রেস ২১টা স্টেপ (script দিয়ে যাচাই করা) — এই টপিকের মধ্যে সবচেয়ে লম্বা। চাইলে ছোট input দিয়ে কমাতে পারেন, কিন্তু workbook-এর ডিফল্ট রাখারও যুক্তি আছে (বহুল পরিচিত উদাহরণ)। নিচে সম্পূর্ণ ট্রেস:**

| # (i) | nums[i] | ঘটনা | detail |
|---|---|---|---|
| 0 | 1 | push | deque=[0] |
| 1 | 3 | pop-back-smaller | idx0(val 1) ফেলে দিন, deque=[] |
| 1 | 3 | push | deque=[1] |
| 2 | -1 | push | deque=[1,2] |
| 2 | -1 | record-max | window[0..2] প্রস্তুত, max=nums[1]=3 |
| 3 | -3 | push | deque=[1,2,3] |
| 3 | -3 | record-max | max=3 |
| 4 | 5 | pop-front-out-of-window | idx1 window-এর বাইরে (4-3=1 ≤ 1) |
| 4 | 5 | pop-back-smaller | idx3(val -3) ফেলে দিন |
| 4 | 5 | pop-back-smaller | idx2(val -1) ফেলে দিন |
| 4 | 5 | push | deque=[4] |
| 4 | 5 | record-max | max=5 |
| 5 | 3 | push | deque=[4,5] |
| 5 | 3 | record-max | max=5 |
| 6 | 6 | pop-back-smaller | idx5(val 3) ফেলে দিন |
| 6 | 6 | pop-back-smaller | idx4(val 5) ফেলে দিন |
| 6 | 6 | push | deque=[6] |
| 6 | 6 | record-max | max=6 |
| 7 | 7 | pop-back-smaller | idx6(val 6) ফেলে দিন |
| 7 | 7 | push | deque=[7] |
| 7 | 7 | record-max | max=7 |

**চূড়ান্ত উত্তর: `[3, 3, 5, 5, 6, 7]`।**

---

## যাচাই (implement করার পর)

```bash
cd d:\document-files\dsa_prep
npx tsc --noEmit
npx eslint app --ext .ts,.tsx
npx next build
```

## শেষে যা আপডেট করবেন

- `app/lib/simulations/index.ts` — ৪টা import + `ALL` array
- `context/progress-tracker.md` — টপিক ৪-এর এন্ট্রি
