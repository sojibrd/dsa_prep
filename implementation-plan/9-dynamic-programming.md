# Implementation Plan — Topic 9: Dynamic Programming (Pattern Simulations)

## এই ডকুমেন্ট কীভাবে পড়বেন

আপনি একটা AI যে এই কথোপকথনটা দেখেননি। শুরু করার আগে এই ক্রমে পড়ুন:

1. `d:\document-files\dsa_prep\AGENTS.md`
2. `d:\document-files\dsa_prep\context\ui-tokens.md` ও `context\ui-rules.md` — Theme Contract
3. `d:\document-files\dsa_prep\context\ui-registry.md` — "🎬 Simulation" সেকশন
4. `d:\document-files\dsa_prep\app\lib\simulations\types.ts` — Scene কনট্র্যাক্ট
5. `d:\document-files\dsa_prep\implementation-plan\1-arrays-strings.md` — Scene কনট্র্যাক্ট, `MatrixScene`-এর মূল ডিজাইন (এই টপিকে এর একটা ছোট এক্সটেনশন লাগবে, নিচে দেখুন), আর `1.1-two-pointers.ts`/`1.6-kadane.ts`-এর reference স্টাইল (Kadane বিশেষভাবে প্রাসঙ্গিক, কারণ সেটাও `subValues` দিয়ে চলমান dp মান দেখায়)। ১ নম্বর টপিক আগে implement হয়ে থাকলে `app\components\simulation\MatrixScene.tsx` ফাইলটাও দেখে নিন।
7. `d:\document-files\dsa_prep\context\dsa-workbook\9. Dynamic Programming\*.md` — raw ডেটা

**⚠️ একটা ডেটা সমস্যা এই টপিকে আছে:** `9.4 Longest Common Subsequence LCS.md` ফাইলটার পাশে একটা **URL-encoded ডুপ্লিকেট** আছে — `9.4%20Longest%20Common%20Subsequence%20LCS.md`। ডুপ্লিকেট ফাইলটাতে বেশি সম্পূর্ণ কনটেন্ট (demo statement, একটা problem-এর statement) আছে যা "সঠিক" নামের ফাইলে **নেই**। `dsa-workbook.md`-এর parser শুধু সঠিক-নামের ফাইল পড়ে (`fs.existsSync` চেক পাস করে), তাই অ্যাপে বর্তমানে ৯.৪-এর demo statement অনুপস্থিত। এই প্ল্যানে ৯.৪-এর জন্য **ডুপ্লিকেট ফাইলের সম্পূর্ণ কনটেন্ট থেকে** demo statement বসানো হয়েছে (নিচে দেখুন) — কিন্তু আসল workbook ফাইল-দুটোর সমস্যা এই কাজের স্কোপের বাইরে, শুধু ফ্ল্যাগ করে রাখা হলো। চাইলে আলাদাভাবে `9.4 Longest Common Subsequence LCS.md`-কে ডুপ্লিকেটের কনটেন্ট দিয়ে replace করে `9.4%20...`ফাইলটা মুছে ফেলতে পারেন (ডেটা হাইজিন, এই সিমুলেশন ফিচারের অংশ নয়)।

**এই প্ল্যান কী নয়:** চূড়ান্ত TypeScript কোড নয়। প্রতিটা প্যাটার্নে demo input (কিছু ক্ষেত্রে workbook-এর ডিফল্টের চেয়ে ছোট, কারণ নোট করা আছে), scene kind সিদ্ধান্ত, আর **script দিয়ে যাচাই করা exact trace** আছে।

## প্রেক্ষাপট — Topic 9-এ ১১টা প্যাটার্ন

| id | নাম | Demo | Scene kind |
|---|---|---|---|
| 9.1 | Fibonacci Style / Climbing Stairs | Climbing Stairs | `array` |
| 9.2 | 0/1 Knapsack / Subset Sum | Partition Equal Subset Sum | `array` |
| 9.3 | Unbounded Knapsack / Coin Change | Coin Change | `array` |
| 9.4 | Longest Common Subsequence (LCS) | LCS | `matrix` |
| 9.5 | Longest Increasing Subsequence (LIS) | LIS (O(n log n)) | `array` |
| 9.6 | Edit Distance | Edit Distance | `matrix` |
| 9.7 | House Robber (Non-Adjacent Choice) | House Robber | `array` |
| 9.8 | Grid Paths | Unique Paths | `matrix` |
| 9.9 | Interval DP | Burst Balloons | `matrix` (**pointers এক্সটেনশন লাগবে**) |
| 9.10 | State Machine DP | Stock with Cooldown | `array` |
| 9.11 | Bitmask / Digit DP | Partition to K Equal Sum Subsets | `array` |

