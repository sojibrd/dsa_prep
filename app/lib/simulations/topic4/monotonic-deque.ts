import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   4.4 Monotonic Deque — Sliding Window Maximum (LC 239)

   The deque holds INDEXES whose values decrease from front to back. Two rules
   keep it that way: drop the front when it slides out of the window, and drop
   from the back anything the new element already beats. What survives at the
   front is always the window's maximum.
   ========================================================================= */

const NUMS = [1, 3, -1, -3, 5, 3, 6, 7];
const K = 3;

type Kind = 'shift' | 'popback' | 'push' | 'record';

interface Event {
  i: number;
  kind: Kind;
  /** Index removed, for `shift` and `popback`. */
  removed?: number;
  /** Deque after the step. */
  deque: number[];
  /** Result after the step. */
  res: number[];
}

/** Verified by running the demo code and logging all 21 deque operations. */
const EVENTS: Event[] = [
  { i: 0, kind: 'push', deque: [0], res: [] },
  { i: 1, kind: 'popback', removed: 0, deque: [], res: [] },
  { i: 1, kind: 'push', deque: [1], res: [] },
  { i: 2, kind: 'push', deque: [1, 2], res: [] },
  { i: 2, kind: 'record', deque: [1, 2], res: [3] },
  { i: 3, kind: 'push', deque: [1, 2, 3], res: [3] },
  { i: 3, kind: 'record', deque: [1, 2, 3], res: [3, 3] },
  { i: 4, kind: 'shift', removed: 1, deque: [2, 3], res: [3, 3] },
  { i: 4, kind: 'popback', removed: 3, deque: [2], res: [3, 3] },
  { i: 4, kind: 'popback', removed: 2, deque: [], res: [3, 3] },
  { i: 4, kind: 'push', deque: [4], res: [3, 3] },
  { i: 4, kind: 'record', deque: [4], res: [3, 3, 5] },
  { i: 5, kind: 'push', deque: [4, 5], res: [3, 3, 5] },
  { i: 5, kind: 'record', deque: [4, 5], res: [3, 3, 5, 5] },
  { i: 6, kind: 'popback', removed: 5, deque: [4], res: [3, 3, 5, 5] },
  { i: 6, kind: 'popback', removed: 4, deque: [], res: [3, 3, 5, 5] },
  { i: 6, kind: 'push', deque: [6], res: [3, 3, 5, 5] },
  { i: 6, kind: 'record', deque: [6], res: [3, 3, 5, 5, 6] },
  { i: 7, kind: 'popback', removed: 6, deque: [], res: [3, 3, 5, 5, 6] },
  { i: 7, kind: 'push', deque: [7], res: [3, 3, 5, 5, 6] },
  { i: 7, kind: 'record', deque: [7], res: [3, 3, 5, 5, 6, 7] },
];

const HIGHLIGHT: Record<Kind, number[]> = {
  shift: [4, 5],
  popback: [4, 6, 7],
  push: [4, 8],
  record: [4, 9],
};

function dequeTable(deque: number[]) {
  return {
    title: 'deque — index, মান কমতি ক্রমে',
    entries: deque.map((idx, position) => ({
      key: `#${idx}`,
      value: NUMS[idx],
      // The front is the answer for this window; the rest are understudies.
      mark: (position === 0 ? 'active' : 'done') as CellMark,
    })),
    emptyLabel: 'খালি',
  };
}

