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
  const lines = content.split('\n');
  
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

    // Parse Demo Statement: "**Statement (Demo):** ..."
    if (line.startsWith('**Statement (Demo):**')) {
      currentPattern.demoStatement = line.replace('**Statement (Demo):**', '').trim();
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
    
    // Parse Practice Problems
    if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
      // Find problem name inside **
      const nameMatch = line.match(/\*\*([^*]+)\*\*/);
      const name = nameMatch ? nameMatch[1].trim() : '';
      
      // Find URL
      const urlMatch = line.match(/\((https?:\/\/[^)]+)\)/);
      const leetcodeUrl = urlMatch ? urlMatch[1].trim() : '';
      
      const isMustDo = line.includes('🔥');
      
      // Notes or extra label
      let notesLabel = '';
      const notesMatch = line.match(/_([^_]+)_$/);
      if (notesMatch) {
        notesLabel = notesMatch[1].trim();
      }
      
      if (name && leetcodeUrl) {
        const id = `${currentPattern.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        currentProblem = {
          id,
          name,
          leetcodeUrl,
          isMustDo,
          notesLabel: notesLabel || undefined,
          statement: undefined,
        };
        currentPattern.problems.push(currentProblem);
      }
      continue;
    }

    // Parse problem statement: "→ Statement: ..."
    // This line appears directly after a problem entry
    if (line.startsWith('→ Statement:') && currentProblem) {
      currentProblem.statement = line.replace('→ Statement:', '').trim();
      continue;
    }
  }
  
  return topics;
}
