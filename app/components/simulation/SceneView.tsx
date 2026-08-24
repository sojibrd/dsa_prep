'use client';

import type { Scene } from '../../lib/simulations/types';
import ArrayScene from './ArrayScene';
import MatrixScene from './MatrixScene';
import IntervalsScene from './IntervalsScene';

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
    case 'matrix':
      return <MatrixScene scene={scene} />;
    case 'intervals':
      return <IntervalsScene scene={scene} />;
    default: {
      // Exhaustiveness: adding a member to `Scene` without a renderer becomes a
      // compile error here rather than a blank box in production.
      const _never: never = scene;
      return _never;
    }
  }
}
