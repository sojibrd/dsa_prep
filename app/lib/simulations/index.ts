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

import { monotonicStackSim } from './topic4/monotonic-stack';
import { parenthesesSim } from './topic4/parentheses';
import { minStackSim } from './topic4/min-stack';
import { monotonicDequeSim } from './topic4/monotonic-deque';

import { treeTraversalSim } from './topic5/traversal';
import { treeConstructionSim } from './topic5/construction';
import { pathSumSim } from './topic5/path-sum';
import { validationSim } from './topic5/validation';
import { lcaSim } from './topic5/lca';

import { subsetsSim } from './topic7/subsets';
import { nQueensSim } from './topic7/n-queens';
import { wordSearchSim } from './topic7/word-search';

import { islandsSim } from './topic8/islands';
import { cycleDetectionSim } from './topic8/cycle-detection';
import { topologicalSortSim } from './topic8/topological-sort';
import { unionFindSim } from './topic8/union-find';
import { bipartiteSim } from './topic8/bipartite';
import { dijkstraSim } from './topic8/dijkstra';
import { mstSim } from './topic8/mst';

import { climbingStairsSim } from './topic9/climbing-stairs';
import { subsetSumSim } from './topic9/subset-sum';
import { coinChangeSim } from './topic9/coin-change';
import { lcsSim } from './topic9/lcs';
import { lisSim } from './topic9/lis';
import { editDistanceSim } from './topic9/edit-distance';
import { houseRobberSim } from './topic9/house-robber';
import { gridPathsSim } from './topic9/grid-paths';
import { intervalDpSim } from './topic9/interval-dp';
import { stateMachineSim } from './topic9/state-machine';
import { bitmaskSim } from './topic9/bitmask';

import { greedySim } from './topic10/greedy';
import { trieSim } from './topic10/trie';
import { lruCacheSim } from './topic10/lru-cache';

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

  monotonicStackSim,
  parenthesesSim,
  minStackSim,
  monotonicDequeSim,

  treeTraversalSim,
  treeConstructionSim,
  pathSumSim,
  validationSim,
  lcaSim,

  subsetsSim,
  nQueensSim,
  wordSearchSim,

  islandsSim,
  cycleDetectionSim,
  topologicalSortSim,
  unionFindSim,
  bipartiteSim,
  dijkstraSim,
  mstSim,

  climbingStairsSim,
  subsetSumSim,
  coinChangeSim,
  lcsSim,
  lisSim,
  editDistanceSim,
  houseRobberSim,
  gridPathsSim,
  intervalDpSim,
  stateMachineSim,
  bitmaskSim,

  greedySim,
  trieSim,
  lruCacheSim,
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
