/** Notes a person keeps against one problem. */
export interface ProblemNote {
  solution: string;
  obstacle: string;
}

/** One row as the Apps Script endpoint returns it. */
export interface SheetRow {
  id: string;
  name?: string;
  solved?: boolean;
  noteIdea?: string;
  noteObstacle?: string;
}

/** A message shown in the banner under the navbar. */
export interface SyncStatus {
  type: 'success' | 'error';
  message: string;
}

/** One clue-example entry: a problem and every clue it answers. */
export interface ClueMatch {
  problem: import('./utils/dsaParser').PracticeProblem;
  clues: string[];
}
