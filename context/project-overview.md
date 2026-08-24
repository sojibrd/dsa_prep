# Project Overview — DSA Prep Tracker

## প্রজেক্টের লক্ষ্য

একটা **ব্যক্তিগত DSA প্র্যাকটিস ট্র্যাকার** ওয়েব অ্যাপ তৈরি করা যা:

- `dsa-workbook.md` থেকে টপিক/প্যাটার্ন/প্রবলেম পার্স করে UI-তে দেখাবে
- প্রতিটা প্রবলেম সলভ করলে চেকবক্সে টিক দেওয়া যাবে (progress গুগল শিটে সেভ)
- প্রতিটা প্রবলেমের জন্য নোট (সমাধানের ধারণা + যে সমস্যা হয়েছিল) লেখা যাবে
- সামগ্রিক অগ্রগতি (কতটা সলভ হলো) দেখা যাবে

## টেকনোলজি স্ট্যাক

| লেয়ার | টেকনোলজি |
|--------|----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (লেআউট) + Theme Contract / `control-room.css` (চেহারা), dark-only |
| Font | ৫-ফন্ট শেল্ফ — Barlow Semi Condensed, JetBrains Mono, Noto Sans Bengali, Archivo ×২ (next/font) |
| Data Source | `context/dsa-workbook.md` (Markdown ফাইল, server-side পার্স) |
| State | React `useState` + `useLocalStorage` hook |
| Storage | Google Sheet (solved, notes) + `localStorage` (নির্বাচিত প্যাটার্ন, Apps Script URL) |
| Rendering | Server Component (`page.tsx`) + Client Component (`TrackerClient.tsx`) |

## ফাইল স্ট্রাকচার

```
DSA_Prep/
├── app/
│   ├── layout.tsx              # Root layout, ৫-ফন্ট শেল্ফ, metadata
│   ├── page.tsx                # Server component — dsa-workbook.md পার্স করে
│   ├── TrackerClient.tsx       # Client component — সম্পূর্ণ UI লজিক
│   ├── globals.css             # Theme Contract — role class
│   ├── themes/
│   │   └── control-room.css    # সক্রিয় থিম — সব `--t-*` মান
│   ├── components/
│   │   └── simulation/         # ধাপে ধাপে demo run — scene renderer, code pane, কন্ট্রোল
│   ├── lib/
│   │   └── simulations/        # Scene/SimStep কনট্র্যাক্ট + প্রতি প্যাটার্নের হাতে লেখা স্টেপ
│   ├── hooks/
│   │   ├── usePatternSim.ts    # সিমুলেশন টাইমলাইন ইঞ্জিন
│   │   └── useLocalStorage.ts  # Custom hook — localStorage state management
│   └── utils/
│       └── dsaParser.ts        # dsa-workbook.md পার্স করার ইউটিলিটি
├── context/
│   ├── dsa-workbook.md         # মূল ডেটা সোর্স — সব টপিক, প্যাটার্ন, প্রবলেম
│   ├── project-overview.md     # (এই ফাইল)
│   ├── build-plan.md           # বিল্ড রোডম্যাপ
│   ├── progress-tracker.md     # বর্তমান অবস্থা
│   ├── ui-tokens.md            # ডিজাইন টোকেন
│   ├── ui-rules.md             # UI/UX নিয়মাবলী
│   └── ui-registry.md          # কম্পোনেন্ট রেজিস্ট্রি
├── AGENTS.md                   # AI agent-এর নিয়মাবলী
├── next.config.ts
├── package.json
└── tsconfig.json
```

## কীভাবে কাজ করে (Data Flow)

```
dsa-workbook.md
      ↓ (server-side fs.readFileSync)
dsaParser.ts → parseDsaWorkbook() → Topic[]
      ↓ (props)
page.tsx (Server Component)
      ↓ (props: topics)
TrackerClient.tsx (Client Component)
      ↓
UI: Sidebar (topics/patterns) + Main Panel (demo + problems)
      ↓ (user interaction)
Google Sheet: solvedIds, notes   |   localStorage: selectedPatternId, sheetUrl
```

## মূল ডেটা মডেল

```typescript
interface PracticeProblem {
  id: string;          // e.g. "1.1-three-sum"
  name: string;
  leetcodeUrl: string;
  isMustDo: boolean;   // 🔥 Must-do = true, ⚪ Bonus = false
  notesLabel?: string; // optional extra hint
}

interface Pattern {
  id: string;          // e.g. "1.1"
  name: string;        // e.g. "Two Pointers"
  recognize: string;   // চিনবেন কীভাবে
  demoName: string;
  demoLink: string;    // LeetCode URL
  approach: string;
  demoCode: string;    // JavaScript code snippet
  complexity: string;
  problems: PracticeProblem[];
}

interface Topic {
  id: number;          // e.g. 1
  name: string;        // e.g. "Arrays & Strings"
  patterns: Pattern[];
}
```

## সীমাবদ্ধতা / স্কোপ বাইরে

- আলাদা Backend/Database নেই — Google Apps Script endpoint-ই স্টোর
- Authentication নেই
- Multi-user নয়
- Mobile-first নয় (responsive কিন্তু desktop-optimized)