**কোনো নতুন scene kind লাগবে না** — শুধু `MatrixScene`-এ একটা ছোট এক্সটেনশন (৯.৯-এর জন্য), বাকি সব বিদ্যমান `array`/`matrix` দিয়ে কভার হয়।

## সাধারণ নিয়ম — DP-র স্টেপ কীভাবে ভাঙবেন

- 1D dp (৯.১, ৯.২, ৯.৩, ৯.৫, ৯.৭, ৯.১০, ৯.১১): **প্রতিটা `dp[i]`/রানিং ভ্যালুর অর্থপূর্ণ আপডেট = একটা স্টেপ।** যেখানে কোনো পরিবর্তন হয়নি (মান একই থাকল), সেই iteration আলাদা স্টেপ না করাই ভালো — নিচের ট্রেসগুলোতে already filtered করা আছে।
- 2D dp (৯.৪, ৯.৬, ৯.৮, ৯.৯): **প্রতিটা সেল fill হওয়া = একটা স্টেপ।** ছোট demo input বেছে নেওয়া হয়েছে যাতে মোট সেল সংখ্যা ~৬-২০-এর মধ্যে থাকে।
- **`vars`-এ scalar রানিং state দেখান (যেমন ৯.৭-এর `robbed`/`skipped`, ৯.১০-এর `hold`/`sold`/`rest`)। `ArrayScene.subValues` শুধু তখনই ব্যবহার করুন যখন প্রতিটা array index-এর নিজস্ব দ্বিতীয় মান আছে** (যেমন ৯.৯-এর dp টেবিল নিজেই, বা Kadane-এর `cur`)। দুটো ভিন্ন ব্যবহার — গুলিয়ে ফেলবেন না।

---

## 9.1 Fibonacci Style / Climbing Stairs

**Demo:** Climbing Stairs — কোড অপরিবর্তিত:

```js
function climbStairs(n) {
  let prev = 1,
    cur = 1; // dp[0], dp[1]
  for (let i = 2; i <= n; i++) [prev, cur] = [cur, prev + cur];
  return cur;
}
```

লাইন: ১=function, ২-৩=prev,cur init, ৪=for লুপ (swap), ৫=return cur।

**Scene:** `array`, `values` = ধাপে ধাপে গণনা হওয়া `dp[0..n]` (শুরুতে শুধু `dp[0]=1, dp[1]=1` fill করা, বাকি ফাঁকা/`""`)। প্রতি স্টেপে `dp[i]` fill হয়, `marks[i]='active'`, আগেরগুলো `done`। `vars`: `prev`, `cur`।

**Demo input:** `n = 5` (workbook-এর ডিফল্টের চেয়ে সামান্য বড় করে prospপ্যাটার্ন স্পষ্ট করা)।

**সম্পূর্ণ ট্রেস (৪টা স্টেপ — i=2..5, script দিয়ে যাচাই করা):**

| # | i | prev (আগে) | cur (আগে) | prev (পরে) | cur (পরে) |
|---|---|---|---|---|---|
| 1 | 2 | 1 | 1 | 1 | 2 |
| 2 | 3 | 1 | 2 | 2 | 3 |
| 3 | 4 | 2 | 3 | 3 | 5 |
| 4 | 5 | 3 | 5 | 5 | 8 |

**চূড়ান্ত উত্তর: `8`** (n=5 ধাপে ওঠার ৮টা উপায়)।

---

## 9.2 0/1 Knapsack / Subset Sum

**Demo:** Partition Equal Subset Sum — কোড অপরিবর্তিত:

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

লাইন: ১=function, ২-৩=total/parity check, ৪=target, ৫-৬=dp init, ৮=for num (বাইরের লুপ), ৯-১৩=for s (ভেতরের লুপ, উল্টো দিকে), ১৩=dp[s] আপডেট, ১৪=return।

