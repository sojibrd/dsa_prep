import type { PatternSimulation } from './types';
import { twoPointersSim } from './data/1.1-two-pointers';

/**
 * Every pattern that has a simulation, keyed by `Pattern.id`.
 *
 * The map is deliberately sparse. Fifty-one patterns will not get a timeline
 * on the same day, and a pattern that is missing here simply shows no
 * simulation block — never an empty frame or an error. That is what makes this
 * feature safe to fill in one topic at a time.
 */
const SIMULATIONS: Record<string, PatternSimulation> = {
  [twoPointersSim.patternId]: twoPointersSim,
};

export function getSimulation(patternId: string): PatternSimulation | null {
  return SIMULATIONS[patternId] ?? null;
}

export type { PatternSimulation, SimStep, Scene } from './types';
