import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   4.3 Design Problems — Min Stack (LC 155)

   No array is being scanned here, so the row is the CALL SEQUENCE and the
   cursor walks it one call at a time. The data structure itself lives in the
   side table, each entry a `[value, minSoFar]` pair — which is the whole
   trick, so it is the thing on screen.
   ========================================================================= */

/** Each entry carries the minimum as it stood when that value was pushed. */
type Entry = [value: number, min: number];

interface Call {
  label: string;
  op: 'push' | 'pop' | 'top' | 'getMin';
  /** Stack after the call. */
  stack: Entry[];
  returned?: number;
}

const CALLS: Call[] = [
  { label: 'push(-2)', op: 'push', stack: [[-2, -2]] },
  { label: 'push(0)', op: 'push', stack: [[-2, -2], [0, -2]] },
  { label: 'push(-3)', op: 'push', stack: [[-2, -2], [0, -2], [-3, -3]] },
  { label: 'getMin()', op: 'getMin', stack: [[-2, -2], [0, -2], [-3, -3]], returned: -3 },
  { label: 'pop()', op: 'pop', stack: [[-2, -2], [0, -2]] },
  { label: 'top()', op: 'top', stack: [[-2, -2], [0, -2]], returned: 0 },
  { label: 'getMin()', op: 'getMin', stack: [[-2, -2], [0, -2]], returned: -2 },
];

const SEQUENCE = CALLS.map((call) => call.label);

const HIGHLIGHT: Record<Call['op'], number[]> = {
  push: [5, 6, 7],
  pop: [9, 10],
  top: [12, 13],
  getMin: [15, 16],
};

function stackTable(stack: Entry[]) {
  return {
    title: 'stack — [মান, তখনকার min]',
    entries: stack.map(([value, min], i) => ({
      key: `${value}`,
      value: `min ${min}`,
      mark: (i === stack.length - 1 ? 'active' : 'done') as CellMark,
    })),
    emptyLabel: 'খালি',
  };
}

/** Calls already made are settled; the current one is live. */
function marksFor(index: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (let i = 0; i < index; i++) marks[i] = 'done';
  marks[index] = 'active';
  return marks;
}

