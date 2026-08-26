# Progress Tracker — DSA Prep Tracker

_সর্বশেষ আপডেট: ২০২৬-০৮-২৬_

---

## ✅ সম্পন্ন কাজ (v1 MVP)

### Core Infrastructure
- [x] Next.js App Router সেটআপ (বর্তমানে ১৬.২, Turbopack)
- [x] TypeScript কনফিগারেশন
- [x] Tailwind CSS v4 ইন্টিগ্রেশন
- [x] Geist font (Sans + Mono) লোড
- [x] `globals.css` — CSS custom properties (design tokens)

### Data Layer
- [x] `dsa-workbook.md` — ১০টা টপিক, ৫১টা প্যাটার্ন, ৯১টা প্র্যাকটিস প্রবলেম
- [x] `dsaParser.ts` — Markdown পার্সার (Topic → Pattern → Problem)
- [x] `useLocalStorage.ts` — Custom hook

### UI Components
- [x] **Navbar** — logo, progress pill, dark mode toggle
- [x] **Sidebar** — topic list + per-topic progress counter + pattern buttons
- [x] **Mobile Progress Dashboard** — circular progress ring
- [x] **Pattern Header** — topic breadcrumb + pattern name
- [x] **Recognize Box** — "চিনবেন কীভাবে" card
- [x] **Demo Section** — demo name + LeetCode link + approach + code block + complexity
- [x] **Copy Button** — code block-এ hover-এ কপি বাটন
- [x] **Problem Card** — checkbox, name (LeetCode link), Must-do/Bonus badge, Notes toggle
- [x] **Notes Section** (expandable) — "আমার সমাধান" + "যে সমস্যা হয়েছিল" textarea

### Features
- [x] Solve/Unsolved toggle (localStorage persist)
- [x] Per-problem notes (localStorage persist)
- [x] Dark/Light mode (localStorage persist, `document.documentElement.classList`)
- [x] Overall progress calculation + percentage display
- [x] Per-topic progress calculation

---

## ✅ সম্প্রতি সম্পন্ন (Mobile Responsive)

- [x] **Mobile Responsive Sidebar** — Hamburger menu + slide-in drawer (left)
- [x] **Body scroll lock** — drawer খোলা থাকলে body scroll বন্ধ
- [x] **Drawer auto-close** — pattern select করলে drawer বন্ধ হয়
- [x] **Responsive navbar** — mobile-এ compact, progress pill hidden
- [x] **Problem card** — mobile-এ vertical stack layout
- [x] **Slide-in animation** — `animate-slide-in-left` CSS animation

## 🎬 Pattern Simulation (চলমান — টপিক ধরে ধরে)

`implementation-plan/`-এর ৯টা প্ল্যান ডকুমেন্ট ধরে ক্রমান্বয়ে implement হচ্ছে। প্রতি টপিক = এক কমিট।
> টপিক ৬ (Heaps) ইচ্ছাকৃতভাবে বাদ — workbook-এ ওই টপিকের সোর্স ডেটা নেই।

### ✅ ভিত্তি (টপিক ১-এ একবারই বানানো হয়েছে)
- [x] `app/lib/simulations/types.ts` — Scene কনট্র্যাক্ট (`Scene` / `SimStep` / `PatternSimulation`)
- [x] `app/hooks/usePatternSim.ts` — টাইমলাইন ইঞ্জিন (play/pause/step/scrub/speed, শেষে থামে)
- [x] `app/components/simulation/` — ৯টা কম্পোনেন্ট (SceneView, ArrayScene, MatrixScene, IntervalsScene, SceneAside, CodePane, ExplainPanel, SimControls, SimulationBlock)
- [x] `app/lib/simulations/index.ts` — `getSimulation()` sparse lookup
- [x] Theme — `--t-sim-*` টোকেন পরিবার + `sim-*`/`codeline` role class; নতুন `cyan` প্যালেট এন্ট্রি (`fill` = জমা রাশি)
- [x] `PatternPanel`-এ demo সেকশনের পরে জোড়া লাগানো

### টপিকভিত্তিক অবস্থা

