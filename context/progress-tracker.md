# Progress Tracker — DSA Prep Tracker

_সর্বশেষ আপডেট: ২০২৬-০৮-২৫_

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

## ✅ সম্প্রতি সম্পন্ন (Pattern Simulation — ভিত্তি)

- [x] **Scene কনট্র্যাক্ট** — `app/lib/simulations/types.ts` (Scene / SimStep / PatternSimulation)
- [x] **Timeline engine** — `usePatternSim` (play/pause/step/scrub/speed, banked clock)
- [x] **`ArrayScene`** — cell ও bar মোড, pointer, window, জমা রাশি (fill)
- [x] **`CodePane`** — demo code, চলমান লাইন হাইলাইট + auto-scroll
- [x] **`ExplainPanel` + `SimControls`**
- [x] **`SimulationBlock`** — PatternPanel-এ ভাঁজ করা, fullscreen টগল (Escape + scroll lock)
- [x] **Theme** — `sim-*` role class ও টোকেন পরিবার
- [x] **টপিক ১ সম্পূর্ণ** — `1.1`–`1.7`, ৭টাই simulation সহ:
  - `1.1` Two Pointers (Trapping Rain Water, bar মোড)
  - `1.2` Sliding Window (Minimum Window Substring, hashmap টেবিল)
  - `1.3` Prefix Sum (Subarray Sum Equals K, hashmap টেবিল)
  - `1.4` Hashing (Longest Consecutive Sequence, Set টেবিল)
  - `1.5` Merge Intervals — **নতুন scene kind `intervals`**
  - `1.6` Kadane's Algorithm (subValues দিয়ে চলমান `cur`)
  - `1.7` Matrix Traversal — **নতুন scene kind `matrix`**, boundary frame

## 🔄 বর্তমানে চলমান

_টপিক ১, ২ ও ৩ সম্পূর্ণ — পরবর্তী: টপিক ৪ (Stacks & Queues) থেকে শুরু, সাথে `StackScene` দরকার অনুযায়ী।_

---

## ⏳ বাকি কাজ (v2 পরিকল্পনা)

### High Priority
- [ ] **Search/Filter** — প্রবলেম বা প্যাটার্ন নাম দিয়ে খোঁজা
- [ ] **Filter by status** — unsolved / Must-do only toggle
- [ ] **Keyboard navigation** — `j/k` pattern switch
- [ ] **App metadata** — proper title ("DSA Practice Workbook"), favicon

### Simulation (নতুন)
- [x] `1.1`–`1.7` — টপিক ১ সম্পূর্ণ (`ArrayScene`, `MatrixScene`, `IntervalsScene` তিনটাই যাচাই হয়ে গেছে)
- [x] `2.1`–`2.4` — টপিক ২ সম্পূর্ণ (Binary Search — `ArrayScene` + `table` + `window`)
- [x] `3.1`–`3.3` — টপিক ৩ সম্পূর্ণ (Linked Lists — `LinkedListScene` + `dummy` + `cycle` arrow)
- [x] `LinkedListScene` — টপিক ৩ ✅
- [ ] টপিক ৪ (Stacks & Queues) থেকে শুরু
- [ ] `StackScene` — টপিক ৪
- [ ] `MatrixScene`-এর পুনর্ব্যবহার — টপিক ৯ (DP টেবিল), ৮ (grid BFS)
- [ ] `TreeScene` / `GraphScene` — টপিক ৫, ৮ (ভেতরে React Flow; ডেটা ফাইল তা জানবে না)

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
| Simulation হাতে লেখা — demo code বদলালে স্টেপ নিজে আপডেট হয় না | ভুল টাইমলাইন চুপচাপ থেকে যেতে পারে | demo code সম্পাদনার সময় ওই প্যাটার্নের ডেটা ফাইলও দেখুন |
| `SceneView`-এর exhaustiveness check এখন সক্রিয় (`Scene` তিন-সদস্যের union) | নতুন scene kind যোগ করলে renderer ছাড়া কম্পাইল হবে না | নতুন `kind` যোগ করলে `SceneView.tsx`-এ case + renderer একসাথে যোগ করুন |
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
