/** Notes a person keeps against one problem. */
export interface ProblemNote {
  solution: string;
  obstacle: string;
}

/** One clue-example entry: a problem and every clue it answers. */
export interface ClueMatch {
  problem: import('./utils/dsaParser').PracticeProblem;
  clues: string[];
}