| টপিক | scene kind | প্যাটার্ন | অবস্থা |
|---|---|---|---|
| 1. Arrays & Strings | `array` `matrix` `intervals` | ৭/৭ | ✅ সম্পন্ন |
| 2. Binary Search | `array` (পুনর্ব্যবহার) | ৪/৪ | ✅ সম্পন্ন |
| 3. Linked Lists | + `linked-list` | ৩/৩ | ✅ সম্পন্ন |
| 4. Stacks & Queues | `array` (পুনর্ব্যবহার) | ৪/৪ | ✅ সম্পন্ন |
| 5. Trees | + `tree` | ৫/৫ | ✅ সম্পন্ন |
| 7. Backtracking | `array` `matrix` (পুনর্ব্যবহার) | ৩/৩ | ✅ সম্পন্ন |
| 8. Graphs | + `graph` | ৭/৭ | ✅ সম্পন্ন |
| 9. Dynamic Programming | `array` `matrix` (+ `matrix.pointers`) | ১১/১১ | ✅ সম্পন্ন |
| 10. Greedy, Trie & Design | + `trie` | ৩/৩ | ✅ সম্পন্ন |

### ✅ টপিক ১ — Arrays & Strings (সম্পন্ন)

| প্যাটার্ন | Demo | scene | ধাপ | উত্তর |
|---|---|---|---|---|
| 1.1 Two Pointers | Trapping Rain Water (LC 42) | `array` (bar মোড) | 13 | `6` |
| 1.2 Sliding Window | Minimum Window Substring (LC 76) | `array` + window | 28 | `"BANC"` |
| 1.3 Prefix Sum | Subarray Sum Equals K (LC 560) | `array` + table | 5 | `2` |
| 1.4 Hashing | Longest Consecutive Sequence (LC 128) | `array` + table | 8 | `4` |
| 1.5 Merge Intervals | Merge Intervals (LC 56) | `intervals` | 5 | `[[1,6],[8,10],[15,18]]` |
| 1.6 Kadane's | Maximum Subarray (LC 53) | `array` + subValues | 10 | `6` |
| 1.7 Matrix Traversal | Spiral Matrix (LC 54) | `matrix` + bounds | 11 | `[1,2,3,6,9,8,7,4,5]` |

সব ট্রেস node script দিয়ে চালিয়ে যাচাই করা। `tsc --noEmit`, `eslint app`, `next build` — তিনটাই ক্লিন।

### ✅ টপিক ২ — Binary Search (সম্পন্ন)

কোনো নতুন কম্পোনেন্ট বা scene kind লাগেনি — চারটাই `array` scene পুনর্ব্যবহার করে।

| প্যাটার্ন | Demo | সারিতে কী আঁকা | ধাপ | উত্তর |
|---|---|---|---|---|
| 2.1 Basic Binary Search | Find First and Last Position (LC 34) | `nums` | 9 | `[3, 4]` |
| 2.2 Search on Answer | Koko Eating Bananas (LC 875) | **candidate speed 1‥11** | 6 | `4` |
| 2.3 Allocation | Split Array Largest Sum (LC 410) | **candidate cap 10‥32** | 6 | `18` |
| 2.4 Rotated Array | Search in Rotated Sorted Array (LC 33) | `nums` | 5 | `4` |

**সিদ্ধান্ত — 2.2/2.3-এ সারিটা input array নয়, উত্তরের পরিসর।** প্ল্যান দুটো বিকল্প দিয়েছিল; `values = piles` রেখে lo/hi/mid দেখালে তিনটে pointer এমন একটা array-র উপর বসত যাকে তারা index-ই করে না — এই প্যাটার্নের সবচেয়ে চেনা বিভ্রান্তিটাই। তাই সারিতে আঁকা হয় candidate speed/cap, আর input array পাশের `table`-এ (2.2-তে প্রতি pile-এ কত ঘণ্টা লাগছে সেটাসহ)। cell index = `মান − সর্বনিম্ন মান`।

**2.1-এ দুই pass এক টাইমলাইনে** — মাঝে একটা হ্যান্ড-অফ স্টেপ ("এখন শেষ occurrence খুঁজব"), নইলে দ্বিতীয় pass শুরু হওয়াটা অকারণে আবার শুরু করা মনে হয়।

