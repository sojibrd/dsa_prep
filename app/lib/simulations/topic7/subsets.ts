import type { CellMark, PatternSimulation, SimStep } from '../types';

/* ============================================================================
   7.1 Subsets / Permutations / Combinations — Subsets (LC 78)

   Small enough that no consolidation is needed: all 22 raw events become 22
   steps. Seeing every choose/record/undo in sequence is the point — the
   rhythm IS the pattern.
   ========================================================================= */

const NUMS = [1, 2, 3];

type Kind = 'record' | 'choose' | 'undo';

interface Event {
  kind: Kind;
  /** Loop index, for choose and undo. */
  i?: number;
  val?: number;
  /** `path` after the event. */
  path: number[];
}

/** Verified by running the demo code and logging every event. */
const EVENTS: Event[] = [
  { kind: 'record', path: [] },
  { kind: 'choose', i: 0, val: 1, path: [1] },
  { kind: 'record', path: [1] },
  { kind: 'choose', i: 1, val: 2, path: [1, 2] },
  { kind: 'record', path: [1, 2] },
  { kind: 'choose', i: 2, val: 3, path: [1, 2, 3] },
  { kind: 'record', path: [1, 2, 3] },
  { kind: 'undo', i: 2, val: 3, path: [1, 2] },
  { kind: 'undo', i: 1, val: 2, path: [1] },
  { kind: 'choose', i: 2, val: 3, path: [1, 3] },
  { kind: 'record', path: [1, 3] },
  { kind: 'undo', i: 2, val: 3, path: [1] },
  { kind: 'undo', i: 0, val: 1, path: [] },
  { kind: 'choose', i: 1, val: 2, path: [2] },
  { kind: 'record', path: [2] },
  { kind: 'choose', i: 2, val: 3, path: [2, 3] },
  { kind: 'record', path: [2, 3] },
  { kind: 'undo', i: 2, val: 3, path: [2] },
  { kind: 'undo', i: 1, val: 2, path: [] },
  { kind: 'choose', i: 2, val: 3, path: [3] },
  { kind: 'record', path: [3] },
  { kind: 'undo', i: 2, val: 3, path: [] },
];

const show = (path: number[]) => `[${path.join(',')}]`;

/** Everything currently in `path` is lit; the rest of the row is untouched. */
function marksFor(path: number[], justUndone?: number): Record<number, CellMark> {
  const marks: Record<number, CellMark> = {};
  for (const value of path) marks[NUMS.indexOf(value)] = 'active';
  if (justUndone !== undefined) marks[NUMS.indexOf(justUndone)] = 'reject';
  return marks;
}

/** Subsets recorded up to and including event `index`. */
function resultsAt(index: number): string[] {
  return EVENTS.slice(0, index + 1)
    .filter((event) => event.kind === 'record')
    .map((event) => show(event.path));
}

