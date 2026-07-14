# DSA Practice Workbook

> ১৭টা প্যাটার্ন cheat-sheet (ProPeers/Parikh Jain, algomaster.io, neetcode.io) থেকে সংকলিত একটা **living workbook**। প্রতিটা প্যাটার্নে একটা worked demo (JS) টেমপ্লেট হিসেবে দেওয়া আছে — বাকি প্রবলেমগুলো আপনি নিজে সলভ করে নিজের নোট লিখে ভরবেন।

**📍 শেষ যেখানে ছিলাম:** _(break নেওয়ার আগে এখানে এক লাইন লিখে রাখুন — যেমন: "Trees → Path Sum পর্যন্ত শেষ, LCA বাকি")_

---

## কীভাবে ব্যবহার করবেন (Spot → Solve → Revise)

1. **Spot** — প্রবলেম পড়ে প্যাটার্নের **"চিনবেন কীভাবে"** ক্লুগুলোর সাথে মেলান (প্রথম ২–৩ মিনিট)
2. **Solve** — demo-র টেমপ্লেট মাথায় রেখে **নিজে** কোড করুন (demo দেখে কপি নয়)
3. **Revise** — সলভ করার **সাথে সাথেই** চেকলিস্টে লিখুন:
   - **আমার সমাধান:** মূল আইডিয়া ২–৩ লাইনে (পুরো কোড নয়, যেটা মনে রাখলে আবার লিখতে পারবেন)
   - **যে সমস্যা হয়েছিল:** কোন trap/edge case-এ আটকেছিলেন — এটাই এই workbook-এর আসল দাম

**Priority ট্যাগ:** 🔥 **Must-do** = company-frequency ডেটায় (Amazon/Google/Meta/Microsoft/Apple/Uber) বেশি রিপোর্টেড — সময় কম থাকলে আগে এগুলো রিভিশন দিন। ⚪ **Bonus** = সম্পূর্ণ coverage-এর জন্য।

**Duplicate নিয়ম:** একই প্রবলেম একাধিক প্যাটার্নে পড়লে **এক জায়গায়** full এন্ট্রি, বাকি জায়গায় শুধু cross-ref — একই প্রবলেম দুইবার ট্র্যাক করবেন না।

---

## Progress Tracker

সলভ করার পর চেকবক্সে ✔ দিন আর এই টেবিলের Done কলাম আপডেট করুন।

| #   | টপিক                  | প্যাটার্ন | Demo   | প্র্যাকটিস প্রবলেম | Done     |
| --- | --------------------- | --------- | ------ | ------------------ | -------- |
| 1   | Arrays & Strings      | 7         | 7      | 27                 | 0/27     |
| 2   | Binary Search         | 4         | 4      | 7                  | 0/7      |
| 3   | Linked Lists          | 3         | 3      | 6                  | 0/6      |
| 4   | Stacks & Queues       | 4         | 4      | 7                  | 0/7      |
| 5   | Trees                 | 5         | 5      | 11                 | 0/11     |
| 6   | Heaps                 | 4         | 4      | 5                  | 0/5      |
| 7   | Backtracking          | 3         | 3      | 3                  | 0/3      |
| 8   | Graphs                | 7         | 7      | 11                 | 0/11     |
| 9   | Dynamic Programming   | 11        | 11     | 9                  | 0/9      |
| 10  | Greedy, Trie & Design | 3         | 3      | 5                  | 0/5      |
|     | **মোট**               | **51**    | **51** | **91**             | **0/91** |

---

## Constraint-Reading Quick Reference

প্রবলেম পড়ার **আগে** constraint দেখুন — এতেই প্যাটার্ন অর্ধেক চেনা হয়ে যায়।

| দেখলে                                  | ভাবুন                                                     |
| -------------------------------------- | --------------------------------------------------------- |
| N ≤ 20                                 | brute force / **backtracking** / bitmask DP               |
| N ≤ 100                                | O(n³) চলতে পারে — triple loop / সরাসরি simulation         |
| N ≤ 1,000                              | O(n²) ঠিক আছে — **DP টেবিল**, pair comparison             |
| N ≤ 10⁵                                | O(n log n) বা O(n) লাগবে — sort / heap / hashmap / prefix |
| N ≤ 10⁶                                | O(n) one-pass — counting / prefix, memory-ও খেয়াল রাখুন  |
| Sorted input                           | **binary search** / **two pointers**                      |
| অনেকগুলো range query                   | **prefix sum** (static) / segment tree (update সহ)        |
| Tree, n nodes                          | DFS/BFS recursion, children-এর ফল লাগলে tree DP           |
| Weighted graph + shortest              | **Dijkstra** (adjacency list + min-heap)                  |
| Unweighted shortest path               | **BFS** (প্রথম পৌঁছানোই shortest)                         |
| Top K / Kth                            | **heap** (বা just Kth হলে quickselect)                    |
| Count / frequency                      | **hashmap**                                               |
| সব possibility / সব combination        | **backtracking**                                          |
| min/max over choices, "number of ways" | **DP**                                                    |

---

# টপিকসমূহ

---

## 1. Arrays & Strings

সবচেয়ে বেশি জিজ্ঞেস হওয়া টপিক (Meta/Adobe-তে 75–85%)। Pointer, window, prefix, hashmap দিয়ে sequence প্রসেস করা — বাকি সব টপিকের ভিত।

### 1.1 Two Pointers

**চিনবেন কীভাবে:** sorted array/string, "pair with sum X", দুই প্রান্ত থেকে তুলনা, palindrome, in-place / O(1) space, remove duplicates, partition