**2.4-এ `done` = সাজানো অর্ধেক** (বাদ পড়া অংশ নয় — সেটা `reject`)। সিদ্ধান্তটা সবসময় সাজানো অর্ধেক থেকেই নেওয়া হয়, তাই ওটাই চোখে পড়া দরকার।

### ✅ টপিক ৩ — Linked Lists (সম্পন্ন)

**নতুন scene kind `linked-list`** — `Scene` union প্রথমবার বাড়ল।

| প্যাটার্ন | Demo | ধাপ | উত্তর |
|---|---|---|---|
| 3.1 Fast & Slow Pointers | Linked List Cycle II (LC 142) | 8 | মান 2-এর নোড |
| 3.2 Dummy Node | Merge Two Sorted Lists (LC 21) | 8 | `[1,1,2,3,4,4]` |
| 3.3 In-Place Reversal | Reverse Nodes in k-Group (LC 25) | 9 | `[2,1,4,3,5]` |

**সিদ্ধান্ত — `nodes` লেআউট ক্রম, চেইন ক্রম নয়।** 3.3-এ নোডগুলো পুরো রান জুড়ে মূল অবস্থানেই বসানো, তাই ঘুরে যাওয়া তীর `↳` হিসেবে দেখা যায়। প্রতি স্টেপে চেইন-ক্রমে সাজিয়ে দিলে তীরগুলো সবসময় ঝকঝকে সোজা থাকত আর ঠিক যে জিনিসটা দেখার — pointer পেছনে ঘুরে গেছে — সেটাই লুকিয়ে যেত। শুধু শেষ স্টেপে চেইন-ক্রমে সাজানো, ফলাফলটা লিস্ট হিসেবে পড়ার জন্য।

**cycle আঁকা হয়েছে rail দিয়ে, বাঁকানো তীর দিয়ে নয়** — প্রতি নোডের নিচে এক টুকরো segment, target থেকে tail পর্যন্ত জ্বলে। কম্পোনেন্টকে একটাও স্থানাঙ্ক হিসাব করতে হয় না, তবু rail ঠিক জায়গায় বসে।

**3.2-এ চেইনটা ফলাফল, ইনপুট নয়** — একসাথে তিনটে লিস্ট (দুটো কমতে থাকা ইনপুট + একটা বাড়তে থাকা আউটপুট) এক চেইনে সৎভাবে দেখানো যায় না। তাই আঁকা হয় আউটপুট, আর বাকি ইনপুট যায় পাশের `table`-এ।

> ⚠️ **প্ল্যান ডকুমেন্টের লাইন নম্বর সংশোধন** — `3-linked-lists.md`-এ 3.3-এর লাইন ম্যাপ লাইন ৭ থেকে এক ঘর পিছিয়ে আছে (`if (count < k)` আসলে লাইন ৮, `return prev` লাইন ১৭)। 3.1-এও `return p` লাইন ১৪, ১৩ নয়। কোড ফেন্স থেকে গুনে যাচাই করা মান ব্যবহার করা হয়েছে।

### ✅ টপিক ৪ — Stacks & Queues (সম্পন্ন)

নতুন কিছু লাগেনি — চারটাই `array` scene + `table` side panel।

| প্যাটার্ন | Demo | সারিতে কী | ধাপ | উত্তর |
|---|---|---|---|---|
| 4.1 Monotonic Stack | Largest Rectangle in Histogram (LC 84) | heights (bar) + sentinel | 15 | `10` |
| 4.2 Parentheses | Longest Valid Parentheses (LC 32) | `s`-এর অক্ষর | 8 | `4` |
| 4.3 Design (Min Stack) | Min Stack (LC 155) | **কলের ক্রম** | 9 | `-3, 0, -2` |
| 4.4 Monotonic Deque | Sliding Window Maximum (LC 239) | `nums` | 23 | `[3,3,5,5,6,7]` |

**সিদ্ধান্ত — 4.1-এ sentinel আসল cell হিসেবে আঁকা।** কোডের `h = i === length ? 0 : heights[i]` আক্ষরিক অর্থেই শেষে একটা শূন্য-উচ্চতার বার। সেটা সারিতে না দেখালে শেষ তিনটে pop দেখে মনে হতো লুপ array-র বাইরে চলে গেছে; দেখালে বোঝা যায় sentinel-ই স্ট্যাক খালি করাচ্ছে।

