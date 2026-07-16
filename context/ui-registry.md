# UI Registry — DSA Prep Tracker

বিদ্যমান সমস্ত UI কম্পোনেন্টের রেজিস্ট্রি। নতুন কম্পোনেন্ট তৈরির আগে এখানে দেখুন — হয়তো ইতিমধ্যে আছে।

---

## ফাইল ম্যাপ

| ফাইল | উদ্দেশ্য | টাইপ |
|------|---------|------|
| `app/page.tsx` | Root page, data parsing | Server Component |
| `app/TrackerClient.tsx` | সম্পূর্ণ UI (monolithic) | Client Component |
| `app/hooks/useLocalStorage.ts` | localStorage state hook | Custom Hook |
| `app/utils/dsaParser.ts` | Markdown পার্সার | Utility |
| `app/globals.css` | Design tokens + global styles | CSS |
| `app/layout.tsx` | Root layout, font, metadata | Server Component |

---

## কম্পোনেন্ট ইনভেন্টরি

> সব কম্পোনেন্ট বর্তমানে `TrackerClient.tsx`-এ monolithic আকারে আছে।
> ভবিষ্যতে split করলে এই registry আপডেট করতে হবে।

---

### 🏗️ Layout Components

#### `<AppShell>` (implicit — TrackerClient root div)
- **অবস্থান:** `TrackerClient.tsx` — return-এর root `<div>`
- **কাজ:** full-height flex container, bg/text color, dark mode transition
- **Classes:** `min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300`

---

### 🧭 Navigation Components

#### `<Navbar>`
- **অবস্থান:** `TrackerClient.tsx` — `<header>` element
- **কাজ:** Sticky top bar — logo + title, progress pill, dark mode toggle
- **Classes:** `sticky top-0 z-40 w-full glass-panel border-b py-4 px-6 md:px-12`
- **Props (state used):** `solvedProblemsCount`, `totalProblems`, `progressPercent`, `darkMode`
- **Sections:**
  - Logo area: 📚 emoji + gradient title + tagline
  - Progress pill (hidden on mobile): `{solved}/{total} ({percent}%)` + mini progress bar
  - Dark mode toggle button

#### `<ProgressPill>` (inline in Navbar)
- **কাজ:** `{solved}/{total} ({percent}%)` + 80px progress bar
- **Classes:** `hidden sm:flex items-center gap-3 glass-panel px-4 py-1.5 rounded-full text-sm`
- **Bar fill:** `bg-gradient-to-r from-indigo-500 to-cyan-500`

---

### 📋 Sidebar Components

#### `<Sidebar>`
- **অবস্থান:** `TrackerClient.tsx` — `<aside>` element
- **কাজ:** Topic list + pattern navigation
- **Size:** `w-full lg:w-[360px] flex flex-col gap-4 shrink-0`

#### `<MobileProgressDashboard>` (inside Sidebar, lg:hidden)
- **কাজ:** Mobile-only — solved count + circular progress ring
- **Classes:** `lg:hidden glass-panel p-5 rounded-2xl`
- **Ring:** SVG circle with `strokeDasharray=175`, `strokeDashoffset` calculated from percent

#### `<TopicGroup>` (mapped inside Sidebar)
- **কাজ:** একটা topic-এর header + pattern button list
- **Props (from map):** `topic`, `solved/total` from `getTopicProgress()`
- **Header:** topic name + `{solved}/{total}` badge
- **Pattern list:** left-bordered `<div>` with pattern buttons

#### `<PatternButton>` (mapped inside TopicGroup)
- **কাজ:** Clickable pattern selector
- **Active state:** `bg-indigo-500/10 text-indigo-600 border-l-2 border-indigo-500`
- **Inactive state:** `text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900`
- **Right side:** `({solved}/{total})` counter in `text-[10px]`

---

### 📄 Main Panel Components

#### `<PatternPanel>` (main content area)
- **অবস্থান:** `<main>` element inside flex row
- **কাজ:** Selected pattern-এর সম্পূর্ণ বিবরণ
- **Wrapper:** `glass-panel p-6 md:p-8 rounded-3xl flex flex-col gap-6`

#### `<PatternHeader>` (inside PatternPanel)
- **কাজ:** Topic breadcrumb + pattern name
- **Breadcrumb:** `text-xs font-bold text-indigo-500 uppercase tracking-wider`
- **Title:** `text-2xl md:text-3xl font-extrabold`