**Scene:** `array`, `values` = `dp[0..target]` (boolean, `"T"`/`"F"` স্ট্রিং হিসেবে দেখান)। প্রতি স্টেপে যে `s` বদলাল সেটা `marks[s]='active'` (নতুন `true` হলে), বাকি `dp[s-num]` (উৎস) হিসেবে `marks[s-num]='fill'` করে দেখান কোথা থেকে সত্য এলো। `vars`: `num` (বর্তমান আইটেম)।

**Demo input:** `nums = [1, 5, 11, 5]` (workbook-এর নিজস্ব উদাহরণ, `target=11`)।

**সম্পূর্ণ ট্রেস (৫টা পরিবর্তনকারী স্টেপ — শুধু যেসব `s`-এ `dp[s]` `false`→`true` হলো, script দিয়ে যাচাই করা):**

| # | num | s | from (s−num) | dp[s] নতুন |
|---|---|---|---|---|
| 1 | 1 | 1 | 0 | true |
| 2 | 5 | 6 | 1 | true |
| 3 | 5 | 5 | 0 | true |
| 4 | 11 | 11 | 0 | true |
| 5 | 5 | 10 | 5 | true |

প্রতিটা `num`-এর জন্য `s = target downTo num` পুরো লুপ চলে, কিন্তু বেশিরভাগ `s`-এ কিছু বদলায় না (already false থেকে false) — সেগুলো স্টেপ বানানোর দরকার নেই, উপরের টেবিলেই শুধু বদলানো entry। প্রতিটা `num`-এর ব্লকের শুরুতে একটা "num=X নিয়ে কাজ শুরু" ধরনের ছোট ইনট্রো-স্টেপ চাইলে যোগ করতে পারেন।

**চূড়ান্ত: `dp[11] = true`** → `[1,5,5]` ও `[11]`-এ ভাগ করা সম্ভব।

---

## 9.3 Unbounded Knapsack / Coin Change

**Demo:** Coin Change — কোড অপরিবর্তিত:

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

লাইন: ১=function, ২-৩=dp init, ৫=for coin, ৬-১০=for a (সোজা দিকে), ১০=dp[a] আপডেট, ১১=return।

**Scene:** `array`, `values` = `dp[0..amount]` (∞ কে `"∞"` স্ট্রিং হিসেবে দেখান)। প্রতি স্টেপে `marks[a]='active'`, উৎস `marks[a-coin]='fill'`। `vars`: `coin`।

**Demo input (workbook-এর ডিফল্ট `amount=11` অনেক বড় ট্রেস দেয় — ছোট সংস্করণ প্রস্তাবিত):**

```
coins = [1, 2, 5]
amount = 6
```

**সম্পূর্ণ ট্রেস (১৩টা স্টেপ, script দিয়ে যাচাই করা):**

| # | coin | a | dp[a] আগে | dp[a−coin] | dp[a] নতুন |
|---|---|---|---|---|---|
| 1 | 1 | 1 | ∞ | dp[0]=0 | 1 |
| 2 | 1 | 2 | ∞ | dp[1]=1 | 2 |
| 3 | 1 | 3 | ∞ | dp[2]=2 | 3 |
| 4 | 1 | 4 | ∞ | dp[3]=3 | 4 |
| 5 | 1 | 5 | ∞ | dp[4]=4 | 5 |
| 6 | 1 | 6 | ∞ | dp[5]=5 | 6 |
| 7 | 2 | 2 | 2 | dp[0]=0 | 1 |
| 8 | 2 | 3 | 3 | dp[1]=1 | 2 |
| 9 | 2 | 4 | 4 | dp[2]=1 | 2 |
| 10 | 2 | 5 | 5 | dp[3]=2 | 3 |
| 11 | 2 | 6 | 6 | dp[4]=2 | 3 |
| 12 | 5 | 5 | 3 | dp[0]=0 | 1 |
| 13 | 5 | 6 | 3 | dp[1]=1 | 2 |

**চূড়ান্ত: `dp[6] = 2`** (৫+১ = ৬, দুটো কয়েন)।

---

## 9.4 Longest Common Subsequence (LCS) — `matrix`

**Demo statement (ডুপ্লিকেট ফাইল থেকে পুনরুদ্ধার করা, ⚠️ উপরের নোট দেখুন):** দুটো string `text1` ও `text2` দেওয়া — এদের Longest Common Subsequence (LCS)-এর দৈর্ঘ্য বের করুন। উদাহরণ: `text1="abcde", text2="ace"` → `3` ("ace")।

