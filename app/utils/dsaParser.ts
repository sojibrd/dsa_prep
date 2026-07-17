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

export function parseDsaWorkbook(): Topic[] {
  const filePath = path.join(process.cwd(), 'context', 'dsa-workbook.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const topics: Topic[] = [];
  // Recursively resolve @[filepath] references
  function resolveRefs(text: string): string[] {
    const result: string[] = [];
    for (const line of text.split('\n')) {
      const refMatch = line.trim().match(/^@\[([^\]]+)\]$/);
      if (refMatch) {
        const refPath = path.join(process.cwd(), refMatch[1].trim());
        if (fs.existsSync(refPath)) {
          result.push(...resolveRefs(fs.readFileSync(refPath, 'utf-8')));
        } else {
          result.push(line);
        }
      } else {
        result.push(line);
      }
    }
    return result;
  }

  let lines = resolveRefs(content);
  
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
