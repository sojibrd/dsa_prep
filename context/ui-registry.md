# UI Registry — DSA Prep Tracker

বিদ্যমান সমস্ত UI কম্পোনেন্টের রেজিস্ট্রি। নতুন কম্পোনেন্ট তৈরির আগে এখানে দেখুন — হয়তো ইতিমধ্যে আছে।

> `measure` — পাঠ্য কলামের প্রস্থ (`--t-measure`, ৭০ch)। t-body প্রোজে ব্যবহার করুন।

> সব ভিজ্যুয়াল চেহারা role class থেকে আসে (`context/ui-tokens.md`)। নিচে যেখানে ক্লাস লেখা আছে, সেগুলো **role class**, Tailwind ভিজ্যুয়াল ক্লাস নয়।

---

## ফাইল ম্যাপ

| ফাইল | উদ্দেশ্য | টাইপ |
|------|---------|------|
| `app/page.tsx` | Root page, data parsing | Server Component |
| `app/TrackerClient.tsx` | শেল — state orchestration + composition | Client Component |
| `app/types.ts` | ProblemNote / SheetRow / SyncStatus / ClueMatch | Types |
| `app/components/Navbar.tsx` | header, progress pill, sync বাটন | Client Component |
| `app/components/Sidebar.tsx` | drawer — topic/pattern নেভিগেশন | Client Component |
| `app/components/PatternPanel.tsx` | recognize, demo, code, problem list | Client Component |
| `app/components/ProblemCard.tsx` | একটি প্রবলেম row + notes + statement | Client Component |
| `app/components/StatementBox.tsx` | statement রেন্ডার | Client Component |
| `app/components/ProgressReadout.tsx` | gauge readout | Client Component |
| `app/components/SyncModal.tsx` | Apps Script URL মডাল | Client Component |
| `app/components/simulation/SimulationBlock.tsx` | সিমুলেশন প্লেয়ারের র‍্যাপার — fold + expand | Client Component |
| `app/components/simulation/SceneView.tsx` | `scene.kind` → renderer (একমাত্র switch) | Client Component |
| `app/components/simulation/ArrayScene.tsx` | `kind: 'array'` — cell/bar মোড | Client Component |
| `app/components/simulation/MatrixScene.tsx` | `kind: 'matrix'` — grid + bounds ফ্রেম | Client Component |
| `app/components/simulation/IntervalsScene.tsx` | `kind: 'intervals'` — সংখ্যারেখায় span | Client Component |
| `app/components/simulation/LinkedListScene.tsx` | `kind: 'linked-list'` — নোড চেইন, jump link, cycle rail | Client Component |
| `app/components/simulation/TreeScene.tsx` | `kind: 'tree'` — SVG, layout হিসাব করা | Client Component |
| `app/components/simulation/SceneAside.tsx` | `table`/`output` পাশের প্যানেল (সব kind শেয়ার করে) | Client Component |
| `app/components/simulation/CodePane.tsx` | demo code + line highlight + auto-scroll | Client Component |
| `app/components/simulation/ExplainPanel.tsx` | `vars` চিপ + বাংলা ব্যাখ্যা | Client Component |
| `app/components/simulation/SimControls.tsx` | transport — play/step/reset/speed/scrub | Client Component |
| `app/hooks/useSheetSync.ts` | শিট load / debounce / push — সব cloud state | Custom Hook |
| `app/hooks/useLocalStorage.ts` | localStorage state hook | Custom Hook |
| `app/hooks/usePatternSim.ts` | সিমুলেশন টাইমলাইন ইঞ্জিন | Custom Hook |
| `app/lib/simulations/types.ts` | Scene কনট্র্যাক্ট — `Scene`/`SimStep`/`PatternSimulation` | Types |
| `app/lib/simulations/index.ts` | `getSimulation(patternId)` — sparse lookup | Utility |
| `app/lib/simulations/topic1/*.ts` | টপিক ১-এর ৭টা যাচাই-করা ট্রেস | Data |
| `app/lib/simulations/topic2/*.ts` | টপিক ২-এর ৪টা যাচাই-করা ট্রেস | Data |
| `app/lib/simulations/topic3/*.ts` | টপিক ৩-এর ৩টা যাচাই-করা ট্রেস | Data |
| `app/lib/simulations/topic4/*.ts` | টপিক ৪-এর ৪টা যাচাই-করা ট্রেস | Data |
| `app/lib/simulations/topic5/*.ts` | টপিক ৫-এর ৫টা যাচাই-করা ট্রেস | Data |
| `app/lib/clueMatch.ts` | clue → problem ম্যাচিং (pure) | Utility |
| `app/lib/parseStatement.ts` | statement পার্সার (pure) | Utility |
| `app/utils/dsaParser.ts` | Markdown পার্সার (server-only, fs) | Utility |
| `app/globals.css` | Theme Contract — role class | CSS |
| `app/themes/control-room.css` | সক্রিয় থিম — --t-* মান | CSS |
| `app/layout.tsx` | Root layout, ৫-ফন্ট শেল্ফ, metadata | Server Component |