**কোড অপরিবর্তিত:**

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

লাইন: ১=function, ২-৩=m,n, ৪=dp init, ৫-৬=for i,j, ৭-১০=dp[i][j] হিসাব (ternary — match হলে diagonal+1, নাহলে max)।

**Scene:** `matrix`, `values` = dp টেবিল (`(m+1)×(n+1)`, প্রথম row/column ০)। `cursor` = বর্তমান `(i,j)`। `marks`: source cell(গুলো) (diagonal বা উপর/বাম) `fill`। `vars`: `s1[i-1]`, `s2[j-1]`, match কিনা।

**Demo input (workbook-এর ডিফল্ট `"abcde"`/`"ace"` টেবিল 6×4 = ২৪ সেল, একটু বড় — আরও ছোট বিকল্প প্রস্তাবিত):**

```
s1 = "ABC"
s2 = "AC"
```

**সম্পূর্ণ ট্রেস (৬টা স্টেপ, script দিয়ে যাচাই করা):**

| # | (i,j) | s1[i-1] | s2[j-1] | match | dp[i][j] |
|---|---|---|---|---|---|
| 1 | (1,1) | A | A | ✅ | dp[0][0]+1 = 1 |
| 2 | (1,2) | A | C | ❌ | max(dp[0][2]=0, dp[1][1]=1) = 1 |
| 3 | (2,1) | B | A | ❌ | max(dp[1][1]=1, dp[2][0]=0) = 1 |
| 4 | (2,2) | B | C | ❌ | max(dp[1][2]=1, dp[2][1]=1) = 1 |
| 5 | (3,1) | C | A | ❌ | max(dp[2][1]=1, dp[3][0]=0) = 1 |
| 6 | (3,2) | C | C | ✅ | dp[2][1]+1 = 2 |

**চূড়ান্ত dp টেবিল:** `[[0,0,0],[0,1,1],[0,1,1],[0,1,2]]` → **উত্তর `dp[3][2] = 2`** (LCS = "AC")।

চাইলে workbook-এর আসল demo input (`"abcde"`/`"ace"`, উত্তর ৩) ব্যবহার করতে পারেন — শুধু স্টেপ সংখ্যা ২৪ হবে।

---

## 9.5 Longest Increasing Subsequence (LIS)

**Demo:** LIS, O(n log n) patience sorting — কোড অপরিবর্তিত:

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

লাইন: ১=function, ২=tails init, ৩=for x, ৪-৫=lo,hi init, ৬-১০=binary search (while), ১১=tails[lo]=x।

**Scene:** `array`, `values` = `tails` (বর্তমান পর্যন্ত)। প্রতি স্টেপে binary search-এর `lo`/`hi` `pointers` হিসেবে দেখান (২.x প্যাটার্নের মতো), শেষে যে index-এ বসল (`lo`) `marks[lo]='active'`। `vars`: `x` (বর্তমান input), `action` (append/replace)।

**Demo input:** `nums = [3, 1, 4, 1, 5, 9, 2, 6]` (নতুন, LIS-এর ক্লাসিক ধরনের উদাহরণ — workbook-এর ডিফল্ট `[10,9,2,5,3,7,101,18]`-এর চেয়ে ছোট মান, একই দৈর্ঘ্য ৮)।

**সম্পূর্ণ ট্রেস (৮টা স্টেপ, script দিয়ে যাচাই করা):**

| # | x | binary search lo | action | tails (পরে) |
|---|---|---|---|---|
| 1 | 3 | 0 | append | [3] |
| 2 | 1 | 0 | replace (old 3) | [1] |
| 3 | 4 | 1 | append | [1,4] |
| 4 | 1 | 0 | replace (old 1) | [1,4] |
| 5 | 5 | 2 | append | [1,4,5] |
| 6 | 9 | 3 | append | [1,4,5,9] |
| 7 | 2 | 1 | replace (old 4) | [1,2,5,9] |
| 8 | 6 | 3 | replace (old 9) | [1,2,5,6] |

**চূড়ান্ত: `tails.length = 4`** (প্রকৃত LIS একটা: `1,4,5,9` বা `1,2,5,6`-এর দৈর্ঘ্য — মনে রাখবেন `tails` নিজে LIS নয়, শুধু দৈর্ঘ্য সঠিক, এটা ব্যাখ্যায় স্পষ্ট করে বলা জরুরি)।

