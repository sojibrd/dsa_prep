# Implementation Plan — Topic 7: Backtracking (Pattern Simulations)

## এই ডকুমেন্ট কীভাবে পড়বেন

আপনি একটা AI যে এই কথোপকথনটা দেখেননি। শুরু করার আগে এই ক্রমে পড়ুন:

1. `d:\document-files\dsa_prep\AGENTS.md` — প্রজেক্টের ভাষা ও কাজের নিয়ম (বাংলায় লিখতে হবে, ইত্যাদি)
2. `d:\document-files\dsa_prep\context\ui-tokens.md` ও `context\ui-rules.md` — Theme Contract (কম্পোনেন্টে কোনো ভিজ্যুয়াল ক্লাস নয়)
3. `d:\document-files\dsa_prep\context\ui-registry.md` — "🎬 Simulation" সেকশন, বিদ্যমান সব কম্পোনেন্ট ও role class-এর তালিকা
4. `d:\document-files\dsa_prep\app\lib\simulations\types.ts` — Scene কনট্র্যাক্ট (ইতিমধ্যে `array`, `matrix`, `intervals`, `linked-list`, `tree` — পাঁচটা kind আছে)
5. `d:\document-files\dsa_prep\implementation-plan\1-arrays-strings.md` — **আগে এটা implement করা থাকতে হবে।** সম্পূর্ণ Scene কনট্র্যাক্ট, `usePatternSim` হুক, কম্পোনেন্ট গঠন এখানে সংজ্ঞায়িত; সেই কোড (`app/lib/simulations/types.ts`, `app/lib/simulations/data/1.1-two-pointers.ts` ইত্যাদি) ইতিমধ্যে থাকবে ধরে নিয়ে এগোন
6. `d:\document-files\dsa_prep\context\dsa-workbook\7. Backtracking\*.md` — এই টপিকের raw পার্ন ডেটা (demo code, statement, approach — এই প্ল্যানে যা কপি করা আছে তার উৎস)

**এই প্ল্যান কী নয়:** এটা চূড়ান্ত `SimStep[]` TypeScript কোড নয়। প্রতিটা প্যাটার্নের জন্য এখানে demo input, scene kind সিদ্ধান্ত, আর একটা **precise ধাপে-ধাপে state trace** দেওয়া আছে (হাতে/স্ক্রিপ্টে হিসাব করা, তাই সংখ্যাগুলো ভুল নয়) — কিন্তু আসল `SimStep` object, বাংলা `whatHappens`/`whyItMatters` বাক্য, আর `highlightLines` array **আপনাকে লিখতে হবে**, ঠিক `1-arrays-strings.md` অনুযায়ী তৈরি হওয়া `1.1-two-pointers.ts`-এর স্টাইলে।

## প্রেক্ষাপট — Topic 7-এ ৩টা প্যাটার্ন

| id | নাম | Demo | Scene kind |
|---|---|---|---|
| 7.1 | Subsets / Permutations / Combinations | Subsets (LC 78) | `array` (পুনর্ব্যবহার) |
| 7.2 | N-Queens ও Board Puzzles | N-Queens (LC 51) | `matrix` (পুনর্ব্যবহার) |
| 7.3 | Word Search (Grid Backtracking) | Word Search (LC 79) | `matrix` (পুনর্ব্যবহার) |

**কোনো নতুন scene kind লাগবে না** — `types.ts`, কোনো renderer ফাইল সম্পাদনা করবেন না, শুধু `app/lib/simulations/data/7.1-subsets.ts` (ইত্যাদি) নতুন ফাইল লিখে `app/lib/simulations/index.ts`-এ যোগ করবেন।

## সাধারণ নিয়ম — Backtracking-এর স্টেপ কীভাবে ভাঙবেন

Backtracking-এ raw recursion trace অনেক বড় হয় (N-Queens n=4-এই ৭৮টা event)। পুরোটা স্টেপ বানালে সিমুলেশন অসহনীয় লম্বা হয়ে যাবে। তাই এই নিয়মে **consolidate** করুন:

