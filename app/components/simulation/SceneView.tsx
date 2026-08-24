'use client';

import type { Scene } from '../../lib/simulations/types';
import ArrayScene from './ArrayScene';

interface SceneViewProps {
  scene: Scene;
}

/**
 * The one place a scene `kind` is turned into a renderer. Every other part of
 * the simulation — the engine, the controls, the explanation — stays ignorant
 * of what shape is on screen, which is what lets a new structure arrive as one
 * new file and one new branch here.
 */
export default function SceneView({ scene }: SceneViewProps) {
  switch (scene.kind) {
    case 'array':
      return <ArrayScene scene={scene} />;
    default:
      // Unreachable while every `Scene` member has a case above. Kept as a
      // guard rather than an exhaustiveness assertion because `Scene` has a
      // single member today, and TypeScript cannot narrow a one-member union
      // to `never`. When the second scene kind lands, replace this with
      // `const _never: never = scene`.
      return null;
  }
}
