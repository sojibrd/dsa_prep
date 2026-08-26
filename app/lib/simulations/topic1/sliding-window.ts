import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   1.2 Sliding Window — Minimum Window Substring (LC 76)

   The workbook's own example is kept rather than a shorter one: the whole
   story is expand → shrink → expand AGAIN, and an input small enough to run
   in ten steps never gets to that second expansion.
   ========================================================================= */

const S = 'ADOBECODEBANC';
const T = 'ABC';
const CHARS = S.split('');

/** A `need` snapshot as [A, B, C] — negatives mean a surplus in the window. */
type Need = [number, number, number];

type Event =
  | { kind: 'expand'; r: number; l: number; ch: string; missing: number; need: Need }
  | { kind: 'shrink'; r: number; l: number; ch: string; missing: number; need: Need }
  | { kind: 'best'; r: number; l: number; missing: number; need: Need; window: string };

/** Verified by running the demo code and logging every loop event. */
const EVENTS: Event[] = [
  { kind: 'expand', r: 0, l: 0, ch: 'A', missing: 2, need: [0, 1, 1] },
  { kind: 'expand', r: 1, l: 0, ch: 'D', missing: 2, need: [0, 1, 1] },
  { kind: 'expand', r: 2, l: 0, ch: 'O', missing: 2, need: [0, 1, 1] },
  { kind: 'expand', r: 3, l: 0, ch: 'B', missing: 1, need: [0, 0, 1] },
  { kind: 'expand', r: 4, l: 0, ch: 'E', missing: 1, need: [0, 0, 1] },
  { kind: 'expand', r: 5, l: 0, ch: 'C', missing: 0, need: [0, 0, 0] },
  { kind: 'best', r: 5, l: 0, missing: 0, need: [0, 0, 0], window: 'ADOBEC' },
  { kind: 'shrink', r: 5, l: 1, ch: 'A', missing: 1, need: [1, 0, 0] },
  { kind: 'expand', r: 6, l: 1, ch: 'O', missing: 1, need: [1, 0, 0] },
  { kind: 'expand', r: 7, l: 1, ch: 'D', missing: 1, need: [1, 0, 0] },
  { kind: 'expand', r: 8, l: 1, ch: 'E', missing: 1, need: [1, 0, 0] },
  { kind: 'expand', r: 9, l: 1, ch: 'B', missing: 1, need: [1, -1, 0] },
  { kind: 'expand', r: 10, l: 1, ch: 'A', missing: 0, need: [0, -1, 0] },
  { kind: 'shrink', r: 10, l: 2, ch: 'D', missing: 0, need: [0, -1, 0] },
  { kind: 'shrink', r: 10, l: 3, ch: 'O', missing: 0, need: [0, -1, 0] },
  { kind: 'shrink', r: 10, l: 4, ch: 'B', missing: 0, need: [0, 0, 0] },
  { kind: 'shrink', r: 10, l: 5, ch: 'E', missing: 0, need: [0, 0, 0] },
  { kind: 'shrink', r: 10, l: 6, ch: 'C', missing: 1, need: [0, 0, 1] },
  { kind: 'expand', r: 11, l: 6, ch: 'N', missing: 1, need: [0, 0, 1] },
  { kind: 'expand', r: 12, l: 6, ch: 'C', missing: 0, need: [0, 0, 0] },
  { kind: 'shrink', r: 12, l: 7, ch: 'O', missing: 0, need: [0, 0, 0] },
  { kind: 'shrink', r: 12, l: 8, ch: 'D', missing: 0, need: [0, 0, 0] },
  { kind: 'best', r: 12, l: 8, missing: 0, need: [0, 0, 0], window: 'EBANC' },
  { kind: 'shrink', r: 12, l: 9, ch: 'E', missing: 0, need: [0, 0, 0] },
  { kind: 'best', r: 12, l: 9, missing: 0, need: [0, 0, 0], window: 'BANC' },
  { kind: 'shrink', r: 12, l: 10, ch: 'B', missing: 1, need: [0, 1, 0] },
];