---

## 9.6 Edit Distance — `matrix`

**Demo:** Edit Distance — কোড অপরিবর্তিত:

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

লাইন: ১=function, ২-৩=m,n, ৪-৬=dp init (base case: প্রথম row/col), ৭-৮=for i,j, ৯-১৬=dp[i][j] হিসাব (match→diagonal, নাহলে min(replace,delete,insert)+1)।

**Scene:** `matrix`, base row/column আগে থেকেই ভরা দেখান (base case)। `cursor`=বর্তমান `(i,j)`, `marks`: match হলে diagonal source `fill`, নাহলে যে অপারেশন (replace/delete/insert) জিতল তার source cell `fill` + `vars`-এ `op` নাম।

**Demo input:** `word1="cat", word2="cut"` (workbook-এর ডিফল্ট `"horse"`/`"ros"` টেবিল বড়, `4×4=16` সেলের এই ছোট সংস্করণ প্রস্তাবিত)।

**সম্পূর্ণ ট্রেস (৯টা স্টেপ, script দিয়ে যাচাই করা):**

| # | (i,j) | w1[i-1] | w2[j-1] | match | op | dp[i][j] |
|---|---|---|---|---|---|---|
| 1 | (1,1) | c | c | ✅ | copy | 0 |
| 2 | (1,2) | c | u | ❌ | insert (min of rep=1,del=2,**ins=0**) | 1 |
| 3 | (1,3) | c | t | ❌ | insert (rep=2,del=3,**ins=1**) | 2 |
| 4 | (2,1) | a | c | ❌ | delete (rep=1,**del=0**,ins=2) | 1 |
| 5 | (2,2) | a | u | ❌ | replace (**rep=0**,del=1,ins=1) | 1 |
| 6 | (2,3) | a | t | ❌ | replace (**rep=1**,del=2,ins=1) — tie broken by rep first | 2 |
| 7 | (3,1) | t | c | ❌ | delete (rep=2,**del=1**,ins=3) | 2 |
| 8 | (3,2) | t | u | ❌ | replace/delete tie (rep=1,**del=1**,ins=2) — কোড `Math.min` ব্যবহার করে, tie-এ `1+min(...)` একই ফল দেয়; op বলার দরকার নেই, শুধু "rep অথবা del, দুটোই ১" বলুন | 2 |
| 9 | (3,3) | t | t | ✅ | copy | 1 |

**চূড়ান্ত: `dp[3][3] = 1`** ("cat"→"cut", শুধু 'a'→'u' একটা replace)।

---

## 9.7 House Robber (Non-Adjacent Choice)

**Demo:** House Robber — কোড অপরিবর্তিত:

```js
function rob(nums) {
  let robbed = 0,
    skipped = 0;
  for (const x of nums)
    [robbed, skipped] = [skipped + x, Math.max(robbed, skipped)];
  return Math.max(robbed, skipped);
}
```

লাইন: ১=function, ২-৩=robbed,skipped init, ৪-৫=for x (swap)।

**Scene:** `array`, `values` = `nums`, `marks[i]='active'` বর্তমান index। `vars`: `robbed`, `skipped` (দুটোই — এখানে **`subValues` ব্যবহার করবেন না**, কারণ এরা per-index মান নয়, running scalar — উপরের সাধারণ নিয়ম দেখুন)।

**Demo input:** `nums = [2, 7, 9, 3, 1]` (workbook-এর ডিফল্ট `[1,2,3,1]`-এর চেয়ে একটু বড়, প্যাটার্ন স্পষ্ট দেখানোর জন্য)।

**সম্পূর্ণ ট্রেস (৫টা স্টেপ, script দিয়ে যাচাই করা):**

| # | x | robbed আগে | skipped আগে | robbed পরে | skipped পরে |
|---|---|---|---|---|---|
| 1 | 2 | 0 | 0 | 2 | 0 |
| 2 | 7 | 2 | 0 | 7 | 2 |
| 3 | 9 | 7 | 2 | 11 | 7 |
| 4 | 3 | 11 | 7 | 10 | 11 |
| 5 | 1 | 10 | 11 | 12 | 11 |

**চূড়ান্ত: `max(12, 11) = 12`** (বাড়ি ২, ৯, ১ থেকে: 2+9+1=12)।

---

## 9.8 Grid Paths — `matrix`

