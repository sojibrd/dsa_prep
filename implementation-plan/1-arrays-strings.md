# Implementation Plan — Topic 1: Arrays & Strings (Pattern Simulations)

## এই ডকুমেন্ট কীভাবে পড়বেন

আপনি একটা AI যে এই কথোপকথনটা দেখেননি এবং **প্রজেক্টে বর্তমানে কোনো simulation কোড নেই** (আগের একটা প্রচেষ্টা বাতিল করে reverted করা হয়েছে)। শুরু করার আগে এই ক্রমে পড়ুন:

1. `d:\document-files\dsa_prep\AGENTS.md` — প্রজেক্টের ভাষা ও কাজের নিয়ম (বাংলায় লিখতে হবে, কাজ শুরুর আগে ভাষা মিলিয়ে নিতে হবে ইত্যাদি)
2. `d:\document-files\dsa_prep\context\project-overview.md`, `build-plan.md`, `progress-tracker.md` — প্রজেক্টের লক্ষ্য ও বর্তমান অবস্থা
3. `d:\document-files\dsa_prep\context\ui-tokens.md` ও `context\ui-rules.md` — **Theme Contract, অলঙ্ঘনীয়।** কম্পোনেন্টে কোনো ভিজ্যুয়াল ক্লাস (রং, radius, shadow, uppercase) থাকবে না — Tailwind শুধু লেআউটের জন্য (`flex`, `grid`, `gap`, `p-*` ইত্যাদি), চেহারা `--t-*` টোকেন ও role class-এ।
4. `d:\document-files\dsa_prep\context\ui-registry.md` — বিদ্যমান সব কম্পোনেন্ট ও role class
5. `d:\document-files\dsa_prep\app\components\PatternPanel.tsx` — এখানেই simulation ব্লক জোড়া লাগবে (demo code block-এর ঠিক পরে)
6. `d:\document-files\dsa_prep\app\utils\dsaParser.ts` — বুঝে নিন `Pattern.demoCode` ঠিক কীভাবে তৈরি হয় (নিচে "লাইন নম্বর কনভেনশন" সেকশনে বিস্তারিত)
7. `d:\document-files\dsa_prep\context\dsa-workbook\1. Arrays & Strings\*.md` — এই টপিকের raw ডেটা (demo code, statement, approach — নিচে প্রতিটা প্যাটার্নে কপি করা আছে, কিন্তু যাচাইয়ের জন্য মূল ফাইলও দেখে নিন)

**এই প্ল্যান কী নয়:** চূড়ান্ত TypeScript কোড নয়। এই ডকুমেন্টে আছে (ক) সম্পূর্ণ Scene কনট্র্যাক্টের ডিজাইন (যেহেতু টপিক ১-ই প্রথম, এখানেই ভিত্তি স্থাপিত হচ্ছে), (খ) প্রতিটা প্যাটার্নের demo input ও **script দিয়ে যাচাই করা exact trace**। `SimStep[]` object, বাংলা `whatHappens`/`whyItMatters` বাক্য, আর প্রতিটা কম্পোনেন্টের JSX **আপনাকে লিখতে হবে**।

---

## অংশ ১ — গোটা ফিচারের ভিত্তি (একবারই বানাতে হবে)

Topic 1 সবার প্রথমে implement হচ্ছে, তাই এখানেই পুরো সিমুলেশন ইঞ্জিন আর প্রথম তিনটা scene kind বানাতে হবে। **টপিক ২-১০-এর প্ল্যান ডকুমেন্টগুলো ধরে নেয় এই ভিত্তিটা ইতিমধ্যে আছে** — তাই এই অংশটা সবচেয়ে গুরুত্বপূর্ণ, ভুল হলে বাকি সব টপিকে সমস্যা হবে।

### ধারণাগত মডেল