const HIGHLIGHT: Record<Event['kind'], number[]> = {
  expand: [7, 8, 9, 10, 11],
  best: [13, 15],
  shrink: [16, 17, 18, 19, 21],
};

function needTable(need: Need) {
  return {
    title: 'need — আর কয়টা লাগবে',
    entries: T.split('').map((key, i) => ({
      key,
      value: need[i],
      // A negative count is a surplus: that char can be dropped for free.
      mark: (need[i] > 0 ? 'reject' : need[i] < 0 ? 'fill' : 'done') as CellMark,
    })),
  };
}

/** Left of the window is settled; the newest char is the one to look at. */
function marksFor(l: number, active?: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (let i = 0; i < l; i++) marks[i] = 'done';
  if (active !== undefined && active >= l) marks[active] = 'active';
  return marks;
}

/** The best window recorded at or before event `index` (null before the first). */
function bestAt(index: number): { from: number; to: number; text: string } | null {
  let found: { from: number; to: number; text: string } | null = null;
  for (let i = 0; i <= index; i++) {
    const event = EVENTS[i];
    if (event.kind === 'best') found = { from: event.l, to: event.r, text: event.window };
  }
  return found;
}

const steps: SimStep[] = [
  {
    id: '1.2-init',
    title: 'শুরু — need তৈরি, window খালি',
    whatHappens:
      '`t = "ABC"` থেকে `need` map বানানো হলো: A×1, B×1, C×1। `missing = 3` (তিনটা অক্ষরই এখনো window-এ নেই), `l = 0`, আর `best` এখনো অসীম-দৈর্ঘ্যের।',
    whyItMatters:
      '`missing` একটা একক সংখ্যায় পুরো শর্তটা ধরে রাখে। এটা না থাকলে প্রতিটা ধাপে map-এর সব entry ঘুরে দেখতে হতো "সব চাহিদা মিটেছে কি না" — তাতে অ্যালগরিদম O(n·|t|) হয়ে যেত।',
    highlightLines: [2, 3, 4, 5, 6],
    vars: [
      { name: 'missing', value: 3 },
      { name: 'l', value: 0 },
      { name: 'best', value: '—' },
    ],
    scene: {
      kind: 'array',
      values: CHARS,
      table: needTable([1, 1, 1]),
      caption: 's = "ADOBECODEBANC", t = "ABC" — লক্ষ্য: A, B, C তিনটাই ধরে এমন সবচেয়ে ছোট টুকরো।',
    },
  },

  ...EVENTS.map((event, index): SimStep => {
    const best = bestAt(index);
    const bestLabel = best ? `"${best.text}" [${best.from},${best.to}]` : '—';

    const common = {
      id: `1.2-${index + 1}`,
      highlightLines: HIGHLIGHT[event.kind],
      vars: [
        { name: 'l', value: event.l },
        { name: 'r', value: event.r },
        { name: 'missing', value: event.missing },
        { name: 'best', value: bestLabel },
      ],
    };

    const scene = (active: number | undefined, caption: string) =>
      ({
        kind: 'array' as const,
        values: CHARS,
        pointers: [
          { name: 'l', index: event.l },
          { name: 'r', index: event.r },
        ],
        window: { from: event.l, to: event.r },
        marks: marksFor(event.l, active),
        table: needTable(event.need),
        caption,
      });

    if (event.kind === 'expand') {
      const isNeeded = T.includes(event.ch);
      return {
        ...common,
        title: `r = ${event.r} — "${event.ch}" window-এ ঢুকল`,
        whatHappens: isNeeded
          ? `"${event.ch}" দরকারি অক্ষর, তাই need["${event.ch}"] এক কমে ${event.need[T.indexOf(event.ch)]} হলো। missing এখন ${event.missing}।`
          : `"${event.ch}" t-এ নেই, তাই need অপরিবর্তিত। missing এখনো ${event.missing} — window শুধু লম্বা হলো।`,
        whyItMatters:
          event.missing === 0 && EVENTS[index - 1]?.missing !== 0
            ? 'missing শূন্যে নামল — window এখন বৈধ। এখান থেকে আর ডানে বাড়ানোর মানে নেই; ছোট করার সময়।'
            : undefined,
        scene: scene(event.r, `window = "${S.slice(event.l, event.r + 1)}"`),
      };
    }

    if (event.kind === 'shrink') {
      const isNeeded = T.includes(event.ch);
      return {
        ...common,
        title: `বাঁ দিক ছাঁটা — "${event.ch}" বেরিয়ে গেল`,
        whatHappens: isNeeded
          ? `"${event.ch}" ফেরত দেওয়ায় need["${event.ch}"] বেড়ে ${event.need[T.indexOf(event.ch)]} হলো${event.missing > 0 ? `, আর missing ${event.missing} হয়ে যাওয়ায় window আর বৈধ নয় — আবার ডানে বাড়াতে হবে` : '। উদ্বৃত্ত ছিল, তাই missing এখনো 0 — আরও ছাঁটা যায়'}।`
          : `"${event.ch}" t-এ নেই, তাই বাদ দিলে কিছুই হারায় না — window বিনা খরচে এক ঘর ছোট হলো।`,
        whyItMatters:
          index === 7
            ? 'এটাই sliding window-এর কেন্দ্রীয় চাল: বৈধ হওয়ামাত্র বাঁ দিক থেকে চাপ দিতে থাকো যতক্ষণ না বৈধতা ভাঙে। প্রতিটা pointer শুধু সামনে যায়, তাই দুটো লুপ থাকা সত্ত্বেও মোট কাজ O(n)।'
            : undefined,
        scene: scene(
          undefined,
          event.l <= event.r ? `window = "${S.slice(event.l, event.r + 1)}"` : 'window খালি'
        ),
      };
    }

    return {
      ...common,
      title: `নতুন সেরা window — "${event.window}"`,
      whatHappens: `window "${event.window}" (দৈর্ঘ্য ${event.window.length}) বৈধ এবং আগের সেরার চেয়ে ছোট, তাই best = [${event.l}, ${event.r}] রেকর্ড হলো।`,
      whyItMatters:
        index === 6
          ? 'প্রথম বৈধ উত্তর পাওয়া গেল — কিন্তু এটাই সবচেয়ে ছোট নয়। তাই এখানে থামা যায় না; রেকর্ড করে খোঁজা চালিয়ে যেতে হয়।'
          : undefined,
      scene: scene(undefined, `best = "${event.window}"`),
    };
  }),

  {
    id: '1.2-done',
    title: 'শেষ — সবচেয়ে ছোট window "BANC"',
    whatHappens:
      '`r` স্ট্রিংয়ের শেষে পৌঁছেছে এবং window আর বৈধ নয়। রেকর্ড হওয়া সেরা মান `[9, 12]` — অর্থাৎ `"BANC"`।',
    whyItMatters:
      'তিনটা প্রার্থী পাওয়া গিয়েছিল — "ADOBEC" (6), "EBANC" (5), "BANC" (4)। প্রতিটা index-এ `l` ও `r` মিলিয়ে সর্বোচ্চ দুবার হাত পড়েছে, তাই সব সম্ভাব্য substring না দেখেও (যা O(n²) হতো) উত্তরটা O(n)-এ বেরিয়ে এল।',
    highlightLines: [24],
    vars: [
      { name: 'best', value: '[9, 12]' },
      { name: 'উত্তর', value: '"BANC"' },
    ],
    scene: {
      kind: 'array',
      values: CHARS,
      window: { from: 9, to: 12, label: 'সবচেয়ে ছোট বৈধ window' },
      marks: Object.fromEntries(
        CHARS.map((_, i) => [i, (i >= 9 ? 'active' : 'done') as CellMark])
      ),
      table: needTable([0, 0, 0]),
      caption: '"BANC" — A, B, C তিনটাই আছে, আর এর চেয়ে ছোট কোনো বৈধ টুকরো নেই।',
    },
  },
];

export const slidingWindowSim: PatternSimulation = {
  patternId: '1.2',
  input: 's = "ADOBECODEBANC", t = "ABC"',
  output: '"BANC"',
  steps,
};
