'use client';

import type { GraphScene as GraphSceneData } from '../../lib/simulations/types';

/* Circular layout constants. Sized for the ≤7-node demo graphs here. */
const RADIUS = 16;
const RING = 92;
const PAD = 46;
const SIZE = (RING + PAD) * 2;
const CENTER = SIZE / 2;

/** How far back from the node the arrowhead sits, and how wide it opens. */
const ARROW_LENGTH = 10;
const ARROW_HALF_WIDTH = 4.5;

/**
 * A graph drawn as plain SVG, nodes placed on a circle at equal angles in
 * array order — the same "derive the layout, never store it" rule `TreeScene`
 * follows, so no trace file holds a coordinate.
 *
 * Arrowheads are drawn as polygons rather than SVG `marker`s: a marker cannot
 * inherit the line's stroke colour reliably, and an arrow that stays grey
 * while its edge lights up would say the wrong thing.
 */
export default function GraphScene({ scene }: { scene: GraphSceneData }) {
  const { nodes, edges, activeNodeId, activeEdgeId, pointers } = scene;

  const position = new Map(
    nodes.map((node, i) => {
      // Start at the top and go clockwise, so node 0 is where the eye lands.
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(nodes.length, 1);
      return [node.id, { x: CENTER + RING * Math.cos(angle), y: CENTER + RING * Math.sin(angle) }];
    })
  );

  const pointersAt = (id: string) => (pointers ?? []).filter((p) => p.nodeId === id);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label="গ্রাফ"
        className="max-w-full"
      >
        {edges.map((edge) => {
          const from = position.get(edge.from);
          const to = position.get(edge.to);
          if (!from || !to) return null;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const length = Math.hypot(dx, dy) || 1;
          const ux = dx / length;
          const uy = dy / length;

          // Stop the line at the rim of each circle, not at its centre.
          const x1 = from.x + ux * RADIUS;
          const y1 = from.y + uy * RADIUS;
          const x2 = to.x - ux * RADIUS;
          const y2 = to.y - uy * RADIUS;

          const mark = edge.id === activeEdgeId ? 'active' : edge.mark;

          // Arrowhead: back off along the line, then spread perpendicular.
          const bx = x2 - ux * ARROW_LENGTH;
          const by = y2 - uy * ARROW_LENGTH;
          const head = [
            `${x2},${y2}`,
            `${bx - uy * ARROW_HALF_WIDTH},${by + ux * ARROW_HALF_WIDTH}`,
            `${bx + uy * ARROW_HALF_WIDTH},${by - ux * ARROW_HALF_WIDTH}`,
          ].join(' ');

          return (
            <g key={edge.id}>
              <line className="sim-graph-edge" data-mark={mark} x1={x1} y1={y1} x2={x2} y2={y2} />
              {edge.directed && (
                <polygon className="sim-graph-arrow" data-mark={mark} points={head} />
              )}
              {edge.weight !== undefined && (
                <text
                  className="sim-graph-weight"
                  data-mark={mark}
                  x={(x1 + x2) / 2 - uy * 9}
                  y={(y1 + y2) / 2 + ux * 9}
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((node) => {
          const at = position.get(node.id);
          if (!at) return null;
          const mark = node.id === activeNodeId ? 'active' : node.mark;

          return (
            <g key={node.id}>
              <circle
                className="sim-graph-node"
                data-mark={mark}
                cx={at.x}
                cy={at.y}
                r={RADIUS}
              />
              <text className="sim-graph-label" x={at.x} y={at.y}>
                {node.label}
              </text>

              {node.annotation && (
                <text className="sim-graph-annot" x={at.x} y={at.y + RADIUS + 13}>
                  {node.annotation}
                </text>
              )}

              {pointersAt(node.id).map((pointer, i) => (
                <text
                  key={pointer.name}
                  className="sim-graph-pointer"
                  x={at.x}
                  y={at.y - RADIUS - 7 - i * 12}
                >
                  {pointer.name}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