- **Simulation** — একটা প্যাটার্নের demo code একটা নির্দিষ্ট ইনপুটে চালানোর ধাপে-ধাপে (play/pause/step করা যায় এমন) দৃশ্য।
- **Step** — কোডের একটা অর্থপূর্ণ মুহূর্ত (এক লুপ iteration বা এক শাখা), প্রতিটা statement নয়।
- **Scene** — এক স্টেপের ভিজ্যুয়াল অবস্থা, declarative ডেটা হিসেবে বর্ণিত (কোনো রং/CSS/স্থানাঙ্ক নয় — শুধু "কী আছে, কোথায়, কী অবস্থায়")।
- **Scene renderer** — একটা `kind`-কে আঁকার দায়িত্বে থাকা React কম্পোনেন্ট।

**অলঙ্ঘনীয় নিয়ম:** ডেটা ফাইল (প্রতিটা প্যাটার্নের `SimStep[]`) কখনো renderer-এর বাস্তবায়ন জানবে না — কোনো `position`, কোনো লাইব্রেরি-টাইপ, কোনো CSS ক্লাস নেই। শুধু অর্থপূর্ণ state (`values`, `pointers`, `marks` ইত্যাদি)। এটাই renderer বদলানোর (ভবিষ্যতে দরকার হলে) সুযোগ দেয় ডেটা না ছুঁয়ে।

### `app/lib/simulations/types.ts` — সম্পূর্ণ টাইপ কনট্র্যাক্ট

```ts
/** How one cell reads at this moment. The names are MEANINGS, not colours. */
export type CellMark =
  | 'active'   // এই মুহূর্তে pointer এখানে
  | 'done'     // প্রসেস হয়ে গেছে, settled
  | 'reject'   // বাদ পড়েছে — skip, discard, ব্যর্থ
  | 'fill';    // জমা রাশি — Trapping Rain Water-এর পানি, running sum

/** A named cursor into the structure — `l`, `r`, `slow`, `fast`, `i`. */
export interface ScenePointer {
  name: string;
  index: number;
}

/**
 * Side panels every scene may carry — a hashmap, a Set, the output built so
 * far. Shared so a matrix walk or a future scene kind gets these for free
 * instead of every kind reinventing its own "extra panel" field.
 */
interface SceneBase {
  table?: {
    title: string;
    entries: { key: string; value?: string | number; mark?: CellMark }[];
    emptyLabel?: string;
  };
  output?: {
    title: string;
    values: (string | number)[];
  };
  caption?: string;
}

/** A row of values with cursors over it — two pointers, sliding window, prefix sum. */
export interface ArrayScene extends SceneBase {
  kind: 'array';
  values: (number | string)[];
  pointers?: ScenePointer[];
  window?: { from: number; to: number; label?: string };
  marks?: Record<number, CellMark>;
  /** Height stacked on top of a cell (water above a bar). Needs `asBars`. */
  fills?: Record<number, number>;
  /** A second per-index value, e.g. Kadane's running `cur`. */
  subValues?: Record<number, string | number>;
  subLabel?: string;
  asBars?: boolean;
}

/** A 2D grid — spiral order, grid BFS, a DP table. */
export interface MatrixScene extends SceneBase {
  kind: 'matrix';
  values: (number | string)[][];
  cursor?: { row: number; col: number };
  marks?: Record<string, CellMark>; // key = "row,col"
  bounds?: { top: number; bottom: number; left: number; right: number };
}

/** Spans on a shared timeline — merge intervals, meeting rooms. */
export interface IntervalsScene extends SceneBase {
  kind: 'intervals';
  intervals: { start: number; end: number; label?: string; mark?: CellMark }[];
  cursor?: number;
  result?: { start: number; end: number; mark?: CellMark }[];
  axis?: { from: number; to: number };
}

export type Scene = ArrayScene | MatrixScene | IntervalsScene;
/* টপিক ৩ এখানে `LinkedListScene`, টপিক ৫ `TreeScene` যোগ করবে — তখন এই union বাড়বে। */

export interface SimStep {
  id: string;
  title: string;
  whatHappens: string;
  whyItMatters?: string;
  /** 1-based line numbers of `pattern.demoCode` executing now. */
  highlightLines?: number[];
  vars?: { name: string; value: string | number }[];
  scene: Scene;
}

export interface PatternSimulation {
  /** Matches `Pattern.id`, e.g. "1.1". */
  patternId: string;
  input: string;
  output: string;
  steps: SimStep[];
}
```

