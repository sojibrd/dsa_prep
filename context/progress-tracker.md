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
| 5. Trees | + `tree` | 0/? | ⏳ বাকি |
| 7. Backtracking | `tree` | 0/? | ⏳ বাকি |
| 8. Graphs | + `graph` | 0/? | ⏳ বাকি |
| 9. Dynamic Programming | `matrix` | 0/? | ⏳ বাকি |
| 10. Greedy, Trie & Design | + `trie` | 0/? | ⏳ বাকি |

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

## 🔄 বর্তমানে চলমান

_টপিক ৫ (Trees) শুরুর অপেক্ষায় — নতুন `tree` scene kind আনবে।_

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
