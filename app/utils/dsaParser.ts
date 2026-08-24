import fs from 'fs';
import path from 'path';

export interface PracticeProblem {
  id: string; // unique ID
  name: string;
  leetcodeUrl: string;
  isMustDo: boolean;
  notesLabel?: string;
  statement?: string; // inline problem statement (optional)
}

export interface Pattern {
  id: string; // e.g. "1.1"
  name: string;
  recognize: string;
  demoName: string;
  demoLink: string;
  demoStatement?: string; // inline statement for the demo problem
  approach: string;
  demoCode: string;
  complexity: string;
  problems: PracticeProblem[];
}

export interface Topic {
  id: number;
  name: string;
  patterns: Pattern[];
}

/**
 * Every file this parser may read lives under `context/`, and the bundler is
 * told so statically. Joining `process.cwd()` straight to a path read out of
 * a file leaves the dependency graph unresolvable, and Next then falls back
 * to tracing the WHOLE project — node_modules included — as a dependency of
 * the page. Anchoring the join to a fixed subfolder keeps the trace to the
 * content directory.
 */
const CONTENT_ROOT = path.join(process.cwd(), 'context');
const CONTENT_ROOT_PREFIX = path.resolve(CONTENT_ROOT) + path.sep;

/** How deep `@[...]` includes may nest before we assume something is wrong. */
const MAX_REF_DEPTH = 16;

/**
 * Turns an `@[...]` target into an absolute path, or null if it escapes the
 * content directory. Refs are written project-relative (`context/foo/bar.md`),
 * so a leading `context/` is stripped before re-anchoring.
 */
function resolveRefPath(ref: string): string | null {
  const cleaned = ref.trim().replace(/^\.?[/\\]/, '');
  const relative = cleaned.replace(/^context[/\\]/, '');
  const resolved = path.resolve(CONTENT_ROOT, relative);

  // Containment check: `@[../../etc/passwd]` must not resolve outside.
  if (!resolved.startsWith(CONTENT_ROOT_PREFIX)) return null;

  return resolved;
}