---

## কম্পোনেন্ট ইনভেন্টরি

> সব কম্পোনেন্ট বর্তমানে `TrackerClient.tsx`-এ monolithic আকারে আছে।
> ভবিষ্যতে split করলে এই registry আপডেট করতে হবে।

### 🧭 Navigation

#### `<Navbar>` — `<header>`
- **Roles:** `surface-app seam-b` (sticky), লোগো `t-title` + `t-caption`
- **Contains:** হ্যামবার্গার (`control control--quiet`, `lg:hidden`), Progress pill, sync ইন্ডিকেটর (`t-label`), ক্লাউড সিঙ্ক বাটন

#### `<ProgressPill>` (Navbar-এর ভেতরে)
- **Roles:** `surface-raised` + `t-label` + `t-mono t-accent`
- **Bar:** `gauge` / `gauge-fill`, `role="progressbar"` সহ

#### `<Sidebar>` — `<aside>`
- ডেস্কটপে স্থায়ী কলাম, মোবাইলে drawer (`overlay` + `animate-slide-in-left`)
- Topic গ্রুপ `seam-b`-তে বিভক্ত; প্রতিটি প্যাটার্ন একটি `row` (`aria-current` = নির্বাচিত)
- প্যাটার্ন বাটনের `id="pattern-btn-{id}"` — লোডে অটো-স্ক্রলের জন্য

---

### 📄 Pattern Panel — `<main>`

| ব্লক | Roles | নোট |
|---|---|---|
| র‍্যাপার | `surface-panel` | |
| Header | `t-label` (breadcrumb) + `t-title` | |
| Recognize | `callout callout--accent` | ক্লু তালিকা `measure`; উদাহরণ ডিফল্টে collapsed (`control control--quiet` toggle, `aria-expanded`/`aria-controls="clue-examples"`), প্রতি **প্রবলেমে** একটি `option[data-chosen]` — তার clue-গুলো `t-caption t-quote` লাইনে (chip নয়: clue বাক্য, ট্যাগ নয়, আর `.chip`-এর mono ফেসে বাংলা glyph নেই) |
| Demo header | `t-title` + `chip chip--accent` (LeetCode লিংক) | |
| Statement | `callout` + `<StatementBox>` | expandable, `aria-expanded` |
| Approach | `surface-well` + `t-label` + `t-body` | |
| Code | `codeblock` + `codeblock-copy` | copy বাটন hover/focus-এ আসে |
| Complexity | `chip` | |
| খালি অবস্থা | `surface-panel` + `control control--primary` | Apps Script URL না থাকলে |
| লোডিং | `spinner t-accent` | |

#### `<StatementBox>` (মডিউল-লেভেল ফাংশন কম্পোনেন্ট)
- `parseStatement()` দিয়ে raw টেক্সটকে description / input / output / constraint-এ ভাঙে
- Input/Output দুটো `surface-well`; ইঙ্ক `code-inline t-ok` ও `code-inline t-accent`

