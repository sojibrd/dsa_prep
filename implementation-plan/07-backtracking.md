# Implementation Plan — Topic 7: Backtracking

> **লক্ষ্য:** টপিক ৭-এর ৩টি প্যাটার্নের (`7.1` থেকে `7.3`) জন্য সিমুলেশন তৈরি করা (ডিসিশন ট্রি, চেসবোর্ড গ্রিড ও গ্রিড পাথ ব্যাকট্র্যাকিং)।
> **ফাইল লোকেশন:** `app/lib/simulations/data/7.1-subsets-permutations.ts` থেকে `7.3-word-search-grid.ts`

---

## ১. আর্কিটেকচার ও Scene Kind

- **Scene Kind:**
  - `7.1 Subsets`: `ArrayScene` (`values: nums`, `table: { title: 'Current Path', entries: path }`, `output: { title: 'Subsets (res)', values }`)
  - `7.2 N-Queens`: `MatrixScene` (4x4 বোর্ড, কুইন `Q` বসানো, সংঘাতপূর্ণ সেল `reject` মার্ক, ভ্যালিড সমাধান `done`)
  - `7.3 Word Search`: `MatrixScene` (অক্ষর গ্রিড, ভিজিটেড পাথ `active`/`done`, ব্যাকট্র্যাকিংয়ে সেল রিস্টোর)

---

## ২. প্যাটার্ন স্পেসিফিকেশন

### Pattern 7.1: Subsets / Permutations / Combinations
- **ডেমো কোড:** `subsets(nums)` [LC 78]
- **Concrete Input:** `nums = [1, 2, 3]`
- **Output:** `[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]`
- **Visuals:**
  - ইনপুট অ্যারে: `[1, 2, 3]` (বর্তমান `start` ও `i` পয়েন্টার সহ)।
  - সাইড প্যানেল: `path` (স্ট্যাকের মতো push/pop লাইভ দেখা যাবে) এবং `output` তালিকা।
- **ধাপসমূহ:**
  - `path=[]` → add `[]` to res
  - Choose `1` → `path=[1]` → add `[1]` to res
  - Choose `2` → `path=[1, 2]` → add `[1, 2]` to res
  - Choose `3` → `path=[1, 2, 3]` → add `[1, 2, 3]` to res
  - Undo `3` (`path=[1, 2]`), Undo `2` (`path=[1]`)
  - Choose `3` → `path=[1, 3]` → add `[1, 3]` to res
  - Undo `3`, Undo `1` (`path=[]`)
  - একইভাবে `2` এবং `3` দিয়ে শুরু হওয়া ব্রাঞ্চগুলো তৈরি হবে।

### Pattern 7.2: N-Queens & Board Puzzles
- **ডেমো কোড:** `solveNQueens(n)` [LC 51]
- **Concrete Input:** `n = 4`
- **Output:** `[[".Q..","...Q","Q...","..Q."], ["..Q.","Q...","...Q",".Q.."]]`
- **Visuals:**
  - `MatrixScene` 4x4 গ্রিড।
  - সারি অনুযায়ী কুইন বসানোর চেষ্টা:
    - Row 0: `Col 0` বসানো হলো `(0,0)`-এ `Q`।
    - Row 1: `Col 0` ও `Col 1` আক্রান্ত (`reject`), `Col 2 (1,2)`-এ `Q` বসানো হলো।
    - Row 2: সব কলাম আক্রান্ত! ব্যাকট্র্যাক → Row 1-এর কুইন সরানো → `Col 3 (1,3)`-এ বসানো।
  - ফাইনাল সফল কনফিগারেশন তৈরি হলে পুরো বোর্ড `done` মার্ক হবে।

### Pattern 7.3: Word Search (Grid Backtracking)
- **ডেমো কোড:** `exist(board, word)` [LC 79]
- **Concrete Input:** `board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]`, `word = "ABCCED"`
- **Output:** `true`
- **Visuals:**
  - `MatrixScene` 3x4 গ্রিড।
  - পাথ ট্রেসিং: `(0,0) A` → `(0,1) B` → `(0,2) C` → `(1,2) C` → `(2,2) E` → `(2,1) D`।
  - প্রতিটি কদমে সেল ভিজিটেড (`mark: 'active'`), ডেড-এন্ডে গেলে ব্যাকট্র্যাক করে সেল পুনরুদ্ধার।

---

## ৩. ফাইল তৈরির তালিকা

1. `app/lib/simulations/data/7.1-subsets-permutations.ts`
2. `app/lib/simulations/data/7.2-n-queens.ts`
3. `app/lib/simulations/data/7.3-word-search-grid.ts`
4. `app/lib/simulations/index.ts` (রেজিস্ট্রেশন)