### `app/hooks/usePatternSim.ts` — টাইমলাইন ইঞ্জিন

একটা `SimStep[]` নিয়ে play/pause/next/prev/goTo/reset/speed চালায়। মূল বিষয়গুলো:
- `stepIndex` (0 থেকে শুরু, `-1` নয় — প্রথম স্টেপ সবসময় দৃশ্যমান)।
- Auto-play টাইমার (base ~২৬০০ms প্রতি স্টেপ ১×-এ, `speed` 0.5/1/2 দিয়ে ভাগ)।
- **শেষ স্টেপে থেমে যায়, rewind করে না** — DP/backtracking-এর উত্তর শেষ স্টেপেই থাকে, সেটা হারানো ঠিক না।
- Pattern বদলালে (`steps` array-এর identity বদলালে) render-এর সময়ই `stepIndex=0`, `isPlaying=false`-এ রিসেট করুন — effect-এ নয়, নাহলে পুরনো state-এর এক ফ্রেম দেখা যাবে।
- Pause/resume-এ "কতটা সময় দেখা হয়ে গেছে" ব্যাংক করে রাখুন (`consumed`/`runningSince` ref জোড়া) — নাহলে speed বদলালে বা pause-resume করলে স্টেপ আবার শুরু থেকে চলবে।

রিটার্ন করবে: `stepIndex, step, totalSteps, isPlaying, isFinished, speed, play, pause, next, prev, goTo, reset, setSpeed`।

### কম্পোনেন্ট গঠন (`app/components/simulation/`)

| ফাইল | কাজ |
|---|---|
| `SceneView.tsx` | `scene.kind` অনুযায়ী সঠিক renderer বাছে (একমাত্র জায়গা যেখানে switch/case হয়) |
| `ArrayScene.tsx` | `kind: 'array'` আঁকে — cell/bar মোড, pointer লেবেল, window bracket |
| `MatrixScene.tsx` | `kind: 'matrix'` আঁকে — grid, cursor, boundary frame |
| `IntervalsScene.tsx` | `kind: 'intervals'` আঁকে — সংখ্যারেখায় span |
| `SceneAside.tsx` | `table`/`output` পাশের প্যানেল — সব scene kind পুনর্ব্যবহার করে |
| `CodePane.tsx` | demo code দেখায়, `highlightLines` অনুযায়ী লাইন হাইলাইট, `scrollIntoView` দিয়ে auto-scroll |
| `ExplainPanel.tsx` | `vars` চিপ + `whatHappens`/`whyItMatters` |
| `SimControls.tsx` | play/pause/prev/next/reset বাটন, speed toggle, স্ক্রাবার (`range` input) |
| `SimulationBlock.tsx` | সব একসাথে জোড়ে, fold/unfold টগল, fullscreen টগল (Graph/Tree-র জন্য ভবিষ্যতে দরকার হবে) |

`SimulationBlock`-কে `PatternPanel.tsx`-এ demo code block-এর ঠিক পরে বসান:

```tsx
{simulation && pattern.demoCode && (
  <SimulationBlock simulation={simulation} code={pattern.demoCode} />
)}
```

যেখানে `simulation = getSimulation(pattern.id)` — `app/lib/simulations/index.ts`-এর একটা sparse lookup, যে প্যাটার্নে simulation নেই সেখানে `null` ফেরত দেয় আর ব্লকটাই দেখা যায় না (কোনো খালি বাক্স/এরর নয়)।

```ts
// app/lib/simulations/index.ts
const SIMULATIONS: Record<string, PatternSimulation> = Object.fromEntries(
  ALL.map((sim) => [sim.patternId, sim])
);
export function getSimulation(patternId: string): PatternSimulation | null {
  return SIMULATIONS[patternId] ?? null;
}
```