**4.3-এ সারিটা কলের ক্রম** — এখানে কোনো array স্ক্যান হচ্ছে না, একটা API-র কল-সিকোয়েন্স চলছে। তাই cursor কলের তালিকা ধরে হাঁটে, আর আসল গল্প (`[value, minSoFar]` জোড়া) থাকে `table`-এ। 2.2/2.3-এর মতোই নিয়ম: `values` মানেই input array নয়।

**4.1-এ `window` = আয়তক্ষেত্রের প্রস্থ**, 4.2-এ = বৈধ অংশের বিস্তার, 4.4-এ = আসল sliding window। একই role, তিন রকম অর্থ — প্রতিবার `label`-এ স্পষ্ট বলা।

> ⚠️ **প্ল্যান ডকুমেন্টের লাইন নম্বর সংশোধন** — `4-stacks-queues.md`-এ 4.3-এর ম্যাপ লাইন ৮ থেকে পিছিয়ে আছে (`pop()` আসলে ৯, `top()` ১২, `getMin()` ১৫)। বাকি তিনটে প্যাটার্নের ম্যাপ ঠিক আছে।

### ✅ টপিক ৫ — Trees (সম্পন্ন)

**নতুন scene kind `tree`** — SVG, layout **হিসাব করা** (in-order → x, depth → y)।

| প্যাটার্ন | Demo | দিক | ধাপ | উত্তর |
|---|---|---|---|---|
| 5.1 Traversal | Zigzag Level Order (LC 103) | BFS, level ধরে | 5 | `[[3],[20,9],[15,7]]` |
| 5.2 Construction | Build from Preorder+Inorder (LC 105) | গাছ গড়ে ওঠে | 7 | `3(9, 20(15, 7))` |
| 5.3 Path Sum | Max Path Sum (LC 124) | post-order (নিচ→উপর) | 7 | `42` |
| 5.4 Validation | Validate BST (LC 98) | pre-order (উপর→নিচ) | 5 | `false` |
| 5.5 LCA | LCA of Binary Tree (LC 236) | post-order সংকেত | 5 | `3` |

**সিদ্ধান্ত — layout ডেটায় নয়, renderer-এ।** প্ল্যানের যুক্তিই মানা হয়েছে: React Flow আনলে ≤৭ নোডের গাছের জন্য pan/zoom/minimap-এর ওজন আসত, আর প্রতিটা নোডের `{x,y}` ট্রেস ফাইলে হাতে লিখতে হতো — Scene কনট্র্যাক্টের মূল নিয়ম ভেঙে। এখন in-order traversal কলাম ঠিক করে, depth সারি — কোনো ট্রেস ফাইল একটাও স্থানাঙ্ক জানে না। এর ফলেই 5.2-এর অর্ধেক-তৈরি গাছ বিনা কষ্টে সঠিক জায়গায় বসে।

**`annotation` তিন রকম কাজে** — 5.3-এ parent-কে পাঠানো gain, 5.4-এ অনুমোদিত `(min, max)` জানালা, 5.5-এ কোন target পাওয়া গেল। প্রতিবার নোডের নিচে ছোট cyan টেক্সট।

**দিক বদল স্পষ্ট রাখা হয়েছে** — 5.3 post-order (উত্তর নিচ থেকে উপরে ওঠে), 5.4 pre-order (সীমা উপর থেকে নিচে নামে)। `highlightLines`-ও সেভাবে: 5.3-এ leaf ধাপে base-case লাইন আলাদা।

> ⚠️ **প্ল্যান সংশোধন** — `5-trees.md`-এ 5.3-এর ট্রেস টেবিলে root-এর "parent-কে ফেরত" লেখা 24; আসলে `-10 + max(9, 35) = 25`। চূড়ান্ত উত্তর 42 ঠিকই আছে। লাইন ম্যাপ পাঁচটাই সঠিক।

### ✅ টপিক ৭ — Backtracking (সম্পন্ন)

নতুন কিছু লাগেনি — `array` ও `matrix` পুনর্ব্যবহার (প্ল্যান `tree` অনুমান করেছিল, কিন্তু তিনটে demo-র কোনোটাই গাছ নয়)।