---

### ✅ Problem List

#### `<ProblemCard>`
- **Wrapper:** `surface-raised`, `data-solved={isSolved}`
- **Check:** নেটিভ `<input type="checkbox" className="check">` — `:checked`-এ সবুজ, টিক থিমের background image
- **Name:** `<a>` `card-name` — `[data-solved="true"]`-এ ম্লান ও line-through (CSS-এ, কম্পোনেন্টে নয়)
- **Badge:** `chip chip--accent` (🔥 Must-do) / `chip` (⚪ Bonus)
- **Toggles:** `control control--quiet` × ২ — Statement ও Notes, দুটোতেই `aria-expanded`

#### `<NotesSection>` (expandable)
- দুটো `<textarea className="surface-well">` — সমাধানের আইডিয়া ও যে সমস্যা হয়েছিল

---

### 🎬 Simulation — প্যাটার্ন প্লেয়ার

Demo code একটা নির্দিষ্ট ইনপুটে ধাপে-ধাপে চলতে দেখার প্লেয়ার। `PatternPanel`-এ demo সেকশনের ঠিক পরে বসে, `getSimulation(pattern.id)` `null` দিলে **কিছুই render হয় না** (খালি বাক্স নয়)।

#### অলঙ্ঘনীয় সীমানা
- **ট্রেস ডেটা renderer-এর কিছুই জানে না** — কোনো স্থানাঙ্ক, রং, CSS ক্লাস বা লাইব্রেরি-টাইপ `app/lib/simulations/`-এ ঢুকবে না। শুধু অর্থ (`values`, `pointers`, `marks`, `window`, `fills`)।
- **`scene.kind`-এ switch হয় একমাত্র `SceneView.tsx`-এ।** নতুন scene kind = নতুন renderer + সেখানে একটা case, আর কোথাও নয়।
- `highlightLines` ১-ভিত্তিক, এবং লাইন ১ = workbook-এর কোড ফেন্সের ভেতরের প্রথম লাইন (কমেন্টসহ)।

#### Scene kinds

| kind | কম্পোনেন্ট | কোথায় প্রথম লাগল |
|---|---|---|
| `array` | `<ArrayScene>` | 1.1 (bar মোড), 1.2, 1.3, 1.4, 1.6, 2.1–2.4, 4.1–4.4 |
| `matrix` | `<MatrixScene>` | 1.7 Spiral Matrix |
| `intervals` | `<IntervalsScene>` | 1.5 Merge Intervals |
| `linked-list` | `<LinkedListScene>` | 3.1, 3.2, 3.3 |
| `tree` | `<TreeScene>` | 5.1–5.5 |

> টপিক ৮ `graph`, ১০ `trie` যোগ করবে — `Scene` union বাড়বে, উপরের কিছুই বদলাবে না।

#### `linked-list` — তিনটে নিয়ম

- **`nodes` = লেআউট ক্রম, চেইন ক্রম নয়।** লিস্ট অক্ষত থাকলে দুটো মেলে; reversal-এর মাঝপথে ইচ্ছাকৃতভাবে মেলে না। renderer প্রতিটা নোডের আসল `nextId` পড়ে, তাই পেছনে তাক করা তীর **পেছনে তাক করা অবস্থাতেই** আঁকা হয়।
- **connector-এর তিন রূপ** — `→` (next-ই ডান পাশের প্রতিবেশী), `↳ মান` (next অন্য কোথাও — জাম্প), `∅` (tail)। jump ও cycle amber, কারণ ওখানেই গঠন বদলেছে।
- **cycle = নিচের rail, বাঁকানো তীর নয়।** প্রতি নোডের নিচে এক টুকরো segment (`.sim-loop`), target থেকে tail পর্যন্ত `data-in="true"` — কম্পোনেন্ট একটাও স্থানাঙ্ক হিসাব করে না, তবু rail নিজে থেকেই সঠিক জায়গায় বসে।

