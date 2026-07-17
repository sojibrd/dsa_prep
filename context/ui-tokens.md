# UI Tokens — DSA Prep Tracker

এই ফাইলে প্রজেক্টের সম্পূর্ণ ডিজাইন টোকেন সিস্টেম আছে।
সব রং, স্পেসিং, টাইপোগ্রাফি এখান থেকে নিন — কখনো hardcoded value ব্যবহার করবেন না।

---

## Color Tokens (CSS Custom Properties)

`globals.css`-এ সংজ্ঞায়িত। Light ও Dark উভয়ের জন্য আলাদা মান আছে।

### Light Mode (`:root`)

| Token | Value | ব্যবহার |
|-------|-------|--------|
| `--background` | `#f5f7fb` | Page background |
| `--foreground` | `#18181b` | Primary text |
| `--card-bg` | `rgba(255,255,255,0.7)` | Glass card background |
| `--card-border` | `rgba(228,228,231,0.6)` | Glass card border |
| `--primary` | `#4f46e5` | Indigo — primary action, selected state |
| `--primary-hover` | `#4338ca` | Primary hover state |
| `--accent` | `#06b6d4` | Cyan — accent, gradient endpoint |
| `--success` | `#10b981` | Emerald — solved/done state |
| `--shadow` | `0 4px 30px rgba(0,0,0,0.03)` | Card shadow |
| `--glow` | `0 0 20px rgba(79,70,229,0.1)` | Indigo glow effect |

### Dark Mode (`.dark`)

| Token | Value | পরিবর্তন |
|-------|-------|--------|
| `--background` | `#09090b` | Zinc-950 |
| `--foreground` | `#f4f4f5` | Zinc-100 |
| `--card-bg` | `rgba(24,24,27,0.6)` | Dark glass |
| `--card-border` | `rgba(39,39,42,0.8)` | Dark border |
| `--primary` | `#6366f1` | Lighter indigo |
| `--primary-hover` | `#4f46e5` | |
| `--accent` | `#22d3ee` | Lighter cyan |
| `--success` | `#34d399` | Lighter emerald |
| `--shadow` | `0 4px 30px rgba(0,0,0,0.3)` | Darker shadow |
| `--glow` | `0 0 25px rgba(99,102,241,0.15)` | Stronger glow |

---

## Tailwind Color Palette

এই প্রজেক্টে Tailwind-এর zinc scale মূল palette।

| Scale | Light Mode ব্যবহার | Dark Mode ব্যবহার |
|-------|------------------|-----------------|
| `zinc-50` | Page bg | — |
| `zinc-100` | Subtle bg, badge bg | — |
| `zinc-200` | Border, divider | — |
| `zinc-400` | Muted text, icons | — |
| `zinc-500` | Secondary text | — |
| `zinc-600` | Body text | — |
| `zinc-800` | — | Subtle bg |
| `zinc-900` | Code block bg | Dark card bg |
| `zinc-950` | — | Page bg |

### Semantic Colors (Tailwind utility classes)

| উদ্দেশ্য | Light | Dark |
|---------|-------|------|
| Primary / Selected | `text-indigo-600`, `bg-indigo-500/10` | `text-indigo-400` |
| Accent / Gradient end | `text-cyan-600` | `text-cyan-400` |
| Success / Solved | `text-emerald-600`, `bg-emerald-500/5` | `text-emerald-400` |
| Must-do badge | `text-amber-600`, `bg-amber-500/10` | `text-amber-400` |
| Warning / Info | `text-cyan-600`, `bg-cyan-500/5` | `text-cyan-400` |

---

## Typography

### Fonts

| ভ্যারিয়েবল | ফন্ট | ব্যবহার |
|-----------|------|--------|
| `--font-geist-sans` | Geist Sans | সব body text |
| `--font-geist-mono` | Geist Mono | Code blocks |

### Text Scale (Tailwind)

| Class | Size | ব্যবহার |
|-------|------|--------|
| `text-[10px]` | 10px | Badge labels, tiny counters |
| `text-xs` | 12px | Meta info, secondary labels |
| `text-sm` | 14px | Body text, problem names |
| `text-base` | 16px | Standard text |
| `text-lg` | 18px | Section headings |
| `text-xl` | 20px | Navbar title |
| `text-2xl` | 24px | Pattern name (mobile) |
| `text-3xl` | 30px | Pattern name (desktop) |

### Font Weight

| Class | ব্যবহার |
|-------|--------|
| `font-medium` | Labels |
| `font-semibold` | Problem names, section titles |
| `font-bold` | Headings, pattern names |
| `font-extrabold` | Main pattern title |

---

## Spacing & Layout

| টোকেন | Value | ব্যবহার |
|-------|-------|--------|
| Sidebar width | `w-[360px]` (lg+) | Left navigation panel |
| Max content width | `max-w-[1600px]` | Main container |
| Page padding | `p-4 md:p-6 lg:p-8` | Responsive body padding |
| Card padding (sm) | `p-4` | Problem card inner |
| Card padding (md) | `p-5` | Dashboard cards |
| Card padding (lg) | `p-6 md:p-8` | Main content panel |
| Gap (sidebar items) | `gap-4`, `gap-5` | Topic/pattern spacing |
| Gap (problems) | `gap-3` | Problem card list |

---

## Border Radius

| Class | ব্যবহার |
|-------|--------|
| `rounded-lg` | Buttons, small cards |
| `rounded-xl` | Input fields, info boxes |
| `rounded-2xl` | Problem cards |
| `rounded-3xl` | Main content panel |
| `rounded-full` | Progress bar, pills, badges |

---

## Gradients

| ব্যবহার | Definition |
|--------|-----------|
| Logo title text | `bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent` |
| Progress bar fill | `bg-gradient-to-r from-indigo-500 to-cyan-500` |

---

## Special Effects

### Glassmorphism (`.glass-panel`)
```css
background: var(--card-bg);          /* semi-transparent */
backdrop-filter: blur(12px);
border: 1px solid var(--card-border);
box-shadow: var(--shadow);
```

**ব্যবহার করুন:** Navbar, Sidebar, Main content panel, Mobile dashboard

### Glow Effect (`.glass-glow`)
```css
box-shadow: var(--shadow), var(--glow);
```
**ব্যবহার করুন:** Highlighted / focused cards (এখনো কম ব্যবহৃত)

---

## Transitions & Animations

| উদ্দেশ্য | Class |
|---------|-------|
| Color/theme transition | `transition-colors duration-300` |
| Progress bar fill | `transition-all duration-500` |
| Hover scale | `hover:scale-105 transition-transform` |
| Opacity fade | `opacity-0 group-hover:opacity-100 transition-opacity` |
| All properties | `transition-all` |