**Demo: Trapping Rain Water** — [LC 42](https://leetcode.com/problems/trapping-rain-water/) _(Hard — Amazon/Google/Meta High)_

**Approach:** প্রতিটা ঘরে পানি জমে `min(leftMax, rightMax) - height[i]`। দুই প্রান্ত থেকে pointer চালান — যেদিকের height ছোট সেদিকটা আগান, কারণ ছোট দিকের max-ই bottleneck, অন্য পাশে যত বড়ই থাকুক পানির উচ্চতা এই দিকেই আটকে।

```js
function trap(height) {
  let l = 0,
    r = height.length - 1;
  let leftMax = 0,
    rightMax = 0,
    water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      leftMax = Math.max(leftMax, height[l]);
      water += leftMax - height[l];
      l++;
    } else {
      rightMax = Math.max(rightMax, height[r]);
      water += rightMax - height[r];
      r--;
    }
  }
  return water;
}
```

**Complexity:** Time O(n), Space O(1) _(monotonic stack দিয়েও হয় — দেখুন 4.1)_

**প্রবলেম লিস্ট:**

- [ ] **3Sum** — [LC 15](https://leetcode.com/problems/3sum/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Container With Most Water** — [LC 11](https://leetcode.com/problems/container-with-most-water/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Two Sum II (Sorted Array)** — [LC 167](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Valid Palindrome** — [LC 125](https://leetcode.com/problems/valid-palindrome/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Remove Duplicates from Sorted Array** — [LC 26](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Sort Colors** — [LC 75](https://leetcode.com/problems/sort-colors/) — ⚪ Bonus _(তিন pointer / Dutch flag)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Merge Sorted Array** — [LC 88](https://leetcode.com/problems/merge-sorted-array/) — ⚪ Bonus _(পেছন থেকে merge)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Reverse String** — [LC 344](https://leetcode.com/problems/reverse-string/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 1.2 Sliding Window

**চিনবেন কীভাবে:** "longest/shortest substring/subarray with X", contiguous, "subarray of size k", max/min sum — O(n²) nested loop-কে O(n) window-এ নামানো

**Demo: Minimum Window Substring** — [LC 76](https://leetcode.com/problems/minimum-window-substring/) _(Hard — Google/Meta/Apple High)_

**Approach:** `t`-এর প্রতিটা char-এর দরকারি count একটা map-এ রাখুন। ডান দিকে window বাড়ান; সব char পাওয়া গেলে (`missing === 0`) বাম দিক থেকে যত পারা যায় ছোট করুন আর best উত্তর আপডেট করুন। ছোট করতে গিয়ে কোনো দরকারি char হারালে আবার ডানে বাড়ানো শুরু।

```js
function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let missing = t.length,
    l = 0,
    best = [0, Infinity];
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    if (need.has(c)) {
      if (need.get(c) > 0) missing--;
      need.set(c, need.get(c) - 1);
    }
    while (missing === 0) {
      // valid window → shrink
      if (r - l < best[1] - best[0]) best = [l, r];
      const d = s[l];
      if (need.has(d)) {
        need.set(d, need.get(d) + 1);
        if (need.get(d) > 0) missing++;
      }
      l++;
    }
  }
  return best[1] === Infinity ? "" : s.slice(best[0], best[1] + 1);
}
```

**Complexity:** Time O(|s| + |t|), Space O(|t|)

**প্রবলেম লিস্ট:**

- [ ] **Longest Substring Without Repeating Characters** — [LC 3](https://leetcode.com/problems/longest-substring-without-repeating-characters/) — 🔥 Must-do _(hashing-ও লাগে — primary এখানেই)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Longest Repeating Character Replacement** — [LC 424](https://leetcode.com/problems/longest-repeating-character-replacement/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Fruit Into Baskets** — [LC 904](https://leetcode.com/problems/fruit-into-baskets/) — ⚪ Bonus _(at most 2 distinct)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Minimum Size Subarray Sum** — [LC 209](https://leetcode.com/problems/minimum-size-subarray-sum/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Find All Anagrams in a String** — [LC 438](https://leetcode.com/problems/find-all-anagrams-in-a-string/) — ⚪ Bonus _(fixed-size window + freq compare)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- _Sliding Window Maximum → দেখুন **4.4** (Stacks & Queues — monotonic deque)_

### 1.3 Prefix Sum

**চিনবেন কীভাবে:** "subarray sum", range sum query, cumulative, একই array-তে বারবার sum জিজ্ঞেস — precompute O(n), query O(1)

**Demo: Subarray Sum Equals K** — [LC 560](https://leetcode.com/problems/subarray-sum-equals-k/) _(Medium)_

**Approach:** চলতে চলতে running prefix sum রাখুন। `sum[i..j] = k` মানে `prefix[j] - prefix[i-1] = k`, অর্থাৎ আগে কোথাও `prefix - k` মানের prefix দেখা গেছে কি না — সেটা hashmap-এ count সহ রাখলেই হয়। (negative number থাকলেও কাজ করে, যেখানে sliding window ব্যর্থ।)

```js
function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]); // খালি prefix
  let sum = 0,
    count = 0;
  for (const x of nums) {
    sum += x;
    count += seen.get(sum - k) || 0;
    seen.set(sum, (seen.get(sum) || 0) + 1);
  }
  return count;
}
```

**Complexity:** Time O(n), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Range Sum Query — Immutable** — [LC 303](https://leetcode.com/problems/range-sum-query-immutable/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Count of Range Sum** — [LC 327](https://leetcode.com/problems/count-of-range-sum/) — ⚪ Bonus _(Hard — prefix + merge sort/BIT)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 1.4 Hashing / Frequency Counting

**চিনবেন কীভাবে:** "count", "frequency", "group by", "duplicate", "complement/pair sum", "first unique", O(1) lookup দরকার — O(n²) scan-কে O(n) এ নামানো

**Demo: Longest Consecutive Sequence** — [LC 128](https://leetcode.com/problems/longest-consecutive-sequence/) _(Medium)_

**Approach:** সব সংখ্যা Set-এ ঢুকান। কেবল সেই সংখ্যা থেকে গোনা শুরু করুন যার `x-1` নেই (মানে সেটাই sequence-এর শুরু) — তাহলে প্রতিটা এলিমেন্ট সর্বোচ্চ দুবার দেখা হয়, sort ছাড়াই O(n)।

```js
function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (set.has(x - 1)) continue; // sequence-এর শুরু না হলে skip
    let len = 1;
    while (set.has(x + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}
```

**Complexity:** Time O(n), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Two Sum** — [LC 1](https://leetcode.com/problems/two-sum/) — 🔥 Must-do _(complement lookup — সবার আগে এটা)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Group Anagrams** — [LC 49](https://leetcode.com/problems/group-anagrams/) — 🔥 Must-do _(sorted string / freq-signature key)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Valid Anagram** — [LC 242](https://leetcode.com/problems/valid-anagram/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **First Unique Character in a String** — [LC 387](https://leetcode.com/problems/first-unique-character-in-a-string/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **First Missing Positive** — [LC 41](https://leetcode.com/problems/first-missing-positive/) — 🔥 Must-do _(Hard — Meta High; index-as-hash trick, O(1) space)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Max Points on a Line** — [LC 149](https://leetcode.com/problems/max-points-on-a-line/) — 🔥 Must-do _(Hard — Google High; slope-কে hashmap key বানানো)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Find the Index of the First Occurrence (strStr)** — [LC 28](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) — ⚪ Bonus _(advanced string matching: KMP/Z-algorithm শেখার entry point)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 1.5 Merge Intervals

**চিনবেন কীভাবে:** (start, end) pair, "overlap", "merge", "meeting rooms", scheduling — প্রায় সবসময় **আগে start দিয়ে sort**

**Demo: Merge Intervals** — [LC 56](https://leetcode.com/problems/merge-intervals/) _(Medium — সব কোম্পানিতে ঘন ঘন)_

**Approach:** start অনুযায়ী sort করুন। এরপর এক পাস — নতুন interval-এর start যদি result-এর শেষ interval-এর end-এর ভেতরে পড়ে, end বাড়িয়ে merge; নাহলে নতুন করে push।

```js
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const [s, e] = intervals[i];
    const last = res[res.length - 1];
    if (s <= last[1])
      last[1] = Math.max(last[1], e); // overlap → merge
    else res.push([s, e]);
  }
  return res;
}
```

**Complexity:** Time O(n log n) (sort), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Insert Interval** — [LC 57](https://leetcode.com/problems/insert-interval/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Non-overlapping Intervals** — [LC 435](https://leetcode.com/problems/non-overlapping-intervals/) — 🔥 Must-do _(greedy: end অনুযায়ী sort — দেখুন 10.1-ও)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Meeting Rooms** — [LC 252](https://leetcode.com/problems/meeting-rooms/) — ⚪ Bonus _(Premium; ফ্রি বিকল্প: GfG "meeting rooms")_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 1.6 Kadane's Algorithm

**চিনবেন কীভাবে:** "maximum/minimum subarray sum", contiguous, এক পাসে চলমান best — আসলে ১-ভেরিয়েবল DP: "আগেরটা টেনে নেব, না নতুন শুরু করব?"

**Demo: Maximum Subarray** — [LC 53](https://leetcode.com/problems/maximum-subarray/) _(Medium)_

**Approach:** প্রতিটা index-এ সিদ্ধান্ত — আগের চলমান sum positive contribution দিলে যোগ করুন, নাহলে এখান থেকে নতুন subarray শুরু। global best আলাদা রাখুন।

```js
function maxSubArray(nums) {
  let cur = nums[0],
    best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]); // নতুন শুরু vs টেনে নেওয়া
    best = Math.max(best, cur);
  }
  return best;
}
```

**Complexity:** Time O(n), Space O(1)

**প্রবলেম লিস্ট:**

- [ ] **Maximum Product Subarray** — [LC 152](https://leetcode.com/problems/maximum-product-subarray/) — ⚪ Bonus _(negative × negative = positive → min-ও ট্র্যাক করুন)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 1.7 Matrix Traversal

**চিনবেন কীভাবে:** 2D grid, "spiral", "rotate", boundary ধরে ধরে হাঁটা, layer-by-layer — direction/boundary ভেরিয়েবল দিয়ে simulation

**Demo: Spiral Matrix** — [LC 54](https://leetcode.com/problems/spiral-matrix/) _(Medium)_

**Approach:** চারটা boundary (`top/bottom/left/right`) রাখুন। এক layer ঘুরে boundary গুটিয়ে আনুন। ভেতরের দিকের single row/column-এ ডাবল-কাউন্ট এড়াতে নিচ ও বাম পাসের আগে boundary চেক জরুরি।

```js
function spiralOrder(matrix) {
  const res = [];
  let top = 0,
    bottom = matrix.length - 1;
  let left = 0,
    right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) res.push(matrix[top][j]);
    top++;
    for (let i = top; i <= bottom; i++) res.push(matrix[i][right]);
    right--;
    if (top <= bottom) {
      for (let j = right; j >= left; j--) res.push(matrix[bottom][j]);
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) res.push(matrix[i][left]);
      left++;
    }
  }
  return res;
}
```

**Complexity:** Time O(m·n), Space O(1) (output বাদে)

**প্রবলেম লিস্ট:**

- [ ] **Rotate Image** — [LC 48](https://leetcode.com/problems/rotate-image/) — ⚪ Bonus _(transpose + reverse)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- \*Grid-এ BFS/DFS (islands, flood fill) → দেখুন **8.1\***

---

## 2. Binary Search

Sorted data বা monotonic answer space — প্রতি ধাপে অর্ধেক বাদ। মন্ত্র: **"Can I eliminate half the space?"** `low`, `high`, `mid`, `feasible(mid)` — এই চারটা জিনিস পরিষ্কার রাখুন।

### 2.1 Basic Binary Search ও Counting Occurrences

**চিনবেন কীভাবে:** sorted array, "find efficiently", "first/last occurrence", "count of X in range"

**Demo: Find First and Last Position of Element** — [LC 34](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) _(Medium)_

**Approach:** দুইবার binary search — একবার left-biased (match পেলে বামে চাপুন), একবার right-biased (match পেলে ডানে চাপুন)। এটাই "counting occurrences"-এরও ভিত্তি: `last - first + 1`।

```js
function searchRange(nums, target) {
  const bound = (isFirst) => {
    let lo = 0,
      hi = nums.length - 1,
      ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (nums[mid] === target) {
        ans = mid;
        if (isFirst)
          hi = mid - 1; // আরও বামে খুঁজুন
        else lo = mid + 1; // আরও ডানে খুঁজুন
      } else if (nums[mid] < target) lo = mid + 1;
      else hi = mid - 1;
    }
    return ans;
  };
  return [bound(true), bound(false)];
}
```

**Complexity:** Time O(log n), Space O(1)

**প্রবলেম লিস্ট:**

- [ ] **Search Insert Position** — [LC 35](https://leetcode.com/problems/search-insert-position/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Binary Search** — [LC 704](https://leetcode.com/problems/binary-search/) — ⚪ Bonus _(টেমপ্লেট মুখস্থ লেখার প্র্যাকটিস)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Median of Two Sorted Arrays** — [LC 4](https://leetcode.com/problems/median-of-two-sorted-arrays/) — 🔥 Must-do _(Hard — Google/Apple High; ছোট array-তে partition search)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 2.2 Binary Search on Answer

**চিনবেন কীভাবে:** "minimize the maximum" / "maximize the minimum", "least speed/capacity/days so that...", উত্তরটা একটা range-এ আছে এবং feasibility monotonic (k পারলে k+1-ও পারে)

**Demo: Koko Eating Bananas** — [LC 875](https://leetcode.com/problems/koko-eating-bananas/) _(Medium)_

**Approach:** array-তে না, **উত্তরের space-এ** search করুন: speed 1 থেকে max(piles)। `canFinish(k)` monotonic — তাই সবচেয়ে ছোট feasible k বের করতে binary search।

```js
function minEatingSpeed(piles, h) {
  const canFinish = (k) => piles.reduce((t, p) => t + Math.ceil(p / k), 0) <= h;
  let lo = 1,
    hi = Math.max(...piles);
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (canFinish(mid))
      hi = mid; // আরও ছোট speed চেষ্টা
    else lo = mid + 1;
  }
  return lo;
}
```

**Complexity:** Time O(n log max), Space O(1)

**প্রবলেম লিস্ট:**

- [ ] **Capacity to Ship Packages Within D Days** — [LC 1011](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 2.3 Allocation Problems

**চিনবেন কীভাবে:** "distribute/allocate/divide K জনে", "minimize the largest share" — binary search on answer-এরই বিশেষ রূপ, feasible() = "এই cap-এ K ভাগে ভাগ করা যায় কি?"

**Demo: Split Array Largest Sum** — [LC 410](https://leetcode.com/problems/split-array-largest-sum/) _(Hard — Google High)_

**Approach:** উত্তরের range: `max(nums)` (এক এলিমেন্টের ভাগ) থেকে `sum(nums)` (সব এক ভাগে)। প্রতিটা cap-এর জন্য greedy করে দেখুন কত ভাগ লাগে — k ভাগের মধ্যে হলে cap কমান।

```js
function splitArray(nums, k) {
  const canSplit = (cap) => {
    let parts = 1,
      sum = 0;
    for (const x of nums) {
      if (sum + x > cap) {
        parts++;
        sum = 0;
      }
      sum += x;
    }
    return parts <= k;
  };
  let lo = Math.max(...nums),
    hi = nums.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (canSplit(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

**Complexity:** Time O(n log sum), Space O(1)

**প্রবলেম লিস্ট:**

- [ ] **Allocate Minimum Number of Pages** — [GfG](https://www.geeksforgeeks.org/allocate-minimum-number-pages/) — ⚪ Bonus _(LC 410-এর যমজ)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 2.4 Bitonic / Rotated Array

**চিনবেন কীভাবে:** "rotated sorted array", "peak/mountain element", "bitonic" — array পুরো sorted না হলেও **অর্ধেকটা সবসময় sorted**, সেটা দিয়েই decide করুন কোন দিকে যাবেন

**Demo: Search in Rotated Sorted Array** — [LC 33](https://leetcode.com/problems/search-in-rotated-sorted-array/) _(Medium)_

**Approach:** প্রতি ধাপে দেখুন কোন অর্ধেক sorted (`nums[lo] <= nums[mid]` হলে বাম)। target সেই sorted অর্ধেকের range-এ পড়লে সেদিকে যান, নাহলে অন্য দিকে।

```js
function search(nums, target) {
  let lo = 0,
    hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      // বাম অর্ধেক sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      // ডান অর্ধেক sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}
```

**Complexity:** Time O(log n), Space O(1)

**প্রবলেম লিস্ট:**

- [ ] **Find Minimum in Rotated Sorted Array** — [LC 153](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Find Peak Element** — [LC 162](https://leetcode.com/problems/find-peak-element/) — 🔥 Must-do _(ঢালের দিক দেখে অর্ধেক বাদ)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

---

## 3. Linked Lists

Pointer manipulation — index নেই, তাই pointer-এর গতি আর দিকই সব। **Dummy node** head-এর edge case বাঁচায়, **fast/slow** cycle আর midpoint দেয়।

### 3.1 Fast & Slow Pointers

**চিনবেন কীভাবে:** "detect cycle", "middle of list", "nth from end", "intersection" — দুই pointer ভিন্ন গতিতে/ব্যবধানে

**Demo: Linked List Cycle II** — [LC 142](https://leetcode.com/problems/linked-list-cycle-ii/) _(Medium — Floyd's algorithm পুরোটা)_

**Approach:** fast ২ ধাপ, slow ১ ধাপ — দেখা হলে cycle আছে। এরপর একটা pointer head-এ ফিরিয়ে দুটোই ১ ধাপ করে চালান; আবার যেখানে মিলবে সেটাই cycle-এর শুরু (গণিত: head→start দূরত্ব = meeting→start দূরত্ব mod cycle)।

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

**Complexity:** Time O(n), Space O(1)

**প্রবলেম লিস্ট:**

- [ ] **Linked List Cycle** — [LC 141](https://leetcode.com/problems/linked-list-cycle/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Middle of the Linked List** — [LC 876](https://leetcode.com/problems/middle-of-the-linked-list/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Remove Nth Node From End of List** — [LC 19](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) — 🔥 Must-do _(n ব্যবধানে দুই pointer + dummy)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 3.2 Dummy Node Technique

**চিনবেন কীভাবে:** head বদলাতে পারে এমন insert/delete/merge — dummy বানিয়ে `dummy.next` রিটার্ন করলে head-এর special case উধাও

**Demo: Merge Two Sorted Lists** — [LC 21](https://leetcode.com/problems/merge-two-sorted-lists/) _(Easy কিন্তু dummy-র ক্যানোনিকাল টেমপ্লেট — Merge K Lists-এর ভিত)_

**Approach:** dummy থেকে tail চালান; দুই লিস্টের ছোট নোডটা tail-এ জুড়ুন। একটা শেষ হলে অন্যটার বাকি অংশ সরাসরি জুড়ে দিন।

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

**Complexity:** Time O(m+n), Space O(1)

**প্রবলেম লিস্ট:**

- [ ] **Swap Nodes in Pairs** — [LC 24](https://leetcode.com/problems/swap-nodes-in-pairs/) — ⚪ Bonus _(recursion দিয়েও সুন্দর হয়)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 3.3 In-Place Reversal

**চিনবেন কীভাবে:** "reverse list", "reverse in k-group", "reorder" — `prev/cur/next` তিন pointer-এর নাচ, O(1) space

**Demo: Reverse Nodes in k-Group** — [LC 25](https://leetcode.com/problems/reverse-nodes-in-k-group/) _(Hard — Meta High)_

**Approach:** আগে গুনে দেখুন k-টা নোড আছে কি না — না থাকলে ওই অংশ অপরিবর্তিত। থাকলে recursion দিয়ে পরের অংশ আগে সমাধান করুন, তারপর বর্তমান k-টা নোড standard reversal-এ উল্টে সেই ফলের সাথে জুড়ে দিন।

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

**Complexity:** Time O(n), Space O(n/k) recursion (iterative করলে O(1))

**প্রবলেম লিস্ট:**

- [ ] **Reverse Linked List** — [LC 206](https://leetcode.com/problems/reverse-linked-list/) — 🔥 Must-do _(টেমপ্লেট — চোখ বন্ধ করে লিখতে পারা চাই)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Reorder List** — [LC 143](https://leetcode.com/problems/reorder-list/) — 🔥 Must-do _(middle + reverse + merge — তিন প্যাটার্নের কম্বো)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

---

## 4. Stacks & Queues

LIFO/FIFO order যেখানে গুরুত্বপূর্ণ — nesting, "next greater", expression, window-এর max/min। **Monotonic stack** এই টপিকের রাজা: stack-এ increasing বা decreasing order জোর করে ধরে রাখা।

### 4.1 Monotonic Stack

**চিনবেন কীভাবে:** "next greater/smaller element", "কতদিন অপেক্ষা", histogram/boundary, stock span — প্রতিটা এলিমেন্টের জন্য "আমার চেয়ে বড়/ছোট প্রথম কে" প্রশ্ন

**Demo: Largest Rectangle in Histogram** — [LC 84](https://leetcode.com/problems/largest-rectangle-in-histogram/) _(Hard — Google High)_

**Approach:** stack-এ index রাখুন যাতে height increasing থাকে। ছোট height এলে pop করুন — pop হওয়া bar-এর জন্য ডান boundary = এখনকার index, বাম boundary = stack-এর নতুন top। শেষে সব pop করাতে sentinel হিসেবে height 0 প্রসেস করুন।

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

**Complexity:** Time O(n) (প্রতিটা index একবার push, একবার pop), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Daily Temperatures** — [LC 739](https://leetcode.com/problems/daily-temperatures/) — 🔥 Must-do _(monotonic stack-এর সহজতম রূপ — আগে এটা)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Next Greater Element I** — [LC 496](https://leetcode.com/problems/next-greater-element-i/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Next Greater Element II** — [LC 503](https://leetcode.com/problems/next-greater-element-ii/) — ⚪ Bonus _(circular → দুইবার লুপ, index mod n)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Online Stock Span** — [LC 901](https://leetcode.com/problems/online-stock-span/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- _Trapping Rain Water (stack solution) → primary এন্ট্রি **1.1**-এ_

### 4.2 Expression Evaluation / Parentheses

**চিনবেন কীভাবে:** "valid parentheses", "evaluate expression", nesting/matching, infix/postfix, "backspace" — খোলা জিনিস stack-এ রাখুন, বন্ধ হলে match করে pop

**Demo: Longest Valid Parentheses** — [LC 32](https://leetcode.com/problems/longest-valid-parentheses/) _(Hard — Google High)_

**Approach:** stack-এ index রাখুন, নিচে একটা base হিসেবে -1। `(` এলে push; `)` এলে pop — pop-এর পর stack খালি হলে এই `)` টা নতুন base, নাহলে বর্তমান valid দৈর্ঘ্য = `i - stack.top`।

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

**Complexity:** Time O(n), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Valid Parentheses** — [LC 20](https://leetcode.com/problems/valid-parentheses/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Backspace String Compare** — [LC 844](https://leetcode.com/problems/backspace-string-compare/) — ⚪ Bonus _(stack, বা O(1) space-এ পেছন থেকে two pointers)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 4.3 Design Problems (Custom Stack/Queue)

**চিনবেন কীভাবে:** "implement a stack/queue with X" — O(1)-এ বাড়তি তথ্য (min/max) চাই, বা এক structure দিয়ে আরেকটা simulate

**Demo: Min Stack** — [LC 155](https://leetcode.com/problems/min-stack/) _(Medium)_

**Approach:** প্রতিটা এলিমেন্টের সাথে "এই পর্যন্ত min" জোড়া করে রাখুন — pop করলে min-ও আপনা-আপনি আগের অবস্থায় ফিরে যায়।

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

**Complexity:** সব operation O(1), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Implement Queue using Stacks** — [LC 232](https://leetcode.com/problems/implement-queue-using-stacks/) — ⚪ Bonus _(দুই stack: in + out, amortized O(1))_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- _LRU/LFU Cache → দেখুন **10.3** (Design)_

### 4.4 Sliding Window Maximum (Monotonic Deque)

**চিনবেন কীভাবে:** "sliding window max/min", "moving maximum" — window সরে আর প্রতিবার max চাই; heap-এ O(n log n), deque-এ O(n)

**Demo: Sliding Window Maximum** — [LC 239](https://leetcode.com/problems/sliding-window-maximum/) _(Hard — Google/Uber High)_

**Approach:** deque-এ index রাখুন যাতে মানগুলো decreasing থাকে — front সবসময় window-এর max। নতুন এলিমেন্টের চেয়ে ছোট সব পেছন থেকে ফেলে দিন (ওরা আর কখনো max হবে না), আর window-এর বাইরে পড়া front ফেলে দিন।

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

**Complexity:** Time O(n), Space O(k) _(নোট: JS-এ `shift()` O(n) — বড় input-এ head pointer ব্যবহার করুন)_

**প্রবলেম লিস্ট:**

- _(demo-ই এই প্যাটার্নের মূল প্রবলেম — heap দিয়ে বিকল্প সমাধানও একবার লিখে দেখুন, দেখুন 6।)_

---

## 5. Trees

Recursive thinking-এর টপিক — প্রতিটা প্রবলেমে জিজ্ঞেস করুন: "একটা নোডের কাজ কী, আর children-এর ফল থেকে কী বানাব?" Height, path, ancestor, diameter — এই চারটা জিনিস বারবার আসে।

### 5.1 Tree Traversal (DFS / BFS)

**চিনবেন কীভাবে:** "visit all nodes", "level order", "zigzag", "inorder/preorder/postorder", serialize — traversal order-ই প্রশ্নের প্রাণ

**Demo: Binary Tree Zigzag Level Order Traversal** — [LC 103](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/) _(Medium)_

**Approach:** সাধারণ BFS level-by-level, শুধু প্রতি level-এ direction flag উল্টে দিন — জোড় level সোজা, বিজোড় উল্টো।

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

**Complexity:** Time O(n), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Binary Tree Inorder Traversal** — [LC 94](https://leetcode.com/problems/binary-tree-inorder-traversal/) — 🔥 Must-do _(iterative-টাও পারতে হবে — stack দিয়ে)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Binary Tree Level Order Traversal** — [LC 102](https://leetcode.com/problems/binary-tree-level-order-traversal/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Serialize and Deserialize Binary Tree** — [LC 297](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) — 🔥 Must-do _(Hard — Google/Meta High; preorder + null marker সবচেয়ে সহজ)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Maximum Depth of Binary Tree** — [LC 104](https://leetcode.com/problems/maximum-depth-of-binary-tree/) — ⚪ Bonus _(recursion-এর hello world)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 5.2 Tree Construction

**চিনবেন কীভাবে:** "construct from preorder/inorder", "rebuild tree" — একটা traversal root চেনায়, আরেকটা left/right ভাগ করে

**Demo: Construct Binary Tree from Preorder and Inorder** — [LC 105](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) _(Medium)_

**Approach:** preorder-এর প্রথম এলিমেন্ট = root। inorder-এ সেই root-এর position বাম/ডান subtree ভাগ করে দেয়। inorder index গুলো hashmap-এ রাখলে প্রতি নোড O(1)।

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

**Complexity:** Time O(n), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Serialize and Deserialize BST** — [LC 449](https://leetcode.com/problems/serialize-and-deserialize-bst/) — ⚪ Bonus _(BST হলে শুধু preorder-ই যথেষ্ট — কেন?)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 5.3 Path Sum

**চিনবেন কীভাবে:** "path sum", "root-to-leaf", "maximum path" — path নোড হয়ে **বাঁক নিতে পারে** কি না সেটাই আসল প্রশ্ন

**Demo: Binary Tree Maximum Path Sum** — [LC 124](https://leetcode.com/problems/binary-tree-maximum-path-sum/) _(Hard — Microsoft/Meta High)_

**Approach:** প্রতিটা নোডে দুটো হিসাব: (১) এই নোডে **বাঁক নেওয়া** path-এর যোগফল = `node + leftGain + rightGain` → global best; (২) parent-কে ফেরত দেওয়া যায় শুধু **এক দিকের** সেরা branch = `node + max(leftGain, rightGain)`। Negative branch নেবেন না (`max(gain, 0)`)।

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

**Complexity:** Time O(n), Space O(h) recursion

**প্রবলেম লিস্ট:**

- [ ] **Path Sum** — [LC 112](https://leetcode.com/problems/path-sum/) — ⚪ Bonus _(root-to-leaf, target কমাতে কমাতে নামুন)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 5.4 Validation & Properties

**চিনবেন কীভাবে:** "validate BST", "balanced", "diameter", "symmetric/invert" — subtree থেকে property (height, range) উপরে ওঠানো

**Demo: Validate Binary Search Tree** — [LC 98](https://leetcode.com/problems/validate-binary-search-tree/) _(Medium — খুব common trap প্রবলেম)_

**Approach:** শুধু parent-child তুলনা করলেই **ভুল** — পুরো subtree-র valid range (min, max) নামিয়ে দিতে হবে। বামে গেলে max হয় নোডের মান, ডানে গেলে min।

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

**Complexity:** Time O(n), Space O(h)

**প্রবলেম লিস্ট:**

- [ ] **Balanced Binary Tree** — [LC 110](https://leetcode.com/problems/balanced-binary-tree/) — ⚪ Bonus _(height ফেরত দিন, unbalanced হলে -1 sentinel)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Diameter of Binary Tree** — [LC 543](https://leetcode.com/problems/diameter-of-binary-tree/) — 🔥 Must-do _(Max Path Sum-এর ছোট ভাই — একই কাঠামো)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Invert Binary Tree** — [LC 226](https://leetcode.com/problems/invert-binary-tree/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Symmetric Tree** — [LC 101](https://leetcode.com/problems/symmetric-tree/) — ⚪ Bonus _(দুই নোড নিয়ে mirror তুলনা)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 5.5 Lowest Common Ancestor (LCA)

**চিনবেন কীভাবে:** "common ancestor", "distance between nodes", "kth smallest in BST" — দুই নোডের মিলনবিন্দু বা BST-র order property

**Demo: Lowest Common Ancestor of a Binary Tree** — [LC 236](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) _(Medium — সব কোম্পানিতে common)_

**Approach:** প্রতিটা নোড থেকে জিজ্ঞেস করুন — p বা q কি আমার subtree-তে? দুই পাশ থেকেই non-null ফেরত এলে এই নোডই LCA; এক পাশ থেকে এলে সেটাই উপরে পাঠান।

```js
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root; // দুই পাশে → এটাই LCA
  return left || right;
}
```

**Complexity:** Time O(n), Space O(h)

**প্রবলেম লিস্ট:**

- [ ] **Kth Smallest Element in a BST** — [LC 230](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) — 🔥 Must-do _(inorder = sorted order — k-তম এ থামুন)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

---

## 6. Heaps / Priority Queues

Current min/max বা top K-তে দ্রুত access — insert/remove O(log n), peek O(1)। পুরো sort (O(n log n)) না করে শুধু দরকারি অংশ order রাখা।

**JS-এ built-in heap নেই** — এই MinHeap-টা টেমপ্লেট হিসেবে মুখস্থ রাখুন (comparator বদলে max-heap বা custom order হয়; Dijkstra-র demo-তেও এটাই ব্যবহৃত):

```js
class MinHeap {
  constructor(cmp = (a, b) => a - b) {
    this.a = [];
    this.cmp = cmp;
  }
  get size() {
    return this.a.length;
  }
  top() {
    return this.a[0];
  }
  push(v) {
    this.a.push(v);
    let i = this.a.length - 1;
    while (i > 0) {
      // sift up
      const p = (i - 1) >> 1;
      if (this.cmp(this.a[i], this.a[p]) >= 0) break;
      [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
      i = p;
    }
  }
  pop() {
    const top = this.a[0],
      last = this.a.pop();
    if (this.a.length) {
      this.a[0] = last;
      let i = 0;
      while (true) {
        // sift down
        let s = i;
        const l = 2 * i + 1,
          r = 2 * i + 2;
        if (l < this.a.length && this.cmp(this.a[l], this.a[s]) < 0) s = l;
        if (r < this.a.length && this.cmp(this.a[r], this.a[s]) < 0) s = r;
        if (s === i) break;
        [this.a[i], this.a[s]] = [this.a[s], this.a[i]];
        i = s;
      }
    }
    return top;
  }
}
```

### 6.1 Top K / Kth Element

**চিনবেন কীভাবে:** "Kth largest/smallest", "top K frequent", "K closest" — পুরো sort লাগবে না, K সাইজের heap-ই যথেষ্ট

**Demo: Kth Largest Element in an Array** — [LC 215](https://leetcode.com/problems/kth-largest-element-in-an-array/) _(Medium)_

**Approach:** K সাইজের **min-heap** রাখুন — ভর্তি হয়ে গেলে ছোটটা ফেলে দিন; শেষে heap-এর top-ই Kth largest। (Interview-তে quickselect-ও বলুন: average O(n)।)

```js
function findKthLargest(nums, k) {
  const heap = new MinHeap();
  for (const x of nums) {
    heap.push(x);
    if (heap.size > k) heap.pop(); // K-টার বেশি রাখব না
  }
  return heap.top();
}
```

**Complexity:** Time O(n log k), Space O(k)

**প্রবলেম লিস্ট:**

- [ ] **Top K Frequent Elements** — [LC 347](https://leetcode.com/problems/top-k-frequent-elements/) — 🔥 Must-do _(freq map + heap; O(n) bucket sort-ও শিখুন)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **K Closest Points to Origin** — [LC 973](https://leetcode.com/problems/k-closest-points-to-origin/) — 🔥 Must-do
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Kth Largest Element in a Stream** — [LC 703](https://leetcode.com/problems/kth-largest-element-in-a-stream/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 6.2 Merge K Sorted Lists

**চিনবেন কীভাবে:** "merge K sorted lists/streams/arrays" — K-টা উৎসের current head-দের মধ্যে min বারবার চাই → heap

**Demo: Merge k Sorted Lists** — [LC 23](https://leetcode.com/problems/merge-k-sorted-lists/) _(Hard — Amazon/Meta/Uber High)_

**Approach:** প্রতিটা লিস্টের head heap-এ দিন। সবচেয়ে ছোটটা pop করে result-এ জুড়ুন, তার next-টা heap-এ push করুন — শেষ পর্যন্ত।

```js
function mergeKLists(lists) {
  const heap = new MinHeap((a, b) => a.val - b.val);
  for (const node of lists) if (node) heap.push(node);
  const dummy = { next: null };
  let tail = dummy;
  while (heap.size) {
    const node = heap.pop();
    tail.next = node;
    tail = node;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}
```

**Complexity:** Time O(N log k) (N = মোট নোড), Space O(k)

**প্রবলেম লিস্ট:**

- _(demo-ই এই প্যাটার্নের মূল প্রবলেম — divide & conquer (pairwise merge) বিকল্পটাও একবার লিখুন।)_

### 6.3 Two Heaps (Running Median)

**চিনবেন কীভাবে:** "median from stream", "balance two halves" — ছোট অর্ধেক max-heap-এ, বড় অর্ধেক min-heap-এ; দুই top-এর মাঝেই median

**Demo: Find Median from Data Stream** — [LC 295](https://leetcode.com/problems/find-median-from-data-stream/) _(Hard — Amazon/Meta/Uber High)_

**Approach:** নতুন সংখ্যা আগে `small` (max-heap)-এ, তারপর তার top-টা `large` (min-heap)-এ ঠেলে দিন — এতে order ঠিক থাকে। size balance রাখুন: `small` সমান বা এক বেশি।

```js
class MedianFinder {
  constructor() {
    this.small = new MinHeap((a, b) => b - a); // max-heap: ছোট অর্ধেক
    this.large = new MinHeap(); // min-heap: বড় অর্ধেক
  }
  addNum(num) {
    this.small.push(num);
    this.large.push(this.small.pop()); // order ঠিক রাখা
    if (this.large.size > this.small.size) this.small.push(this.large.pop()); // balance
  }
  findMedian() {
    if (this.small.size > this.large.size) return this.small.top();
    return (this.small.top() + this.large.top()) / 2;
  }
}
```

**Complexity:** addNum O(log n), findMedian O(1)

**প্রবলেম লিস্ট:**

- _(demo-ই মূল প্রবলেম। আরও চাইলে: Sliding Window Median — LC 480, একই আইডিয়া + removal।)_

### 6.4 Heap-Based Design / Greedy Scheduling

**চিনবেন কীভাবে:** "task scheduler", "reorganize so no two adjacent same", "leaderboard" — সবচেয়ে frequent/বড়টা আগে খরচ করুন (greedy + heap)

**Demo: Task Scheduler** — [LC 621](https://leetcode.com/problems/task-scheduler/) _(Medium)_

**Approach:** সবচেয়ে frequent task-টা frame ঠিক করে দেয়: `(max-1)` টা gap, প্রতিটা `n+1` চওড়া, শেষে max-freq-ওয়ালা task ক'টা আছে ততটা slot। বাকি task গুলো gap-এ ঢুকে যায় — তাই উত্তর হয় এই formula, নাহলে total task সংখ্যা।

```js
function leastInterval(tasks, n) {
  const freq = new Array(26).fill(0);
  for (const t of tasks) freq[t.charCodeAt(0) - 65]++;
  const max = Math.max(...freq);
  const maxCount = freq.filter((f) => f === max).length;
  return Math.max(tasks.length, (max - 1) * (n + 1) + maxCount);
}
```

**Complexity:** Time O(n), Space O(1)

**প্রবলেম লিস্ট:**

- [ ] **Reorganize String** — [LC 767](https://leetcode.com/problems/reorganize-string/) — ⚪ Bonus _(max-heap থেকে দুটো করে নিন)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Minimum Number of Refueling Stops** — [LC 871](https://leetcode.com/problems/minimum-number-of-refueling-stops/) — 🔥 Must-do _(Hard — Uber High; পার হওয়া স্টেশনের fuel max-heap-এ, আটকালে সবচেয়ে বড়টা নিন)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

---

## 7. Backtracking

সব valid possibility generate/search: **choose → explore → undo**। Decision tree ভাবুন, invalid path-এ ঢোকার আগেই prune করুন। Constraint-এ N ≤ 20 দেখলেই এদিকে মন দিন।

### 7.1 Subsets / Permutations / Combinations

**চিনবেন কীভাবে:** "all subsets/permutations/combinations", "generate all", "সব উপায়" — output সংখ্যাই exponential, তাই backtracking ছাড়া উপায় নেই

**Demo: Subsets** — [LC 78](https://leetcode.com/problems/subsets/) _(Medium — backtracking-এর টেমপ্লেট প্রবলেম)_

**Approach:** প্রতিটা লেভেলে `start` থেকে সামনের এলিমেন্টগুলো একে একে নিন — path-এর প্রতিটা অবস্থাই একেকটা subset। নেওয়ার পর recurse, ফিরে এসে pop (undo) — এই push/pop জোড়াটাই backtracking।

```js
function subsets(nums) {
  const res = [];
  const backtrack = (start, path) => {
    res.push([...path]); // প্রতিটা অবস্থাই উত্তর
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]); // choose
      backtrack(i + 1, path); // explore
      path.pop(); // undo
    }
  };
  backtrack(0, []);
  return res;
}
```

**Complexity:** Time O(n · 2ⁿ), Space O(n) path

**প্রবলেম লিস্ট:**

- [ ] **Permutations** — [LC 46](https://leetcode.com/problems/permutations/) — 🔥 Must-do _(used[] array বা swap technique)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Combinations** — [LC 77](https://leetcode.com/problems/combinations/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 7.2 N-Queens ও Board Puzzles

**চিনবেন কীভাবে:** board-এ placement, "no two attack each other", sudoku — constraint check দ্রুত করার জন্য Set/array দিয়ে occupied track করুন

**Demo: N-Queens** — [LC 51](https://leetcode.com/problems/n-queens/) _(Hard)_

**Approach:** row ধরে ধরে queen বসান। কোন column আর কোন দুই diagonal দখলে আছে তা তিনটা Set-এ রাখুন — diagonal চেনার কৌশল: `row - col` আর `row + col` constant।

```js
function solveNQueens(n) {
  const res = [];
  const board = Array.from({ length: n }, () => new Array(n).fill("."));
  const cols = new Set(),
    diag1 = new Set(),
    diag2 = new Set();
  const place = (row) => {
    if (row === n) {
      res.push(board.map((r) => r.join("")));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col))
        continue;
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);
      board[row][col] = "Q";
      place(row + 1);
      board[row][col] = "."; // undo
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  };
  place(0);
  return res;
}
```

**Complexity:** Time O(n!), Space O(n²)

**প্রবলেম লিস্ট:**

- [ ] **Sudoku Solver** — [LC 37](https://leetcode.com/problems/sudoku-solver/) — ⚪ Bonus _(Hard — খালি ঘরে 1–9 চেষ্টা, invalid হলে undo)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 7.3 Word Search (Grid Backtracking)

**চিনবেন কীভাবে:** grid-এ path ধরে শব্দ/প্যাটার্ন খোঁজা, একই cell দুবার ব্যবহার নিষেধ — DFS + visited mark/unmark

**Demo: Word Search** — [LC 79](https://leetcode.com/problems/word-search/) _(Medium)_

**Approach:** প্রতিটা cell থেকে DFS — char মিললে cell-টা সাময়িক '#' দিয়ে mark করুন (visited), চার দিকে explore, ফেরার পথে আসল char ফিরিয়ে দিন (undo)।

```js
function exist(board, word) {
  const m = board.length,
    n = board[0].length;
  const dfs = (i, j, k) => {
    if (k === word.length) return true;
    if (i < 0 || i >= m || j < 0 || j >= n || board[i][j] !== word[k])
      return false;
    board[i][j] = "#"; // visited mark
    const found =
      dfs(i + 1, j, k + 1) ||
      dfs(i - 1, j, k + 1) ||
      dfs(i, j + 1, k + 1) ||
      dfs(i, j - 1, k + 1);
    board[i][j] = word[k]; // undo
    return found;
  };
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++) if (dfs(i, j, 0)) return true;
  return false;
}
```

**Complexity:** Time O(m·n·4^L) (L = শব্দের দৈর্ঘ্য), Space O(L)

**প্রবলেম লিস্ট:**

- _Word Search II (অনেকগুলো শব্দ একসাথে) → primary এন্ট্রি **10.2** (Trie) — Trie + এই DFS-এর কম্বো_

---

## 8. Graphs

সম্পর্ক আর সংযোগের টপিক — Google-এ 75%, Uber-এ 65%। প্রথম প্রশ্ন: **graph-টা কীভাবে দেওয়া?** (grid / adjacency list / edge list / implicit)। দ্বিতীয়: **weighted কি না?** (unweighted shortest = BFS, weighted = Dijkstra)।

### 8.1 BFS / DFS Traversal (Grid ও Components)

**চিনবেন কীভাবে:** "number of islands/components", "flood fill", "shortest steps in grid/maze", "is there a path", "clone" — BFS = level/shortest, DFS = explore/components

**Demo: Number of Islands** — [LC 200](https://leetcode.com/problems/number-of-islands/) _(Medium — সব কোম্পানির টপ লিস্টে)_

**Approach:** grid scan করুন; '1' পেলে counter বাড়িয়ে সেখান থেকে DFS চালিয়ে পুরো island '0' করে "ডুবিয়ে" দিন — একই island দ্বিতীয়বার গোনা হবে না।

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

**Complexity:** Time O(m·n), Space O(m·n) worst-case recursion

**প্রবলেম লিস্ট:**

- [ ] **Rotting Oranges** — [LC 994](https://leetcode.com/problems/rotting-oranges/) — 🔥 Must-do _(multi-source BFS — সব পচা কমলা একসাথে queue-তে)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Clone Graph** — [LC 133](https://leetcode.com/problems/clone-graph/) — 🔥 Must-do _(old→new node-এর hashmap)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Flood Fill** — [LC 733](https://leetcode.com/problems/flood-fill/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Word Ladder** — [LC 127](https://leetcode.com/problems/word-ladder/) — 🔥 Must-do _(Hard — implicit graph: শব্দ = নোড, ১ অক্ষর বদল = edge; BFS)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Word Ladder II** — [LC 126](https://leetcode.com/problems/word-ladder-ii/) — 🔥 Must-do _(Hard — Google High; BFS + parent track করে path reconstruct)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Bus Routes** — [LC 815](https://leetcode.com/problems/bus-routes/) — 🔥 Must-do _(Hard — Uber High; route-কে নোড বানিয়ে BFS)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 8.2 Cycle Detection (Directed)

**চিনবেন কীভাবে:** "circular dependency", "deadlock", "can finish all" — directed graph-এ তিন রঙের DFS: unvisited / **এই path-এ আছি** / done

**Demo: Course Schedule** — [LC 207](https://leetcode.com/problems/course-schedule/) _(Medium)_

**Approach:** DFS-এ প্রতিটা নোডের state রাখুন — 1 মানে বর্তমান recursion path-এ আছে; DFS চলাকালীন state-1 নোডে আবার পৌঁছালে cycle। state-2 (সম্পূর্ণ শেষ) নোড আবার দেখলে নিরাপদে skip।

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

**Complexity:** Time O(V + E), Space O(V + E)

**প্রবলেম লিস্ট:**

- _(undirected graph-এ cycle → Union Find, দেখুন **8.4**; directed-এ Kahn's algorithm দিয়েও হয়, দেখুন **8.3**)_

### 8.3 Topological Sort

**চিনবেন কীভাবে:** "prerequisite", "dependency order", "valid task sequence", DAG — indegree-0 থেকে শুরু করে层 ধরে বের করা (Kahn's)

**Demo: Course Schedule II** — [LC 210](https://leetcode.com/problems/course-schedule-ii/) _(Medium)_

**Approach:** প্রতিটা নোডের indegree গুনুন; 0-ওয়ালারা queue-তে। pop করে order-এ যোগ করুন আর neighbor-দের indegree কমান — 0 হলেই queue-তে। শেষে order-এ সব নোড না থাকলে cycle ছিল।

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

**Complexity:** Time O(V + E), Space O(V + E)

**প্রবলেম লিস্ট:**

- [ ] **Alien Dictionary** — [LC 269](https://leetcode.com/problems/alien-dictionary/) — ⚪ Bonus _(Premium — ফ্রি: GfG "Alien Dictionary"; পাশাপাশি শব্দ থেকে edge বানিয়ে topo sort)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 8.4 Union Find (Disjoint Set)

**চিনবেন কীভাবে:** "are X and Y connected", "merge groups", "how many components", edge একটা একটা করে আসছে — near-O(1) union/find, path compression

**Demo: Redundant Connection** — [LC 684](https://leetcode.com/problems/redundant-connection/) _(Medium)_

**Approach:** প্রতিটা edge-এ দুই প্রান্তের root খুঁজুন — root এক হলে তারা আগেই connected, মানে এই edge-টা cycle বানাচ্ছে। নাহলে union করুন। `find`-এ path compression দিলেই কার্যত O(1)।

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

**Complexity:** Time O(n α(n)) ≈ O(n), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Number of Provinces** — [LC 547](https://leetcode.com/problems/number-of-provinces/) — ⚪ Bonus _(connected components গোনা — DFS দিয়েও করুন, তুলনা করুন)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 8.5 Bipartite Check / Graph Coloring

**চিনবেন কীভাবে:** "divide into two groups", "no edge within same group", "possible bipartition" — BFS/DFS করে ২ রঙ; প্রতিবেশী একই রঙ হলে fail

**Demo: Is Graph Bipartite?** — [LC 785](https://leetcode.com/problems/is-graph-bipartite/) _(Medium)_

**Approach:** রঙহীন নোড থেকে BFS শুরু করে alternate রঙ (1/-1) দিন। কোনো edge-এর দুই প্রান্ত একই রঙ পেলে bipartite না। Disconnected graph-এর জন্য সব component ঘুরুন।

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

**Complexity:** Time O(V + E), Space O(V)

**প্রবলেম লিস্ট:**

- [ ] **Possible Bipartition** — [LC 886](https://leetcode.com/problems/possible-bipartition/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Flower Planting With No Adjacent** — [LC 1042](https://leetcode.com/problems/flower-planting-with-no-adjacent/) — ⚪ Bonus _(k-coloring, degree ≤ 3 বলে greedy-ই যথেষ্ট)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 8.6 Dijkstra (Weighted Shortest Path)

**চিনবেন কীভাবে:** weighted graph + "shortest/minimum cost path" — plain BFS **চলবে না**; adjacency list + min-heap

**Demo: Network Delay Time** — [LC 743](https://leetcode.com/problems/network-delay-time/) _(Medium)_

**Approach:** source থেকে দূরত্ব-সহ min-heap। সবচেয়ে কাছের নোড pop করে তার edge গুলো relax করুন — উন্নতি হলে heap-এ নতুন এন্ট্রি। পুরনো (stale) এন্ট্রি pop হলে `d > dist[u]` চেক দিয়ে skip। (MinHeap ক্লাস → সেকশন 6।)

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

**Complexity:** Time O(E log V), Space O(V + E)

**প্রবলেম লিস্ট:**

- [ ] **Cheapest Flights Within K Stops** — [LC 787](https://leetcode.com/problems/cheapest-flights-within-k-stops/) — ⚪ Bonus _(stop-limit থাকায় plain Dijkstra না — Bellman-Ford ধাঁচ)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 8.7 Minimum Spanning Tree (MST)

**চিনবেন কীভাবে:** "connect all cities/points with minimum cost" — সব নোড যুক্ত, মোট খরচ কম; Prim (dense-এ সহজ) বা Kruskal (sort + union find)

**Demo: Min Cost to Connect All Points** — [LC 1584](https://leetcode.com/problems/min-cost-to-connect-all-points/) _(Medium)_

**Approach:** Prim's — MST-র বাইরে থাকা প্রতিটা নোডের "MST-তে ঢোকার সবচেয়ে সস্তা খরচ" রাখুন; প্রতি ধাপে সবচেয়ে সস্তাটা ঢুকিয়ে বাকিদের খরচ আপডেট করুন। Dense graph (সব জোড়ায় edge) বলে O(n²) স্ক্যানই ভালো।

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

**Complexity:** Time O(n²), Space O(n)

**প্রবলেম লিস্ট:**

- _(demo-ই মূল প্রবলেম — Kruskal (edge sort + union find) দিয়েও একবার লিখুন, 8.4-এর সাথে জুড়ে যাবে।)_

---

## 9. Dynamic Programming

Google-এ 80% — সবচেয়ে ভারী টপিক। প্রতিটা DP-তে চারটা জিনিস লিখে ফেলুন: **state** (dp[i] মানে কী), **transition** (recurrence), **base case**, **order** (memo না tabulation)। "count ways", "min/max over choices" শুনলেই DP সন্দেহ করুন।

_(নোট: Kadane's → 1.6, Prefix-sum DP → 1.3 — primary সেখানেই।)_

### 9.1 Fibonacci Style / Climbing Stairs

**চিনবেন কীভাবে:** dp[i] শুধু আগের ১–২টা মানের ওপর নির্ভর করে — "কত উপায়ে i-তে পৌঁছানো যায়"

**Demo: Climbing Stairs** — [LC 70](https://leetcode.com/problems/climbing-stairs/) _(Easy কিন্তু সব 1D DP-র কঙ্কাল)_

**Approach:** i-তম ধাপে আসা যায় i-1 (এক লাফ) বা i-2 (দুই লাফ) থেকে — তাই `dp[i] = dp[i-1] + dp[i-2]`। শুধু শেষ দুটো মান লাগে বলে O(1) space।

```js
function climbStairs(n) {
  let prev = 1,
    cur = 1; // dp[0], dp[1]
  for (let i = 2; i <= n; i++) [prev, cur] = [cur, prev + cur];
  return cur;
}
```

**Complexity:** Time O(n), Space O(1)

**প্রবলেম লিস্ট:**

- [ ] **Frog Jump** — [LC 403](https://leetcode.com/problems/frog-jump/) — ⚪ Bonus _(Hard — state = (position, last jump); Map-of-Sets memo)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 9.2 0/1 Knapsack / Subset Sum

**চিনবেন কীভাবে:** "pick or skip each item once", capacity/target-এর মধ্যে max value বা exact sum — dp[sum] উল্টো দিকে লুপ করলে item একবারই ব্যবহৃত হয়

**Demo: Partition Equal Subset Sum** — [LC 416](https://leetcode.com/problems/partition-equal-subset-sum/) _(Medium — Subset Sum-এর LC রূপ)_

**Approach:** মোট যোগফল বিজোড় হলে অসম্ভব; নাহলে target = মোটের অর্ধেক sum বানানো যায় কি না — classic subset sum। প্রতিটা সংখ্যার জন্য dp **target থেকে নিচে** নেমে আপডেট করুন — নাহলে একই item একাধিকবার ব্যবহৃত হয়ে যাবে (সেটা unbounded)।

```js
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const num of nums)
    for (
      let s = target;
      s >= num;
      s-- // উল্টো দিক = 0/1
    )
      dp[s] = dp[s] || dp[s - num];
  return dp[target];
}
```

**Complexity:** Time O(n · target), Space O(target)

**প্রবলেম লিস্ট:**

- _(demo-ই 0/1 knapsack-এর টেমপ্লেট — value-সহ generic 0/1 Knapsack একবার GfG-তে লিখে দেখুন।)_

### 9.3 Unbounded Knapsack / Coin Change

**চিনবেন কীভাবে:** item **যতবার খুশি** reuse — coin change, rod cutting; dp **সোজা দিকে** লুপ

**Demo: Coin Change** — [LC 322](https://leetcode.com/problems/coin-change/) _(Medium — Amazon/Google টপ পছন্দ)_

**Approach:** `dp[a]` = amount a বানাতে ন্যূনতম কয়েন। প্রতিটা কয়েনের জন্য a সোজা দিকে বাড়িয়ে আপডেট — সোজা দিক মানেই reuse allowed (9.2-এর উল্টো দিকের সাথে তুলনা করুন)।

```js
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins)
    for (
      let a = coin;
      a <= amount;
      a++ // সোজা দিক = unbounded
    )
      dp[a] = Math.min(dp[a], dp[a - coin] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

**Complexity:** Time O(n · amount), Space O(amount)

**প্রবলেম লিস্ট:**

- [ ] **Rod Cutting** — [GfG](https://www.geeksforgeeks.org/cutting-a-rod-dp-13/) — ⚪ Bonus _(unbounded knapsack-এর profit রূপ)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 9.4 Longest Common Subsequence (LCS)

**চিনবেন কীভাবে:** দুই string/sequence-এর মিল — "common subsequence", "delete to make equal"; 2D dp[i][j] = প্রথম i আর প্রথম j অক্ষরের উত্তর

**Demo: Longest Common Subsequence** — [LC 1143](https://leetcode.com/problems/longest-common-subsequence/) _(Medium)_

**Approach:** শেষ অক্ষর মিললে দুটোই খেয়ে diagonal + 1; না মিললে যেকোনো একটার শেষ অক্ষর বাদ দিয়ে বড়টা।

```js
function longestCommonSubsequence(s1, s2) {
  const m = s1.length,
    n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        s1[i - 1] === s2[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}
```

**Complexity:** Time O(m·n), Space O(m·n) (দুই row রেখে O(n) হয়)

**প্রবলেম লিস্ট:**

- [ ] **Longest Palindromic Subsequence** — [LC 516](https://leetcode.com/problems/longest-palindromic-subsequence/) — 🔥 Must-do _(trick: LCS(s, reverse(s)))_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 9.5 Longest Increasing Subsequence (LIS)

**চিনবেন কীভাবে:** "longest increasing/chain", envelope/box nesting — O(n²) DP সবাই পারে, senior-দের কাছে O(n log n) আশা করা হয়

**Demo: Longest Increasing Subsequence** — [LC 300](https://leetcode.com/problems/longest-increasing-subsequence/) _(Medium)_

**Approach (O(n log n), patience sorting):** `tails[i]` = দৈর্ঘ্য i+1-এর increasing subsequence-এর **সবচেয়ে ছোট সম্ভাব্য শেষ মান** — এটা sorted থাকে। প্রতিটা সংখ্যার জন্য binary search করে প্রথম `>= x` জায়গা replace করুন (না পেলে append)।

```js
function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0,
      hi = tails.length;
    while (lo < hi) {
      // প্রথম tails[i] >= x খুঁজুন
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x; // replace বা append
  }
  return tails.length;
}
```

**Complexity:** Time O(n log n), Space O(n)

**প্রবলেম লিস্ট:**

- _(demo-ই মূল — O(n²) DP ভার্সনটাও লিখুন, path reconstruct করা লাগলে ওটাই লাগে।)_

### 9.6 Edit Distance

**চিনবেন কীভাবে:** "transform one string to another", insert/delete/replace-এর min সংখ্যা — 2D DP, তিন অপারেশনের min

**Demo: Edit Distance** — [LC 72](https://leetcode.com/problems/edit-distance/) _(Medium/Hard — Google/Microsoft High)_

**Approach:** `dp[i][j]` = word1-এর প্রথম i → word2-এর প্রথম j বানানোর খরচ। অক্ষর মিললে খরচ নেই (diagonal); নাহলে replace/delete/insert-এর min + 1। Base: খালি string → j inserts বা i deletes।

```js
function minDistance(w1, w2) {
  const m = w1.length,
    n = w2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        w1[i - 1] === w2[j - 1]
          ? dp[i - 1][j - 1]
          : 1 +
            Math.min(
              dp[i - 1][j - 1], // replace
              dp[i - 1][j], // delete
              dp[i][j - 1],
            ); // insert
  return dp[m][n];
}
```

**Complexity:** Time O(m·n), Space O(m·n)

**প্রবলেম লিস্ট:**

- [ ] **Regular Expression Matching** — [LC 10](https://leetcode.com/problems/regular-expression-matching/) — 🔥 Must-do _(Hard — Google High; `_`-এর দুই choice: zero বা more)\*
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 9.7 House Robber (Non-Adjacent Choice)

**চিনবেন কীভাবে:** "can't pick two adjacent", প্রতিটা এলিমেন্টে নেব/নেব-না কিন্তু প্রতিবেশী বাধা — দুই state: নিয়েছি / নিইনি

**Demo: House Robber** — [LC 198](https://leetcode.com/problems/house-robber/) _(Medium)_

**Approach:** দুটো চলমান মান — `robbed` (এই বাড়ি নিলাম: আগের skipped + এখনকার টাকা) আর `skipped` (নিলাম না: আগের দুটোর max)।

```js
function rob(nums) {
  let robbed = 0,
    skipped = 0;
  for (const x of nums)
    [robbed, skipped] = [skipped + x, Math.max(robbed, skipped)];
  return Math.max(robbed, skipped);
}
```

**Complexity:** Time O(n), Space O(1)

**প্রবলেম লিস্ট:**

- [ ] **House Robber III** — [LC 337](https://leetcode.com/problems/house-robber-iii/) — ⚪ Bonus _(Tree DP — প্রতিটা নোড [নিলে, না নিলে] জোড়া ফেরত দেয়)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 9.8 Grid Paths

**চিনবেন কীভাবে:** grid-এ উপরে-বাম থেকে নিচ-ডানে "কত path" বা "min cost path" — dp[i][j] = উপর + বাম

**Demo: Unique Paths** — [LC 62](https://leetcode.com/problems/unique-paths/) _(Medium)_

**Approach:** প্রতিটা ঘরে আসা যায় উপর বা বাম থেকে — `dp[i][j] = dp[i-1][j] + dp[i][j-1]`। এক row-ই যথেষ্ট: in-place রোল করুন।

```js
function uniquePaths(m, n) {
  const dp = new Array(n).fill(1); // প্রথম row
  for (let i = 1; i < m; i++) for (let j = 1; j < n; j++) dp[j] += dp[j - 1]; // উপর (পুরনো dp[j]) + বাম
  return dp[n - 1];
}
```

**Complexity:** Time O(m·n), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Minimum Path Sum** — [LC 64](https://leetcode.com/problems/minimum-path-sum/) — ⚪ Bonus
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Knight Probability in Chessboard** — [LC 688](https://leetcode.com/problems/knight-probability-in-chessboard/) — ⚪ Bonus _(probability DP — state: (ধাপ, ঘর), সম্ভাবনা যোগ হয়)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 9.9 Interval DP

**চিনবেন কীভাবে:** "burst balloons", "matrix chain", subarray/interval-এর ভেতরে **শেষ operation কোনটা** ভেবে ভাঙা — dp[l][r], ছোট interval থেকে বড়

**Demo: Burst Balloons** — [LC 312](https://leetcode.com/problems/burst-balloons/) _(Hard)_

**Approach:** উল্টো করে ভাবুন — (l, r) খোলা interval-এ **সবার শেষে** কোন বেলুন k ফাটবে? তখন তার প্রতিবেশী হবে l আর r নিজেই। `dp[l][r] = max(dp[l][k] + a[l]·a[k]·a[r] + dp[k][r])`। দুই পাশে 1 padding দিন।

```js
function maxCoins(nums) {
  const a = [1, ...nums, 1];
  const n = a.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len < n; len++) {
    for (let l = 0; l + len < n; l++) {
      const r = l + len;
      for (let k = l + 1; k < r; k++) {
        // k = শেষে ফাটানো বেলুন
        dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
      }
    }
  }
  return dp[0][n - 1];
}
```

**Complexity:** Time O(n³), Space O(n²)

**প্রবলেম লিস্ট:**

- [ ] **Matrix Chain Multiplication** — [GfG](https://www.geeksforgeeks.org/matrix-chain-multiplication-dp-8/) — ⚪ Bonus _(interval DP-র জনক প্রবলেম)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 9.10 State Machine DP

**চিনবেন কীভাবে:** সীমিত কয়েকটা state-এর মধ্যে transition — stock buy/sell (hold/sold/rest), cooldown/fee — state diagram আঁকলেই recurrence বেরিয়ে আসে

**Demo: Best Time to Buy and Sell Stock with Cooldown** — [LC 309](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/) _(Medium)_

**Approach:** তিন state: `hold` (শেয়ার হাতে), `sold` (আজ বিক্রি করলাম), `rest` (হাত খালি, cooldown পার)। প্রতিদিন তিনটাই আপডেট — কেনা যায় শুধু rest থেকে।

```js
function maxProfit(prices) {
  let hold = -Infinity,
    sold = 0,
    rest = 0;
  for (const p of prices) {
    const prevSold = sold;
    sold = hold + p; // আজ বিক্রি
    hold = Math.max(hold, rest - p); // ধরে রাখা / আজ কেনা
    rest = Math.max(rest, prevSold); // অপেক্ষা (cooldown শেষ)
  }
  return Math.max(sold, rest);
}
```

**Complexity:** Time O(n), Space O(1)

**প্রবলেম লিস্ট:**

- _(demo-ই টেমপ্লেট — stock সিরিজের বাকিগুলো (fee, at-most-k transaction) একই state machine-এর ভ্যারিয়েন্ট।)_

### 9.11 Bitmask / Digit DP

**চিনবেন কীভাবে:** **Bitmask:** N ≤ 20, "কোন কোন এলিমেন্ট ব্যবহৃত" state-এ লাগবে — subset-কে integer বানান। **Digit DP:** "X পর্যন্ত কতগুলো সংখ্যার digit property Y" — digit ধরে ধরে গোনা

**Demo: Partition to K Equal Sum Subsets** — [LC 698](https://leetcode.com/problems/partition-to-k-equal-sum-subsets/) _(Medium — bitmask memo)_

**Approach:** mask = কোন এলিমেন্টগুলো ইতিমধ্যে ব্যবহৃত। বর্তমান bucket ভরাট হলে (curSum % target === 0) নতুন bucket শুরু। প্রতিটা mask-এর ফল memo করুন — এতেই exponential → O(2ⁿ · n)।

```js
function canPartitionKSubsets(nums, k) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % k) return false;
  const target = total / k;
  nums.sort((a, b) => b - a);
  if (nums[0] > target) return false;
  const n = nums.length;
  const memo = new Map();
  const dfs = (mask, curSum) => {
    if (mask === (1 << n) - 1) return true; // সব ব্যবহৃত
    if (memo.has(mask)) return memo.get(mask);
    let ok = false;
    for (let i = 0; i < n && !ok; i++) {
      if (mask & (1 << i)) continue;
      if (curSum + nums[i] <= target)
        ok = dfs(mask | (1 << i), (curSum + nums[i]) % target);
    }
    memo.set(mask, ok);
    return ok;
  };
  return dfs(0, 0);
}
```

**Complexity:** Time O(2ⁿ · n), Space O(2ⁿ)

**প্রবলেম লিস্ট:**

- [ ] **Numbers At Most N Given Digit Set** — [LC 902](https://leetcode.com/problems/numbers-at-most-n-given-digit-set/) — ⚪ Bonus _(digit DP-র entry point)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

---

## 10. Greedy, Trie & Design

সোর্স ফাইলগুলোতে ছিল কিন্তু আগের ৯ টপিকে পড়ে না — এমন তিনটা প্যাটার্ন। Interview-তে design প্রবলেম (LRU/LFU) খুবই ঘন ঘন আসে।

### 10.1 Greedy

**চিনবেন কীভাবে:** "minimize/maximize" যেখানে **local best = global best** প্রমাণ করা যায় — activity selection, scheduling, "pick largest that fits"। সন্দেহ হলে DP-র সাথে তুলনা করুন: greedy ভুল হলে counterexample থাকবেই (যেমন coin change-এ greedy ব্যর্থ → 9.3)

**Demo: Candy** — [LC 135](https://leetcode.com/problems/candy/) _(Hard)_

**Approach:** দুই পাস — বাম→ডান: rating বাড়লে আগেরটার চেয়ে ১ বেশি; ডান→বাম: rating বাড়লে (ডান দিক থেকে) max নিয়ে ঠিক করুন। দুই দিকের constraint-ই এতে satisfy হয়।

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

**Complexity:** Time O(n), Space O(n)

**প্রবলেম লিস্ট:**

- [ ] **Activity Selection** — [GfG](https://www.geeksforgeeks.org/activity-selection-problem-greedy-algo-1/) — ⚪ Bonus _(end time দিয়ে sort — greedy-র জনক প্রবলেম)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- \*Non-overlapping Intervals (greedy রূপ) → primary **1.5**; Task Scheduler ও Refueling Stops (greedy + heap) → primary **6.4\***

### 10.2 Trie (Prefix Tree)

**চিনবেন কীভাবে:** "common prefix", "word dictionary", "autocomplete/suggestions", অনেক শব্দ নিয়ে বারবার prefix query — char ধরে ধরে নামার tree

**Demo: Implement Trie** — [LC 208](https://leetcode.com/problems/implement-trie-prefix-tree/) _(Medium)_

**Approach:** প্রতিটা নোড = plain object, key = পরের char। শব্দ শেষে `isEnd` ফ্ল্যাগ। search আর startsWith-এর পার্থক্য শুধু শেষে isEnd চেক।

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

**Complexity:** সব operation O(L) (L = শব্দের দৈর্ঘ্য)

**প্রবলেম লিস্ট:**

- [ ] **Word Search II** — [LC 212](https://leetcode.com/problems/word-search-ii/) — 🔥 Must-do _(Hard — Google High; সব শব্দ Trie-তে ঢুকিয়ে grid-এ একবারই DFS (7.3-এর কম্বো))_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Search Suggestions System** — [LC 1268](https://leetcode.com/problems/search-suggestions-system/) — ⚪ Bonus _(autocomplete — Trie বা sort + binary search)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:

### 10.3 Design (Cache ও Data Structure Composition)

**চিনবেন কীভাবে:** "design/implement X with O(1) operations" — সঠিক structure-এর **কম্বিনেশন** বাছাই: HashMap + Doubly Linked List, Map + heap ইত্যাদি

**Demo: LRU Cache** — [LC 146](https://leetcode.com/problems/lru-cache/) _(Medium — design-এর ক্যানোনিকাল টেমপ্লেট, LFU এর ওপরেই দাঁড়ায়)_

**Approach:** ধারণাগতভাবে HashMap + Doubly Linked List — O(1) lookup + O(1) reorder। JS-এ `Map` insertion order মনে রাখে বলে দুটোই একসাথে পাওয়া যায়: get-এ delete+set করে "সামনে" আনুন, capacity পেরোলে প্রথম key ফেলুন। (Interview-তে DLL ভার্সনটাও ব্যাখ্যা করতে পারা চাই।)

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

**Complexity:** get/put O(1)

**প্রবলেম লিস্ট:**

- [ ] **LFU Cache** — [LC 460](https://leetcode.com/problems/lfu-cache/) — 🔥 Must-do _(Hard — Amazon/Meta/Uber High; freq → DLL bucket-এর map + minFreq pointer)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- [ ] **Text Justification** — [LC 68](https://leetcode.com/problems/text-justification/) — 🔥 Must-do _(Hard — Apple High; algorithm নয়, খুঁতখুঁতে simulation — edge case-এর খনি)_
      → আমার সমাধান:
      → যে সমস্যা হয়েছিল:
- \*Min Stack, Queue using Stacks → **4.3**; Serialize/Deserialize Binary Tree → **5.1**; Median from Data Stream → **6.3**; Task Scheduler → **6.4\***

---

## পরিশিষ্ট: সোর্স ফাইলে উল্লেখিত অতিরিক্ত টপিক

এগুলো প্যাটার্ন-চেকলিস্টে রাখিনি (interview-তে তুলনামূলক কম আসে), কিন্তু সোর্সে (ফাইল 12) নাম ছিল — দরকার পড়লে দেখে নেবেন:

- **Math:** GCD/LCM, Sieve of Eratosthenes, Modulo arithmetic
- **Bit Manipulation:** XOR trick (single number), `n & (n-1)` (bit গোনা), shift operations
- **Advanced Strings:** KMP (entry: LC 28 → 1.4), Z-Algorithm, Manacher's, Rabin-Karp
- **Advanced Structures:** Segment Tree, Fenwick Tree/BIT (অনেক update+query হলে), AVL, Suffix Array

---

## ইন্টারভিউ রুটিন (সোর্স ফাইল থেকে)

1. প্রতি প্যাটার্নে ২–৩টা প্রবলেম করুন — এলোমেলো প্রবলেম নয়, **প্যাটার্ন ধরে**
2. টেমপ্লেট **স্মৃতি থেকে** লিখুন (demo না দেখে)
3. Edge case dry run করুন (খালি input, এক এলিমেন্ট, duplicate, negative)
4. Variant speedrun করুন
5. ভুলগুলো রিভিউ করুন — এই ফাইলের "যে সমস্যা হয়েছিল" ঘরগুলোই আপনার সবচেয়ে দামি রিভিশন নোট

**Golden rules:** আগে brute force বুঝুন → চিন্তা explain করুন → clarity-র পরে optimize → ছোট উদাহরণে টেস্ট → কোড পরিষ্কার রাখুন।
