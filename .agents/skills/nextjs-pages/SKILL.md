---
name: nextjs-pages
description: শূন্য থেকে একটা নতুন Next.js (App Router, TypeScript, Tailwind) প্রজেক্ট তৈরি করুন এবং GitHub Pages-এ ডিপ্লয় করুন — টার্মিনালে `create-next-app` চালিয়ে scaffold, একটা স্থির ফোল্ডার-কনভেনশন, static export + basePath config, Actions workflow, লোকাল build যাচাই আর শেষ ম্যানুয়াল ধাপ পর্যন্ত। নতুন সাইট/ব্লগ/ডকস-সাইট শুরু করার সময়, বা "Next.js প্রজেক্ট বানাও", "GitHub Pages-এ হোস্ট করো" জাতীয় অনুরোধে ব্যবহার করুন। বিদ্যমান বড় প্রজেক্টে ফিচার যোগ করার জন্য নয়।
---

আপনি একজন সিনিয়র ফ্রন্টএন্ড ইঞ্জিনিয়ার, যিনি একটা নতুন Next.js সাইট দাঁড় করিয়ে দিচ্ছেন — এমনভাবে, যাতে প্রথম দিন থেকেই সেটা GitHub Pages-এ লাইভ থাকে।

আপনার মূল নীতি: **scaffold হাতে লিখবেন না।** অফিসিয়াল `create-next-app` টার্মিনালে চালাবেন, তারপর শুধু যা যা Pages-এর জন্য দরকার সেটুকু সম্পাদনা করবেন। হাতে `package.json` বা `tsconfig.json` লেখা মানে পরের ভার্সনে নীরবে পিছিয়ে পড়া।

---

## ধাপ ০ — git থেকে সত্যটা নিন, অনুমান করবেন না

দুটো মান পুরো ডিপ্লয়কে ধরে রাখে — **repo-নাম** (যেটাই `basePath`) আর **ডিফল্ট ব্রাঞ্চ** (যেটায় workflow ট্রিগার করে)। দুটোর একটাও ভুল হলে সাইট নীরবে ভাঙে: ভুল `basePath` মানে সাদা পাতা, ভুল ব্রাঞ্চ মানে workflow কখনো চলেই না।

**এই দুটো কখনো অনুমান করবেন না, কখনো ফোল্ডার-নাম থেকে আন্দাজ করবেন না।** যেকোনো কনফিগ লেখার আগে git-কে জিজ্ঞেস করুন:

```bash
git remote -v
git branch --show-current
```

- **repo-নাম** = remote URL-এর শেষ অংশ, `.git` বাদে। `https://github.com/sojibrd/code_standards.git` → repo হলো `code_standards`, `basePath` হলো `/code_standards`।
- **ব্রাঞ্চ** = `git branch --show-current`-এর আউটপুট। `master` হলে workflow-এ `master` লিখবেন, `main` নয়।

ফাঁদটা আসল: ফোল্ডারের নাম `code_standard`, কিন্তু remote হলো `code_standards` — একটা `s`-এর তফাত, আর সাইট সাদা। ডেভেলপার প্রশ্ন ১-এ যে নামই বলুক, **remote থাকলে remote-ই জেতে** — কারণ Pages ওই নামেই সার্ভ করবে।

remote না থাকলে (`git remote -v` খালি) ঠিক আছে — প্রশ্ন ১-এর উত্তর দিয়েই এগোন, কিন্তু ধাপ ৫.১-এ push-এর ঠিক আগে আবার `git remote -v` চালিয়ে মিলিয়ে নিন। ইতিমধ্যে ডেভেলপার repo বানিয়ে ফেলতে পারেন — এবং নামটা আলোচনার চেয়ে আলাদা হতে পারে।

---

## ধাপ ১ — প্রশ্ন সেশন

কোনো কমান্ড চালানোর আগে ৫টা প্রশ্ন করুন — **একবারে একটা**, প্রতিটিতে নিজের সুপারিশ দিয়ে। ডেভেলপারকে খালি পাতা দেবেন না।

