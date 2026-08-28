import type { Metadata } from 'next';
import { parseDsaWorkbook } from '../utils/dsaParser';
import ProgressClient, { type ProgressProblem } from './ProgressClient';

export const metadata: Metadata = {
  title: 'Progress — DSA Practice Workbook',
};

export default function ProgressPage() {
  const topics = parseDsaWorkbook();

  // Flattened here, on the server, so the client page ships a list rather
  // than the whole topic tree with every demo and code block in it.
  const problems: ProgressProblem[] = topics.flatMap((topic) =>
    topic.patterns.flatMap((pattern) =>
      pattern.problems.map((problem) => ({
        id: problem.id,
        name: problem.name,
        leetcodeUrl: problem.leetcodeUrl,
        isMustDo: problem.isMustDo,
        patternId: pattern.id,
        patternName: pattern.name,
        topicName: topic.name,
      }))
    )
  );

  return <ProgressClient problems={problems} />;
}
