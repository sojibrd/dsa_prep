import type { PatternSimulation } from './types';
import { twoPointersSim } from './data/1.1-two-pointers';
import { slidingWindowSim } from './data/1.2-sliding-window';
import { prefixSumSim } from './data/1.3-prefix-sum';
import { hashingSim } from './data/1.4-hashing';
import { mergeIntervalsSim } from './data/1.5-merge-intervals';
import { kadaneSim } from './data/1.6-kadane';
import { matrixTraversalSim } from './data/1.7-matrix-traversal';
import { basicBinarySearchSim } from './data/2.1-basic-binary-search';
import { binarySearchOnAnswerSim } from './data/2.2-binary-search-on-answer';
import { allocationProblemsSim } from './data/2.3-allocation-problems';
import { bitonicRotatedArraySim } from './data/2.4-bitonic-rotated-array';
import { fastSlowPointersSim } from './data/3.1-fast-slow-pointers';
import { dummyNodeSim } from './data/3.2-dummy-node';
import { inPlaceReversalSim } from './data/3.3-in-place-reversal';

/**
 * Every pattern that has a simulation, keyed by `Pattern.id`.
 *
 * The map is deliberately sparse. Fifty-one patterns will not get a timeline
 * on the same day, and a pattern that is missing here simply shows no
 * simulation block — never an empty frame or an error. That is what makes this
 * feature safe to fill in one topic at a time.
 */
const ALL: PatternSimulation[] = [
  twoPointersSim,
  slidingWindowSim,
  prefixSumSim,
  hashingSim,
  mergeIntervalsSim,
  kadaneSim,
  matrixTraversalSim,
  basicBinarySearchSim,
  binarySearchOnAnswerSim,
  allocationProblemsSim,
  bitonicRotatedArraySim,
  fastSlowPointersSim,
  dummyNodeSim,
  inPlaceReversalSim,
];

const SIMULATIONS: Record<string, PatternSimulation> = Object.fromEntries(
  ALL.map((sim) => [sim.patternId, sim])
);

export function getSimulation(patternId: string): PatternSimulation | null {
  return SIMULATIONS[patternId] ?? null;
}

export type { PatternSimulation, SimStep, Scene } from './types';
