# Implementation Plan — Topic 2: Binary Search (Pattern Simulations)

## এই ডকুমেন্ট কীভাবে পড়বেন

1. `d:\document-files\dsa_prep\AGENTS.md`
2. `d:\document-files\dsa_prep\implementation-plan\1-arrays-strings.md` — **আগে এটা পড়ুন।** সেখানে সম্পূর্ণ Scene কনট্র্যাক্ট (`types.ts`), `usePatternSim` হুক, কম্পোনেন্ট গঠন (`SceneView`, `ArrayScene`, `CodePane` ইত্যাদি), theme role class — সবকিছুর ডিজাইন আছে। এই টপিকে সেই ভিত্তি **ইতিমধ্যে implement হয়ে গেছে** ধরে নিয়ে এগোন — এখানে শুধু নতুন ডেটা ফাইল, কোনো নতুন কম্পোনেন্ট/টাইপ নয়।
3. `d:\document-files\dsa_prep\context\ui-registry.md`, `context\ui-tokens.md` — Theme Contract
4. `d:\document-files\dsa_prep\context\dsa-workbook\2. Binary Search\*.md` — raw ডেটা

**নতুন কিছু লাগবে না** — সব ৪টা প্যাটার্নই `array` scene (topic 1-এ সংজ্ঞায়িত) পুনর্ব্যবহার করে।

## সাধারণ নিয়ম

প্রতিটা প্যাটার্নেই `lo`, `hi`, `mid` — তিনটে pointer। প্রতি স্টেপ = এক iteration-এ `mid` হিসাব করে কোন দিকে সরানো হলো। `pointers` ফিল্ডে `lo`, `hi`, `mid` তিনটাই দেখান (mid প্রতি স্টেপে বদলায়, lo/hi মাঝে মাঝে)।

---

## 2.1 Basic Binary Search ও Counting Occurrences

**Demo:** Find First and Last Position of Element — [LC 34](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) — কোড:

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

লাইন: ১=function, ২=bound declare, ৩-৫=lo/hi/ans init, ৬=while, ৭=mid হিসাব, ৮=if match, ৯=ans=mid, ১০-১১=if isFirst → hi=mid-1 (comment), ১২=else lo=mid+1 (comment), ১৩=else if too small, ১৪=else too big, ১৭=return [bound(true), bound(false)]।

**Scene:** `array`, `values`=`nums`, `pointers`=[lo, hi, mid]। `marks`: `mid` `active`, match পেলে `done`। `vars`: `ans`, কোন pass (`first`/`last`) চলছে।

**Demo input:** `nums = [5, 7, 7, 8, 8, 10]`, `target = 8` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস — দুই pass, মোট ৬টা স্টেপ (script দিয়ে যাচাই করা):**

**Pass ১ (`isFirst=true`):**

| # | lo | hi | mid | nums[mid] | ঘটনা |
|---|---|---|---|---|---|
| 1 | 0 | 5 | 2 | 7 | too small → lo=3 |
| 2 | 3 | 5 | 4 | 8 | match! ans=4, বামে চাপুন → hi=3 |
| 3 | 3 | 2 | 3 | 8 | match! ans=3, বামে চাপুন → hi=2 (lo>hi, থামল) |

**Pass ১ ফলাফল: `first = 3`।**

**Pass ২ (`isFirst=false`):**

| # | lo | hi | mid | nums[mid] | ঘটনা |
|---|---|---|---|---|---|
| 4 | 0 | 5 | 2 | 7 | too small → lo=3 |
| 5 | 3 | 5 | 4 | 8 | match! ans=4, ডানে চাপুন → lo=5 |
| 6 | 5 | 4 | 5 | 10 | too big → hi=4 (lo>hi, থামল) |

**Pass ২ ফলাফল: `last = 4`।**

**চূড়ান্ত উত্তর: `[3, 4]`।** (দুটো pass আলাদা sub-timeline হিসেবে দেখাতে পারেন — ৩টা করে স্টেপ, মাঝে একটা "এখন last occurrence খুঁজব" ইন্ট্রো স্টেপ যোগ করলে ভালো হয়।)

---

## 2.2 Binary Search on Answer

