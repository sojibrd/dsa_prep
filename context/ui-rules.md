# UI Rules — DSA Prep Tracker

এই ফাইলে প্রজেক্টের UI/UX নিয়মাবলী এবং কম্পোনেন্ট তৈরির নির্দেশিকা আছে।
নতুন কম্পোনেন্ট বা ফিচার যোগ করার আগে এই নিয়মগুলো মেনে চলুন।

---

## ১. স্থাপত্য নিয়ম (Architecture Rules)

### Server vs Client
- **Server Component** (`page.tsx`) — শুধু ডেটা ফেচ করবে (`parseDsaWorkbook()`)
- **Client Component** (`TrackerClient.tsx`) — সব UI লজিক, state, event handler
- নতুন ফিচার যোগ করলে: Client state থাকলে Client Component-এ, pure display হলে Server-এ

### State Management
- **UI state** (selected pattern, expanded item): `useState`
- **Persistent state** (solved, notes, dark mode): `useLocalStorage` hook
- Global state management (Redux, Zustand) ব্যবহার করবেন **না** — এই প্রজেক্টে দরকার নেই

### Data Flow
- Props শুধু নিচের দিকে যাবে: `page.tsx → TrackerClient → (sub-components)`
- Sub-component থেকে parent-এ callback prop দিয়ে communicate করুন
- Context API ব্যবহার করার আগে ভাবুন — সত্যিই দরকার?

---

## ২. ডিজাইন নিয়ম (Design Rules)

### রং ব্যবহার
- `ui-tokens.md`-এর বাইরে **hardcoded hex/rgb ব্যবহার করবেন না**
- CSS custom property বা Tailwind utility class ব্যবহার করুন
- নতুন রং দরকার হলে প্রথমে `ui-tokens.md` আপডেট করুন

### Dark Mode
- **সব** নতুন UI element-এ `dark:` variant দিতে হবে
- Pattern: `bg-zinc-100 dark:bg-zinc-900`, `text-zinc-800 dark:text-zinc-200`
- Dark mode class `.dark` root `<html>` element-এ toggle হয়
- CSS custom property (`--card-bg` ইত্যাদি) স্বয়ংক্রিয়ভাবে switch করে

### Glassmorphism
- Card/panel তৈরিতে `.glass-panel` class ব্যবহার করুন (inline style নয়)
- Navbar, sidebar, main panel — সব `glass-panel` ব্যবহার করে
- নতুন modal/dropdown-এও `glass-panel` ব্যবহার করুন

### Responsive Design
- **Mobile first নয়, Desktop first** — কিন্তু responsive breakdown দিতে হবে
- Tailwind breakpoints: `sm:`, `md:`, `lg:` ব্যবহার করুন
- Sidebar: mobile-এ `w-full`, desktop-এ `w-[360px] lg:shrink-0`
- Font size: `text-2xl md:text-3xl` pattern অনুসরণ করুন

---

## ৩. কম্পোনেন্ট নিয়ম (Component Rules)

### বিদ্যমান প্যাটার্ন অনুসরণ করুন

**Card/Panel তৈরি:**
```tsx
// ✅ সঠিক
<div className="glass-panel p-6 rounded-2xl">...</div>

// ❌ ভুল
<div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px' }}>...</div>
```

**Badge তৈরি:**
```tsx
// ✅ Must-do badge
<span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/10">
  🔥 Must-do
</span>

// ✅ Bonus badge
<span className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
  ⚪ Bonus
</span>
```

**Selected/Active state:**
```tsx
// ✅ Active pattern button
className={isSelected
  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500'
  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
}
```

**Info/Highlight box:**
```tsx
// ✅ Cyan info box ("চিনবেন কীভাবে")
<div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-sm">

// ✅ Neutral code approach box
<div className="bg-zinc-100/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
```

### নামকরণ
- Component file: PascalCase (`TrackerClient.tsx`, `PatternCard.tsx`)
- Function/hook: camelCase (`useLocalStorage`, `getTopicProgress`)
- CSS class: lowercase kebab (`.glass-panel`, `.glass-glow`)
- Prop: camelCase (`isMustDo`, `demoName`)

---

## ৪. ইন্টারঅ্যাকশন নিয়ম (Interaction Rules)

### Hover Effects
- সব ক্লিকযোগ্য element-এ `transition-colors` বা `transition-all`
- Link/button hover: color shift বা subtle background change
- Scale effect শুধু icon/badge-এ: `hover:scale-105`

### Expand/Collapse
- Notes section: `expandedProblemId === problem.id` pattern
- একটাই expand হবে একসাথে (single expand)
- Toggle label পরিবর্তন: expanded হলে "Collapse ▲", না হলে "Notes / Revise ▼"

### Loading/Empty States
- Pattern না পাওয়া গেলে: `"কোনো প্যাটার্ন সিলেক্ট করা নেই।"` message দেখাও
- নতুন empty state: `glass-panel p-8 rounded-3xl text-center text-zinc-500` pattern

### Form Inputs (Textarea)
```tsx
className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 
           bg-white dark:bg-black focus:ring-1 focus:ring-indigo-500 
           focus:border-indigo-500 focus:outline-none transition-all resize-y"
```

---

## ৫. পারফরম্যান্স নিয়ম

- `parseDsaWorkbook()` শুধু Server Component-এ call করবেন (build-time এ হয়)
- Client-এ filesystem access নেই — সব data props দিয়ে pass করুন
- `useLocalStorage` hook-এ initial value দেওয়া বাধ্যতামূলক
- `localStorage` directly access করবেন না — সবসময় hook ব্যবহার করুন

---

## ৬. Accessibility নিয়ম

- সব button-এ `title` অথবা readable text দিন
- Interactive element-এ keyboard focus style থাকতে হবে (`focus:ring-*`)
- Color alone দিয়ে information বোঝাবেন না — icon বা text ও দিন (যেমন 🔥/⚪ badge)
- `<a>` tag-এ external link-এ `target="_blank" rel="noopener noreferrer"` দিন

---

## ৭. কী করবেন না (Anti-patterns)

| ❌ করবেন না | ✅ করুন |
|------------|--------|
| Hardcoded hex color | CSS token বা Tailwind class |
| `style={{ }}` inline style | Tailwind utility class |
| `localStorage.getItem()` directly | `useLocalStorage` hook |
| Multiple `useState` for related state | একটা object state বা reducer |
| New font import | শুধু Geist Sans/Mono (next/font) |
| TailwindCSS `@apply` in CSS | Utility class সরাসরি JSX-এ |
| Dark mode ছাড়া কম্পোনেন্ট | সব element-এ `dark:` variant |