**Demo:** Unique Paths — কোড অপরিবর্তিত:

```js
function uniquePaths(m, n) {
  const dp = new Array(n).fill(1); // প্রথম row
  for (let i = 1; i < m; i++) for (let j = 1; j < n; j++) dp[j] += dp[j - 1]; // উপর (পুরনো dp[j]) + বাম
  return dp[n - 1];
}
```

লাইন: ১=function, ২=dp init (1D rolling), ৩=for i,j (dp[j]+=dp[j-1])।

**⚠️ ডিজাইন সিদ্ধান্ত:** কোড `1D` rolling array ব্যবহার করে (space-optimized), কিন্তু ভিজ্যুয়ালি এটা একটা **2D grid walk** — তাই scene-এ পূর্ণ `m×n` matrix দেখান (প্রতিটা `(i,j)` সেলে "এই ঘরে কত path আছে" পূর্ণ মান রেখে), যদিও কোড বাস্তবে ১টা row-ই রাখে। এটা কোড-থেকে-scene-এর একটা **ইচ্ছাকৃত বিমূর্তকরণ** — scene-এর `values` পুরো grid থাকবে (row `i`-তে যেসব cell এখনো "compute" হয়নি তারা placeholder, বাকি final মান), কোড নিজে অপরিবর্তিত।

**Scene:** `matrix`, `values` = পূর্ণ `m×n` grid (dp মান), প্রথম row/column সব `1`। `cursor`=বর্তমান `(i,j)`। `marks`: উৎস `(i-1,j)` ও `(i,j-1)` `fill`।

**Demo input:** `m=3, n=3` (workbook-এর ডিফল্ট `m=3,n=7` অনেক বড়, ছোট সংস্করণ প্রস্তাবিত)।

**সম্পূর্ণ ট্রেস (৪টা স্টেপ, script দিয়ে যাচাই করা):**

| # | (i,j) | dp[i-1][j] (উপর) | dp[i][j-1] (বাম) | dp[i][j] |
|---|---|---|---|---|
| 1 | (1,1) | 1 | 1 | 2 |
| 2 | (1,2) | 1 | 2 | 3 |
| 3 | (2,1) | 2 | 1 | 3 |
| 4 | (2,2) | 3 | 3 | 6 |

**চূড়ান্ত grid:** `[[1,1,1],[1,2,3],[1,3,6]]` → **উত্তর `6`**।

---

## 9.9 Interval DP — `matrix` (⚠️ `MatrixScene` এক্সটেনশন লাগবে)

### কেন এক্সটেনশন লাগছে

Burst Balloons-এ প্রতিটা "candidate" মুহূর্তে **তিনটা** অবস্থান একসাথে গুরুত্বপূর্ণ: `l` (interval-এর বাম সীমা), `r` (ডান সীমা), `k` (split candidate)। বর্তমান `MatrixScene`-এ শুধু একটা singular `cursor: {row, col}` আছে — তিনটে নামযুক্ত অবস্থান দেখানো যায় না।

### `types.ts`-এ `MatrixScene`-এ যোগ করুন

```ts
export interface MatrixScene extends SceneBase {
  kind: 'matrix';
  values: (number | string)[][];
  cursor?: { row: number; col: number };
  /** Named 2D cursors — e.g. interval DP's l/r/k triple. Additive to `cursor`. */
  pointers?: { name: string; row: number; col: number }[];
  marks?: Record<string, CellMark>;
  bounds?: { top: number; bottom: number; left: number; right: number };
}
```

`cursor` **সরাবেন না** — যেসব প্যাটার্ন (৯.৪, ৯.৬, ৯.৮, ৮.১) শুধু একটা অবস্থান দেখায়, তারা `cursor`-ই ব্যবহার করবে; শুধু ৯.৯ (আর দরকার হলে ভবিষ্যতে অন্য কিছু) `pointers` ব্যবহার করবে। `MatrixScene.tsx`-এ `pointers` থাকলে প্রতিটার নাম সেই সেলের উপরে ছোট লেবেল হিসেবে আঁকুন — ঠিক `ArrayScene`-এর `sim-pointer` label-এর ধাঁচে (`{name} ▼` বা সংক্ষেপে `{name}`)।

### Demo

**Demo:** Burst Balloons — কোড অপরিবর্তিত:

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