**প্রশ্ন ১ — প্রজেক্টের ফোল্ডার-নাম আর GitHub repo-নাম কী?**
> সুপারিশ: দুটো এক রাখুন। কারণ Pages-এ সাইটটা যাবে `https://<user>.github.io/<repo>/`-তে, আর ওই `<repo>` অংশটাই `basePath` — নাম আলাদা হলে পরে গুলিয়ে যায়।
>
> **আগে ধাপ ০ চালান।** remote আগে থেকে থাকলে প্রশ্নটা করবেন না — নামটা জানিয়ে দিন ("remote বলছে `code_standards`, তাই `basePath` হবে `/code_standards`") আর নিশ্চিত করে নিন। উত্তর না-জানা প্রশ্ন করলে ডেভেলপার আন্দাজে "ok" বলে দেন, আর ভুল নামটা কনফিগে বসে যায়।

**প্রশ্ন ২ — সাইটটা static export হবে, নাকি server-rendered?**
> সুপারিশ: GitHub Pages-এ যেতে চাইলে **static** ছাড়া উপায় নেই। Pages শুধু স্থির ফাইল পরিবেশন করে — কোনো Node সার্ভার চলে না।
>
> উত্তর যদি **server-rendered** হয় (API route, SSR, middleware, ISR, auth callback দরকার): সৎভাবে বলুন Pages-এ এটা চলবে না, Vercel/Netlify/Cloudflare লাগবে। তারপর ধাপ ২–৩ স্বাভাবিকভাবে করুন, কিন্তু ধাপ ৪-এ `output: "export"` বা workflow বসাবেন না।

**প্রশ্ন ৩ — কনটেন্ট কোথা থেকে আসবে?**
> ক) হাতে লেখা page — সাধারণ ল্যান্ডিং/পোর্টফোলিও
> খ) রিপোর ভেতরের markdown ফাইল — ডকস, ব্লগ, রেফারেন্স
> গ) external API — build-এর সময় fetch করা
>
> সুপারিশ: markdown হলে বলুন — কারণ তখন `react-markdown` + `remark-gfm` লাগবে আর `app/lib/content.ts`-এ একটা build-time reader দরকার হবে (ধাপ ৩ দেখুন)।

**প্রশ্ন ৪ — `src/` ডিরেক্টরি লাগবে?**
> সুপারিশ: **না**। ছোট-মাঝারি সাইটে `src/` শুধু একটা বাড়তি স্তর। `app/` রুটেই থাক।

**প্রশ্ন ৫ — package manager: npm না pnpm?**
> সুপারিশ: **npm** — workflow-এ `cache: npm` আর `npm ci` সরাসরি কাজ করে, lockfile নিয়ে ঝামেলা নেই।

পাঁচটার উত্তর পাওয়ার পর সংক্ষেপে পুনরাবৃত্তি করুন কী তৈরি হতে যাচ্ছে, তারপর কাজ শুরু করুন।

---

## ধাপ ২ — Scaffold (টার্মিনালে)

`create-next-app` ডিফল্টে ইন্টারঅ্যাকটিভ প্রশ্ন করে, আর আপনার শেল সেই প্রম্পটের উত্তর দিতে পারে না — কমান্ড ঝুলে যাবে। **তাই প্রতিটা উত্তর ফ্ল্যাগ হিসেবে দিতে হবে, এবং শেষে `--yes`।**

```bash
npx create-next-app@latest <project-name> \
  --ts --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*" \
  --use-npm --yes
```

উত্তর অনুযায়ী যা বদলাবে:

| উত্তর | ফ্ল্যাগ |
|---|---|
| `src/` লাগবে | `--src-dir` (ডিফল্ট: `--no-src-dir`) |
| pnpm | `--use-pnpm` (npm-এর বদলে) |
| ইনস্টল পরে করবেন | `--skip-install` যোগ করুন |

যা কখনো জিজ্ঞেস করবেন না, সবসময় এভাবেই থাকবে: `--ts`, `--tailwind`, `--app`, `--eslint`, `--import-alias "@/*"`।

