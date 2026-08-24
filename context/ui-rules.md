# UI Rules — DSA Prep Tracker

এই ফাইলে প্রজেক্টের UI/UX নিয়মাবলী, আর্কিটেকচারাল কনভেনশন এবং কম্পোনেন্ট ব্যবহারের নির্দেশিকা আছে।

> **স্ট্যাটাস:** বর্তমান স্পেসিফিকেশন (Next.js App Router, static export, Tailwind CSS v4, Theme Contract / `control-room.css`, dark-only)।

---

## ১. স্থাপত্য নিয়ম (Architecture Rules)

### Server vs Client বিভাজন
- **Server Component** (`app/page.tsx`) — শুধু ডেটা পার্স করে (`parseDsaWorkbook()`)। `app/utils/dsaParser.ts` `fs` ব্যবহার করে, তাই সম্পূর্ণ **server-only** — ক্লায়েন্ট কম্পোনেন্ট থেকে কখনো ইম্পোর্ট করবেন না।
- **Client Component** (`app/TrackerClient.tsx`) — সব UI লজিক, state, event handler, Google Sheets সিঙ্ক।

### State Management
- **UI state** (নির্বাচিত প্যাটার্ন expand/collapse, drawer, modal): `useState`।
- **Persistent state** (নির্বাচিত প্যাটার্ন আইডি, Apps Script URL): `useLocalStorage`।
- **Remote state** (solved, notes): Google Apps Script endpoint — `sheetUrl` সেট না থাকলে অ্যাপ ডেটা দেখায় না, খালি স্টেট দেখায়।
- গ্লোবাল স্টেট লাইব্রেরি (Redux, Zustand) প্রজেক্টে **নিষিদ্ধ** — দরকার নেই।

### Data Flow
- একমুখী: `page.tsx → TrackerClient → sub-components`।
- Sub-component থেকে parent-এ callback prop দিয়ে যোগাযোগ; Context API-এর আগে ভাবুন সত্যিই দরকার কি না।

---

## ২. ডিজাইন নিয়ম ও Theme Contract

সাইটের সমস্ত ভিজ্যুয়াল সিদ্ধান্ত **Theme Contract** (`app/globals.css` ও `app/themes/control-room.css`)-এ সংরক্ষিত। পূর্ণ টোকেন তালিকা ও role class-এর তালিকা: `context/ui-tokens.md`।

### অলঙ্ঘনীয় কনট্র্যাক্ট
1. **কম্পোনেন্টে কোনো ভিজ্যুয়াল ক্লাস নয়:** কোনো রঙ (`text-zinc-*`, `bg-indigo-*`), কোণা (`rounded-*`), শ্যাডো (`shadow-*`), বর্ডার উইডথ (`border-2`), কেস (`uppercase`), ট্র্যাকিং (`tracking-*`) বা ফন্ট ওয়েট (`font-bold`) কম্পোনেন্টে বসবে না। এগুলো role class-এ থাকবে।
2. **Tailwind শুধু লেআউটের জন্য:** `flex`, `grid`, `gap`, `w-`, `h-`, `min-*`, `max-*`, `p-*`, `m-*`, `truncate`, `overflow-*`, `absolute`/`relative`, `z-*` অনুমোদিত।
3. **Hardcoded রঙ কোথাও নয়:** সব রঙ `--t-*` ভেরিয়েবল দ্বারা নিয়ন্ত্রিত।
4. **Dark-only সাইট:** `dark:` ভ্যারিয়েন্ট, `.dark` ক্লাস বা theme toggle লিখবেন না। light চাইলে সেটা নতুন থিম ফাইল।
5. **Glassmorphism ও gradient বাতিল:** control-room matte ও gradient-হীন। `backdrop-filter` শুধু `--t-overlay-filter`-এর মাধ্যমে, থিমের সিদ্ধান্ত হিসেবে।

### ফন্ট শেল্ফ (৫ Family)
`app/layout.tsx`-এ লোড: Barlow Semi Condensed (`--t-font-sans`), JetBrains Mono (`--t-font-mono`), Noto Sans Bengali (sans fallback — বাংলা), Archivo ও Archivo Black (রিজার্ভ)। নতুন ফন্ট ইম্পোর্ট করাই `layout.tsx` এডিটের একমাত্র কারণ।

---

## ৩. কম্পোনেন্ট ও লেআউট নিয়ম

### Panel ও Well
```tsx
// ✅ সঠিক
<div className="surface-panel p-4 sm:p-6 md:p-8 flex flex-col gap-6">...</div>
<div className="surface-well p-4">...</div>

// ❌ ভুল — সরাসরি Tailwind ভিজ্যুয়াল ক্লাস
<div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">...</div>
```

