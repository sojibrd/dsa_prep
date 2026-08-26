'use client';

import type { Scene } from '../../lib/simulations/types';
import ArrayScene from './ArrayScene';
import MatrixScene from './MatrixScene';
import IntervalsScene from './IntervalsScene';
import LinkedListScene from './LinkedListScene';
import SceneAside from './SceneAside';

/**
 * The ONE place that branches on `scene.kind`. Adding a scene kind means a
 * new renderer plus a case here — nothing else in the app learns about it.
 */
function renderScene(scene: Scene) {
  switch (scene.kind) {
    case 'array':
      return <ArrayScene scene={scene} />;
    case 'matrix':
      return <MatrixScene scene={scene} />;
    case 'intervals':
      return <IntervalsScene scene={scene} />;
    case 'linked-list':
      return <LinkedListScene scene={scene} />;
  }
}

export default function SceneView({ scene }: { scene: Scene }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
        <div className="flex-1 min-w-0">{renderScene(scene)}</div>
        <SceneAside scene={scene} />
      </div>
      {scene.caption && <span className="t-caption">{scene.caption}</span>}
    </div>
  );
}
