import type { PatternSimulation } from './types';

import { twoPointersSim } from './topic1/two-pointers';
import { slidingWindowSim } from './topic1/sliding-window';
import { prefixSumSim } from './topic1/prefix-sum';
import { hashingSim } from './topic1/hashing';
import { mergeIntervalsSim } from './topic1/merge-intervals';
import { kadaneSim } from './topic1/kadane';
import { matrixTraversalSim } from './topic1/matrix-traversal';

/** Every simulation that exists. Topics land here one file at a time. */
const ALL: PatternSimulation[] = [
  twoPointersSim,
  slidingWindowSim,
  prefixSumSim,
  hashingSim,
  mergeIntervalsSim,
  kadaneSim,
  matrixTraversalSim,
];

const SIMULATIONS: Record<string, PatternSimulation> = Object.fromEntries(
  ALL.map((sim) => [sim.patternId, sim])
);

/**
 * Sparse on purpose: a pattern without a simulation returns null and the
 * player is not rendered at all. No placeholder, no "coming soon" box — the
 * panel simply reads as it did before the feature existed.
 */
export function getSimulation(patternId: string): PatternSimulation | null {
  return SIMULATIONS[patternId] ?? null;
}