### কন্ট্রোল ও বাটন
```tsx
// ✅ সঠিক — অবস্থা attribute-এ, চেহারা থিমে
<button type="button" className="control control--primary py-2 px-6 text-xs">
  Set App Script URL
</button>
```

### সলভ টগল (Check)
```tsx
// ✅ সঠিক — নেটিভ চেকবক্সই থাকে (সেমান্টিক্স ও কীবোর্ড ব্রাউজারের),
//    `.check` শুধু চেহারা নেয়; টিক-চিহ্নটি থিমের background image
<input
  type="checkbox"
  checked={isSolved}
  onChange={() => toggleSolved(problem.id)}
  aria-label={`${problem.name} — সলভ হয়েছে`}
  className="check"
/>
```

### প্রোগ্রেস অনুপাত (Gauge)
```tsx
// ✅ সঠিক — gauge কতটুকু, a11y সহ
<div
  role="progressbar"
  aria-valuenow={progressPercent}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="সার্বিক অগ্রগতি"
  className="gauge h-2 w-full"
>
  <div className="gauge-fill" style={{ width: `${progressPercent}%` }} />
</div>
```

### কোড ব্লক
```tsx
// ✅ সঠিক — copy বাটন hover/focus-এ আসে, চেহারা CSS-এর
<div className="group relative">
  <div className="codeblock-copy absolute right-3 top-3 z-10">
    <button className="control px-3 py-1.5 text-xs">Copy</button>
  </div>
  <pre className="codeblock p-4"><code>{demoCode}</code></pre>
</div>
```

### Inline code
`.code-inline` শুধু প্লেট দেয়, ইঙ্ক নয় — রঙ কলার ঠিক করে: input-এ `t-ok`, output-এ `t-accent`।

### Responsive Design
- **Desktop-first, কিন্তু responsive বাধ্যতামূলক।** Breakpoints: `sm:`, `md:`, `lg:`।
- Sidebar: মোবাইলে drawer (`.overlay` + `.animate-slide-in-left`), `lg:`-এ স্থায়ী কলাম।
- আকারের ধাপ: `text-xl sm:text-2xl md:text-3xl` প্যাটার্ন।

---

## ৪. Accessibility (a11y) নির্দেশিকা

- **Landmark:** পেজে একটাই `<main>`। ভেতরে দরকার হলে `role="region"`।
- **Form Controls:** প্রতিটি ইনপুট/টেক্সটএরিয়ায় দৃশ্যমান `<label htmlFor>` অথবা স্পষ্ট `aria-label`।
- **Collapsibles:** টগল বাটনে `aria-expanded` ও `aria-controls`।
- **Progressbar:** প্রতিটি `.gauge`-এ `role="progressbar"` + `aria-valuenow/min/max` + `aria-label`।
- **Check:** `role="checkbox"` + `aria-checked` + `aria-label`; শুধু রঙ দিয়ে অবস্থা বোঝানো যাবে না।
- **Focus:** কোনো role-এ `focus:outline-none` লিখে রিং মুছবেন না — কনট্র্যাক্ট প্রতিটি ইন্টারঅ্যাকটিভ role-এ একই amber রিং দেয়।
- **Link:** নেভিগেশনে সবসময় `<a>` বা `<button>`, `<div onClick>` নয়।
- **বাংলা লেবেলিং:** ব্যবহারকারীর দেখা টেক্সট ও aria-label বাংলায়; কোড, প্রবলেম নাম ও টেকনিক্যাল টার্ম ইংরেজিতে।

---

## ৫. কী করবেন না (Anti-patterns)

| ❌ করবেন না | ✅ করুন |
|------------|--------|
| Hardcoded hex/rgb color | CSS token (`--t-*`) ও role class |
| ভিজ্যুয়াল স্টাইলিংয়ের জন্য inline `style={{ }}` | Role class (ব্যতিক্রম: dynamic gauge width) |
| `dark:` ভ্যারিয়েন্ট বা `.dark` ক্লাস | Dark-only theme contract |
| `.glass-panel`, gradient টেক্সট | `surface-panel`, `t-title` + `t-accent` |
| নেটিভ `<input type="checkbox">` স্টাইল করা | `.check` + `role="checkbox"` |
| সরাসরি `localStorage` এক্সেস | `useLocalStorage` কাস্টম হুক |
| অনিবন্ধিত নতুন ফন্ট ইম্পোর্ট | লেআউটে সংজ্ঞায়িত ৫-ফন্ট শেল্ফ |
| লেবেল ছাড়া ইনপুট/টেক্সটএরিয়া | `htmlFor` + `id` অথবা `aria-label` |
