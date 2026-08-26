import type { PatternSimulation } from './types';

import { twoPointersSim } from './topic1/two-pointers';
import { slidingWindowSim } from './topic1/sliding-window';
import { prefixSumSim } from './topic1/prefix-sum';
import { hashingSim } from './topic1/hashing';
import { mergeIntervalsSim } from './topic1/merge-intervals';
import { kadaneSim } from './topic1/kadane';
import { matrixTraversalSim } from './topic1/matrix-traversal';

import { basicBinarySearchSim } from './topic2/basic-binary-search';
import { searchOnAnswerSim } from './topic2/search-on-answer';
import { allocationSim } from './topic2/allocation';
import { rotatedArraySim } from './topic2/rotated-array';

import { fastSlowPointersSim } from './topic3/fast-slow-pointers';
import { dummyNodeSim } from './topic3/dummy-node';
import { inPlaceReversalSim } from './topic3/in-place-reversal';

/** Every simulation that exists. Topics land here one file at a time. */
const ALL: PatternSimulation[] = [
  twoPointersSim,
  slidingWindowSim,
  prefixSumSim,
  hashingSim,
  mergeIntervalsSim,
  kadaneSim,
  matrixTraversalSim,

  basicBinarySearchSim,
  searchOnAnswerSim,
  allocationSim,
  rotatedArraySim,

  fastSlowPointersSim,
  dummyNodeSim,
  inPlaceReversalSim,
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