const steps: SimStep[] = [
  {
    id: '4.3-init',
    title: 'শুরু — খালি MinStack',
    whatHappens:
      'একটা `MinStack` তৈরি হলো, ভেতরের `stack` খালি। উপরের সারিটা array নয় — এগুলো পরপর যে কলগুলো হবে সেই তালিকা।',
    whyItMatters:
      'চ্যালেঞ্জ: `getMin()`-ও O(1) হতে হবে। সহজ ভুল সমাধান হলো একটা `min` ভেরিয়েবল রাখা — কিন্তু সেই min-টাই যদি pop হয়ে যায়, তখন নতুন min খুঁজতে পুরো স্ট্যাক ঘাঁটতে হয়, অর্থাৎ O(n)। এখানকার চাল: প্রতিটা এন্ট্রি নিজের সাথে **তখনকার min** বয়ে বেড়ায়।',
    highlightLines: [1, 2, 3, 4],
    vars: [{ name: 'stack', value: '[]' }],
    scene: {
      kind: 'array',
      values: SEQUENCE,
      table: stackTable([]),
      caption: 'উপরের সারি = কলের ক্রম, নিচের প্যানেল = ভেতরের স্ট্যাক।',
    },
  },

  ...CALLS.map((call, i): SimStep => {
    const top = call.stack[call.stack.length - 1];
    const previousMin = i > 0 ? CALLS[i - 1].stack.at(-1)?.[1] : undefined;

    const whatHappens =
      call.op === 'push'
        ? `\`${call.label}\` — নতুন min হিসাব হলো ${previousMin === undefined ? `স্ট্যাক খালি ছিল, তাই min = মান নিজেই (${top[1]})` : `min(${top[0]}, ${previousMin}) = ${top[1]}`}। জোড়া \`[${top[0]}, ${top[1]}]\` স্ট্যাকে বসল।`
        : call.op === 'pop'
          ? `\`pop()\` — মাথার জোড়াটা \`[-3, -3]\` সরে গেল। এখন মাথায় \`[${top[0]}, ${top[1]}]\`।`
          : call.op === 'top'
            ? `\`top()\` — মাথার জোড়ার **প্রথম** ঘরটা ফেরত: ${call.returned}।`
            : `\`getMin()\` — মাথার জোড়ার **দ্বিতীয়** ঘরটা ফেরত: ${call.returned}। কোনো খোঁজাখুঁজি নেই, একটা পড়া মাত্র।`;

    const whyItMatters =
      i === 1
        ? 'মান 0 push হলেও তার সাথে জমা হলো min −2, কারণ তখন পর্যন্ত সবচেয়ে ছোট সেটাই। প্রতিটা এন্ট্রি তাই এক টুকরো ইতিহাস — "আমি যখন ঢুকেছিলাম, তখনকার সর্বনিম্ন ছিল এটা"।'
        : i === 3
          ? '`getMin()` মানে শুধু মাথার দ্বিতীয় ঘরটা পড়া — O(1)। স্ট্যাক ঘেঁটে দেখা লাগল না।'
          : i === 4
            ? 'এখানেই আসল পরীক্ষা: সবচেয়ে ছোট মান (−3) এইমাত্র pop হয়ে গেল। এখন কী হবে?'
            : i === 6
              ? 'min আপনাআপনি −2-এ ফিরে এল — কারণ সেটা আলাদা করে হিসাব করা হয়নি, নিচের এন্ট্রিতে আগে থেকেই লেখা ছিল। pop যা মুছে দেয়, তার সাথে তার ইতিহাসও মুছে যায়। এই কারণেই কোনো "min পুনরুদ্ধার" কোড লিখতে হয় না।'
              : undefined;

    return {
      id: `4.3-call-${i + 1}`,
      title: `${i + 1}. ${call.label}${call.returned !== undefined ? ` → ${call.returned}` : ''}`,
      whatHappens,
      whyItMatters,
      highlightLines: HIGHLIGHT[call.op],
      vars: [
        { name: 'call', value: call.label },
        { name: 'top', value: top ? top[0] : '—' },
        { name: 'getMin', value: top ? top[1] : '—' },
        ...(call.returned !== undefined ? [{ name: 'ফেরত', value: call.returned }] : []),
      ],
      scene: {
        kind: 'array',
        values: SEQUENCE,
        pointers: [{ name: '▶', index: i }],
        marks: marksFor(i),
        table: stackTable(call.stack),
        output: {
          title: 'ফেরত আসা মান',
          values: CALLS.slice(0, i + 1)
            .filter((c) => c.returned !== undefined)
            .map((c) => c.returned as number),
        },
        caption:
          call.op === 'push'
            ? `প্রতিটা এন্ট্রি নিজের সাথে তখনকার min বয়ে নিয়ে গেল।`
            : call.op === 'pop'
              ? 'মাথার জোড়া গেল — তার সাথে তার min-ও।'
              : `উত্তর মিলল মাথার জোড়া থেকেই, এক ধাপে।`,
      },
    };
  }),

  {
    id: '4.3-done',
    title: 'শেষ — চারটে অপারেশনই O(1)',
    whatHappens:
      'কলের ক্রম শেষ। `push`, `pop`, `top`, `getMin` — চারটেই ধ্রুব সময়ে চলল। বিনিময়ে প্রতি এন্ট্রিতে একটা করে বাড়তি সংখ্যা রাখতে হলো।',
    whyItMatters:
      'এটাই design প্রশ্নের চেনা দর-কষাকষি: একটু বেশি জায়গা দিয়ে সময় কেনা। এখানে জায়গা দ্বিগুণ (প্রতি মানের সাথে একটা min), বিনিময়ে O(n)-এর খোঁজ O(1)-এ নামল। একই ভাবনায় দুটো স্ট্যাক দিয়ে queue, বা hashmap + doubly-linked list দিয়ে LRU cache বানানো হয়।',
    highlightLines: [15, 16],
    vars: [
      { name: 'push/pop/top/getMin', value: 'O(1)' },
      { name: 'জায়গা', value: 'O(n)' },
    ],
    scene: {
      kind: 'array',
      values: SEQUENCE,
      marks: Object.fromEntries(SEQUENCE.map((_, i) => [i, 'done' as CellMark])),
      table: stackTable([[-2, -2], [0, -2]]),
      output: { title: 'ফেরত আসা মান', values: [-3, 0, -2] },
      caption: 'min খোঁজা হয়নি কখনো — সবসময় শুধু পড়া হয়েছে।',
    },
  },
];

export const minStackSim: PatternSimulation = {
  patternId: '4.3',
  input: 'push(-2), push(0), push(-3), getMin, pop, top, getMin',
  output: '-3, 0, -2',
  steps,
};
