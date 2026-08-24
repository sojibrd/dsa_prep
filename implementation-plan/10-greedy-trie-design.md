# Implementation Plan — Topic 10: Greedy, Trie & Design

> **লক্ষ্য:** টপিক ১০-এর ৩টি প্যাটার্নের (`10.1` থেকে `10.3`) জন্য সিমুলেশন ডেটা তৈরি করা।
> **ফাইল লোকেশন:** `app/lib/simulations/data/10.1-greedy-candy.ts` থেকে `10.3-lru-cache.ts`

---

## ১. আর্কিটেকচার ও Scene Kind

- **Scene Kind:**
  - `10.1 Greedy (Candy)`: `ArrayScene` (`ratings` অ্যারে, `subValues: candies`, 2-pass ট্রাভার্সাল)।
  - `10.2 Trie Prefix Tree`: `TreeScene` (ক্যারেক্টার এজ ও `isEnd` ফ্ল্যাগ সহ নোড)।
  - `10.3 LRU Cache`: `LinkedListScene` (ডাব্লি লিঙ্কড লিস্ট `head <-> [k, v] <-> tail`) + `table` (HashMap lookup `key → Node`)।

---

## ২. প্যাটার্ন স্পেসিফিকেশন

### Pattern 10.1: Greedy
- **ডেমো কোড:** `candy(ratings)` [LC 135: Candy]
- **Concrete Input:** `ratings = [1, 0, 2]`
- **Output:** `5` (চকলেট: `[2, 1, 2]`)
- **Scene:** `ArrayScene`
- **Visuals:** 
  - শুরুতে `candies = [1, 1, 1]`।
  - **Pass 1 (Left → Right):** `ratings[2] > ratings[1]` (2 > 0) → `candies[2] = 1 + 1 = 2`। `candies = [1, 1, 2]`।
  - **Pass 2 (Right → Left):** `ratings[0] > ratings[1]` (1 > 0) → `candies[0] = max(1, 1 + 1) = 2`। `candies = [2, 1, 2]`।
  - যোগফল = `2 + 1 + 2 = 5`।

### Pattern 10.2: Trie (Prefix Tree)
- **ডেমো কোড:** `Trie` [LC 208: Implement Trie]
- **Concrete Input:** অপারেশন সিকোয়েন্স: `insert("apple") → search("apple") → startsWith("app") → search("app")`
- **Output:** `true, true, false`
- **Scene:** `TreeScene`
- **Visuals:**
  - রুট `{}` → `'a'` → `'p'` → `'p'` → `'l'` → `'e'` (`isEnd: true`)।
  - `search("apple")`: প্রতিটি ক্যারেক্টার ধরে নেমে শেষ নোডে `isEnd === true` দেখে `true` রিটার্ন।
  - `startsWith("app")`: নোড `'p'` পর্যন্ত পৌঁছায় এবং সাবট্রি বিদ্যমান থাকায় `true` রিটার্ন।

### Pattern 10.3: Design (Cache & DS Composition)
- **ডেমো কোড:** `LRUCache` [LC 146]
- **Concrete Input:** `capacity = 2`, `put(1, 1) → put(2, 2) → get(1) → put(3, 3) → get(2)`
- **Output:** `get(1) = 1`, `get(2) = -1` (key 2 evicted)
- **Scene:** `LinkedListScene` + `table`
- **Visuals:**
  - `table`: HashMap `Map { 1: Node(1,1), 2: Node(2,2) }`
  - ডাব্লি লিঙ্কড লিস্ট: `head <-> [1:1] <-> [2:2] <-> tail`
  - `get(1)`: নোড `[1:1]` লিস্টের শেষে (most-recent) চলে যাবে → `head <-> [2:2] <-> [1:1] <-> tail`
  - `put(3,3)`: ক্যাপাসিটি শেষ! প্রথম নোড `[2:2]` (least-recent) বাদ যাবে → `head <-> [1:1] <-> [3:3] <-> tail`
  - `get(2)`: ম্যাপে নেই → `-1` রিটার্ন।

---

## ৩. ফাইল তৈরির তালিকা

1. `app/lib/simulations/data/10.1-greedy-candy.ts`
2. `app/lib/simulations/data/10.2-trie-prefix-tree.ts`
3. `app/lib/simulations/data/10.3-lru-cache.ts`
4. `app/lib/simulations/index.ts` (রেজিস্ট্রেশন)
