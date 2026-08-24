# Implementation Plan — Topic 2: Binary Search

> **লক্ষ্য:** টপিক ২-এর ৪টি প্যাটার্নের (`2.1` থেকে `2.4`) জন্য `SimStep[]` ভিত্তিক সমৃদ্ধ সিমুলেশন তৈরি করা।
> **ফাইল লোকেশন:** `app/lib/simulations/data/2.1-basic-binary-search.ts` থেকে `2.4-bitonic-rotated-array.ts`
> **রেজিস্ট্রি:** `app/lib/simulations/index.ts`-এ sparse map-এ যোগ।

---

## ১. আর্কিটেকচার ও Scene Kind

- **Scene Kind:** `ArrayScene` (বিদ্যমান)। কোনো নতুন Scene renderer দরকার নেই।
- **ব্যবহৃত উপাদান:**
  - `pointers`: `lo`, `mid`, `hi` পয়েন্টার চিহ্নিতকরণ।
  - `window`: সার্চ স্পেস দেখানো (`{ from: lo, to: hi, label: 'Search Range' }`)।
  - `marks`: এলিমেন্ট টেস্ট (`active`), বাদ পড়া অঞ্চল (`reject`), টার্গেট ম্যাচ (`done`)।
  - `table` (Side panel): `2.2` ও `2.3`-এর জন্য প্রতি ঘন্টায় কলার সংখ্যা / সাব-অ্যারে পার্টস হিসেবের টেবিল।

---

## ২. প্যাটার্ন স্পেসিফিকেশন

### Pattern 2.1: Basic Binary Search & Counting Occurrences
- **ডেমো কোড:** `searchRange(nums, target)` [LC 34]
- **Concrete Input:** `nums = [5, 7, 7, 8, 8, 10]`, `target = 8`
- **Output:** `[3, 4]`
- **সিমুলেশন স্ট্রাকচার (২ ফেজ):**
  1. **Phase 1 (First Occurrence):** `lo=0, hi=5` → `mid=2 (7)` (ছোট, `lo=3`) → `mid=4 (8)` (ম্যাচ! `ans=4`, আরও বামে `hi=3`) → `mid=3 (8)` (ম্যাচ! `ans=3`, `hi=2`) → `lo > hi` সমাপ্ত, `first = 3`।
  2. **Phase 2 (Last Occurrence):** `lo=0, hi=5` → `mid=2` (`lo=3`) → `mid=4` (ম্যাচ! `ans=4`, আরও ডানে `lo=5`) → `mid=5 (10)` (`hi=4`) → সমাপ্ত, `last = 4`।
- **Visuals:** `window` দিয়ে অ্যাক্টিভ সার্চ এরিয়া হাইলাইট, অপ্রয়োজনীয় অংশ `reject` মার্ক।

### Pattern 2.2: Binary Search on Answer
- **ডেমো কোড:** `minEatingSpeed(piles, h)` [LC 875: Koko Eating Bananas]
- **Concrete Input:** `piles = [3, 6, 7, 11]`, `h = 8`
- **Output:** `4`
- **Search Space:** `speed: 1` থেকে `11` (একটি ভার্চুয়াল স্পিড অ্যারে `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]`)
- **Visuals:**
  - প্রধান অ্যারে: Speed space `1..11`
  - `pointers`: `lo`, `mid`, `hi`
  - `table`: প্রতি পাইলে কত ঘন্টা লাগে (`piles[i] / mid`) এবং মোট সময় `totalHours <= 8` কিনা।
- **ধাপসমূহ:**
  - `lo=1, hi=11, mid=6`: hours = 1+1+2+2 = 6 <= 8 (Feasible! `hi=6`)
  - `lo=1, hi=6, mid=3`: hours = 1+2+3+4 = 10 > 8 (Too slow, `lo=4`)
  - `lo=4, hi=6, mid=5`: hours = 1+2+2+3 = 8 <= 8 (Feasible! `hi=5`)
  - `lo=4, hi=5, mid=4`: hours = 1+2+2+3 = 8 <= 8 (Feasible! `hi=4`)
  - `lo=4, hi=4` সমাপ্ত → উত্তর `4`।

### Pattern 2.3: Allocation Problems
- **ডেমো কোড:** `splitArray(nums, k)` [LC 410]
- **Concrete Input:** `nums = [7, 2, 5, 10, 8]`, `k = 2`
- **Output:** `18`
- **Search Space:** `lo = max(nums) = 10`, `hi = sum(nums) = 32`
- **Visuals:**
  - প্রধান অ্যারে: `nums` (কোন কোন এলিমেন্ট কোন ভাগে পড়ছে `subValues` দিয়ে রানিং সাম দেখানো)।
  - `table`: বর্তমান `cap (mid)` ও প্রয়োজনীয় `parts` বনাম `k`।
- **মূল ধাপসমূহ:**
  - `cap=21` (mid of 10..32): `[7,2,5] (14)`, `[10,8] (18)` → 2 parts <= 2 (Feasible! `hi=21`)
  - `cap=15`: `[7,2,5] (14)`, `[10] (10)`, `[8] (8)` → 3 parts > 2 (Too small, `lo=16`)
  - `cap=18`: `[7,2,5] (14)`, `[10,8] (18)` → 2 parts <= 2 (Feasible! `hi=18`)
  - ক্রমান্বয়ে সংকোচন হয়ে `18`-এ এসে স্থির হবে।

### Pattern 2.4: Bitonic / Rotated Array
- **ডেমো কোড:** `search(nums, target)` [LC 33]
- **Concrete Input:** `nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0`
- **Output:** `4`
- **Visuals:**
  - `window`: সার্চ রেঞ্জ
  - `marks`: কোন অর্ধেক sorted (`nums[lo] <= nums[mid]` হলে বাম অর্ধেক `done`/স্বচ্ছ রঙ, ডান অর্ধেক অন্য রঙ)।
- **ধাপসমূহ:**
  - `lo=0, hi=6, mid=3 (7)`: বাম অর্ধেক `[4..7]` সর্টেড। টার্গেট `0` কি `[4..7]`-এর মধ্যে? না। সুতরাং ডানে যেতে হবে `lo = 4`।
  - `lo=4, hi=6, mid=5 (1)`: ডান অর্ধেক `[1..2]` সর্টেড। টার্গেট `0` বামে? হ্যাঁ `hi = 4`।
  - `lo=4, hi=4, mid=4 (0)`: `nums[mid] === target` → পাওয়া গেছে ইনডেক্স `4`!

---

## ৩. ফাইল তৈরির তালিকা

1. `app/lib/simulations/data/2.1-basic-binary-search.ts`
2. `app/lib/simulations/data/2.2-binary-search-on-answer.ts`
3. `app/lib/simulations/data/2.3-allocation-problems.ts`
4. `app/lib/simulations/data/2.4-bitonic-rotated-array.ts`
5. `app/lib/simulations/index.ts` (রেজিস্ট্রেশন)
