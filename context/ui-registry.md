# UI Registry — DSA Prep Tracker

বিদ্যমান সমস্ত UI কম্পোনেন্টের রেজিস্ট্রি। নতুন কম্পোনেন্ট তৈরির আগে এখানে দেখুন — হয়তো ইতিমধ্যে আছে।

> সব ভিজ্যুয়াল চেহারা role class থেকে আসে (`context/ui-tokens.md`)। নিচে যেখানে ক্লাস লেখা আছে, সেগুলো **role class**, Tailwind ভিজ্যুয়াল ক্লাস নয়।

---

## ফাইল ম্যাপ

| ফাইল | উদ্দেশ্য | টাইপ |
|------|---------|------|
| `app/page.tsx` | Root page, data parsing | Server Component |
| `app/TrackerClient.tsx` | সম্পূর্ণ UI (monolithic) | Client Component |
| `app/hooks/useLocalStorage.ts` | localStorage state hook | Custom Hook |
| `app/utils/dsaParser.ts` | Markdown পার্সার (server-only, `fs`) | Utility |
| `app/globals.css` | Theme Contract — role class | CSS |
| `app/themes/control-room.css` | সক্রিয় থিম — `--t-*` মান | CSS |
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
| Recognize | `callout callout--accent` | ভেতরে ক্লু-ম্যাচ উদাহরণ `option[data-chosen]` |
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

### `parseDsaWorkbook(): Topic[]`
`context/dsa-workbook.md` পড়ে `Topic[]` return করে। **Server-only** (`fs`)।
পার্স করে: `## N. Topic`, `### N.M Pattern`, recognize, demo, statement, approach, code block, complexity, problem list।