- **প্রতিটা সফল "choose" (একটা এলিমেন্ট/সংখ্যা/queen বসানো) = একটা স্টেপ।** Scene-এ `marks` দিয়ে সেই সেল/index `active` দেখান।
- **প্রতিটা "undo" (backtrack) = একটা স্টেপ**, যেখানে ওই সেল আবার আগের মতো mark হয় (বা mark মুছে যায়)।
- **টানা কয়েকটা ব্যর্থ চেষ্টা (reject) একসাথে একটা স্টেপে বলুন** — প্রতিটা reject আলাদা স্টেপ না করে ("row ২-এ column ০, ১, ২, ৩ — সবগুলোই আক্রান্ত, তাই এই শাখা বাতিল") রকম একটা স্টেপে গুটিয়ে ফেলুন, `marks` দিয়ে ওই row-এর সব cell একসাথে `reject` দেখিয়ে।
- **প্রতিটা সম্পূর্ণ solution পাওয়া = একটা স্টেপ**, `output.values`-এ যোগ হবে (marks-এ পুরো path `done`)।
- লক্ষ্য: প্রতি প্যাটার্নে ১৫–২৫টা স্টেপ। এর বেশি হলে input আরও ছোট করুন।

---

## 7.1 Subsets / Permutations / Combinations