### লাইন নম্বর কনভেনশন

`dsaParser.ts` কোড ফেন্স (` ```js ... ``` `)-এর ভেতরের লাইনগুলো verbatim জোড়ে `pattern.demoCode`-এ বসায়। তাই **`highlightLines`-এর লাইন ১ = কোড ফেন্সের ভেতরের প্রথম লাইন** (`function ...` লাইন), কমেন্ট লাইনও গোনায় ধরা হয়। নিচের প্রতিটা প্যাটার্নে এই কনভেনশন অনুযায়ী লাইন নম্বর দেওয়া আছে — নিজে গুনে মিলিয়ে নিন।

### Theme — নতুন role class (`app/globals.css`, টোকেন `app/themes/control-room.css`)

```css
.sim-cell { /* array/matrix cell */ }
.sim-cell[data-mark="active"] { /* amber */ }
.sim-cell[data-mark="done"] { /* green border */ }
.sim-cell[data-mark="reject"] { /* faded */ }
.sim-cell[data-mark="fill"] { /* cool accent — জমা রাশি */ }
.sim-index { /* index number, faint */ }
.sim-pointer { /* named cursor label, amber */ }
.sim-window { /* span bracket under a row */ }
.sim-bar, .sim-bar-fill { /* bar mode (asBars) */ }
.codeline, .codeline[data-active="true"], .codeline-no { /* CodePane */ }
.sim-fullscreen { /* future: fullscreen scene */ }
.sim-scrub { /* range input styling */ }
```

টোকেন প্যালেট: `active` = amber (নির্বাচিত/জীবিত জিনিসের রং — sidebar-এর সাথে সামঞ্জস্যপূর্ণ), `done` = green (settled fact — solved checkbox-এর সবুজের সাথে সামঞ্জস্যপূর্ণ), `reject` = faded opacity, `fill` = ঠান্ডা নীল/সায়ান (নতুন পরিবার, কারণ "জমা হওয়া" ধারণাটা amber/green কোনোটাই না)। নতুন `--t-sim-*` টোকেন পরিবার `control-room.css`-এ যোগ করুন, বিদ্যমান `--chassis`/`--amber`/`--green` ইত্যাদি প্যালেট থেকেই মান নিন — নতুন hex রং উদ্ভাবন করবেন না।

---

## অংশ ২ — প্রতিটা প্যাটার্ন (৭টা, সব `array` বা `matrix`/`intervals`)

### সাধারণ নিয়ম — স্টেপ কীভাবে ভাঙবেন

- **প্রতিটা লুপ iteration যেখানে অর্থপূর্ণ কিছু বদলায় = একটা স্টেপ।**
- শুরুতে একটা "init" স্টেপ (pointer/ভেরিয়েবলের প্রাথমিক অবস্থা) — code না চলা অবস্থাতেই।
- শেষে একটা "done" স্টেপ যেখানে চূড়ান্ত উত্তর স্পষ্ট দেখা যায়।
- লক্ষ্য: প্রতি প্যাটার্নে ১০–২৫টা স্টেপ। এর বেশি হলে input ছোট করুন (নিচে কিছু প্যাটার্নে workbook-এর ডিফল্ট ব্যবহার করা হয়েছে যেটা ২৬ স্টেপ পর্যন্ত যায় — সেটা flag করা আছে, চাইলে ছোট input দিয়ে বদলাতে পারেন)।

---

### 1.1 Two Pointers