> `dummy` (sentinel) আলাদা করে dashed border-এ — সে ডেটার অংশ নয়, আর দেখতেও যেন তা-ই মনে না হয়।

#### `tree` — তিনটে নিয়ম

- **Layout হিসাব করা, দেওয়া নয়।** in-order traversal কলাম ঠিক করে, recursion depth সারি। কোনো ট্রেস ফাইল `{x, y}` জানে না — জানলে এক renderer-এর জ্যামিতি পঞ্চাশটা ডেটা ফাইলে ছড়িয়ে পড়ত। পার্শ্বফল: অর্ধেক-তৈরি গাছ (5.2) বিনা কষ্টে সঠিকভাবে বসে।
- **root নিজে খুঁজে নেয়** — `rootId` না দিলে যে নোডকে কেউ `leftId`/`rightId` হিসেবে দাবি করেনি, সে-ই root।
- **SVG-তে mark = fill/stroke।** `<circle>`-এ border/background নেই, তাই একই চারটে `data-mark` fill ও stroke দিয়ে প্রকাশ পায়। অর্থ `.sim-cell`-এর সাথে অভিন্ন।

> `annotation` = নোডের নিচে ছোট cyan টেক্সট। 5.3-এ parent-কে পাঠানো gain, 5.4-এ অনুমোদিত `(min, max)`, 5.5-এ কোন target মিলল। `highlightPath` = live recursion path — ওই পথের edge amber হয়ে যায়।

#### Role classes

| ক্লাস | কাজ |
|---|---|
| `sim-stage` (+ `data-wide`) | প্লেয়ারের মঞ্চ; `data-wide="true"` = fixed fullscreen |
| `sim-cell` | array/matrix ঘর — `data-mark` ও `data-cursor`/`data-window` পড়ে |
| `sim-index` / `sim-cell-value` / `sim-subvalue` | index নম্বর, bar-এর নিচের মান, দ্বিতীয় সারির মান (Kadane-এর `cur`) |
| `sim-pointer` | নামযুক্ত cursor লেবেল (`l`, `r`, `slow`) — amber প্লেট |
| `sim-window-tag` | window ক্যাপশনের ট্যাগ |
| `sim-bar-track` / `sim-bar` / `sim-bar-fill` | bar মোড — track, দেয়াল, উপরে জমা রাশি |
| `sim-span` / `sim-axis` | interval span ও সংখ্যারেখা |
| `sim-node` (+ `data-mark`, `data-dummy`) | লিংকড লিস্ট নোড প্লেট — `sim-cell`-এর প্লেট ও চারটে mark পুনর্ব্যবহার করে |
| `sim-node-val` / `sim-node-link` | নোডের মান ও pointer slot |
| `sim-link` (+ `data-kind`) | connector — `next` / `jump` / `null` / `cycle` |
| `sim-loop` (+ `data-in`, `data-edge`) | cycle rail-এর এক নোডের segment |
| `sim-tree-node` (+ `data-mark`, `data-on`) | SVG `<circle>` — fill/stroke দিয়ে একই চারটে mark |
| `sim-tree-val` / `sim-tree-annot` / `sim-tree-pointer` | নোডের মান, নিচের ছোট টেক্সট, উপরের cursor লেবেল |
| `sim-tree-edge` (+ `data-on`) | parent→child রেখা; `data-on` = live recursion path |
| `sim-entry` (+ `sim-entry-key`/`-value`) | পাশের map/Set entry |
| `sim-out` | output array-র এক মান |
| `sim-var` (+ `sim-var-name`/`-value`) | ব্যাখ্যা প্যানেলের ভেরিয়েবল চিপ |
| `codeline` (+ `data-active`) / `codeline-no` | CodePane-এর লাইন ও গাটার নম্বর |
| `sim-scrub` | টাইমলাইন range input |
| `control[aria-pressed="true"]` | চাপা অবস্থার control (speed বাটন) |

#### `data-mark` — চারটা অর্থ, চারটা রং

