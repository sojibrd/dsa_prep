import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   4.2 Expression Evaluation / Parentheses — Longest Valid Parentheses (LC 32)
   ========================================================================= */

const S = ')()())';
const CHARS = S.split('');

type Kind = 'push' | 'valid' | 'newbase';

interface Event {
  i: number;
  kind: Kind;
  /** Stack after the step. */
  stack: number[];
  /** Length of the run this step closed, if any. */
  length?: number;
  best: number;
}

/** Verified by running the demo code character by character. */
const EVENTS: Event[] = [
  { i: 0, kind: 'newbase', stack: [0], best: 0 },
  { i: 1, kind: 'push', stack: [0, 1], best: 0 },
  { i: 2, kind: 'valid', stack: [0], length: 2, best: 2 },
  { i: 3, kind: 'push', stack: [0, 3], best: 2 },
  { i: 4, kind: 'valid', stack: [0], length: 4, best: 4 },
  { i: 5, kind: 'newbase', stack: [5], best: 4 },
];

function stackTable(stack: number[], isInitial = false) {
  return {
    title: 'stack — index',
    entries: stack.map((idx, position) => ({
      key: idx === -1 ? '-1' : `#${idx}`,
      // The bottom entry is never a real '(' — it is the fence to measure from.
      value: position === 0 ? 'base' : '(',
      mark: (position === 0 ? 'fill' : 'done') as CellMark,
    })),
    emptyLabel: isInitial ? 'খালি' : 'খালি',
  };
}