| প্যাটার্ন | Demo | scene | ধাপ | উত্তর |
|---|---|---|---|---|
| 7.1 Subsets | Subsets (LC 78) | `array` | 24 | ৮টা subset |
| 7.2 N-Queens | N-Queens (LC 51) | `matrix` | 29 | ২টা সমাধান |
| 7.3 Word Search | Word Search (LC 79) | `matrix` | 11 | `true` |

**সিদ্ধান্ত — 7.2-এর consolidation স্ক্রিপ্টে করা, হাতে নয়।** raw recursion-এ ৭৮টা event; প্ল্যান হাতে গুনে ২৯ লাইনে নামিয়েছিল। আমি একটা script লিখে যান্ত্রিকভাবে consolidate করেছি (পরপর reject-গুলো তার পরের placement-এ মিশে যায়, আর যে undo-চেইনের পরে চেষ্টা করার কিছু নেই সেটা এক backtrack-এ) — ফল ২৭টা event, আর প্রতিটার board ও তিনটে Set-এর অবস্থা কোড চালিয়ে পাওয়া, হাতে লেখা নয়।

**7.3-এ ছোট input** — প্ল্যানের প্রস্তাব মেনে workbook-এর 3×4 / `"ABCCED"`-এর বদলে 3×3 / `"ABCC"`। এতে ব্যর্থ probe-গুলোও (bounds ও mismatch) আলাদা ধাপ হিসেবে দেখানো গেছে, যা grid DFS-এ শেখার মূল অংশ।

**7.1-এ কোনো consolidation নয়** — ২২টা raw event-ই ২২টা ধাপ। নাও → গভীরে যাও → ফেরত দাও, এই তালটাই তো প্যাটার্ন; গুটিয়ে ফেললে সেটাই হারায়।

### ✅ টপিক ৮ — Graphs (সম্পন্ন)

**নতুন scene kind `graph`** — SVG, নোড বৃত্তে সমান কোণে, layout হিসাব করা।

| প্যাটার্ন | Demo | scene | ধাপ | উত্তর |
|---|---|---|---|---|
| 8.1 BFS/DFS Grid | Number of Islands | `matrix` | 8 | `2` |
| 8.2 Cycle Detection | Course Schedule | `graph` | 11 | `false` |
| 8.3 Topological Sort | Course Schedule II | `graph` | 14 | `[0,1,2,3]` |
| 8.4 Union Find | Redundant Connection | `array` | 8 | `[2,3]` |
| 8.5 Bipartite | Is Graph Bipartite? | `graph` | 6 | `true` |
| 8.6 Dijkstra | Network Delay Time | `graph` | 9 | `2` |
| 8.7 MST | Min Cost to Connect All Points | `graph` | 8 | `13` |

**সিদ্ধান্ত — role class `sim-graph-*`, প্ল্যানের `sim-node` নয়।** প্ল্যান `.sim-node`/`.sim-edge` প্রস্তাব করেছিল, কিন্তু `.sim-node` টপিক ৩-এ লিংকড লিস্টের নোডে দখল হয়ে গেছে। দুটো আলাদা আকৃতি এক ক্লাসে সাড়া দিলে থিম পড়া অসম্ভব হতো, তাই `TreeScene`-এর `sim-tree-*` ধাঁচেই `sim-graph-*`।

**arrowhead polygon, SVG `marker` নয়** — marker নির্ভরযোগ্যভাবে line-এর stroke রং উত্তরাধিকার পায় না। edge amber হয়ে গেলেও তীরের মাথা ধূসর থেকে গেলে ভুল বার্তা যেত, তাই তীর হিসাব করে polygon হিসেবে আঁকা।

**8.1 ও 8.4 ইচ্ছাকৃতভাবে `graph`-এ যায়নি।** গ্রিড নিজেই একটা গ্রাফ, কিন্তু ৯টা ঘরকে বৃত্তে সাজালে ঠিক যে adjacency-র উপর অ্যালগরিদম দাঁড়িয়ে সেটাই হারাত। আর Union-Find-এর অবস্থা একটা `parent[]` array — সারিতে দেখলে এক নজরে পড়া যায়, node-link ছবিতে প্রতিবার লেআউট নতুন করে বুঝতে হতো।