**Demo:** Koko Eating Bananas — [LC 875](https://leetcode.com/problems/koko-eating-bananas/) — কোড:

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

লাইন: ১=function, ২=canFinish declare, ৩-৪=lo/hi init, ৫=while, ৬=mid, ৭-৮=if canFinish → hi=mid (comment), ৯=else lo=mid+1, ১১=return lo।

**Scene:** `array`, কিন্তু এখানে `values` আসলে **উত্তরের সম্ভাব্য range** (`speed` 1 থেকে `max(piles)`) — `piles` নিজে input হিসেবে `caption`/`table`-এ দেখান, মূল array হলো `[lo..hi]` স্পেস। বিকল্প (সহজ): `values`=`piles` রাখুন, আর `pointers`-এ `lo`/`hi`/`mid` দেখান **speed-এর মান হিসেবে** (`vars`-এ, array-এর index হিসেবে না, কারণ এগুলো piles-এর index না বরং candidate speed) — `caption`-এ স্পষ্ট করে বলুন "lo/hi/mid এখানে candidate speed, piles-এর index নয়"। `vars`: `mid` (candidate speed), `hours` (লাগবে কত ঘণ্টা), `canFinish`।

**Demo input:** `piles = [3, 6, 7, 11]`, `h = 8` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৪টা স্টেপ, script দিয়ে যাচাই করা):**

| # | lo (আগে) | hi (আগে) | mid (speed) | লাগবে (ঘণ্টা) | canFinish(mid)? | পরে |
|---|---|---|---|---|---|---|
| 1 | 1 | 11 | 6 | 6 | ✅ (6≤8) | hi=6 |
| 2 | 1 | 6 | 3 | 10 | ❌ (10>8) | lo=4 |
| 3 | 4 | 6 | 5 | 8 | ✅ (8≤8) | hi=5 |
| 4 | 4 | 5 | 4 | 8 | ✅ (8≤8) | hi=4 (lo===hi, থামল) |

**চূড়ান্ত উত্তর: `4`।**

---

## 2.3 Allocation Problems

**Demo:** Split Array Largest Sum — [LC 410](https://leetcode.com/problems/split-array-largest-sum/) — কোড:

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
    const mid = (lo + hi) >> 1;
    if (canSplit(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

লাইন: ১=function, ২=canSplit declare, ৩-৪=parts/sum init, ৫=for x, ৬-৯=if overflow → নতুন part, ১০=sum+=x, ১২=return parts≤k, ১৪-১৫=lo/hi init, ১৬=while, ১৭=mid, ১৮-১৯=if canSplit → hi=mid, ২০=else lo=mid+1।

**Scene:** ২.২-এর মতোই — `values`=`nums` (input array), `lo`/`hi`/`mid` candidate cap হিসেবে `vars`-এ। `vars`: `mid` (candidate cap), `parts` (এই cap-এ কত ভাগ লাগে)।

**Demo input:** `nums = [7, 2, 5, 10, 8]`, `k = 2` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৪টা স্টেপ, script দিয়ে যাচাই করা):**

| # | lo (আগে) | hi (আগে) | mid (cap) | canSplit(mid)? | পরে |
|---|---|---|---|---|---|
| 1 | 10 | 32 | 21 | ✅ (২ ভাগে হয়) | hi=21 |
| 2 | 10 | 21 | 15 | ❌ (৩ ভাগ লাগে) | lo=16 |
| 3 | 16 | 21 | 18 | ✅ | hi=18 |
| 4 | 16 | 18 | 17 | ❌ | lo=18 (lo===hi, থামল) |

**চূড়ান্ত উত্তর: `18`।**

---

## 2.4 Bitonic / Rotated Array

**Demo:** Search in Rotated Sorted Array — [LC 33](https://leetcode.com/problems/search-in-rotated-sorted-array/) — কোড:

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

লাইন: ১=function, ২-৩=lo/hi init, ৪=while, ৫=mid, ৬=if match return, ৭=if left sorted, ৮=comment, ৯-১০=if target in left range, ১১=else, ১২=comment, ১৩-১৪=if target in right range।

**Scene:** `array`, `values`=`nums`, `pointers`=[lo, hi, mid]। `marks`: sorted অর্ধেক `done` (visual cue), বাদ পড়া অর্ধেক `reject`। `vars`: কোন অর্ধেক sorted (`left`/`right`)।

**Demo input:** `nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৩টা স্টেপ, script দিয়ে যাচাই করা):**

| # | lo | hi | mid | nums[mid] | কোন অর্ধেক sorted | ঘটনা |
|---|---|---|---|---|---|---|
| 1 | 0 | 6 | 3 | 7 | বাম (`nums[0]=4 ≤ nums[3]=7`) | target(0) বাম রেঞ্জে `[4,7)` নেই → lo=4 |
| 2 | 4 | 6 | 5 | 1 | বাম (`nums[4]=0 ≤ nums[5]=1`) | target(0) বাম রেঞ্জে `[0,1)` আছে → hi=4 |
| 3 | 4 | 4 | 4 | 0 | — | **match! return 4** |

**চূড়ান্ত উত্তর: `4`।**

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
- `context/progress-tracker.md` — টপিক ২-এর এন্ট্রি
