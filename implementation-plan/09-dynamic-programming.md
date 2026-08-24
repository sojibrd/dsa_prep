# Implementation Plan — Topic 9: Dynamic Programming

> **লক্ষ্য:** টপিক ৯-এর ১১টি প্যাটার্নের (`9.1` থেকে `9.11`) জন্য সিমুলেশন ডেটা তৈরি করা।
> **ফাইল লোকেশন:** `app/lib/simulations/data/9.1-fibonacci-climbing-stairs.ts` থেকে `9.11-bitmask-digit-dp.ts`

---

## ১. আর্কিটেকচার ও Scene Kind

- **Scene Kind:** 
  - **1D DP:** `ArrayScene` (যেমন: Fibonacci, Coin Change, LIS, House Robber, Counting Bits)।
  - **2D DP:** `MatrixScene` (যেমন: 0/1 Knapsack, LCS, Edit Distance, Grid Paths, Interval DP)।
- **সুবিধা:** কোনো নতুন রেন্ডারার কম্পোনেন্ট দরকার নেই। বিদ্যমান `ArrayScene` ও `MatrixScene`-এর `cursor`, `marks`, `subValues`, `table` ব্যবহার করেই পূর্ণাঙ্গ ডায়নামিক প্রোগ্রামিং সিমুলেশন সম্ভব।

---

## ২. প্যাটার্ন স্পেসিফিকেশন

### Pattern 9.1: Fibonacci Style (Climbing Stairs)
- **ডেমো কোড:** `climbStairs(n)` [LC 70]
- **Concrete Input:** `n = 5`
- **Output:** `8`
- **Scene:** `ArrayScene`
- **Visuals:** `dp = [1, 2, 3, 5, 8]`, পয়েন্টার `i`, `marks` দিয়ে `dp[i-1]` এবং `dp[i-2]` হাইলাইট যার যোগফল `dp[i]`।

### Pattern 9.2: 0/1 Knapsack (Subset Sum)
- **ডেমো কোড:** `canPartition(nums)` [LC 416: Partition Equal Subset Sum]
- **Concrete Input:** `nums = [1, 5, 11, 5]`, `target = 11`
- **Output:** `true`
- **Scene:** `MatrixScene` (Rows: item indices `0..3`, Cols: target sum `0..11`)
- **Visuals:** `dp[i][j]` ক্যালকুলেশন — ওপরের সেল `dp[i-1][j]` অথবা `dp[i-1][j - nums[i]]` থেকে মান সংগ্রহ।

### Pattern 9.3: Unbounded Knapsack (Coin Change)
- **ডেমো কোড:** `coinChange(coins, amount)` [LC 322]
- **Concrete Input:** `coins = [1, 2, 5]`, `amount = 7`
- **Output:** `2` (5 + 2)
- **Scene:** `ArrayScene` (`values: dp[0..7]`, শুরুতে `[0, ∞, ∞, ∞, ∞, ∞, ∞, ∞]`)
- **Visuals:** প্রতিটা কয়েনের জন্য `dp[j] = min(dp[j], dp[j - coin] + 1)` লাইভ আপডেট।

### Pattern 9.4: Longest Common Subsequence (LCS)
- **ডেমো কোড:** `longestCommonSubsequence(text1, text2)` [LC 1143]
- **Concrete Input:** `text1 = "abcde"`, `text2 = "ace"`
- **Output:** `3` ("ace")
- **Scene:** `MatrixScene` (6x4 গ্রিড)
- **Visuals:** 
  - যদি অক্ষর মেলে: ডায়াগোনাল সেল `dp[i-1][j-1] + 1`।
  - অক্ষর না মিললে: `max(dp[i-1][j], dp[i][j-1])`।

### Pattern 9.5: Longest Increasing Subsequence (LIS)
- **ডেমো কোড:** `lengthOfLIS(nums)` [LC 300]
- **Concrete Input:** `nums = [10, 9, 2, 5, 3, 7, 101, 18]`
- **Output:** `4` (`[2, 3, 7, 101]` বা `[2, 5, 7, 18]`)
- **Scene:** `ArrayScene` (উপরে `nums`, `subValues` হিসেবে `dp[i]` দেখানো)।

### Pattern 9.6: Edit Distance
- **ডেমো কোড:** `minDistance(word1, word2)` [LC 72]
- **Concrete Input:** `word1 = "horse"`, `word2 = "ros"`
- **Output:** `3`
- **Scene:** `MatrixScene` (6x4 টেবিল)
- **Visuals:** ৩টি অপারেশনের তুলনা — Insert (বামে), Delete (উপরে), Replace (ডায়াগোনাল)।

### Pattern 9.7: House Robber (Non-Adjacent Choice)
- **ডেমো কোড:** `rob(nums)` [LC 198]
- **Concrete Input:** `nums = [2, 7, 9, 3, 1]`
- **Output:** `12` (2 + 9 + 1)
- **Scene:** `ArrayScene` (`nums` অ্যারে, `subValues: dp` এবং পয়েন্টার `prev1`, `prev2`)।

### Pattern 9.8: Grid Paths
- **ডেমো কোড:** `uniquePaths(m, n)` [LC 62]
- **Concrete Input:** `m = 3, n = 3`
- **Output:** `6`
- **Scene:** `MatrixScene` (3x3 গ্রিড)
- **Visuals:** `dp[r][c] = dp[r-1][c] + dp[r][c-1]`।

### Pattern 9.9: Interval DP
- **ডেমো কোড:** `maxCoins(nums)` [LC 312: Burst Balloons]
- **Concrete Input:** `nums = [3, 1, 5, 8]`
- **Output:** `167`
- **Scene:** `MatrixScene` (Interval table `dp[i][j]`)।

### Pattern 9.10: State Machine DP
- **ডেমো কোড:** `maxProfit(prices)` [LC 309: Stock with Cooldown]
- **Concrete Input:** `prices = [1, 2, 3, 0, 2]`
- **Output:** `3`
- **Scene:** `ArrayScene` (টেবিল: `held`, `sold`, `rest` স্টেট)।

### Pattern 9.11: Bitmask / Digit DP
- **ডেমো কোড:** `countBits(n)` [LC 338: Counting Bits]
- **Concrete Input:** `n = 5`
- **Output:** `[0, 1, 1, 2, 1, 2]`
- **Scene:** `ArrayScene` (`dp[i] = dp[i >> 1] + (i & 1)` প্যাটার্ন)।

---

## ৩. ফাইল তৈরির তালিকা

1. `app/lib/simulations/data/9.1-fibonacci-climbing-stairs.ts`
2. `app/lib/simulations/data/9.2-knapsack-subset-sum.ts`
3. `app/lib/simulations/data/9.3-unbounded-coin-change.ts`
4. `app/lib/simulations/data/9.4-longest-common-subsequence.ts`
5. `app/lib/simulations/data/9.5-longest-increasing-subsequence.ts`
6. `app/lib/simulations/data/9.6-edit-distance.ts`
7. `app/lib/simulations/data/9.7-house-robber.ts`
8. `app/lib/simulations/data/9.8-grid-paths.ts`
9. `app/lib/simulations/data/9.9-interval-dp.ts`
10. `app/lib/simulations/data/9.10-state-machine-dp.ts`
11. `app/lib/simulations/data/9.11-bitmask-counting-bits.ts`
12. `app/lib/simulations/index.ts` (রেজিস্ট্রেশন)