**সতর্কতা — খালি ফোল্ডারে চালাবেন:** `create-next-app` নিজের `README.md`, `.gitignore`, `AGENTS.md`, `CLAUDE.md` লেখে। বিদ্যমান কনটেন্টওয়ালা রিপোতে সরাসরি চালালে সেগুলো চাপা পড়তে পারে। রিপোতে আগে থেকে ফাইল থাকলে: আলাদা টেম্প ফোল্ডারে scaffold করুন, তারপর যা দরকার শুধু সেগুলো রিপোতে সরান।

ইনস্টল শেষ হলে একবার নিশ্চিত করুন কী তৈরি হলো, তারপর ধাপ ৩।

---

## ধাপ ৩ — Structure বসান

`create-next-app` দেয় শুধু `app/layout.tsx` আর `app/page.tsx`। এর ওপর এই স্থির ট্রি-টা বসান:

```
app/
├── layout.tsx          → font, metadata, theme script, global shell
├── page.tsx            → হোম — পাতলা, শুধু data এনে কম্পোনেন্টে পাঠায়
├── globals.css         → CSS variable-এ token, light/dark
├── components/         → সব UI কম্পোনেন্ট
└── lib/                → server-side logic, build-time data read
public/                 → static asset
.github/workflows/deploy.yml
```

তিনটে নিয়ম — এগুলোই কনভেনশনটাকে দাঁড় করায়:

1. **`page.tsx` পাতলা থাকবে।** data আনবে, কম্পোনেন্টে পাঠাবে, নিজে UI লিখবে না। পাতা বদলালেও UI কম্পোনেন্ট অক্ষত থাকে।
2. **`lib/` কখনো client-এ যাবে না।** `fs`, build-time read, secret — সব এখানে। `"use client"` এই ফোল্ডারে নিষিদ্ধ।
3. **`"use client"` যতটা নিচে সম্ভব।** পুরো পাতা client বানাবেন না — শুধু যে কম্পোনেন্টে state বা event handler আছে সেটাই। উপরে তুললে পুরো ট্রি bundle-এ চলে যায়।

**কনটেন্টের উত্তর যদি "markdown" হয়**, এটুকু বাড়তি:

```bash
npm install react-markdown remark-gfm
npm install -D @tailwindcss/typography
```

- `app/lib/content.ts` — `fs` দিয়ে markdown ফোল্ডার স্ক্যান করে, প্রথম `# heading` থেকে টাইটেল নেয়, nav ট্রি আর ডকের তালিকা রিটার্ন করে। server-only।

  **reader-টা ফোল্ডার-কাঠামোর ব্যাপারে উদাসীন হতে হবে।** ডেভেলপার কাল সব ডক `docs/`-এ সরাতে পারেন, বা একটা স্তর গভীরে নিতে পারেন — তাতে nav ভাঙা চলবে না। দুটো নিয়ম:
  - nav-এর গ্রুপ বানান **সরাসরি parent ফোল্ডার** দিয়ে (`path.split("/").at(-2)`), top-level ফোল্ডার দিয়ে নয়। top-level ধরলে `docs/` স্তর যোগ হওয়ামাত্র `docs/ember/`, `docs/react/` — সব একটাই "docs" গ্রুপে চেপ্টে যায়।
  - ফাইলের তালিকা হার্ডকোড করবেন না। স্ক্যান করুন, আর বাদ দেওয়ার ফোল্ডারগুলো একটা ignore-set-এ রাখুন (`node_modules`, `.next`, `out`, `.git`, `app`, `public`, dot-folder)। তাহলে নতুন `vue/RULES.md` যোগ করলে route আর nav নিজেই আসে।
- `app/[...slug]/page.tsx` — `generateStaticParams()` ওই তালিকা থেকে প্রতিটা পাতা প্রি-রেন্ডার করে।
- `app/components/Markdown.tsx` — `"use client"`, `react-markdown` + `remark-gfm`। **markdown-এর ভেতরের রিলেটিভ লিংক (`../foo/`, `README.md`) সাইট-রুটে রূপান্তর করতে একটা কাস্টম `a` রেন্ডারার লিখুন** — না লিখলে রিপোর ভেতরের ক্রস-লিংকগুলো সাইটে ৪০৪ দেবে।
- `globals.css`-এ `@plugin "@tailwindcss/typography";` যোগ করে prose ক্লাস ব্যবহার করুন।

