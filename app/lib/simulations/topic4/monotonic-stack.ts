import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   4.1 Monotonic Stack — Largest Rectangle in Histogram (LC 84)

   Bars rather than boxes, and the sentinel is drawn as a real (zero-height)
   cell at index 6. The code's `h = i === length ? 0 : heights[i]` IS a
   virtual bar of height zero; showing it as one makes the final flush read
   as the algorithm working rather than as the loop overrunning the array.
   ========================================================================= */

const HEIGHTS = [2, 1, 5, 6, 2, 3];
const SENTINEL_AT = HEIGHTS.length;
/** What the row draws: the bars, plus the zero-height sentinel. */
const BARS = [...HEIGHTS, 0];

type Event =
  | { kind: 'push'; i: number; h: number; stack: number[]; best: number }
  | {
      kind: 'pop';
      i: number;
      h: number;
      /** Index popped off the stack. */
      idx: number;
      height: number;
      /** Left edge of the rectangle this pop settles. */
      left: number;
      area: number;
      stack: number[];
      best: number;
    };

/** Verified by running the demo code and logging every push and pop. */
const EVENTS: Event[] = [
  { kind: 'push', i: 0, h: 2, stack: [0], best: 0 },
  { kind: 'pop', i: 1, h: 1, idx: 0, height: 2, left: 0, area: 2, stack: [], best: 2 },
  { kind: 'push', i: 1, h: 1, stack: [1], best: 2 },
  { kind: 'push', i: 2, h: 5, stack: [1, 2], best: 2 },
  { kind: 'push', i: 3, h: 6, stack: [1, 2, 3], best: 2 },
  { kind: 'pop', i: 4, h: 2, idx: 3, height: 6, left: 3, area: 6, stack: [1, 2], best: 6 },
  { kind: 'pop', i: 4, h: 2, idx: 2, height: 5, left: 2, area: 10, stack: [1], best: 10 },
  { kind: 'push', i: 4, h: 2, stack: [1, 4], best: 10 },
  { kind: 'push', i: 5, h: 3, stack: [1, 4, 5], best: 10 },
  { kind: 'pop', i: 6, h: 0, idx: 5, height: 3, left: 5, area: 3, stack: [1, 4], best: 10 },
  { kind: 'pop', i: 6, h: 0, idx: 4, height: 2, left: 2, area: 8, stack: [1], best: 10 },
  { kind: 'pop', i: 6, h: 0, idx: 1, height: 1, left: 0, area: 6, stack: [], best: 10 },
  { kind: 'push', i: 6, h: 0, stack: [6], best: 10 },
];

function stackTable(stack: number[]) {
  return {
    title: 'stack — index, উচ্চতা বাড়তি ক্রমে',
    entries: stack.map((idx) => ({
      key: `#${idx}`,
      value: idx === SENTINEL_AT ? 0 : HEIGHTS[idx],
      mark: 'done' as CellMark,
    })),
    emptyLabel: 'খালি',
  };
}