**8.5-এ দুই রঙ = দুই বিদ্যমান mark** — `+1` → `active` (amber), `−1` → `done` (সবুজ)। নতুন পঞ্চম mark উদ্ভাবনের দরকার পড়েনি, আর amber-বনাম-সবুজ এমনিতেই "দুই দল" হিসেবে পড়ে।

> ⚠️ **প্ল্যান সংশোধন** — `8-graphs.md`-এ 8.3-এর লাইন ম্যাপ পুরোটা +১ শিফটেড (`queue` init আসলে লাইন ৮, ৯ নয়), আর 8.6-এর উত্তর-লাইন ১৮‑১৯, ১৭‑১৮ নয়। 8.6-এর `MinHeap` ক্লাসটা workbook-এ অনুপস্থিত টপিক ৬-এ সংজ্ঞায়িত হওয়ার কথা ছিল; কোড অপরিবর্তিত রেখে heap-কে `[dist, node]`-এর sorted তালিকা হিসেবে `table`-এ দেখানো হয়েছে, প্ল্যানের নির্দেশমতো।

### ✅ টপিক ৯ — Dynamic Programming (সম্পন্ন)

নতুন scene kind লাগেনি — `MatrixScene`-এ একটা ছোট এক্সটেনশন (`pointers`) ছাড়া সবই বিদ্যমান।

| প্যাটার্ন | Demo | scene | ধাপ | উত্তর |
|---|---|---|---|---|
| 9.1 Fibonacci | Climbing Stairs | `array` | 6 | `8` |
| 9.2 0/1 Knapsack | Partition Equal Subset Sum | `array` | 7 | `true` |
| 9.3 Unbounded Knapsack | Coin Change | `array` | 15 | `2` |
| 9.4 LCS | Longest Common Subsequence | `matrix` | 8 | `2` |
| 9.5 LIS | LIS (patience sorting) | `array` | 10 | `4` |
| 9.6 Edit Distance | Edit Distance | `matrix` | 11 | `1` |
| 9.7 House Robber | House Robber | `array` | 7 | `12` |
| 9.8 Grid Paths | Unique Paths | `matrix` | 6 | `6` |
| 9.9 Interval DP | Burst Balloons | `matrix` + `pointers` | 18 | `35` |
| 9.10 State Machine | Stock with Cooldown | `array` | 7 | `3` |
| 9.11 Bitmask | Partition to K Equal Sum Subsets | `array` | 9 | `true` |

**নতুন: `MatrixScene.pointers`** — শুধু ৯.৯-এর জন্য। Burst Balloons-এ একসাথে তিনটে অবস্থান গুরুত্বপূর্ণ (`l`, `r`, `k`), আর একটামাত্র নামহীন `cursor` দিয়ে বলা যায় না কোনটা কোনটা। `cursor` অপরিবর্তিত রাখা হয়েছে — বাকি সব matrix প্যাটার্ন সেটাই ব্যবহার করে।

**সিদ্ধান্ত — কোড 1D, দৃশ্য 2D (৯.১, ৯.৮)।** দুটো প্যাটার্নেই কোড space-optimized rolling array রাখে, কিন্তু scene পুরো টেবিল দেখায়। এটা ইচ্ছাকৃত বিমূর্তকরণ: rolling array আসলে পুরো টেবিলেরই একটা ছাঁটা রূপ, আর পুনরাবৃত্তি সূত্রটা (`dp[i-1] + dp[i-2]`, বা "উপর + বাঁ") টেবিল ছাড়া চোখে পড়ে না। কোড অপরিবর্তিত।

**যেসব iteration কিছু বদলায় না, সেগুলো ধাপ নয় (৯.২)।** ভেতরের লুপ প্রতি আইটেমে target বার চলে, কিন্তু মাত্র ৫ বার `false` → `true` হয়। বাকিগুলো ধাপ বানালে বিশটা অভিন্ন ফ্রেম হতো।

