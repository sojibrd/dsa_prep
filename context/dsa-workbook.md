# DSA Practice Workbook

> ১৭টা প্যাটার্ন cheat-sheet (ProPeers/Parikh Jain, algomaster.io, neetcode.io) থেকে সংকলিত একটা **living workbook**। প্রতিটা প্যাটার্নে একটা worked demo (JS) টেমপ্লেট হিসেবে দেওয়া আছে — বাকি প্রবলেমগুলো আপনি নিজে সলভ করে নিজের নোট লিখে ভরবেন।

**📍 শেষ যেখানে ছিলাম:** _(break নেওয়ার আগে এখানে এক লাইন লিখে রাখুন — যেমন: "Trees → Path Sum পর্যন্ত শেষ, LCA বাকি")_

---

## কীভাবে ব্যবহার করবেন (Spot → Solve → Revise)

1. **Spot** — প্রবলেম পড়ে প্যাটার্নের **"চিনবেন কীভাবে"** ক্লুগুলোর সাথে মেলান (প্রথম ২–৩ মিনিট)
2. **Solve** — demo-র টেমপ্লেট মাথায় রেখে **নিজে** কোড করুন (demo দেখে কপি নয়)
3. **Revise** — সলভ করার **সাথে সাথেই** চেকলিস্টে লিখুন:
   - **আমার সমাধান:** মূল আইডিয়া ২–৩ লাইনে (পুরো কোড নয়, যেটা মনে রাখলে আবার লিখতে পারবেন)
   - **যে সমস্যা হয়েছিল:** কোন trap/edge case-এ আটকেছিলেন — এটাই এই workbook-এর আসল দাম

**Priority ট্যাগ:** 🔥 **Must-do** = company-frequency ডেটায় (Amazon/Google/Meta/Microsoft/Apple/Uber) বেশি রিপোর্টেড — সময় কম থাকলে আগে এগুলো রিভিশন দিন। ⚪ **Bonus** = সম্পূর্ণ coverage-এর জন্য।

**Duplicate নিয়ম:** একই প্রবলেম একাধিক প্যাটার্নে পড়লে **এক জায়গায়** full এন্ট্রি, বাকি জায়গায় শুধু cross-ref — একই প্রবলেম দুইবার ট্র্যাক করবেন না।

---

## Progress Tracker

সলভ করার পর চেকবক্সে ✔ দিন আর এই টেবিলের Done কলাম আপডেট করুন।

| #   | টপিক                  | প্যাটার্ন | Demo   | প্র্যাকটিস প্রবলেম | Done     |
| --- | --------------------- | --------- | ------ | ------------------ | -------- |
| 1   | Arrays & Strings      | 7         | 7      | 27                 | 0/27     |
| 2   | Binary Search         | 4         | 4      | 7                  | 0/7      |
| 3   | Linked Lists          | 3         | 3      | 6                  | 0/6      |
| 4   | Stacks & Queues       | 4         | 4      | 7                  | 0/7      |
| 5   | Trees                 | 5         | 5      | 11                 | 0/11     |
| 6   | Heaps                 | 4         | 4      | 5                  | 0/5      |
| 7   | Backtracking          | 3         | 3      | 3                  | 0/3      |
| 8   | Graphs                | 7         | 7      | 11                 | 0/11     |
| 9   | Dynamic Programming   | 11        | 11     | 9                  | 0/9      |
| 10  | Greedy, Trie & Design | 3         | 3      | 5                  | 0/5      |
|     | **মোট**               | **51**    | **51** | **91**             | **0/91** |

---

## Constraint-Reading Quick Reference

প্রবলেম পড়ার **আগে** constraint দেখুন — এতেই প্যাটার্ন অর্ধেক চেনা হয়ে যায়।

| দেখলে                                  | ভাবুন                                                     |
| -------------------------------------- | --------------------------------------------------------- |
| N ≤ 20                                 | brute force / **backtracking** / bitmask DP               |
| N ≤ 100                                | O(n³) চলতে পারে — triple loop / সরাসরি simulation         |
| N ≤ 1,000                              | O(n²) ঠিক আছে — **DP টেবিল**, pair comparison             |
| N ≤ 10⁵                                | O(n log n) বা O(n) লাগবে — sort / heap / hashmap / prefix |
| N ≤ 10⁶                                | O(n) one-pass — counting / prefix, memory-ও খেয়াল রাখুন  |
| Sorted input                           | **binary search** / **two pointers**                      |
| অনেকগুলো range query                   | **prefix sum** (static) / segment tree (update সহ)        |
| Tree, n nodes                          | DFS/BFS recursion, children-এর ফল লাগলে tree DP           |
| Weighted graph + shortest              | **Dijkstra** (adjacency list + min-heap)                  |
| Unweighted shortest path               | **BFS** (প্রথম পৌঁছানোই shortest)                         |
| Top K / Kth                            | **heap** (বা just Kth হলে quickselect)                    |
| Count / frequency                      | **hashmap**                                               |
| সব possibility / সব combination        | **backtracking**                                          |
| min/max over choices, "number of ways" | **DP**                                                    |

---

# টপিকসমূহ

---

@[context/dsa-workbook/1. Arrays & Strings.md]
@[context/dsa-workbook/2. Binary Search.md]
@[context/dsa-workbook/3. Linked Lists.md]
@[context/dsa-workbook/4. Stacks & Queues.md]
@[context/dsa-workbook/5. Trees.md]
@[context/dsa-workbook/6. Heaps / Priority Queues.md]
@[context/dsa-workbook/7. Backtracking.md]
@[context/dsa-workbook/8. Graphs.md]
@[context/dsa-workbook/9. Dynamic Programming.md]
@[context/dsa-workbook/10. Greedy, Trie & Design.md]