/** Stack members stay lit as live candidates; `i` is what is being tested. */
function marksFor(event: Event): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (const idx of event.stack) marks[idx] = 'done';
  if (event.kind === 'pop') marks[event.idx] = 'reject';
  marks[event.i] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '4.1-init',
    title: 'শুরু — খালি স্ট্যাক',
    whatHappens:
      '`stack` খালি, `best = 0`। লুপ চলবে index 0 থেকে **6 পর্যন্ত** — শেষেরটা আসল বার নয়, উচ্চতা 0-এর একটা কল্পিত sentinel।',
    whyItMatters:
      'প্রতিটা বারের প্রশ্ন একটাই: এটাকে উচ্চতা ধরে বাঁয়ে-ডানে কতদূর টানা যায়? ডান সীমা হলো প্রথম নিচু বার, বাঁ সীমা তার আগেরটা। স্ট্যাকে উচ্চতা বাড়তি ক্রমে index জমিয়ে রাখলে ওই দুটো সীমাই আপনাআপনি বেরিয়ে আসে — প্রতিটা বারের জন্য আলাদা করে দুদিকে খুঁজতে হয় না।',
    highlightLines: [2, 3, 4],
    vars: [
      { name: 'best', value: 0 },
      { name: 'stack', value: '[]' },
    ],
    scene: {
      kind: 'array',
      values: BARS,
      asBars: true,
      marks: { [SENTINEL_AT]: 'reject' },
      table: stackTable([]),
      caption: 'index 6-এর শূন্য বারটা sentinel — শেষে স্ট্যাক খালি করানোর জন্য।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const isSentinel = event.i === SENTINEL_AT;
    const common = {
      id: `4.1-${i + 1}`,
      vars: [
        { name: 'i', value: event.i },
        { name: 'h', value: event.h },
        { name: 'stack', value: `[${event.stack.join(', ')}]` },
        { name: 'best', value: event.best },
      ],
    };

    if (event.kind === 'push') {
      return {
        ...common,
        title: `i = ${event.i} — উচ্চতা ${event.h} স্ট্যাকে`,
        whatHappens: `স্ট্যাকের মাথায় আর কোনো ${event.h}-এর সমান বা বেশি উঁচু বার নেই, তাই index ${event.i} জমা হলো। স্ট্যাক এখন [${event.stack.join(', ')}]।`,
        whyItMatters:
          i === 0
            ? 'জমা রাখা মানে "এই বারের ডান সীমা এখনো জানা যায়নি" — যতক্ষণ না এর চেয়ে নিচু কিছু আসে, ততক্ষণ এটা ডানদিকে বাড়তেই পারে।'
            : undefined,
        highlightLines: [4, 5, 6, 11],
        scene: {
          kind: 'array',
          values: BARS,
          asBars: true,
          pointers: [{ name: 'i', index: event.i }],
          marks: marksFor(event),
          table: stackTable(event.stack),
          caption: `স্ট্যাকের উচ্চতাগুলো এখনো বাড়তি ক্রমে — কোনো সীমা নির্ধারিত হয়নি।`,
        },
      };
    }

    const width = event.i - event.left;
    return {
      ...common,
      title: `আয়তক্ষেত্র বন্ধ — উচ্চতা ${event.height} × প্রস্থ ${width} = ${event.area}`,
      whatHappens: `${
        isSentinel
          ? 'sentinel (উচ্চতা 0) এসে পড়ায়'
          : `উচ্চতা ${event.h} স্ট্যাকের মাথার বার (${event.height}) থেকে নিচু`
      }, তাই index ${event.idx} pop হলো। এর ডান সীমা ${event.i} (এখানেই থেমে যেতে হলো), বাঁ সীমা ${event.left} (স্ট্যাকে এর নিচে যা ছিল তার পরের ঘর)। ক্ষেত্রফল ${event.height} × (${event.i} − ${event.left}) = ${event.area}। best = ${event.best}।`,
      whyItMatters:
        i === 1
          ? 'pop হওয়ার মুহূর্তেই ওই বারের দুই সীমা একসাথে জানা যায় — ডানটা বর্তমান `i`, বাঁটা স্ট্যাকে ঠিক নিচের উপাদান। এটাই monotonic stack-এর পুরো লাভ: প্রতিটা বারের জন্য দুদিকে খোঁজার O(n²) কাজটা এক পাসে নেমে আসে।'
          : i === 6
            ? 'খেয়াল করুন বাঁ সীমা 2 — index 3 আগেই pop হয়ে গেছে, তাই 5-উঁচু বারটা 2 থেকে 3 পর্যন্ত ছড়াতে পারে। pop-এর ক্রমই এই বিস্তারটা মনে রাখে।'
            : i === 9
              ? 'sentinel-এর কাজ শুরু। উচ্চতা 0 সবার চেয়ে নিচু, তাই স্ট্যাকে যা বাকি সব বেরিয়ে আসতে বাধ্য — লুপের পরে আলাদা করে "বাকিটা খালি করো" কোড লিখতে হয় না।'
              : undefined,
      highlightLines: [4, 5, 6, 7, 8, 9],
      scene: {
        kind: 'array',
        values: BARS,
        asBars: true,
        pointers: [{ name: 'i', index: event.i }],
        window: {
          from: event.left,
          to: event.i - 1,
          label: `${event.height} × ${width} = ${event.area}`,
        },
        marks: marksFor(event),
        table: stackTable(event.stack),
        caption: `এই আয়তক্ষেত্রের ক্ষেত্রফল ${event.area}${event.area === event.best ? ' — এ পর্যন্ত সেরা' : `; সেরা এখনো ${event.best}`}।`,
      },
    };
  }),

  {
    id: '4.1-done',
    title: 'শেষ — সবচেয়ে বড় আয়তক্ষেত্র 10',
    whatHappens:
      'sentinel স্ট্যাক খালি করে দিয়েছে, লুপ শেষ। সবচেয়ে বড় আয়তক্ষেত্র উচ্চতা 5, প্রস্থ 2 (index 2‑3) — ক্ষেত্রফল `10`।',
    whyItMatters:
      'প্রতিটা index ঠিক একবার স্ট্যাকে ঢোকে আর একবার বেরোয় — তাই ভেতরে `while` থাকা সত্ত্বেও মোট কাজ O(n)। একই ছাঁচ "পরের বড় উপাদান", "দৈনিক তাপমাত্রা", "বৃষ্টির পানি" — সবখানে খাটে।',
    highlightLines: [13],
    vars: [{ name: 'best', value: 10 }],
    scene: {
      kind: 'array',
      values: BARS,
      asBars: true,
      window: { from: 2, to: 3, label: 'সবচেয়ে বড় আয়তক্ষেত্র' },
      marks: { 2: 'done', 3: 'done', [SENTINEL_AT]: 'reject' },
      table: stackTable([]),
      output: { title: 'সর্বোচ্চ ক্ষেত্রফল', values: [10] },
      caption: 'উচ্চতা 5, প্রস্থ 2 — index 2 ও 3 জুড়ে।',
    },
  },
];

export const monotonicStackSim: PatternSimulation = {
  patternId: '4.1',
  input: 'heights = [2,1,5,6,2,3]',
  output: '10',
  steps,
};