**`vars` বনাম `subValues`** — প্ল্যানের নিয়ম মানা হয়েছে: ৯.৭-এর `robbed`/`skipped` ও ৯.১০-এর `hold`/`sold`/`rest` running scalar, তাই `vars`-এ। `subValues` কেবল তখনই, যখন প্রতিটা index-এর নিজস্ব দ্বিতীয় মান আছে (যেমন Kadane-এর `cur`)।

> ⚠️ **workbook ডেটা সমস্যা (ফ্ল্যাগ করা, ঠিক করা হয়নি)** — `9.4 Longest Common Subsequence LCS.md`-এর পাশে একটা URL-encoded ডুপ্লিকেট ফাইল আছে (`9.4%20Longest%20...md`), যাতে বেশি সম্পূর্ণ কনটেন্ট। parser শুধু সঠিক-নামের ফাইলটা পড়ে, তাই অ্যাপে ৯.৪-এর demo statement অনুপস্থিত। এটা ডেটা-হাইজিনের কাজ, সিমুলেশন ফিচারের অংশ নয় — প্ল্যানও তা-ই বলেছে।

### ✅ টপিক ১০ — Greedy, Trie & Design (সম্পন্ন)

**নতুন scene kind `trie`** — শেষ সংযোজন, `Scene` union এখন ৭ সদস্যের।

| প্যাটার্ন | Demo | scene | ধাপ | উত্তর |
|---|---|---|---|---|
| 10.1 Greedy | Candy | `array` + subValues | 5 | `8` |
| 10.2 Trie | Implement Trie | **`trie`** | 8 | `true, false, true` |
| 10.3 Design | LRU Cache | `linked-list` | 6 | `[1:1, 3:3]` |

**কেন `TreeScene` যথেষ্ট নয়** — trie নোডে ২৬ পর্যন্ত সন্তান হতে পারে, আর সবচেয়ে গুরুত্বপূর্ণ তথ্যটা (অক্ষর) থাকে **edge-এ, নোডে নয়**। `TreeScene`-এ edge-এ কোনো label নেই, আর label ছাড়া trie নিছক কতগুলো বৃত্তের ছড়ানো। layout কৌশল অবশ্য অভিন্ন — হিসাব করা x/y, n-ary: leaf পরের কলাম নেয়, parent তার সন্তানদের উপরে কেন্দ্রে বসে।

**`isEnd` = ভেতরের সবুজ বৃত্ত, রং নয়** — কারণ নোডের নিজের `data-mark` ততক্ষণে walk-এর অবস্থা বলছে। দুটো আলাদা তথ্য, তাই দুটো আলাদা ভিজ্যুয়াল চ্যানেল।

**10.3-এ নতুন কিছু লাগেনি** — `Map`-এর insertion order-ই recency, আর সেটা আক্ষরিক অর্থেই একটা chain (সামনে LRU, পেছনে MRU)। `LinkedListScene` ঠিক সেটাই আঁকে।

**10.1-এ `subValues` = ratings** — Kadane-এর `cur`-এর মতোই বৈধ ব্যবহার: প্রতিটা index-এর নিজস্ব দ্বিতীয় মান, running scalar নয়। সারিতে `candies` (যা বদলায়), নিচে `ratings` (যা স্থির)।

> ⚠️ **প্ল্যান সংশোধন** — `10-greedy-trie-design.md`-এ 10.2-এর লাইন ম্যাপ ৯ থেকে এক ঘর পিছিয়ে (`search` আসলে লাইন ১০, `startsWith` ১৪, `_walk` ১৭), আর 10.3-এ ১২ থেকে (`put` আসলে লাইন ১৩)। কোড ফেন্স থেকে গুনে যাচাই করা মান ব্যবহার করা হয়েছে।

---

## 🎉 সিমুলেশন ফিচার সম্পূর্ণ

**৪৭টা সিমুলেশন, ৯টা টপিক** (টপিক ৬ বাদে, যার সোর্স ডেটা workbook-এ নেই)।

**৭টা scene kind:** `array` `matrix` `intervals` `linked-list` `tree` `graph` `trie`
**১৩টা কম্পোনেন্ট:** SceneView + ৭টা renderer + SceneAside, CodePane, ExplainPanel, SimControls, SimulationBlock
**১টা হুক:** `usePatternSim`

