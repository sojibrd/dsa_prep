import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   1.5 Merge Intervals — Merge Intervals (LC 56)
   ========================================================================= */

const INPUT: [number, number][] = [
  [1, 3],
  [2, 6],
  [8, 10],
  [15, 18],
];

const AXIS = { from: 1, to: 18 };

/** Input spans, with the one under consideration highlighted. */
function inputSpans(cursor?: number, decided = 0) {
  return INPUT.map(([start, end], index) => ({
    start,
    end,
    label: `[${start},${end}]`,
    mark: (index === cursor
      ? 'active'
      : index < decided
        ? 'done'
        : undefined) as CellMark | undefined,
  }));
}

function resultSpans(spans: [number, number][], mergedIndex?: number) {
  return spans.map(([start, end], index) => ({
    start,
    end,
    mark: (index === mergedIndex ? 'active' : 'done') as CellMark,
  }));
}

const steps: SimStep[] = [
  {
    id: '1.5-init',
    title: 'শুরু — start অনুযায়ী সাজানো',
    whatHappens:
      'interval-গুলো `start` অনুযায়ী সাজানো হলো (এই ইনপুট আগে থেকেই সাজানো)। প্রথমটা `[1,3]` সরাসরি `res`-এ বসল।',
    whyItMatters:
      'সাজানোটাই পুরো অ্যালগরিদমের ভিত্তি। start-ক্রমে গেলে যেকোনো interval কেবল `res`-এর **শেষ** entry-র সাথেই ওভারল্যাপ করতে পারে — আগের কোনোটার সাথে নয়। তাই প্রতিবার পুরো তালিকা ঘেঁটে দেখতে হয় না।',
    highlightLines: [2, 3],
    vars: [{ name: 'res', value: '[[1,3]]' }],
    scene: {
      kind: 'intervals',
      intervals: inputSpans(0),
      cursor: 0,
      result: resultSpans([[1, 3]]),
      axis: AXIS,
      caption: 'উপরে ইনপুট, নিচে merge হওয়া ফল — দুটোই একই সংখ্যারেখায়।',
    },
  },

  {
    id: '1.5-merge-1',
    title: 'i = 1 — [2,6] ওভারল্যাপ করে',
    whatHappens:
      '`res`-এর শেষ entry `[1,3]`। নতুন interval-এর start 2, আর `2 ≤ 3` — অর্থাৎ ওভারল্যাপ। তাই নতুন entry না বসিয়ে শেষটার end বাড়িয়ে `max(3, 6) = 6` করা হলো। `res = [[1,6]]`।',
    whyItMatters:
      '`max` নেওয়াটা জরুরি — শুধু `e` বসিয়ে দিলে `[1,10]` আর `[2,4]` মেলানোর সময় ভুল হতো, কারণ ভেতরে ঢুকে যাওয়া interval-টা বাইরেরটাকে ছোট করে ফেলত।',
    highlightLines: [4, 5, 6, 7, 8],
    vars: [
      { name: 'i', value: 1 },
      { name: '[s,e]', value: '[2,6]' },
      { name: 'last', value: '[1,6]' },
    ],
    scene: {
      kind: 'intervals',
      intervals: inputSpans(1, 1),
      cursor: 1,
      result: resultSpans([[1, 6]], 0),
      axis: AXIS,
      caption: '[1,3] ও [2,6] মিলে হলো [1,6]।',
    },
  },

  {
    id: '1.5-push-1',
    title: 'i = 2 — [8,10] আলাদা',
    whatHappens:
      '`res`-এর শেষ entry এখন `[1,6]`। নতুন start 8, আর `8 > 6` — কোনো ছোঁয়াছুঁয়ি নেই। তাই `[8,10]` নতুন entry হিসেবে যোগ হলো। `res = [[1,6], [8,10]]`।',
    highlightLines: [4, 5, 6, 7, 9],
    vars: [
      { name: 'i', value: 2 },
      { name: '[s,e]', value: '[8,10]' },
      { name: 'last', value: '[1,6]' },
    ],
    scene: {
      kind: 'intervals',
      intervals: inputSpans(2, 2),
      cursor: 2,
      result: resultSpans(
        [
          [1, 6],
          [8, 10],
        ],
        1
      ),
      axis: AXIS,
      caption: 'ফাঁক আছে — তাই নতুন span।',
    },
  },

  {
    id: '1.5-push-2',
    title: 'i = 3 — [15,18]-ও আলাদা',
    whatHappens:
      '`15 > 10`, আবারও ফাঁক। `[15,18]` নতুন entry হিসেবে বসল। `res = [[1,6], [8,10], [15,18]]`।',
    highlightLines: [4, 5, 6, 7, 9],
    vars: [
      { name: 'i', value: 3 },
      { name: '[s,e]', value: '[15,18]' },
      { name: 'last', value: '[8,10]' },
    ],
    scene: {
      kind: 'intervals',
      intervals: inputSpans(3, 3),
      cursor: 3,
      result: resultSpans(
        [
          [1, 6],
          [8, 10],
          [15, 18],
        ],
        2
      ),
      axis: AXIS,
      caption: 'তিনটা আলাদা span দাঁড়াল।',
    },
  },

  {
    id: '1.5-done',
    title: 'শেষ — তিনটা span',
    whatHappens: 'সব interval দেখা শেষ। উত্তর `[[1,6], [8,10], [15,18]]`।',
    whyItMatters:
      'খরচ সাজানোর O(n log n) — তারপরের পাসটা মাত্র O(n)। অর্থাৎ সাজানোটাই সবচেয়ে দামি ধাপ, আর সেটাই ওভারল্যাপ পরীক্ষাকে "শুধু শেষটার সাথে" পর্যন্ত সরল করে দেয়।',
    highlightLines: [11],
    vars: [{ name: 'res', value: '[[1,6],[8,10],[15,18]]' }],
    scene: {
      kind: 'intervals',
      intervals: inputSpans(undefined, 4),
      result: resultSpans([
        [1, 6],
        [8, 10],
        [15, 18],
      ]),
      axis: AXIS,
      caption: '৪টা interval থেকে ৩টা — একটাই merge হয়েছে।',
    },
  },
];

export const mergeIntervalsSim: PatternSimulation = {
  patternId: '1.5',
  input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
  output: '[[1,6],[8,10],[15,18]]',
  steps,
};