**Demo:** Trapping Rain Water — [LC 42](https://leetcode.com/problems/trapping-rain-water/) — কোড:

```js
function trap(height) {
  let l = 0,
    r = height.length - 1;
  let leftMax = 0,
    rightMax = 0,
    water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      leftMax = Math.max(leftMax, height[l]);
      water += leftMax - height[l];
      l++;
    } else {
      rightMax = Math.max(rightMax, height[r]);
      water += rightMax - height[r];
      r--;
    }
  }
  return water;
}
```

লাইন: ১=function, ২-৩=l,r init, ৪-৬=leftMax/rightMax/water init, ৭=while, ৮=if height[l]<height[r], ৯=leftMax আপডেট, ১০=water+=, ১১=l++, ১২=else, ১৩=rightMax আপডেট, ১৪=water+=, ১৫=r--।

**Scene:** `array`, **bar মোড** (`asBars: true`) — এটাই মূল ইনসাইট, পানি bar-এর উপরে জমে, সংখ্যা-বক্সে এটা দেখানো যায় না। `pointers`: `l`, `r`। `fills`: জমা পানি প্রতি index-এ। `marks`: বর্তমান pointer `active`, পার হয়ে যাওয়া অংশ `done`।

**Demo input:** `height = [0,1,0,2,1,0,1,3,2,1,2,1]` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (১৩টা স্টেপ, script দিয়ে যাচাই করা):**

| # | l | r | দিক | leftMax | rightMax | জমা পানি | water |
|---|---|---|---|---|---|---|---|
| init | 0 | 11 | — | 0 | 0 | — | 0 |
| 1 | 0→1 | 11 | L | 0 | 0 | 0 | 0 |
| 2 | 1→2 | 11→10 | R | 0 | 1 | 0 | 0 |
| 3 | 1→2 | 10 | L | 1 | 1 | 0 | 0 |
| 4 | 2→3 | 10 | L | 1 | 1 | **1** (idx 2) | 1 |
| 5 | 3 | 10→9 | R | 1 | 2 | 0 | 1 |
| 6 | 3 | 9→8 | R | 1 | 2 | **1** (idx 9) | 2 |
| 7 | 3 | 8→7 | R | 1 | 2 | 0 | 2 |
| 8 | 3→4 | 7 | L | 2 | 2 | 0 | 2 |
| 9 | 4→5 | 7 | L | 2 | 2 | **1** (idx 4) | 3 |
| 10 | 5→6 | 7 | L | 2 | 2 | **2** (idx 5) | 5 |
| 11 | 6→7 | 7 | L | 2 | 2 | **1** (idx 6) | 6 |
| done | 7 | 7 | — | 2 | 2 | — | **6** |

**চূড়ান্ত উত্তর: `6`।**

---

### 1.2 Sliding Window

**Demo:** Minimum Window Substring — [LC 76](https://leetcode.com/problems/minimum-window-substring/) — কোড:

```js
function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let missing = t.length,
    l = 0,
    best = [0, Infinity];
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    if (need.has(c)) {
      if (need.get(c) > 0) missing--;
      need.set(c, need.get(c) - 1);
    }
    while (missing === 0) {
      // valid window → shrink
      if (r - l < best[1] - best[0]) best = [l, r];
      const d = s[l];
      if (need.has(d)) {
        need.set(d, need.get(d) + 1);
        if (need.get(d) > 0) missing++;
      }
      l++;
    }
  }
  return best[1] === Infinity ? "" : s.slice(best[0], best[1] + 1);
}
```

লাইন: ১=function, ২-৩=need build, ৪-৬=missing/l/best init, ৭=for r, ৮=c=s[r], ৯-১২=need আপডেট (missing কমানো), ১৩=while missing===0, ১৪=comment, ১৫=best আপডেট, ১৬=d=s[l], ১৭-২০=need আপডেট (missing বাড়ানো), ২১=l++।

**Scene:** `array`, `values`=`s` (প্রতিটা char)। `window`: `{from:l, to:r}`। `marks`: window-এর ভেতরের char `active`, বাইরের `done`/plain। `table`: `need` map (key→count)। `vars`: `missing`।

**Demo input:** `s = "ADOBECODEBANC"`, `t = "ABC"` (workbook-এর নিজস্ব উদাহরণ — বিখ্যাত ক্লাসিক উদাহরণ, তাই ছোট করার সুপারিশ করছি না)।

**⚠️ এই ট্রেস ২৬টা স্টেপ (script দিয়ে যাচাই করা) — এই টপিকের মধ্যে সবচেয়ে লম্বা। চাইলে ছোট input (`s="aa", t="aa"`) দিয়ে ছোট করতে পারেন, কিন্তু এই বিখ্যাত উদাহরণটা রাখারও যুক্তি আছে (অনেকেই এটা চেনে)। সিদ্ধান্ত আপনার — নিচে workbook-এর ডিফল্ট দিয়েই ট্রেস দেওয়া হলো:**

সংক্ষিপ্ত সারাংশ (২৬টা raw event `expand`/`shrink`/`best` — প্রতিটাকে এক-এক স্টেপ বানান):

- `r=0..5` (A,D,O,B,E,C) expand করতে করতে `missing` কমে ০ হয় `r=5`-এ → **best `[0,5]`="ADOBEC"** রেকর্ড হয়।
- `l=0` shrink (missing→1) → আবার expand `r=6..10` (O,D,E,B,A) → `r=10`-এ missing আবার ০।
- `l=1..5` shrink করতে করতে (D,O,B,E বাদ দিলেও missing ০ থাকে, C বাদ দিলে missing→1) — এর মধ্যে কোনো নতুন best রেকর্ড হয় না (window length না কমা পর্যন্ত)।
- `r=11,12` (N,C) expand, `r=12`-এ missing আবার ০ → shrink `l=6,7` (O,D বাদ) → **best `[8,12]`="EBANC"** → আরও shrink `l=8` (E বাদ) → **best `[9,12]`="BANC"** → `l=9`-এ B বাদ দিলে missing→1, loop শেষ।

**চূড়ান্ত উত্তর: `"BANC"`।** (সম্পূর্ণ ২৬-লাইনের raw trace `9-dynamic-programming.md`-এর মতো টেবিল আকারে চাইলে node script দিয়ে পুনরায় জেনারেট করে নিন — approach ঠিক উপরের প্যাটার্নেই, শুধু আকারে বড়।)

---

### 1.3 Prefix Sum

**Demo:** Subarray Sum Equals K — [LC 560](https://leetcode.com/problems/subarray-sum-equals-k/) — কোড:

```js
function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]); // খালি prefix
  let sum = 0,
    count = 0;
  for (const x of nums) {
    sum += x;
    count += seen.get(sum - k) || 0;
    seen.set(sum, (seen.get(sum) || 0) + 1);
  }
  return count;
}
```

লাইন: ১=function, ২=seen init (comment সহ), ৩-৪=sum/count init, ৫=for x, ৬=sum+=x, ৭=count+= (lookup), ৮=seen.set।

**Scene:** `array`, `values`=`nums`, `marks[i]='active'` বর্তমান index। `table`: `seen` map। `vars`: `sum`, `count`।

**Demo input:** `nums = [1, 1, 1]`, `k = 2` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৩টা স্টেপ, script দিয়ে যাচাই করা):**

| # | x | sum | দরকার (sum−k) | seen-এ পাওয়া গেল | count |
|---|---|---|---|---|---|
| 1 | 1 | 1 | −1 | 0 বার | 0 |
| 2 | 1 | 2 | 0 | 1 বার (খালি prefix) | 1 |
| 3 | 1 | 3 | 1 | 1 বার (sum=1 আগে দেখা গেছে) | 2 |

প্রতি স্টেপের পরে `seen`-এ নতুন `sum` যোগ হয় (`seen: {0:1}` → `{0:1,1:1}` → `{0:1,1:1,2:1}` → `{0:1,1:1,2:1,3:1}`)।

**চূড়ান্ত উত্তর: `2`।**

---

### 1.4 Hashing / Frequency Counting

**Demo:** Longest Consecutive Sequence — [LC 128](https://leetcode.com/problems/longest-consecutive-sequence/) — কোড:

```js
function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (set.has(x - 1)) continue; // sequence-এর শুরু না হলে skip
    let len = 1;
    while (set.has(x + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}
```

লাইন: ১=function, ২=set init, ৩=best init, ৪=for x, ৫=if skip (comment সহ), ৬=len init, ৭=while, ৮=best আপডেট।

**Scene:** `array`, `values`=`nums`। `table`: `set` (Set-এর মান, `value` ছাড়া শুধু `key`)। `marks`: বর্তমান `x` `active`, skip হওয়া `reject`, একটা sequence-এর অংশ পাওয়া গেলে সেই range `done`।

**Demo input:** `nums = [100, 4, 200, 1, 3, 2]` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৬টা স্টেপ, script দিয়ে যাচাই করা — Set-এর iteration ক্রম insertion-order):**

| # | x | ঘটনা | detail |
|---|---|---|---|
| 1 | 100 | start-seq | `x-1`(99) নেই, len=1, best=1 |
| 2 | 4 | skip | `x-1`(3) আছে |
| 3 | 200 | start-seq | len=1, best=1 (অপরিবর্তিত) |
| 4 | 1 | start-seq | `x-1`(0) নেই, গুনতে থাকুন: 1,2,3,4 আছে, 5 নেই → len=4, **best=4** |
| 5 | 3 | skip | `x-1`(2) আছে |
| 6 | 2 | skip | `x-1`(1) আছে |

**চূড়ান্ত উত্তর: `4`** (সিকোয়েন্স `1,2,3,4`)।

---

### 1.5 Merge Intervals — `intervals` scene

**Demo:** Merge Intervals — [LC 56](https://leetcode.com/problems/merge-intervals/) — কোড:

```js
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const [s, e] = intervals[i];
    const last = res[res.length - 1];
    if (s <= last[1])
      last[1] = Math.max(last[1], e); // overlap → merge
    else res.push([s, e]);
  }
  return res;
}
```

লাইন: ১=function, ২=sort, ৩=res init, ৪=for i, ৫=[s,e] destructure, ৬=last, ৭-৮=if overlap → merge (comment সহ), ৯=else push, ১১=return।

**Scene:** `intervals` (নতুন kind, এই প্যাটার্নেই প্রথম দরকার)। `intervals` ফিল্ডে ইনপুট spans (sorted), `result` ফিল্ডে এ পর্যন্ত merge হওয়া spans, `cursor`=বর্তমান index।

**Demo input:** `intervals = [[1,3],[2,6],[8,10],[15,18]]` (workbook-এর নিজস্ব উদাহরণ, ইতিমধ্যে start-sorted)।

**সম্পূর্ণ ট্রেস (৪টা স্টেপ, script দিয়ে যাচাই করা):**

| # | ঘটনা | detail |
|---|---|---|
| 0 (init) | sort | sorted = `[[1,3],[2,6],[8,10],[15,18]]` (ইতিমধ্যে সাজানো), `res=[[1,3]]` |
| 1 | merge | i=1, `[2,6]`: `2 ≤ 3` (last-এর end) → overlap, last হয় `[1,6]` |
| 2 | push | i=2, `[8,10]`: `8 > 6` → নতুন push, `res=[[1,6],[8,10]]` |
| 3 | push | i=3, `[15,18]`: `15 > 10` → নতুন push, `res=[[1,6],[8,10],[15,18]]` |

**চূড়ান্ত উত্তর: `[[1,6],[8,10],[15,18]]`।**

---

### 1.6 Kadane's Algorithm

**Demo:** Maximum Subarray — [LC 53](https://leetcode.com/problems/maximum-subarray/) — কোড:

```js
function maxSubArray(nums) {
  let cur = nums[0],
    best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]); // নতুন শুরু vs টেনে নেওয়া
    best = Math.max(best, cur);
  }
  return best;
}
```

লাইন: ১=function, ২-৩=cur/best init, ৪=for i, ৫=cur আপডেট (comment সহ), ৬=best আপডেট।

**Scene:** `array`, `values`=`nums`, **`subValues`=চলমান `cur`** (প্রতি index-এর নিচে, `subLabel="cur"`) — এটাই Kadane-এর মূল গল্প, প্রতি ধাপে "টেনে নেব না নতুন শুরু" সিদ্ধান্ত `cur`-এর মানেই বোঝা যায়। `marks[i]='active'`।

**Demo input:** `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৯টা স্টেপ, script দিয়ে যাচাই করা):**

| # (i) | x | cur | best |
|---|---|---|---|
| 0 (init) | −2 | −2 | −2 |
| 1 | 1 | 1 | 1 |
| 2 | −3 | −2 | 1 |
| 3 | 4 | 4 | 4 |
| 4 | −1 | 3 | 4 |
| 5 | 2 | 5 | 5 |
| 6 | 1 | 6 | 6 |
| 7 | −5 | 1 | 6 |
| 8 | 4 | 5 | 6 |

**চূড়ান্ত উত্তর: `6`** (subarray `[4,-1,2,1]`)।

---

### 1.7 Matrix Traversal — `matrix` scene

**Demo:** Spiral Matrix — [LC 54](https://leetcode.com/problems/spiral-matrix/) — কোড:

```js
function spiralOrder(matrix) {
  const res = [];
  let top = 0,
    bottom = matrix.length - 1;
  let left = 0,
    right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) res.push(matrix[top][j]);
    top++;
    for (let i = top; i <= bottom; i++) res.push(matrix[i][right]);
    right--;
    if (top <= bottom) {
      for (let j = right; j >= left; j--) res.push(matrix[bottom][j]);
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) res.push(matrix[i][left]);
      left++;
    }
  }
  return res;
}
```

লাইন: ১=function, ২=res, ৩-৪=top/bottom, ৫-৬=left/right, ৭=while, ৮=for j (ডানে), ৯=top++, ১০=for i (নিচে), ১১=right--, ১২-১৪=if বামে (bottom row), ১৫-১৭=if উপরে (left col)।

**Scene:** `matrix` (নতুন kind, এই প্যাটার্নেই প্রথম দরকার)। `values`=পুরো matrix। `cursor`=বর্তমান cell। `bounds`={top,bottom,left,right} — এটাই layer-walk-এর সীমানা ফ্রেম হিসেবে আঁকা হবে। `output`: `res` (এ পর্যন্ত সংগ্রহ করা মান)।

**Demo input:** `matrix = [[1,2,3],[4,5,6],[7,8,9]]` (workbook-এর নিজস্ব উদাহরণ)।

**সম্পূর্ণ ট্রেস (৯টা স্টেপ, script দিয়ে যাচাই করা — প্রতিটা cell visit = এক স্টেপ):**

| # | দিক | cell (row,col) | val |
|---|---|---|---|
| 1 | ডানে | (0,0) | 1 |
| 2 | ডানে | (0,1) | 2 |
| 3 | ডানে | (0,2) | 3 |
| 4 | নিচে | (1,2) | 6 |
| 5 | নিচে | (2,2) | 9 |
| 6 | বামে | (2,1) | 8 |
| 7 | বামে | (2,0) | 7 |
| 8 | উপরে | (1,0) | 4 |
| 9 | ডানে (ভেতরের একক row) | (1,1) | 5 |

**চূড়ান্ত উত্তর: `[1,2,3,6,9,8,7,4,5]`।**

---

## যাচাই (implement করার পর)

```bash
cd d:\document-files\dsa_prep
npx tsc --noEmit
npx eslint app --ext .ts,.tsx
npx next build
```

তিনটাই ক্লিন পাস করা বাধ্যতামূলক।

## শেষে যা আপডেট করবেন

- `app/lib/simulations/index.ts` — ৭টা import + `ALL` array
- `context/ui-registry.md` — "🎬 Simulation" নামে নতুন সেকশন (Component/role class তালিকা, ৭-১০ প্ল্যানের ভবিষ্যৎ কাজ এখান থেকে এক্সটেনশন হিসেবে যোগ হবে)
- `context/progress-tracker.md` — টপিক ১-এর এন্ট্রি
