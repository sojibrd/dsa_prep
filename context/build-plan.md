# Build Plan — DSA Prep Tracker

## বর্তমান অবস্থা

প্রজেক্টের **v1 (MVP) সম্পূর্ণ**। মূল ফিচারগুলো কাজ করছে:

- ✅ `dsa-workbook.md` পার্স → Topic/Pattern/Problem UI
- ✅ Sidebar — টপিক ও প্যাটার্নের ন্যাভিগেশন + per-topic progress counter
- ✅ Main panel — pattern header, চিনবেন কীভাবে, demo (code + approach + complexity), problem list
- ✅ Checkbox solve/unsolved → localStorage persist
- ✅ Expand/collapse notes per problem (solution idea + obstacle)
- ✅ Dark/Light mode toggle → localStorage persist
- ✅ Overall progress bar (navbar + mobile dashboard)
- ✅ Glassmorphism UI design

---

## ফেজ ২ — উন্নতির তালিকা

### ২.১ UX Improvements (Priority: High)

| # | ফিচার | বিস্তারিত |
|---|-------|----------|
| 1 | **Keyboard navigation** | `j/k` দিয়ে pattern switch, `Enter` দিয়ে expand |
| 2 | **Search / Filter** | প্রবলেম নাম বা pattern নাম দিয়ে search |
| 3 | **Filter by status** | "শুধু unsolved দেখাও" / "Must-do দেখাও" toggle |
| 4 | **Progress by topic** | Sidebar-এ topic-level progress bar (bar chart বা ring) |
| 5 | **Streak counter** | কতদিন ধরে প্র্যাকটিস করছেন |

### ২.২ Data Features (Priority: Medium)

| # | ফিচার | বিস্তারিত |
|---|-------|----------|
| 6 | **Export progress** | JSON/CSV হিসেবে ডাউনলোড |
| 7 | **Import progress** | আগের JSON ইম্পোর্ট করা |
| 8 | **Solved date tracking** | কোন প্রবলেম কোন তারিখে সলভ হয়েছিল |
| 9 | **Revision reminder** | X দিন পরে revisit suggest করা (Spaced repetition) |

### ২.৩ UI Polish (Priority: Low)

| # | ফিচার | বিস্তারিত |
|---|-------|----------|
| 10 | **Syntax highlighting** | demo code-এ proper syntax highlight (Prism.js বা Shiki) |
| 11 | **Confetti animation** | কোনো topic 100% complete হলে |
| 12 | **Responsive sidebar** | Mobile-এ bottom sheet বা drawer হিসেবে |
| 13 | **Metadata** | App title, favicon, og:image |

---

## ফেজ ৩ — ভবিষ্যৎ পরিকল্পনা (Optional)

- **Timer** — প্রতিটা প্রবলেমে কত সময় লাগল ট্র্যাক করা
- **Custom problems** — নিজের প্রবলেম যোগ করার ব্যবস্থা
- **Multiple workbooks** — বিভিন্ন study plan সাপোর্ট

---

## কাজের নিয়ম

### নতুন ফিচার যোগ করার আগে:
1. `progress-tracker.md` দেখুন — কী বাকি আছে
2. `ui-registry.md` দেখুন — বিদ্যমান কম্পোনেন্ট কী কী আছে
3. `ui-tokens.md` দেখুন — কোন color/spacing ব্যবহার করতে হবে
4. `ui-rules.md` দেখুন — কোন প্যাটার্ন ফলো করতে হবে

### কোড পরিবর্তনের পর:
- `progress-tracker.md` আপডেট করুন
- `ui-registry.md` আপডেট করুন (নতুন component যোগ হলে)