const steps: SimStep[] = [
  {
    id: '7.1-init',
    title: 'শুরু — খালি path, খালি res',
    whatHappens:
      '`backtrack(0, [])` ডাকা হলো। `path` খালি, `res` খালি। প্রতিটা ধাপে তিনটে কাজ পালা করে ঘুরবে: **নাও → গভীরে যাও → ফেরত দাও**।',
    whyItMatters:
      'এই কোডে "subset বানানোর" আলাদা কোনো যুক্তি নেই। `path` নিজেই যেকোনো মুহূর্তে একটা বৈধ subset — তাই প্রথম লাইনেই সেটা রেকর্ড হয়ে যায়, শর্ত ছাড়াই। বাকিটা শুধু সব সম্ভাব্য `path`-এ পৌঁছানোর ব্যবস্থা।',
    highlightLines: [2, 3, 11],
    vars: [
      { name: 'path', value: '[]' },
      { name: 'res', value: 0 },
    ],
    scene: {
      kind: 'array',
      values: NUMS,
      output: { title: 'res', values: [] },
      caption: 'nums = [1,2,3] — মোট 2³ = ৮টা subset হওয়ার কথা।',
    },
  },

  ...EVENTS.map((event, i): SimStep => {
    const results = resultsAt(i);

    const common = {
      id: `7.1-${i + 1}`,
      vars: [
        { name: 'path', value: show(event.path) },
        { name: 'res', value: results.length },
      ],
      scene: {
        kind: 'array' as const,
        values: NUMS,
        marks: marksFor(event.path, event.kind === 'undo' ? event.val : undefined),
        output: { title: 'res', values: results },
      },
    };

    if (event.kind === 'record') {
      return {
        ...common,
        title: `রেকর্ড — ${show(event.path)}`,
        whatHappens: `এই মুহূর্তের \`path\` হলো ${show(event.path)}, আর সেটাই একটা বৈধ subset। \`res\`-এ **কপি করে** রাখা হলো — এখন res-এ ${results.length}টা।`,
        whyItMatters:
          i === 0
            ? 'প্রথম রেকর্ডটাই খালি subset `[]` — কারণ কিছু না নেওয়াও একটা বৈধ বাছাই। `if` ছাড়াই এটা বেরিয়ে এল, কারণ রেকর্ড হয় ফাংশনে ঢোকা মাত্রই।'
            : i === 2
              ? '`[...path]` — কপি, রেফারেন্স নয়। এটাই সবচেয়ে সাধারণ বাগ: সরাসরি `path` push করলে res-এর সব entry একই array-কে দেখাত, আর শেষে সবগুলোই খালি হয়ে যেত।'
              : undefined,
        highlightLines: [4],
        scene: { ...common.scene, caption: `res-এ এখন ${results.length}টা subset।` },
      };
    }

    if (event.kind === 'choose') {
      return {
        ...common,
        title: `নাও — ${event.val} যোগ`,
        whatHappens: `i = ${event.i}, তাই ${event.val} \`path\`-এ যোগ হলো → ${show(event.path)}। এখন \`backtrack(${event.i! + 1}, path)\` — অর্থাৎ এর **পরের** index থেকে খোঁজা চলবে।`,
        whyItMatters:
          i === 1
            ? '`i + 1` দিয়ে recurse করাই ক্রম ধরে রাখে — প্রতিটা উপাদান নিজের পরেরগুলোর সাথেই জোড়া বাঁধে, আগেরগুলোর সাথে নয়। এই কারণেই `[2,1]` কখনো তৈরি হয় না; subset-এ ক্রমের কোনো মানে নেই, তাই একটাই রূপ রাখাই যথেষ্ট।'
            : undefined,
        highlightLines: [5, 6, 7],
        scene: { ...common.scene, caption: `path = ${show(event.path)} — এখন গভীরে যাওয়া।` },
      };
    }

    return {
      ...common,
      title: `ফেরত দাও — ${event.val} বাদ`,
      whatHappens: `${event.val}-কে নিয়ে যা যা করার ছিল সব শেষ, তাই \`path.pop()\` — path আবার ${show(event.path)}। লুপ এবার পরের i-তে যাবে।`,
      whyItMatters:
        i === 7
          ? 'এই একটা লাইনই backtracking-কে backtracking বানায়। `path` একটাই array, সবাই মিলে ব্যবহার করছে — তাই গভীরে যাওয়ার আগে যা যোগ করা হয়েছিল, ফেরার সময় ঠিক সেটাই সরিয়ে নিতে হয়। না সরালে পরের শাখা আগের শাখার আবর্জনা নিয়ে শুরু করত।'
          : undefined,
      highlightLines: [8],
      scene: { ...common.scene, caption: `path = ${show(event.path)} — শাখা গুটিয়ে ফেরা।` },
    };
  }),

  {
    id: '7.1-done',
    title: 'শেষ — ৮টা subset',
    whatHappens:
      'সব শাখা ঘোরা হয়ে গেছে, `path` আবার খালি। উত্তর: `[[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]`।',
    whyItMatters:
      'n উপাদানে 2ⁿ subset, তাই কাজটা অন্তত O(2ⁿ) হতেই হবে — এটা অ্যালগরিদমের দুর্বলতা নয়, উত্তরের আকার। একই কাঠামো সামান্য বদলে permutation (ক্রম গুরুত্বপূর্ণ) বা k-combination (দৈর্ঘ্য বাঁধা) হয়ে যায়; নাও-যাও-ফেরাও এই তিন তাল একই থাকে।',
    highlightLines: [12],
    vars: [{ name: 'res', value: 8 }],
    scene: {
      kind: 'array',
      values: NUMS,
      marks: { 0: 'done', 1: 'done', 2: 'done' },
      output: { title: 'res', values: resultsAt(EVENTS.length - 1) },
      caption: '২³ = ৮ — প্রতিটা উপাদানের জন্য "নেব / নেব না" দুটো করে সিদ্ধান্ত।',
    },
  },
];

export const subsetsSim: PatternSimulation = {
  patternId: '7.1',
  input: 'nums = [1,2,3]',
  output: '[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]',
  steps,
};