/** Characters already settled into a valid run, per the best-so-far reading. */
function marksFor(event: Event): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};

  // Everything above the base is an unmatched '(' still waiting.
  for (const idx of event.stack.slice(1)) marks[idx] = 'done';

  if (event.kind === 'valid' && event.length) {
    for (let j = event.i - event.length + 1; j <= event.i; j++) marks[j] = 'done';
  }
  if (event.kind === 'newbase') marks[event.i] = 'reject';
  marks[event.i] = event.kind === 'newbase' ? 'reject' : 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '4.2-init',
    title: 'শুরু — স্ট্যাকে একটা কল্পিত বেড়া',
    whatHappens:
      '`stack = [-1]`। −1 কোনো আসল বন্ধনী নয় — এটা একটা বেড়া (base), যেখান থেকে দৈর্ঘ্য মাপা হবে। `best = 0`।',
    whyItMatters:
      'দৈর্ঘ্য মাপা হয় "বর্তমান index − স্ট্যাকের মাথা" দিয়ে। শুরুতেই যদি একটা বৈধ জোড়া শেষ হয়, মাথায় কিছু না থাকলে হিসাবটাই করা যেত না। −1 বসিয়ে রাখলে index 0 থেকে শুরু হওয়া রানও `i − (−1)` দিয়ে ঠিকঠাক মাপা যায় — 3.2-এর dummy নোডের মতোই, একটা কল্পিত উপাদান যা প্রান্তের বিশেষ ক্ষেত্রটা মুছে দেয়।',
    highlightLines: [2, 3],
    vars: [
      { name: 'stack', value: '[-1]' },
      { name: 'best', value: 0 },
    ],
    scene: {
      kind: 'array',
      values: CHARS,
      table: stackTable([-1], true),
      caption: 's = ")()())" — সবচেয়ে লম্বা বৈধ অংশটা কত লম্বা?',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const char = CHARS[event.i];
    const base = event.stack[event.stack.length - 1];

    const title =
      event.kind === 'push'
        ? `i = ${event.i} — '(' জমা`
        : event.kind === 'valid'
          ? `i = ${event.i} — জোড়া মিলল, দৈর্ঘ্য ${event.length}`
          : `i = ${event.i} — বেমানান ')', নতুন বেড়া`;

    const whatHappens =
      event.kind === 'push'
        ? `'(' পাওয়া গেল, তাই index ${event.i} স্ট্যাকে জমা হলো — এর জোড়া এখনো আসেনি।`
        : event.kind === 'valid'
          ? `')' পাওয়া গেল, তাই স্ট্যাক থেকে একটা pop হলো। স্ট্যাক খালি হয়নি — মাথায় এখন ${base}। তাই এখানে শেষ হওয়া বৈধ অংশের দৈর্ঘ্য ${event.i} − ${base} = ${event.length}। best = ${event.best}।`
          : `')' পাওয়া গেল, pop করার পর স্ট্যাক খালি হয়ে গেল — মানে এই ')'-এর কোনো জোড়া নেই। তাই index ${event.i} নিজেই নতুন বেড়া হয়ে বসল।`;

    const whyItMatters =
      i === 0
        ? 'প্রথম অক্ষরটাই একটা বেমানান ")"। এটা পরের কোনো বৈধ অংশের সাথে যুক্ত হতে পারবে না, তাই সে-ই নতুন শুরুর দাগ। স্ট্যাক এখানে কী কী অমীমাংসিত আছে তা নয়, বরং **কোথা থেকে মাপা শুরু** সেটাই ধরে রাখে।'
        : i === 4
          ? 'দৈর্ঘ্য 4 — অথচ স্ট্যাকে কখনো ৪টা এন্ট্রি ছিল না। কারণ মাপা হচ্ছে দূরত্ব, গোনা হচ্ছে না। index 4 আর বেড়া 0-এর মাঝের পুরোটাই বৈধ, সেটা "1‑2" আর "3‑4" দুটো জোড়া মিলে তৈরি হলেও।'
          : i === 5
            ? 'শেষের ")"-টা আবার সব ভেঙে দিল, তাই নতুন বেড়া। কিন্তু `best` আলাদা রাখা ছিল বলে আগের 4 হারায়নি — চলতি অবস্থা আর সেরা ফলাফল আলাদা রাখা এই ছাঁচের নিয়ম।'
            : undefined;

    return {
      id: `4.2-${i + 1}`,
      title,
      whatHappens,
      whyItMatters,
      highlightLines:
        event.kind === 'push'
          ? [4, 5]
          : event.kind === 'newbase'
            ? [4, 6, 7, 8, 9]
            : [4, 6, 7, 8, 10],
      vars: [
        { name: 'i', value: event.i },
        { name: 's[i]', value: char },
        { name: 'stack', value: `[${event.stack.join(', ')}]` },
        { name: 'best', value: event.best },
      ],
      scene: {
        kind: 'array',
        values: CHARS,
        pointers: [{ name: 'i', index: event.i }],
        window:
          event.kind === 'valid' && event.length
            ? { from: event.i - event.length + 1, to: event.i, label: `দৈর্ঘ্য ${event.length}` }
            : undefined,
        marks: marksFor(event),
        table: stackTable(event.stack),
        caption:
          event.kind === 'valid'
            ? `বেড়া ${base} থেকে এখানে পর্যন্ত পুরোটাই বৈধ।`
            : event.kind === 'newbase'
              ? `নতুন বেড়া index ${event.i} — এর আগের কিছুর সাথে আর জোড়া লাগবে না।`
              : 'এই "(" এখনো জোড়ার অপেক্ষায়।',
      },
    };
  }),

  {
    id: '4.2-done',
    title: 'শেষ — সবচেয়ে লম্বা বৈধ অংশ 4',
    whatHappens:
      'স্ট্রিং শেষ। সবচেয়ে লম্বা বৈধ অংশ index 1 থেকে 4 — `"()()"`, দৈর্ঘ্য `4`।',
    whyItMatters:
      'এক পাস, O(n) সময় ও জায়গা। স্ট্যাকে বন্ধনী নয়, index রাখা হয়েছে — এই একটা সিদ্ধান্তই "বৈধ কি না" প্রশ্নটাকে "কত লম্বা" প্রশ্নে উন্নীত করেছে, কারণ index থাকলে দূরত্ব মাপা যায়।',
    highlightLines: [13],
    vars: [{ name: 'best', value: 4 }],
    scene: {
      kind: 'array',
      values: CHARS,
      window: { from: 1, to: 4, label: 'সবচেয়ে লম্বা বৈধ অংশ' },
      marks: { 0: 'reject', 1: 'done', 2: 'done', 3: 'done', 4: 'done', 5: 'reject' },
      table: stackTable([5]),
      output: { title: 'উত্তর', values: [4] },
      caption: 'দুই প্রান্তের ")" দুটো কখনোই জোড়া পায়নি।',
    },
  },
];

export const parenthesesSim: PatternSimulation = {
  patternId: '4.2',
  input: 's = ")()())"',
  output: '4',
  steps,
};