---

## ধাপ ৪ — GitHub Pages config

**শুধু static-এর ক্ষেত্রে।** server-rendered বেছে নিলে এই ধাপ বাদ।

`next.config.ts` পুরোটা এভাবে লিখুন — `<repo>` জায়গায় **ধাপ ০-এ `git remote -v` থেকে পাওয়া** নামটা, আলোচনার নাম নয়:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS ? "/<repo>" : "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

কেন প্রতিটা লাইন আছে:
- `output: "export"` — Node সার্ভারের বদলে `out/`-এ স্থির HTML
- `basePath` — সাইট রুটে নয়, `/<repo>/`-তে বসে; `GITHUB_ACTIONS` দিয়ে বাঁধা যাতে লোকালি `localhost:3000` স্বাভাবিক থাকে
- `trailingSlash` — Pages ডিরেক্টরি-ভিত্তিক, `/about/index.html` দরকার
- `images.unoptimized` — Next-এর image optimizer সার্ভার চায়, static export-এ নেই

`.github/workflows/deploy.yml` পুরোটা — নিচের `branches:`-এ **ধাপ ০-এ `git branch --show-current` যা দিয়েছে** সেটা বসাবেন। টেমপ্লেটে `main` লেখা আছে বলে `main` রেখে দেবেন না; বেশিরভাগ পুরনো রিপোতে ওটা `master`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build and Export
        run: npm run build

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

দুটো জায়গা মিলিয়ে নিন:
- `branches:` — `git branch --show-current`-এর সাথে অক্ষরে অক্ষরে মেলান। না মিললে workflow কোনো error দেবে না, শুধু কখনো চলবে না — আর এই নীরবতাটাই ধরা কঠিন
- pnpm হলে: `cache: pnpm`, আর `npm ci`-এর আগে `pnpm/action-setup@v4` স্টেপ যোগ করে `pnpm install --frozen-lockfile` + `pnpm build`

---

## ধাপ ৫ — যাচাই ও ডিপ্লয়

**৫.১ — লোকালি CI-এর মতো build করুন। এই ধাপটা বাদ দেবেন না।**

```bash
GITHUB_ACTIONS=true npm run build
```

PowerShell-এ: `$env:GITHUB_ACTIONS="true"; npm run build`

তারপর `out/index.html` খুলে দেখুন লিংক আর asset-এর path `/<repo>/...` দিয়ে শুরু হচ্ছে কি না। না হলে `basePath` ভুল — এখনই ধরুন, CI-তে গিয়ে ১০ মিনিট নষ্ট করার আগে।

**৫.২ — push-এর ঠিক আগে চারটে জিনিস আবার মিলিয়ে নিন।**

scaffold করা আর push করার মাঝে সময় গেছে — ওই ফাঁকে ডেভেলপার repo বানিয়েছেন, ফাইল সরিয়েছেন, ব্রাঞ্চ বদলেছেন। শুরুতে যা সত্য ছিল, এখন নাও হতে পারে। **স্মৃতি থেকে নয়, কমান্ড চালিয়ে যাচাই করুন:**

```bash
git remote -v            # repo-নাম ↔ next.config.ts-এর basePath
git branch --show-current # ব্রাঞ্চ ↔ deploy.yml-এর branches:
git status --short        # কোনো কনটেন্ট ফাইল untracked/সরানো আছে কি?
```

চারটে চেক:

1. `basePath`-এর নাম remote URL-এর শেষ অংশের সমান কি? (একটা অক্ষরের তফাতও যথেষ্ট)
2. `deploy.yml`-এর `branches:` বর্তমান ব্রাঞ্চের সমান কি?
3. `git status`-এ কোনো markdown untracked (`??`) বা মুছে-যাওয়া (`D`) আছে কি? untracked ফাইল CI-তে থাকবেই না — সেই পাতাটা কখনো তৈরি হবে না, লোকালি নিখুঁত চললেও।
4. কনটেন্ট ফাইল সরে থাকলে route-ও সরেছে। আরেকবার build করে নতুন route-এর তালিকা দেখুন, আর ডক-এর ভেতরের পাথ-উল্লেখগুলো বাসি হয়ে গেছে কি না বলুন।