লাইন: ১=function, ২=padding, ৩=n, ৪=dp init, ৫=for len, ৬=for l, ৭=r, ৮=for k, ৯-১০=dp[l][r] candidate compare (comment লাইন বাদে ৯ থেকে গোনা — ফেন্সের ভেতরের প্রকৃত লাইন সংখ্যা মিলিয়ে নেবেন, comment `// k = শেষে...`ও একটা লাইন গোনায় ধরা হয়)।

**Scene:** `matrix`, `values` = `dp` টেবিল (পুরো `n×n`, শুরুতে সব ০)। `pointers`: `[{name:"l", row:l, col:l}, {name:"r", row:r, col:r}, {name:"k", row:k, col:k}]` (l,r আসলে column index হিসেবে dp\[l\]\[r\]-এ বসে — একটা সহজ কনভেনশন: `row` সবসময় `l`, `col` সবসময় সংশ্লিষ্ট `r` বা `k`, যাতে সবগুলো একই row-তে থাকা dp টেবিলের upper-triangle-এ পড়ে)। `marks`: সেটেল হওয়া `dp[l][r]` `done`।

**Demo input (workbook-এর ৪-বেলুন ডিফল্ট মাঝারি, ৩-বেলুন প্রস্তাবিত):**

```
nums = [3, 1, 5]
```

(পরে padding হয়ে `a = [1,3,1,5,1]`, `n=5`)

**সম্পূর্ণ ট্রেস (১৬টা স্টেপ — candidate + settled মিলিয়ে, script দিয়ে যাচাই করা):**

| # | l | r | k | ঘটনা | মান |
|---|---|---|---|---|---|
| 1 | 0 | 2 | 1 | candidate | dp[0][1]+a0·a1·a2+dp[1][2] = 0+1·3·1+0 = 3 |
| 2 | 0 | 2 | — | **settled** | dp[0][2] = 3 |
| 3 | 1 | 3 | 2 | candidate | 0+3·1·5+0 = 15 |
| 4 | 1 | 3 | — | **settled** | dp[1][3] = 15 |
| 5 | 2 | 4 | 3 | candidate | 0+1·5·1+0 = 5 |
| 6 | 2 | 4 | — | **settled** | dp[2][4] = 5 |
| 7 | 0 | 3 | 1 | candidate | dp[0][1]+a0·a1·a3+dp[1][3] = 0+1·3·5+15 = 30 |
| 8 | 0 | 3 | 2 | candidate | dp[0][2]+a0·a2·a3+dp[2][3] = 3+1·1·5+0 = 8 (৩০-এর চেয়ে ছোট, বাতিল) |
| 9 | 0 | 3 | — | **settled** | dp[0][3] = 30 (k=1 জিতল) |
| 10 | 1 | 4 | 2 | candidate | dp[1][2]+a1·a2·a4+dp[2][4] = 0+3·1·1+5 = 8 |
| 11 | 1 | 4 | 3 | candidate | dp[1][3]+a1·a3·a4+dp[3][4] = 15+3·5·1+0 = 30 |
| 12 | 1 | 4 | — | **settled** | dp[1][4] = 30 (k=3 জিতল) |
| 13 | 0 | 4 | 1 | candidate | dp[0][1]+a0·a1·a4+dp[1][4] = 0+1·3·1+30 = 33 |
| 14 | 0 | 4 | 2 | candidate | dp[0][2]+a0·a2·a4+dp[2][4] = 3+1·1·1+5 = 9 |
| 15 | 0 | 4 | 3 | candidate | dp[0][3]+a0·a3·a4+dp[3][4] = 30+1·5·1+0 = 35 |
| 16 | 0 | 4 | — | **settled** | dp[0][4] = 35 (k=3 জিতল, চূড়ান্ত উত্তর) |

**চূড়ান্ত উত্তর: `dp[0][4] = 35`।**

---

## 9.10 State Machine DP

**Demo:** Best Time to Buy/Sell with Cooldown — কোড অপরিবর্তিত:

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

লাইন: ১=function, ২-৪=hold,sold,rest init, ৫=for p, ৬=prevSold, ৭=sold আপডেট, ৮=hold আপডেট, ৯=rest আপডেট।

**Scene:** `array`, `values` = `prices`, `marks[i]='active'` বর্তমান দিন। `vars`: `hold`, `sold`, `rest` (তিনটাই scalar running state, `subValues` নয়)।

