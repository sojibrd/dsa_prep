import { PracticeProblem, Pattern } from '../utils/dsaParser';
import { ClueMatch } from '../types';

/**
 * Words that carry no signal on their own. Matching on "to" or "একটি" would
 * return every problem in the pattern, which is the same as returning none.
 */
const STOPWORDS = new Set([
  'with', 'from', 'to', 'or', 'in', 'a', 'an', 'the', 'x', 'of', 'at', 'most', 'least', 'size',
  'থেকে', 'এবং', 'ও', 'করে', 'হলে', 'দিয়ে', 'থাকা', 'করা', 'জন্য', 'বা', 'কে', 'একটি',
]);

/**
 * Terms whose literal spelling is not what we are looking for.
 *
 * The workbook is bilingual and the problem titles are not: a Bengali clue has
 * to reach English statement text, and some concepts hide behind a different
 * word entirely ("triplet" for a sum, "unique" for duplicates). Each entry
 * maps one written term to every string that should count as a hit.
 */
const TERM_ALIASES: Array<{ terms: string[]; matches: string[] }> = [
  {
    terms: ['palindrome', 'প্যালিনড্রোম'],
    matches: ['palindrome', 'প্যালিনড্রোম'],
  },
  {
    terms: ['sum', 'যোগফল'],
    matches: ['sum', 'যোগফল', 'triplet'],
  },
  {
    terms: ['duplicate', 'duplicates', 'ডুপ্লিকেট'],
    matches: ['duplicate', 'duplicates', 'ডুপ্লিকেট', 'unique'],
  },
  {
    terms: ['sorted', 'সর্টেড'],
    matches: ['sorted', 'সর্টেড', 'sort', 'ক্রমবর্ধমান'],
  },
  {
    terms: ['in-place', 'inplace'],
    matches: ['in-place', 'inplace', 'extra space', 'o(1)'],
  },
  {
    terms: ['partition'],
    matches: ['partition', 'sort colors', 'colors'],
  },
  {
    terms: ['তুলনা', 'প্রান্ত'],
    matches: ['water', 'পানি', 'reverse', 'compare', 'দিক', 'উল্লম্ব', 'রেখা'],
  },
];

/** Break one clue sentence into the terms worth searching for. */
function extractSearchTerms(clue: string): string[] {
  const normalized = clue.toLowerCase();
  const terms: string[] = [];

  // A quoted fragment is the author naming the shape exactly — keep it whole.
  const quoted = normalized.match(/"([^"]+)"/g);
  if (quoted) {
    quoted.forEach((q) => terms.push(q.replace(/"/g, '')));
  }

  normalized
    .replace(/"/g, ' ')
    .split(/[\s/,\-()]+/)
    .forEach((word) => {
      const cleaned = word.trim().replace(/[.,;:??"']/g, '');
      if (cleaned && cleaned.length > 1 && !STOPWORDS.has(cleaned)) {
        terms.push(cleaned);
      }
    });

  return terms;
}

/** Does this problem answer this term? */
function termHits(term: string, haystack: string): boolean {
  const alias = TERM_ALIASES.find((entry) => entry.terms.includes(term));
  if (alias) return alias.matches.some((m) => haystack.includes(m));
  return haystack.includes(term);
}

/** Problems in this pattern that the clue points at. */
export function getClueMatches(clue: string, problems: PracticeProblem[]): PracticeProblem[] {
  const searchTerms = extractSearchTerms(clue);

  return problems.filter((prob) => {
    if (!prob.statement) return false;
    const haystack = [
      prob.name.toLowerCase(),
      prob.statement.toLowerCase(),
      (prob.notesLabel || '').toLowerCase(),
    ].join(' ');

    return searchTerms.some((term) => termHits(term, haystack));
  });
}

/**
 * Clue examples for a pattern, one entry per PROBLEM.
 *
 * Clue-major output listed the same problem — statement and all — once per
 * clue it matched, which on a pattern like Sliding Window printed "Minimum
 * Size Subarray Sum" four times over.
 */
export function buildClueMatches(pattern: Pattern | null): ClueMatch[] {
  if (!pattern?.recognize) return [];

  const byProblem = new Map<string, ClueMatch>();

  pattern.recognize.split(',').forEach((clueItem) => {
    const clue = clueItem.trim();
    if (!clue) return;
    getClueMatches(clue, pattern.problems).forEach((problem) => {
      const entry = byProblem.get(problem.id);
      if (entry) entry.clues.push(clue);
      else byProblem.set(problem.id, { problem, clues: [clue] });
    });
  });

  return Array.from(byProblem.values());
}
