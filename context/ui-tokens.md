# Theme Contract — এক-ফাইল থিমিং

`dsa_prep`-এর সব ভিজ্যুয়াল সিদ্ধান্ত CSS-এ থাকে, কম্পোনেন্টে নয়।
কনট্র্যাক্টটি `system_design` প্রজেক্টের সাথে অভিন্ন — দুই সাইট একই মেশিনের অংশ হিসেবে পড়া যায়।

## থিম বদলানো

```css
/* app/globals.css — লাইন ৮ */
@import "./themes/control-room.css";
```

**এই একটা লাইনই** পুরো সাইটের চেহারা ঠিক করে। বর্তমান থিম: `control-room.css` (একমাত্র থিম)।

**নতুন থিম লিখতে:** `app/themes/<name>.css`-এ একটা `:root {}` ব্লক, নিচের সব `--t-*` ভেরিয়েবল সেট করে। তারপর উপরের লাইনটা বদলান। **কম্পোনেন্টে কখনো হাত দেবেন না।**

> সাইট **dark-only**। `.dark` ক্লাস নেই, `dark:` ভ্যারিয়েন্ট নেই, theme toggle নেই। light চাইলে সেটা একটা নতুন থিম ফাইল, কোড পরিবর্তন নয়।

---

## অলঙ্ঘনীয় নিয়ম

1. **কম্পোনেন্টে কোনো ভিজ্যুয়াল সিদ্ধান্ত নয়।** রঙ তো নয়ই — `rounded-*`, `shadow-*`, `border-2`, `uppercase`, `tracking-*`, `font-bold` কোনোটাই না। এগুলো role class-এ থাকে।
2. **Tailwind শুধু লেআউটের জন্য** — `flex`, `grid`, `gap`, `w-`, `h-`, `p-`, `m-`, `truncate`, `overflow-*`, `absolute`/`relative`, `z-`।
3. **কম্পোনেন্ট বলে *কী*, থিম বলে *কেমন*।** `aria-checked`, `aria-current`, `data-chosen` — অবস্থা জানায়; সেটা দেখতে কেমন হবে তা CSS ঠিক করে।
4. **নতুন ভিজ্যুয়াল দরকার হলে আগে কনট্র্যাক্টে role + টোকেন যোগ করুন**, তারপর থিম ফাইলে মান দিন।

---

## Role classes (`app/globals.css`)

| শ্রেণি | ক্লাস |
|---|---|
| Surface | `surface-app` `surface-panel` `surface-raised` `surface-well` |
| Text | `t-title` `t-label` `t-body` `t-caption` `t-mono` `t-strong` `t-accent` `t-muted` `t-faint` `t-ok` `t-quote` |
| Seam | `seam` `seam-b` `seam-b-heavy` `seam-t` `seam-l` |
| Control | `control` + `control--primary` `control--alert` `control--quiet` |
| Spinner | `spinner` — কাজ চলছে; ইঙ্ক `currentColor` থেকে আসে |
| Chip | `chip` + `chip--accent` `chip--alert` `chip--ok` |
| Callout | `callout` + `callout--accent` `callout--alert`; `option` |
| Nav | `row` `overlay` |
| **Measure** | **`measure`** — পাঠ্য কলামের সর্বোচ্চ প্রস্থ (`--t-measure`) |
| **Check** | **`check`** — সলভ টগল (`aria-checked`) |
| **Code** | **`codeblock`** / `codeblock-copy` / `code-inline` |
| **Gauge** | **`gauge` / `gauge-fill`** (+ `data-tone="ok"`) — অনুপাত দেখানো বার |
| **Simulation** | **`sim-stage` `sim-cell` `sim-index` `sim-cell-value` `sim-subvalue` `sim-pointer` `sim-window-tag` `sim-bar-track` `sim-bar` `sim-bar-fill` `sim-span` `sim-axis` `sim-entry` `sim-out` `sim-var` `codeline` `codeline-no` `sim-scrub`** — প্যাটার্ন প্লেয়ার (বিস্তারিত `ui-registry.md` → 🎬 Simulation) |

### State attributes