export function parseDsaWorkbook(): Topic[] {
  const filePath = path.join(CONTENT_ROOT, 'dsa-workbook.md');
  const content = fs.readFileSync(filePath, 'utf-8');

  const topics: Topic[] = [];

  /**
   * Recursively resolve `@[filepath]` references.
   *
   * `seen` carries the include chain, so a file that references itself or an
   * ancestor is left as literal text instead of recursing forever. Without it
   * one bad line in the workbook spins the build until it runs out of memory.
   */
  function resolveRefs(text: string, seen: ReadonlySet<string>, depth: number): string[] {
    const result: string[] = [];

    for (const line of text.split('\n')) {
      const refMatch = line.trim().match(/^@\[([^\]]+)\]$/);

      if (!refMatch) {
        result.push(line);
        continue;
      }

      const refPath = resolveRefPath(refMatch[1]);

      if (!refPath || seen.has(refPath) || depth >= MAX_REF_DEPTH || !fs.existsSync(refPath)) {
        if (refPath && seen.has(refPath)) {
          console.warn(`[dsaParser] Circular reference ignored: ${refMatch[1]}`);
        } else if (refPath && depth >= MAX_REF_DEPTH) {
          console.warn(`[dsaParser] Reference nested deeper than ${MAX_REF_DEPTH}: ${refMatch[1]}`);
        } else if (!refPath) {
          console.warn(`[dsaParser] Reference outside context/ ignored: ${refMatch[1]}`);
        }
        result.push(line);
        continue;
      }

      const nested = new Set(seen);
      nested.add(refPath);
      result.push(...resolveRefs(fs.readFileSync(refPath, 'utf-8'), nested, depth + 1));
    }

    return result;
  }

  const lines = resolveRefs(content, new Set([path.resolve(filePath)]), 0);
  
  let currentTopic: Topic | null = null;
  let currentPattern: Pattern | null = null;
  let currentProblem: PracticeProblem | null = null;
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const rawLine = lines[i]; // preserve original indentation
    
    // Check for code block boundary
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        if (currentPattern) {
          currentPattern.demoCode = codeBlockLines.join('\n');
        }
        codeBlockLines = [];
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockLines.push(rawLine); // Keep original formatting/indentation
      continue;
    }
    
    // Parse Topics: e.g., "## 1. Arrays & Strings"
    const topicMatch = line.match(/^##\s+(\d+)\.\s+(.+)$/);
    if (topicMatch) {
      const id = parseInt(topicMatch[1], 10);
      const name = topicMatch[2].trim();
      currentTopic = { id, name, patterns: [] };
      topics.push(currentTopic);
      currentPattern = null;
      currentProblem = null;
      continue;
    }
    
    // Parse Patterns: e.g., "### 1.1 Two Pointers"
    const patternMatch = line.match(/^###\s+(\d+\.\d+)\s+(.+)$/);
    if (patternMatch) {
      const id = patternMatch[1].trim();
      const name = patternMatch[2].trim();
      currentPattern = {
        id,
        name,
        recognize: '',
        demoName: '',
        demoLink: '',
        demoStatement: '',
        approach: '',
        demoCode: '',
        complexity: '',
        problems: []
      };
      currentProblem = null;
      if (currentTopic) {
        currentTopic.patterns.push(currentPattern);
      }
      continue;
    }
    
    if (!currentPattern) {
      continue;
    }
    
    // Parse "চিনবেন কীভাবে" (Recognize)
    if (line.startsWith('**চিনবেন কীভাবে:**')) {
      currentPattern.recognize = line.replace('**চিনবেন কীভাবে:**', '').trim();
      continue;
    }
    
    // Parse Demo name & link
    if (line.startsWith('**Demo:')) {
      const demoNameMatch = line.match(/^\*\*Demo:\s*([^*]+)\*\*/);
      if (demoNameMatch) {
        currentPattern.demoName = demoNameMatch[1].trim();
      }
      const linkMatch = line.match(/\[[^\]]+\]\((https:\/\/[^)]+)\)/);
      if (linkMatch) {
        currentPattern.demoLink = linkMatch[1];
      }
      continue;
    }

    // Parse Demo Statement: "**Statement (Demo):** ..." with উদাহরণ: peek
    if (line.startsWith('**Statement (Demo):**')) {
      let stmt = line.replace('**Statement (Demo):**', '').trim();
      // Peek at next line — if it's the উদাহরণ: continuation, append it
      if (i + 1 < lines.length) {
        const nextTrimmed = lines[i + 1].trim();
        if (nextTrimmed.startsWith('উদাহরণ:')) {
          stmt += '\n' + nextTrimmed;
          i++; // skip consumed line
        }
      }
      currentPattern.demoStatement = stmt;
      continue;
    }
    
    // Parse Approach
    if (line.startsWith('**Approach:**')) {
      currentPattern.approach = line.replace('**Approach:**', '').trim();
      continue;
    }
    
    // Parse Complexity
    if (line.startsWith('**Complexity:**')) {
      currentPattern.complexity = line.replace('**Complexity:**', '').trim();
      continue;
    }
    
    // Parse practice problems
    if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
      const nameMatch = line.match(/\*\*([^*]+)\*\*/);
      const name = nameMatch ? nameMatch[1].trim() : '';
      const urlMatch = line.match(/\((https?:\/\/[^)]+)\)/);
      const leetcodeUrl = urlMatch ? urlMatch[1].trim() : '';
      const isMustDo = line.includes('🔥');
      let notesLabel = '';
      const notesMatch = line.match(/_([^_]+)_$/);
      if (notesMatch) notesLabel = notesMatch[1].trim();

      if (name && leetcodeUrl) {
        const id = `${currentPattern.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        currentProblem = {
          id, name, leetcodeUrl, isMustDo,
          notesLabel: notesLabel || undefined,
          statement: undefined,
        };
        currentPattern.problems.push(currentProblem);
      }
      continue;
    }

    // Parse problem statement: "→ Statement: ..." with উদাহরণ: peek
    if (line.startsWith('→ Statement:') && currentProblem) {
      let stmt = line.replace('→ Statement:', '').trim();
      if (i + 1 < lines.length) {
        const nextTrimmed = lines[i + 1].trim();
        if (nextTrimmed.startsWith('উদাহরণ:')) {
          stmt += '\n' + nextTrimmed;
          i++;
        }
      }
      currentProblem.statement = stmt;
      continue;
    }
  }
  
  return topics;
}
