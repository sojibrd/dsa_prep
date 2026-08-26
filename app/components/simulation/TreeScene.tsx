'use client';

import type { TreeScene as TreeSceneData, TreeNodeData } from '../../lib/simulations/types';

/* Layout constants. Small enough for the ≤7-node demo trees this workbook
   uses; a bigger tree would simply produce a wider SVG that scrolls. */
const COL = 60;
const ROW = 72;
const RADIUS = 18;
const PAD_X = 34;
const PAD_Y = 28;

interface Placed {
  node: TreeNodeData;
  x: number;
  y: number;
}

/**
 * A binary tree drawn as plain SVG, with the layout derived rather than
 * supplied: in-order traversal decides the column, recursion depth decides
 * the row. That is why no trace file ever mentions a coordinate — and why a
 * half-built tree (5.2) lays itself out correctly with no extra work.
 *
 * A library like React Flow would bring pan, zoom, drag and a minimap for
 * trees that fit on screen twice over, and would push per-node positions
 * into the data files. Neither is worth it here.
 */
export default function TreeScene({ scene }: { scene: TreeSceneData }) {
  const { nodes, rootId, activeNodeId, highlightPath, pointers } = scene;

  const byId = new Map(nodes.map((node) => [node.id, node]));

  // The root is the node nobody claims as a child.
  const claimed = new Set(
    nodes.flatMap((node) => [node.leftId, node.rightId].filter(Boolean) as string[])
  );
  const root = rootId ?? nodes.find((node) => !claimed.has(node.id))?.id;

  const placed: Placed[] = [];
  const edges: { from: Placed; to: Placed }[] = [];
  let column = 0;

  /** In-order walk: left subtree, then take the next column, then right. */
  function place(id: string | null | undefined, depth: number): Placed | null {
    if (!id) return null;
    const node = byId.get(id);
    if (!node) return null;

    const left = place(node.leftId, depth + 1);
    const self: Placed = {
      node,
      x: PAD_X + column++ * COL,
      y: PAD_Y + depth * ROW,
    };
    placed.push(self);
    const right = place(node.rightId, depth + 1);

    if (left) edges.push({ from: self, to: left });
    if (right) edges.push({ from: self, to: right });
    return self;
  }

  place(root, 0);

  const width = Math.max(PAD_X * 2 + Math.max(column - 1, 0) * COL, 200);
  const height = PAD_Y * 2 + Math.max(...placed.map((p) => p.y - PAD_Y), 0) + RADIUS;

  const onPath = new Set(highlightPath ?? []);
  const pointersAt = (id: string) => (pointers ?? []).filter((p) => p.nodeId === id);

  const markOf = (node: TreeNodeData) =>
    node.id === activeNodeId ? 'active' : node.mark;

  if (!root || placed.length === 0) {
    return <span className="t-caption">এখনো কোনো নোড তৈরি হয়নি।</span>;
  }

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="ট্রি"
        className="max-w-full"
      >
        {edges.map(({ from, to }, i) => (
          <line
            key={i}
            className="sim-tree-edge"
            data-on={onPath.has(from.node.id) && onPath.has(to.node.id)}
            x1={from.x}
            y1={from.y + RADIUS}
            x2={to.x}
            y2={to.y - RADIUS}
          />
        ))}

        {placed.map(({ node, x, y }) => (
          <g key={node.id}>
            <circle
              className="sim-tree-node"
              data-mark={markOf(node)}
              data-on={onPath.has(node.id)}
              cx={x}
              cy={y}
              r={RADIUS}
            />
            <text className="sim-tree-val" x={x} y={y}>
              {node.val}
            </text>

            {node.annotation && (
              <text className="sim-tree-annot" x={x} y={y + RADIUS + 13}>
                {node.annotation}
              </text>
            )}

            {pointersAt(node.id).map((pointer, i) => (
              <text
                key={pointer.name}
                className="sim-tree-pointer"
                x={x}
                y={y - RADIUS - 7 - i * 12}
              >
                {pointer.name}
              </text>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