**৫.৩ — commit ও push।**

push একটা বাইরের দিকে যাওয়া কাজ — **করার আগে ডেভেলপারের অনুমতি নিন**, নিজে থেকে ঠেলে দেবেন না। রিপো এখনো তৈরি না থাকলে বলুন আগে GitHub-এ বানিয়ে remote যোগ করতে; নিজে repo বানাবেন না।

**৫.৪ — শেষ ধাপটা ডেভেলপারের, এটা স্পষ্ট করে বলুন:**

> GitHub → repo Settings → Pages → **Source: GitHub Actions** বেছে নিন।

এটা না করলে workflow সফল হলেও সাইট লাইভ হবে না। API ছাড়া এটা আপনি করতে পারবেন না — তাই ধরে নেবেন না যে হয়ে গেছে, স্পষ্ট করে বলুন। সাইটের ঠিকানা জানিয়ে দিন: `https://<user>.github.io/<repo>/`

---

## ট্রাবলশুটিং

| উপসর্গ | কারণ | সমাধান |
|---|---|---|
| সাইট খোলে কিন্তু CSS/JS নেই, সাদা পাতা | `basePath` বসেনি বা ভুল repo-নাম (`code_standard` vs `code_standards`) | `git remote -v` চালিয়ে আসল নাম নিন, `next.config.ts` ঠিক করুন, `GITHUB_ACTIONS=true` দিয়ে build করে `out/index.html`-এ path মিলিয়ে দেখুন |
| push হলো, কিন্তু Actions ট্যাবে কোনো run-ই নেই | workflow-এর `branches:` ব্রাঞ্চের সাথে মিলছে না (`main` বনাম `master`) | `git branch --show-current` চালিয়ে `deploy.yml`-এ ঠিক করুন। কোনো error দেখাবে না — নীরবে কিছুই হয় না |
| একটা ডক-পাতা ৪০৪, বাকিগুলো ঠিক | ফাইলটা commit হয়নি — `git status`-এ `??` | ফাইলটা commit করুন; CI শুধু commit করা ফাইল দেখে, আপনার ডিস্ক নয় |
| nav-এর সব ডক একটাই গ্রুপে চেপ্টে গেছে | গ্রুপিং top-level ফোল্ডার দিয়ে হচ্ছে, আর সব `docs/`-এর নিচে | `content.ts`-এ সরাসরি parent ফোল্ডার দিয়ে গ্রুপ করুন (`path.split("/").at(-2)`) |
| ভেতরের পাতায় ৪০৪ | `trailingSlash` নেই | `trailingSlash: true` |
| workflow-এ `Resource not accessible by integration` | Pages-এর Source এখনো "Deploy from a branch" | Settings → Pages → Source: GitHub Actions |
| build-এ `Image Optimization … requires a server` | static export-এ Next image optimizer চলে না | `images: { unoptimized: true }` |
| build-এ `useState/onClick … Server Component` | client কোড server component-এ | ফাইলের উপরে `"use client"` — তবে যত নিচের কম্পোনেন্টে সম্ভব |
| `npm ci` ব্যর্থ | lockfile commit হয়নি | `package-lock.json` commit করুন (`.gitignore`-এ যেন না থাকে) |
| `create-next-app` ঝুলে আছে | ফ্ল্যাগ অসম্পূর্ণ, ইন্টারঅ্যাকটিভ প্রম্পটে আটকে | কমান্ড বাতিল করে ধাপ ২-এর পূর্ণ ফ্ল্যাগসহ `--yes` দিয়ে আবার চালান |

---

## এই skill যা নয়

বিদ্যমান বড় প্রজেক্টে ফিচার যোগ করার জন্য নয় — এটা নতুন সাইট দাঁড় করানোর জন্য। ফিচার ডিজাইনের দরকার হলে `architect`।

ডিজাইন সিস্টেম নয়। এটা কাঠামো আর ডিপ্লয় পাইপলাইন ঠিক করে দেয়; UI-এর চেহারা আলাদা কাজ।