**Demo:** Subsets — [LC 78](https://leetcode.com/problems/subsets/), demo code অপরিবর্তিত রাখুন:

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

লাইন নম্বর (কোড ফেন্সের ভেতরের প্রথম লাইন = ১): ১=function, ২=res declare, ৩=backtrack declare, ৪=res.push (record), ৫=for শুরু, ৬=path.push (choose), ৭=backtrack call (explore), ৮=path.pop (undo), ৯=for শেষ বন্ধনী, ১০=backtrack বন্ধনী, ১২=backtrack(0,[]) call, ১৩=return res।

### Scene kind: `array`

`values` = `nums` (`[1, 2, 3]`), কিন্তু এখানে array নিজে বদলায় না — বরং **`path`** (এখন পর্যন্ত বাছাই করা এলিমেন্ট) আর **`output`** (এ পর্যন্ত জেনারেট হওয়া সব subset) দেখানো দরকার। প্যাটার্ন:

- `values`: `nums` অপরিবর্তিত সারি — `marks` দিয়ে কোনটা path-এ আছে (`active`), কোনটা এখনো বিবেচনায় আসেনি (কিছু না — plain)।
- `output.title`: `"res"`, `output.values`: এ পর্যন্ত রেকর্ড হওয়া subset-গুলো, স্ট্রিং আকারে (যেমন `"[1,2]"`)।
- `caption` বা `vars`-এ `path` দেখান (যেমন `vars: [{name:"path", value:"[1,2]"}]`)।

### Demo input

`nums = [1, 2, 3]` (workbook-এর নিজস্ব উদাহরণ, ছোট রাখাই আছে)।

### সম্পূর্ণ ট্রেস (script দিয়ে যাচাই করা, exact)

Raw event log (২২টা):

| # | event | i / val | path (event-এর পরে) | res-এ যোগ হলো কি |
|---|---|---|---|---|
| 1 | record | — | `[]` | ✅ `[]` (res.length=1) |
| 2 | choose | i=0, val=1 | `[1]` | |
| 3 | record | — | `[1]` | ✅ `[1]` |
| 4 | choose | i=1, val=2 | `[1,2]` | |
| 5 | record | — | `[1,2]` | ✅ `[1,2]` |
| 6 | choose | i=2, val=3 | `[1,2,3]` | |
| 7 | record | — | `[1,2,3]` | ✅ `[1,2,3]` |
| 8 | undo | i=2, val=3 | `[1,2]` | |
| 9 | undo | i=1, val=2 | `[1]` | |
| 10 | choose | i=2, val=3 | `[1,3]` | |
| 11 | record | — | `[1,3]` | ✅ `[1,3]` |
| 12 | undo | i=2, val=3 | `[1]` | |
| 13 | undo | i=0, val=1 | `[]` | |
| 14 | choose | i=1, val=2 | `[2]` | |
| 15 | record | — | `[2]` | ✅ `[2]` |
| 16 | choose | i=2, val=3 | `[2,3]` | |
| 17 | record | — | `[2,3]` | ✅ `[2,3]` |
| 18 | undo | i=2, val=3 | `[2]` | |
| 19 | undo | i=1, val=2 | `[]` | |
| 20 | choose | i=2, val=3 | `[3]` | |
| 21 | record | — | `[3]` | ✅ `[3]` |
| 22 | undo | i=2, val=3 | `[]` | |

**এই ২২টা raw event-ই এক-এক স্টেপ বানান (এখানে consolidation দরকার নেই, ইতিমধ্যেই ছোট)।** প্রতিটা `record` স্টেপে `output.values`-এ নতুন entry যোগ হবে, `marks`-এ path-এর index-গুলো `active`।

**চূড়ান্ত output:** `[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]` (৮টা subset, ২ⁿ = ২³)।

### highlightLines নির্দেশনা

- `record` স্টেপ → লাইন ৪
- `choose` স্টেপ → লাইন ৬
- `explore`/recurse করা (backtrack কল) দেখানোর দরকার নেই আলাদা স্টেপে — `choose`-এর সাথেই বলুন "এখন recurse করবে"
- `undo` স্টেপ → লাইন ৮

---

## 7.2 N-Queens ও Board Puzzles

**Demo:** N-Queens — [LC 51](https://leetcode.com/problems/n-queens/), demo code অপরিবর্তিত:

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

লাইন নম্বর: ১=function, ২=res, ৩=board init, ৪-৬=cols/diag1/diag2 Set, ৭=place declare, ৮=if row===n, ৯=res.push, ১০=return, ১২=for col, ১৩-১৪=if constraint violated → continue, ১৫=cols.add, ১৬=diag1.add, ১৭=diag2.add, ১৮=board[row][col]="Q", ১৯=place(row+1) call, ২০=undo board, ২১-২৩=delete from sets।

### Scene kind: `matrix`

- `values`: `n×n` বোর্ড, প্রতি সেল `"."` বা `"Q"` (string)।
- `cursor`: বর্তমানে যে `(row, col)` পরীক্ষা হচ্ছে।
- `marks`: `"row,col"` কী দিয়ে — বসানো queen `done`, reject করা column `reject`।
- `table`: তিনটে Set একসাথে **একটাই টেবিলে না রেখে তিনটে আলাদা লাইনে `caption`-এ বা `vars`-এ** দেখান (যেমন `vars: [{name:"cols", value:"{0,2}"}, {name:"diag1", value:"{...}"}, {name:"diag2", value:"{...}"}]`) — `SceneAside`-এর `table` একটাই key→value প্যানেল দেখায়, তিনটে independent Set-এর জন্য `vars` বেশি স্বাভাবিক।
- `output`: `res`-এ জমা হওয়া সমাধান বোর্ডগুলো (স্ট্রিং আকারে, প্রতি সমাধান একটা লাইন — `output.values` array of strings, প্রতিটাতে `\n`-জোড়া রো)।

### Demo input

`n = 4` (workbook-এর নিজস্ব উদাহরণ)। ২টা সমাধান আছে: `[".Q..","...Q","Q...","..Q."]` ও `["..Q.","Q...","...Q",".Q.."]`।

### সম্পূর্ণ raw ট্রেস (৭৮টা event) — **consolidate করে ব্যবহার করুন**

Row-ভিত্তিক সারাংশ (script দিয়ে যাচাই করা):

1. **row 0, col 0** → place। board: `Q...`/`....`/`....`/`....`
2. row 1: col 0, 1 reject (একই column বা diagonal) → col 2 place। board যোগ: `Q...`/`..Q.`/`....`/`....`
3. row 2: col 0,1,2,3 **সবগুলো reject** (n=4-এ এই শাখায় কোনো valid col নেই) → **backtrack** row 1 থেকে undo।
4. row 1: col 3 place। board: `Q...`/`...Q`/`....`/`....`
5. row 2: col 0 reject, col 1 place। board: `Q...`/`...Q`/`.Q..`/`....`
6. row 3: col 0,1,2,3 সবগুলো reject → backtrack row 2 undo।
7. row 2: col 2,3 ও reject (আর কোনো column নেই) → backtrack row 1 undo (col 3 থেকে) → backtrack row 0 undo (col 0 থেকে)।
8. **row 0, col 1** → place। board: `.Q..`/`....`/`....`/`....`
9. row 1: col 0,1,2 reject → col 3 place। board: `.Q..`/`...Q`/`....`/`....`
10. row 2: col 0 place (একমাত্র valid)। board: `.Q..`/`...Q`/`Q...`/`....`
11. row 3: col 0,1 reject → col 2 place। board: `.Q..`/`...Q`/`Q...`/`..Q.`
12. **row 4 === n → SOLUTION ১:** `[".Q..","...Q","Q...","..Q."]` → `output.values`-এ যোগ।
13. backtrack row 3 (col 2 undo), col 3 reject → backtrack row 2 (col 0 undo)।
14. row 2: col 1,2,3 সবগুলো reject → backtrack row 1 (col 3 undo) → backtrack row 0 (col 1 undo)।
15. **row 0, col 2** → place। board: `..Q.`/`....`/`....`/`....`
16. row 1: col 0 place। board: `..Q.`/`Q...`/`....`/`....`
17. row 2: col 0,1,2 reject → col 3 place। board: `..Q.`/`Q...`/`...Q`/`....`
18. row 3: col 0 reject → col 1 place। board: `..Q.`/`Q...`/`...Q`/`.Q..`
19. **row 4 === n → SOLUTION ২:** `["..Q.","Q...","...Q",".Q.."]` → `output.values`-এ যোগ।
20. backtrack সব — row 3 (col 1 undo), col 2,3 reject → row 2 (col 3 undo), col 0,1,2 আবার reject করা হয়ে গেছে সব শেষ → row 1 (col 0 undo)।
21. row 1: col 1,2,3 reject → backtrack row 0 (col 2 undo)।
22. **row 0, col 3** → place। board: `...Q`/`....`/`....`/`....`
23. row 1: col 0 place। board: `...Q`/`Q...`/`....`/`....`
24. row 2: col 0,1 reject → col 2 place। board: `...Q`/`Q...`/`..Q.`/`....`
25. row 3: col 0,1,2,3 সবগুলো reject → backtrack row 2 (col 2 undo)।
26. row 2: col 3 reject → backtrack row 1 (col 0 undo)।
27. row 1: col 1 place। board: `...Q`/`.Q..`/`....`/`....`
28. row 2: col 0,1,2,3 সবগুলো reject → backtrack row 1 (col 1 undo)।
29. row 1: col 2,3 reject → backtrack row 0 (col 3 undo)। **সব শাখা শেষ, res-এ ২টা সমাধান।**

**এভাবে ২৯টা লাইনকেই ২৯টা স্টেপ বানান** — প্রতিটাতে board-এর `values`, `cursor`, আর কোন column reject হলো তার `marks`। এটা ৭৮-এর তুলনায় অনেক পড়ার-যোগ্য, আর দুটো সমাধানই স্পষ্ট মুহূর্ত হিসেবে দেখা যায়।

---

## 7.3 Word Search (Grid Backtracking)

**Demo:** Word Search — [LC 79](https://leetcode.com/problems/word-search/), demo code অপরিবর্তিত:

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

লাইন নম্বর: ১=function, ২-৩=m,n, ৪=dfs declare, ৫=if k===word.length, ৬=if বাউন্ডারি/char mismatch (৭ পর্যন্ত বিস্তৃত), ৮=board mark '#', ৯-১৩=চার দিকে dfs কল, ১৪=undo, ১৫=return found, ১৭-১৮=for লুপ, ১৯=return false।

### Scene kind: `matrix`

- `values`: বোর্ড, প্রতি সেল একটা char।
- `cursor`: বর্তমান `(i, j)`।
- `marks`: visited path `active` (এখনো recursion-এ আছে), মিলে যাওয়া শেষ path `done`, ব্যর্থ চেষ্টা `reject`।
- `vars`: `k` (word-এ কতদূর পৌঁছেছে), `word[k]` (এখন কোন char খুঁজছে)।

### Demo input (workbook-এর ডিফল্টের চেয়ে ছোট — ভিজ্যুয়ালাইজেশনের জন্য প্রস্তাবিত)

Workbook-এর ডিফল্ট (`3×4` বোর্ড, word `"ABCCED"`) সিমুলেশনে বড়। প্রস্তাবিত ছোট সংস্করণ:

```
board = [["A","B","C"],
         ["S","F","C"],
         ["A","D","E"]]
word  = "ABCC"
```

**এই ইনপুট বদলটা প্ল্যানের সিদ্ধান্ত, চূড়ান্ত নয় — চাইলে workbook-এর ডিফল্টই রাখতে পারেন, কিন্তু তাহলে স্টেপ সংখ্যা বাড়বে।**

### সম্পূর্ণ ট্রেস (script দিয়ে যাচাই করা, exact, ৯টা স্টেপ)

| # | event | (i,j) | k | note |
|---|---|---|---|---|
| 1 | visit | (0,0) | 0→1 | `'A'` মিলল, mark '#', k=1 |
| 2 | fail | (1,0) | 1 | নিচে `'S'` ≠ `'B'` |
| 3 | fail | (-1,0) | 1 | উপরে বাউন্ডারির বাইরে |
| 4 | visit | (0,1) | 1→2 | ডানে `'B'` মিলল, mark '#', k=2 |
| 5 | fail | (1,1) | 2 | নিচে `'F'` ≠ `'C'` |
| 6 | fail | (-1,1) | 2 | উপরে বাউন্ডারির বাইরে |
| 7 | visit | (0,2) | 2→3 | ডানে `'C'` মিলল, mark '#', k=3 |
| 8 | visit | (1,2) | 3→4 | নিচে `'C'` মিলল, mark '#', k=4 |
| 9 | complete | (2,2) | 4 | `k === word.length` → **true**, path = (0,0)→(0,1)→(0,2)→(1,2) |

**`fail` স্টেপগুলোয় undo/backtrack দরকার নেই দেখানো** (dfs সেই দিকে কখনো board mark করেনি — mismatch সরাসরি ধরা পড়েছে)। শুধু `visit` স্টেপে `marks[i,j]='active'`, আগের visited cell-গুলো `done` রাখুন যাতে পুরো path একসাথে দেখা যায়।

---

## যাচাই (implement করার পর)

```bash
cd d:\document-files\dsa_prep
npx tsc --noEmit
npx eslint app --ext .ts,.tsx
npx next build
```

তিনটাই ক্লিন পাস করা বাধ্যতামূলক (এই কনভেনশন পুরো প্রজেক্টে অলঙ্ঘনীয়)।

## শেষে যা আপডেট করবেন

- `app/lib/simulations/index.ts` — তিনটা নতুন import + `ALL` array-তে যোগ
- `context/progress-tracker.md` — "✅ সম্প্রতি সম্পন্ন" সেকশনে টপিক ৭-এর এন্ট্রি
- `context/ui-registry.md` — নতুন কিছু না লাগলে (এই টপিকে নতুন renderer নেই) স্পর্শ করার দরকার নেই
