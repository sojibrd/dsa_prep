/** The parts a workbook statement line breaks into. */
export interface ParsedStatement {
  description: string;
  input: string;
  output: string;
  constraint: string;
}

/**
 * Split a statement block into its description, worked example, and constraint.
 *
 * Shape the workbook writes:
 *   line 0 — the description
 *   line 1 — "উদাহরণ: `input` → `output` | ⚡ `constraint`"
 */
export function parseStatement(raw: string): ParsedStatement {
  const lines = raw.split('\n');
  const description = lines[0].trim();
  let input = '';
  let output = '';
  let constraint = '';

  if (lines.length > 1) {
    const exampleLine = lines[1].replace('উদাহরণ:', '').trim();
    const [examplePart, constraintPart] = exampleLine.split(' | ⚡ ');
    constraint = constraintPart ? constraintPart.trim() : '';

    const arrowIdx = examplePart.indexOf(' → ');
    if (arrowIdx !== -1) {
      input = examplePart.slice(0, arrowIdx).trim();
      output = examplePart.slice(arrowIdx + 3).trim();
    } else {
      input = examplePart.trim();
    }
  }

  return { description, input, output, constraint };
}