**Demo input:** `prices = [1, 2, 3, 0, 2]` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৫টা স্টেপ, script দিয়ে যাচাই করা):**

| # | p | hold আগে | sold আগে | rest আগে | hold পরে | sold পরে | rest পরে |
|---|---|---|---|---|---|---|---|
| 1 | 1 | −∞ | 0 | 0 | −1 | −∞ | 0 |
| 2 | 2 | −1 | −∞ | 0 | −1 | 1 | 0 |
| 3 | 3 | −1 | 1 | 0 | −1 | 2 | 1 |
| 4 | 0 | −1 | 2 | 1 | 1 | −1 | 2 |
| 5 | 2 | 1 | −1 | 2 | 1 | 3 | 2 |

**চূড়ান্ত: `max(3, 2) = 3`** (day1 কিনুন, day2 বেচুন (+1), cooldown day3, day4 কিনুন, day5 বেচুন (+2) = ৩)।

---

## 9.11 Bitmask / Digit DP

**Demo:** Partition to K Equal Sum Subsets — কোড অপরিবর্তিত:

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

লাইন: ১=function, ২-৩=total/parity, ৪=target, ৫=sort, ৬=early exit, ৭-৮=n,memo, ৯=dfs declare, ১০=base case (mask full), ১১=memo hit, ১২=ok init, ১৩-১৭=for i (bit ব্যবহৃত কিনা চেক, recurse), ১৮=memo.set, ১৯=return, ২২=main call।

**Scene:** `array`, `values` = `nums` (sorted)। `marks[i]`: bit ব্যবহৃত হলে `done`, বর্তমান try `active`। `vars`: `mask` (বাইনারি স্ট্রিং হিসেবে, যেমন `"0110"`), `curSum`, `target`।

**Demo input (workbook-এর ডিফল্ট `n=7` recursion tree অনেক বড় — ছোট সংস্করণ প্রস্তাবিত):**

```
nums = [4, 3, 2, 1]
k = 2
```

`total=10, target=5`, sorted `nums=[4,3,2,1]`।

**সম্পূর্ণ ট্রেস (৫টা স্টেপ, script দিয়ে যাচাই করা — শুধু সফল path, ব্যর্থ শাখা `reject` মার্ক দিয়ে সংক্ষেপে):**

| # | i (try) | nums[i] | mask আগে | curSum আগে | ফলাফল |
|---|---|---|---|---|---|
| 1 | 0 (val 4) | 4 | 0000 | 0 | ✅ নেয়া হলো, mask=0001, curSum=4 |
| 2 | 1 (val 3) | 3 | 0001 | 4 | ❌ 4+3=7 > target(5), reject |
| 3 | 2 (val 2) | 2 | 0001 | 4 | ❌ 4+2=6 > 5, reject |
| 4 | 3 (val 1) | 1 | 0001 | 4 | ✅ নেয়া হলো, curSum=4+1=5 → 5%5=0 (bucket ভরাট, নতুন bucket শুরু), mask=1001 |
| 5 | 1 (val 3) | 3 | 1001 | 0 | ✅ নেয়া হলো, mask=1011, curSum=3 |

(এরপর বাকি ২,১ ভ্যালু দিয়ে দ্বিতীয় bucket ভরাট হবে — সংক্ষেপে "বাকি ধাপগুলো একই প্যাটার্নে চলে, শেষে সব bit ব্যবহৃত হয়ে `true`" বলে দিন, চূড়ান্ত `output`-এ শুধু ফলাফল দেখান।)

**চূড়ান্ত উত্তর: `true`** (`[4,1]` ও `[3,2]` — দুটোই sum=5)।

---

## যাচাই (implement করার পর)

```bash
cd d:\document-files\dsa_prep
npx tsc --noEmit
npx eslint app --ext .ts,.tsx
npx next build
```

## শেষে যা আপডেট করবেন

- `app/lib/simulations/types.ts` — `MatrixScene.pointers` যোগ
- `app/components/simulation/MatrixScene.tsx` — `pointers` রেন্ডার করার লজিক
- `app/lib/simulations/index.ts` — ১১টা নতুন import + `ALL` array
- `context/progress-tracker.md` — টপিক ৯-এর এন্ট্রি
- (ঐচ্ছিক) `context/dsa-workbook/9. Dynamic Programming/`-এর `9.4` ডুপ্লিকেট ফাইল সমস্যা ঠিক করা