প্রতিটা টপিকের প্রতিটা ট্রেস demo code চালিয়ে যাচাই করা, হাতে লেখা নয়। প্রতি টপিকে `tsc --noEmit`, `eslint app`, `next build` — তিনটাই ক্লিন।

### যে নিয়মগুলো টিকে গেছে

1. **ট্রেস ডেটা renderer-এর কিছুই জানে না** — ৪৭টা ফাইলের একটাতেও কোনো স্থানাঙ্ক, রং বা CSS ক্লাস নেই। tree, graph ও trie-র layout সম্পূর্ণ হিসাব করা।
2. **`scene.kind`-এ switch একমাত্র `SceneView`-এ** — সাতবার scene kind যোগ হয়েছে, প্রতিবার ঠিক একটা case।
3. **`values` = যার উপর দিয়ে cursor হাঁটে**, স্বয়ংক্রিয়ভাবে input array নয় (2.2/2.3 উত্তরের পরিসর, 4.3 কলের ক্রম, 9.5 `tails`)।
4. **যা বদলায় না, তা ধাপ নয়** — 9.2, 10.1-এ শুধু পরিবর্তনকারী iteration; 7.2-এ ৭৮ event থেকে ২৭।

## 🔄 বর্তমানে চলমান

_কিছু নেই — সিমুলেশন ফিচার সম্পূর্ণ।_

---

## ⏳ বাকি কাজ (v2 পরিকল্পনা)

### High Priority
- [ ] **Search/Filter** — প্রবলেম বা প্যাটার্ন নাম দিয়ে খোঁজা
- [ ] **Filter by status** — unsolved / Must-do only toggle
- [ ] **Keyboard navigation** — `j/k` pattern switch
- [ ] **App metadata** — proper title ("DSA Practice Workbook"), favicon

### Medium Priority
- [ ] **Export progress** — JSON ডাউনলোড
- [ ] **Import progress** — JSON ইম্পোর্ট
- [ ] **Solved date tracking** — কোন তারিখে সলভ হয়েছিল

### Low Priority
- [ ] **Syntax highlighting** — Prism.js বা Shiki
- [x] **Mobile responsive sidebar** — slide-in drawer ✅
- [ ] **Confetti** — topic 100% complete হলে
- [ ] **Streak counter**

---

## 🐛 পরিচিত সমস্যা / টেকনিক্যাল ঋণ

| সমস্যা | প্রভাব | সমাধানের পথ |
|--------|--------|------------|
| `layout.tsx`-এ metadata এখনো default ("Create Next App") | SEO খারাপ | `metadata` object আপডেট করুন |
| `dsa-workbook.md`-এ cross-ref এন্ট্রিগুলো (যেমন `_দেখুন **8.1**_`) পার্স হয় না | কিছু problem card-এ notesLabel অদ্ভুত দেখায় | parser-এ cross-ref detect করে skip করা |
| ~~Mobile-এ sidebar উপরে-নিচে স্ক্যাক হয়~~ | ~~Mobile ব্যবহারকারীর অভিজ্ঞতা খারাপ~~ | ✅ সমাধান হয়েছে — slide-in drawer |

---

## 📊 DSA Practice Progress

| টপিক | মোট | সলভ | অবস্থা |
|------|------|-----|--------|
| Arrays & Strings | 27 | 0 | 🔴 শুরু হয়নি |
| Binary Search | 7 | 7 | 🟢 সম্পন্ন |
| Linked Lists | 6 | 6 | 🟢 সম্পন্ন |
| Stacks & Queues | 7 | 0 | 🔴 শুরু হয়নি |
| Trees | 11 | 0 | 🔴 শুরু হয়নি |
| Heaps | 5 | 0 | 🔴 শুরু হয়নি |
| Backtracking | 3 | 0 | 🔴 শুরু হয়নি |
| Graphs | 11 | 0 | 🔴 শুরু হয়নি |
| Dynamic Programming | 9 | 0 | 🔴 শুরু হয়নি |
| Greedy, Trie & Design | 5 | 0 | 🔴 শুরু হয়নি |
| **মোট** | **91** | **13** | **14%** |

> এই টেবিল ম্যানুয়ালি আপডেট করুন অথবা app-এর UI থেকে দেখুন।