function marksFor(event: Event): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (const idx of event.deque) marks[idx] = 'done';
  if (event.removed !== undefined) marks[event.removed] = 'reject';
  marks[event.i] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '4.4-init',
    title: 'শুরু — খালি deque',
    whatHappens:
      '`deque` খালি, `res` খালি। এতে মান নয়, **index** জমা হবে — আর তাদের মানগুলো সামনে থেকে পেছনে কমতি ক্রমে থাকবে।',
    whyItMatters:
      'index জমা রাখা হয় কেন, মান নয়? কারণ window সরে গেলে জানতে হয় সামনের উপাদানটা এখনো ভেতরে আছে কি না — সেই প্রশ্নের উত্তর কেবল index-এই আছে। মান রাখলে "এটা কোথাকার" প্রশ্নটা আর করা যেত না।',
    highlightLines: [2, 3],
    vars: [
      { name: 'k', value: K },
      { name: 'deque', value: '[]' },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      table: dequeTable([]),
      caption: `প্রতি ${K}-ঘরের window-এর সর্বোচ্চ মান বের করতে হবে।`,
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const value = NUMS[event.i];
    const windowReady = event.i >= K - 1;
    const windowFrom = Math.max(0, event.i - K + 1);

    const title =
      event.kind === 'shift'
        ? `i = ${event.i} — সামনেরটা window ছেড়ে গেছে`
        : event.kind === 'popback'
          ? `i = ${event.i} — পেছনের ${NUMS[event.removed!]} আর দরকার নেই`
          : event.kind === 'push'
            ? `i = ${event.i} — index ${event.i} (মান ${value}) জমা`
            : `i = ${event.i} — window-এর সর্বোচ্চ ${NUMS[event.deque[0]]}`;

    const whatHappens =
      event.kind === 'shift'
        ? `deque-এর সামনে ছিল index ${event.removed}, কিন্তু বর্তমান window শুরু হয়েছে index ${windowFrom} থেকে। তাই সে বাইরে — সামনে থেকে বাদ।`
        : event.kind === 'popback'
          ? `deque-এর পেছনে index ${event.removed} (মান ${NUMS[event.removed!]}), যা নতুন মান ${value}-এর চেয়ে ছোট বা সমান। তাই তাকে বাদ দেওয়া হলো।`
          : event.kind === 'push'
            ? `index ${event.i} পেছনে জমা হলো। deque এখন [${event.deque.join(', ')}] — মান হিসেবে ${event.deque.map((d) => NUMS[d]).join(' > ')}।`
            : `window [${windowFrom}‥${event.i}] প্রস্তুত। deque-এর সামনে index ${event.deque[0]}, মান ${NUMS[event.deque[0]]} — সেটাই এই window-এর সর্বোচ্চ। res-এ যোগ হলো।`;

    const whyItMatters =
      i === 1
        ? 'মান 3 আসার পর মান 1-কে আর কখনো দরকার হবে না — কারণ 3 তার ডানে আছে, মানে 1 যতদিন window-এ থাকবে 3-ও থাকবে, আর 3 সবসময় বড়। ছোট আর নতুন হারায় বড় আর পুরনোর কাছে। এই একটা যুক্তিই deque-কে কমতি ক্রমে রাখে।'
        : i === 4
          ? 'প্রথম পূর্ণ window। উত্তর নিতে deque-এর ভেতরে খোঁজাখুঁজি করতে হলো না — সামনেরটাই উত্তর, কারণ ক্রমটা রক্ষা করেই এতদূর আসা হয়েছে।'
          : i === 7
            ? 'এতক্ষণ বাদ পড়েছে পেছন থেকে (ছোট বলে); এবার সামনে থেকে বাদ পড়ল (পুরনো বলে)। দুই প্রান্তেই কাজ করতে হয় বলেই সাধারণ স্ট্যাক নয়, deque লাগে।'
            : i === 9
              ? 'মান 5 একাই দুটোকে (−3 আর −1) হটিয়ে দিল। একবার দেখলে খরচ বেশি মনে হয়, কিন্তু প্রতিটা index সারা জীবনে একবারই ঢোকে আর একবারই বেরোয় — তাই মোট কাজ O(n)।'
              : i === 20
                ? 'শেষ window-এর সর্বোচ্চ 7। প্রতিটা window-এর জন্য আলাদা করে k-টা মান তুলনা করলে O(n·k) হতো; এখানে হলো O(n)।'
                : undefined;

    return {
      id: `4.4-${i + 1}`,
      title,
      whatHappens,
      whyItMatters,
      highlightLines: HIGHLIGHT[event.kind],
      vars: [
        { name: 'i', value: event.i },
        { name: 'nums[i]', value: value },
        { name: 'deque', value: `[${event.deque.join(', ')}]` },
        { name: 'res', value: `[${event.res.join(', ')}]` },
      ],
      scene: {
        kind: 'array',
        values: NUMS,
        pointers: [{ name: 'i', index: event.i }],
        window: windowReady
          ? { from: windowFrom, to: event.i, label: `${K}-ঘরের window` }
          : undefined,
        marks: marksFor(event),
        table: dequeTable(event.deque),
        output: { title: 'res', values: event.res },
        caption:
          event.kind === 'record'
            ? `window [${windowFrom}‥${event.i}] → সর্বোচ্চ ${NUMS[event.deque[0]]}`
            : event.deque.length
              ? `deque-এর মান: ${event.deque.map((d) => NUMS[d]).join(' > ')}`
              : 'deque এখন খালি।',
      },
    };
  }),

  {
    id: '4.4-done',
    title: 'শেষ — [3, 3, 5, 5, 6, 7]',
    whatHappens:
      'array শেষ। ছয়টা window-এর সর্বোচ্চ মান: `[3, 3, 5, 5, 6, 7]`।',
    whyItMatters:
      'deque-এ কখনোই k-এর বেশি index থাকেনি, তাই জায়গা O(k)। আর প্রতিটা index একবার ঢুকে একবার বেরিয়েছে, তাই সময় O(n)। heap দিয়েও করা যায়, কিন্তু সেটা O(n log k) — deque-এর সুবিধা হলো এখানে "সবচেয়ে বড়টা কে" প্রশ্নের উত্তর সাজিয়ে রাখা হয়, খুঁজে বের করা হয় না।',
    highlightLines: [11],
    vars: [{ name: 'res', value: '[3,3,5,5,6,7]' }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: Object.fromEntries(NUMS.map((_, i) => [i, 'done' as CellMark])),
      table: dequeTable([7]),
      output: { title: 'উত্তর', values: [3, 3, 5, 5, 6, 7] },
      caption: '৮টা সংখ্যা, ৩-ঘরের window → ৬টা উত্তর।',
    },
  },
];

export const monotonicDequeSim: PatternSimulation = {
  patternId: '4.4',
  input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3',
  output: '[3,3,5,5,6,7]',
  steps,
};