#### `<RecognizeBox>` (inside PatternPanel)
- **কাজ:** "চিনবেন কীভাবে" card
- **Classes:** `p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-sm`
- **Header:** `🔎 চিনবেন কীভাবে:` — `text-cyan-600 dark:text-cyan-400 font-bold`

#### `<DemoSection>` (inside PatternPanel)
- **কাজ:** Demo problem — name + LC link + approach + code + complexity
- **Condition:** `selectedPattern.demoName &&`
- **LC Link:** `text-xs font-semibold text-indigo-500 bg-indigo-500/5 px-2.5 py-1 rounded-full border`

#### `<ApproachBox>` (inside DemoSection)
- **কাজ:** Approach text display
- **Classes:** `bg-zinc-100/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50`

#### `<CodeBlock>` (inside DemoSection)
- **কাজ:** JavaScript code display + copy button
- **Pre/code:** `bg-zinc-900 text-zinc-100 dark:bg-black border border-zinc-800 p-5 rounded-2xl overflow-x-auto`
- **Copy button:** hover-এ দেখায়, `navigator.clipboard.writeText()` ব্যবহার করে

#### `<ComplexityBadge>` (inside DemoSection)
- **কাজ:** Time/Space complexity display
- **Classes:** `text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border`

---

### ✅ Problem List Components

#### `<ProblemList>` (inside PatternPanel)
- **কাজ:** Practice problems-এর list
- **Header:** `"Practice Problems ({count})"`

#### `<ProblemCard>` (mapped inside ProblemList)
- **কাজ:** একটা practice problem-এর card
- **States:**
  - Solved: `bg-emerald-500/5 border-emerald-500/20`
  - Unsolved: `bg-zinc-100/30 border-zinc-200/60 dark:bg-zinc-900/30 dark:border-zinc-800/60`
- **Contains:**
  - Checkbox (`<input type="checkbox">`) — `toggleSolved()` trigger
  - Problem name (`<a>` → LeetCode URL, `target="_blank"`)
  - Optional `notesLabel` — italic extra hint
  - Must-do/Bonus badge
  - "Notes / Revise ▼" toggle button

#### `<NotesSection>` (inside ProblemCard, expandable)
- **কাজ:** Solution idea + obstacle textarea
- **Condition:** `expandedProblemId === problem.id`
- **Two textareas:**
  - "আমার সমাধান (মূল আইডিয়া ২–৩ লাইনে):"
  - "যে সমস্যা হয়েছিল (trap / edge cases):"
- **Classes:** `w-full text-sm p-3 rounded-xl border bg-white dark:bg-black focus:ring-1 focus:ring-indigo-500`

---

## Custom Hooks

### `useLocalStorage<T>(key: string, initialValue: T)`
- **অবস্থান:** `app/hooks/useLocalStorage.ts`
- **কাজ:** `useState`-এর মতো — কিন্তু `localStorage`-এ persist করে
- **Return:** `[value, setValue]` — `useState`-এর মতোই
- **ব্যবহার:**
  ```tsx
  const [solvedIds, setSolvedIds] = useLocalStorage<string[]>('dsa_solved_ids', []);
  const [notes, setNotes] = useLocalStorage<Record<string, ProblemNote>>('dsa_problem_notes', {});
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('dsa_dark_mode', false);
  ```

---

## LocalStorage Keys

| Key | Type | Default | ব্যবহার |
|-----|------|---------|--------|
| `dsa_solved_ids` | `string[]` | `[]` | সলভ করা problem IDs |
| `dsa_problem_notes` | `Record<string, ProblemNote>` | `{}` | Problem-wise notes |
| `dsa_dark_mode` | `boolean` | `false` | Dark mode on/off |

---

## Utility Functions

### `parseDsaWorkbook(): Topic[]`
- **অবস্থান:** `app/utils/dsaParser.ts`
- **কাজ:** `context/dsa-workbook.md` পড়ে `Topic[]` return করে
- **শুধু Server-side** — `fs` module ব্যবহার করে
- **পার্স করে:** `## N. Topic`, `### N.M Pattern`, recognize, demo, approach, code block, complexity, problem list

### `getTopicProgress(topic: Topic): { solved: number, total: number }`
- **অবস্থান:** `TrackerClient.tsx` (inline function)
- **কাজ:** একটা topic-এর সলভ সংখ্যা গণনা