| mark | অর্থ | টোকেন পরিবার |
|---|---|---|
| `active` | এই মুহূর্তে pointer এখানে | amber (`--t-sim-active-*`) |
| `done` | প্রসেস হয়ে settled | green (`--t-sim-done-*`) |
| `reject` | বাদ পড়েছে / skip | `--t-sim-reject-opacity` |
| `fill` | জমা রাশি — পানি, running total | cyan (`--t-sim-fill-*`) |

> `cyan`/`cyan-soft` — `control-room.css`-এ যোগ হওয়া একমাত্র নতুন প্যালেট এন্ট্রি। "জমা হওয়া" ধারণাটা amber (নির্বাচিত) বা green (settled) কোনোটাই নয়, তাই তার নিজের ঠান্ডা কণ্ঠস্বর দরকার ছিল।

> **`values` মানেই input array নয়।** সারিতে আঁকা হয় যেটার উপর দিয়ে cursor হাঁটে — 2.2/2.3-এ **উত্তরের সম্ভাব্য পরিসর**, 4.3-এ **API কলের ক্রম**। input array তখন যায় পাশের `table`-এ। কারণ ওখানে lo/hi/mid ওই পরিসরকেই index করে, input array-কে নয় — উল্টোটা আঁকলে pointer-গুলো এমন array-র উপর বসে যাকে তারা স্পর্শই করে না। cell index = `মান − সর্বনিম্ন মান`, আর `caption`-এ স্পষ্ট করে বলা থাকে সারিটা আসলে কী।

> `style` attribute শুধু ডেটা-চালিত জ্যামিতিতে — bar-এর উচ্চতা ও span-এর প্রস্থ/অবস্থান। gauge width-এর মতোই ব্যতিক্রম; রং/বর্ডার/radius সবই role class-এ।

---

### ☁️ Google Sheets Sync Modal
- **Scrim:** `overlay`; **প্যানেল:** `surface-panel`
- Apps Script URL ইনপুট (`surface-well`) + সেভ/বাতিল (`control`, `control--primary`)
- স্ট্যাটাস বার্তা সাফল্য/ব্যর্থতা অনুযায়ী

---

## Custom Hooks

### `useLocalStorage<T>(key, initialValue)`
`useState`-এর মতো, কিন্তু `localStorage`-এ persist করে।

---

## LocalStorage Keys

| Key | Type | ব্যবহার |
|-----|------|--------|
| `dsa_selected_pattern_id` | `string` | শেষ দেখা প্যাটার্ন |
| `dsa_sheet_script_url` | `string` | Google Apps Script endpoint |

> `dsa_dark_mode` কী **অবসরপ্রাপ্ত** — সাইট dark-only, toggle নেই।
> Solved ও notes এখন localStorage-এ নয়, Google Sheet-এ থাকে।

---

## Utility Functions

### `usePatternSim(steps): PatternSim`
টাইমলাইন ইঞ্জিন — `stepIndex, step, totalSteps, isPlaying, isFinished, speed, play, pause, next, prev, goTo, reset, setSpeed`।
দুটো সিদ্ধান্ত load-bearing: (১) **শেষ স্টেপে থেমে যায়, rewind করে না** — DP/backtracking-এর উত্তর শেষ স্টেপেই থাকে; (২) pause/resume "কতটা দেখা হয়েছে" ব্যাংক করে রাখে, নাহলে speed বদলালে স্টেপ শুরু থেকে চলত।
`steps` array-এর identity বদলালে **render-এর সময়ই** রিসেট হয় (effect-এ নয় — নাহলে পুরনো state-এর এক ফ্রেম দেখা যেত)।

### `getSimulation(patternId): PatternSimulation | null`
Sparse lookup। simulation নেই এমন প্যাটার্নে `null` — তখন `SimulationBlock` render-ই হয় না।

### `parseDsaWorkbook(): Topic[]`
`context/dsa-workbook.md` পড়ে `Topic[]` return করে। **Server-only** (`fs`)।
পার্স করে: `## N. Topic`, `### N.M Pattern`, recognize, demo, statement, approach, code block, complexity, problem list।
