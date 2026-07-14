import fs from 'fs';
import path from 'path';

export interface PracticeProblem {
  id: string; // unique ID
  name: string;
  leetcodeUrl: string;
  isMustDo: boolean;
  notesLabel?: string;
}

export interface Pattern {
  id: string; // e.g. "1.1"
  name: string;
  recognize: string;
  demoName: string;
  demoLink: string;
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
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
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
      codeBlockLines.push(lines[i]); // Keep original formatting/indentation
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
        approach: '',
        demoCode: '',
        complexity: '',
        problems: []
      };
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
    // e.g. "**Demo: Trapping Rain Water** — [LC 42](https://leetcode.com/problems/trapping-rain-water/) _(Hard — Amazon/Google/Meta High)_"
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
    // e.g. "- [ ] **3Sum** — [LC 15](https://leetcode.com/problems/3sum/) — 🔥 Must-do"
    // or "- [ ] **Online Stock Span** — [LC 901](https://leetcode.com/problems/online-stock-span/) — ⚪ Bonus"
    if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
      // Find problem name inside **
      const nameMatch = line.match(/\*\*([^*]+)\*\*/);
      const name = nameMatch ? nameMatch[1].trim() : '';
      
      // Find URL
      const urlMatch = line.match(/\((https?:\/\/[^)]+)\)/);
      const leetcodeUrl = urlMatch ? urlMatch[1].trim() : '';
      
      const isMustDo = line.includes('🔥');
      
      // Notes or extra label (e.g. "circular -> two pass")
      let notesLabel = '';
      const notesMatch = line.match(/_([^_]+)_$/);
      if (notesMatch) {
        notesLabel = notesMatch[1].trim();
      }
      
      if (name && leetcodeUrl) {
        const id = `${currentPattern.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        currentPattern.problems.push({
          id,
          name,
          leetcodeUrl,
          isMustDo,
          notesLabel: notesLabel || undefined
        });
      }
    }
  }
  
  return topics;
}