| অ্যাট্রিবিউট | কোথায় | অর্থ |
|---|---|---|
| `aria-checked` | `.check` | প্রবলেম সলভ হয়েছে |
| `aria-current` | `.row` | নির্বাচিত প্যাটার্ন |
| `data-chosen` | `.option` | বাছাই করা শাখা |
| `data-tone` | `.gauge-fill` | `ok` হলে সাফল্যের রঙে |
| `data-mark` | `.sim-cell` `.sim-bar` `.sim-span` `.sim-entry` | `active` / `done` / `reject` / `fill` |
| `data-cursor` | `.sim-cell` `.sim-span` | এই মুহূর্তের ঘর |
| `data-window` | `.sim-cell` | window বা bounds-এর ভেতরে |
| `data-wide` | `.sim-stage` | বড় করে দেখা |
| `data-active` | `.codeline` | এই লাইনটা এখন চলছে |
| `aria-pressed` | `.control` | চাপা অবস্থার বাটন (speed) |

> `.code-inline` ইঙ্ক নিজে ঠিক করে না — প্লেট দেয় মাত্র। রঙ কলারের (`t-ok` = input, `t-accent` = output)।

---

## থিম টোকেন (`--t-*`)

নতুন থিম ফাইলে এগুলো সব সেট করতে হবে। রেফারেন্স: `app/themes/control-room.css`।

- **Layout:** `measure`
- **Type:** `font-sans` `font-mono` `title-family|weight|tracking|transform` `label-family|size|weight|tracking|transform` `control-family|weight|tracking|transform` `quote-style`
- **Motion:** `ease` `spinner-width` `spinner-speed` `lamp-blink-animation`
- **App:** `app-bg` `app-bg-image|size` `select-bg|fg` `overlay-bg|filter` `disabled-opacity` `hover-fill` `selected-bg|fg` `accent` `ok` `ok-soft`
- **Text:** `text-title` `text-body` `text-label` `text-muted` `text-faint`
- **Surface:** `panel-*` `raised-*` `well-*` `seam` `seam-heavy`
- **Control:** `control-*` `primary-*` `alert-*`
- **Chip / Callout:** `chip-*` `callout-*`
- **Scrollbar:** `scrollbar-size|track|thumb|thumb-hover`
- **Gauge:** `gauge-track` `gauge-border` `gauge-border-width` `gauge-radius` `gauge-fill` `gauge-fill-glow`
- **Check:** `check-size|radius|bg|border|border-width|shadow|border-hover` `check-on-bg|border|fg|shadow`
- **Code:** `code-family|size|leading|fg|bg|border|border-width|radius|shadow` `code-inline-size|bg|border`
- **Simulation:** `sim-stage-*` `sim-cell-*` `sim-active-*` `sim-done-*` `sim-reject-opacity` `sim-fill-*` `sim-window-rail|-width` `sim-index-*` `sim-pointer-*` `sim-bar-*` `sim-span-*` `sim-axis-border` `codeline-active-*` `codeline-no-*` `sim-scrub-*`

> `system_design`-এর `canvas-*`, `wire-*`, `packet-*`, `unit-*`, `diagram-*`, `doc-*` পরিবারগুলো এখানে **নেই** — সেগুলো সিমুলেটর ও লম্বা রিডিং কলামের, যার কোনোটাই এই অ্যাপে নেই।

---

## ফন্ট শেল্ফ (`app/layout.tsx`)

পাঁচটি family একবারই লোড হয়; থিম ঠিক করে কোন role কোনটি পায়।

| ভেরিয়েবল | ফন্ট | control-room-এ ভূমিকা |
|---|---|---|
| `--font-condensed` | Barlow Semi Condensed | `--t-font-sans` — title, control |
| `--font-mono-family` | JetBrains Mono | `--t-font-mono` — label, code, readout |
| `--font-bengali` | Noto Sans Bengali | `--t-font-sans`-এর fallback — বাংলা ব্যাখ্যা ও নোট |
| `--font-grotesk` | Archivo | রিজার্ভ |
| `--font-display` | Archivo Black | রিজার্ভ |

> Latin ফেসগুলোতে বাংলা glyph নেই। `--t-font-sans`-এর স্ট্যাকে Noto Sans Bengali **দ্বিতীয়** — তাই latin লেবেল condensed চরিত্র রাখে, বাংলা নির্দিষ্টভাবে Noto-তে পড়ে, ব্রাউজারের এলোমেলো fallback-এ নয়।
>
> নতুন family যোগ করাই `layout.tsx` এডিট করার **একমাত্র** কারণ।
