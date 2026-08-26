'use client';

import type { TrieScene as TrieSceneData, TrieNodeData } from '../../lib/simulations/types';

/* Layout constants, matching TreeScene's proportions. */
const COL = 64;
const ROW = 72;
const RADIUS = 15;
const PAD_X = 36;
const PAD_Y = 26;

interface Placed {
  node: TrieNodeData;
  x: number;
  y: number;
}

/**
 * A prefix tree in plain SVG, laid out the way `TreeScene` lays out a binary
 * tree — derived, never stored — but n-ary: a leaf takes the next column, and
 * a parent centres over the columns its children occupy.
 *
 * The character labels on the edges are the point. In a trie the node itself
 * carries nothing; what a node MEANS is the string of characters spelled by
 * the edges leading to it. Drop the labels and the picture says nothing.
 */
export default function TrieScene({ scene }: { scene: TrieSceneData }) {
  const { nodes, edges, rootId, activeNodeId, pathSoFar } = scene;

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const childrenOf = new Map<string, typeof edges>();
  for (const edge of edges) {
    const list = childrenOf.get(edge.fromId) ?? [];
    list.push(edge);
    childrenOf.set(edge.fromId, list);
  }

  const placed = new Map<string, Placed>();
  let column = 0;

  /** Post-order: children claim columns first, then the parent centres. */
  function place(id: string, depth: number): number {
    const node = byId.get(id);
    if (!node) return 0;

    const children = childrenOf.get(id) ?? [];
    let x: number;

    if (children.length === 0) {
      x = PAD_X + column++ * COL;
    } else {
      const xs = children.map((edge) => place(edge.toId, depth + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }

    placed.set(id, { node, x, y: PAD_Y + depth * ROW });
    return x;
  }

  place(rootId, 0);

  const all = [...placed.values()];
  const width = Math.max(PAD_X * 2 + Math.max(column - 1, 0) * COL, 220);
  const height = PAD_Y * 2 + Math.max(...all.map((p) => p.y - PAD_Y), 0) + RADIUS;

  if (all.length === 0) {
    return <span className="t-caption">trie এখনো খালি।</span>;
  }

  return (
    <div className="flex flex-col gap-2 overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="trie"
        className="max-w-full"
      >
        {edges.map((edge) => {
          const from = placed.get(edge.fromId);
          const to = placed.get(edge.toId);
          if (!from || !to) return null;

          return (
            <g key={edge.id}>
              <line
                className="sim-trie-edge"
                data-mark={edge.mark}
                x1={from.x}
                y1={from.y + RADIUS}
                x2={to.x}
                y2={to.y - RADIUS}
              />
              {/* The character is the whole reason this scene kind exists. */}
              <text
                className="sim-trie-char"
                data-mark={edge.mark}
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2}
              >
                {edge.char}
              </text>
            </g>
          );
        })}

        {all.map(({ node, x, y }) => (
          <g key={node.id}>
            <circle
              className="sim-trie-node"
              data-mark={node.id === activeNodeId ? 'active' : node.mark}
              data-end={node.isEnd}
              cx={x}
              cy={y}
              r={RADIUS}
            />
            {/* A second ring says "a word ends here" without stealing the node's colour. */}
            {node.isEnd && (
              <circle
                className="sim-trie-end"
                cx={x}
                cy={y}
                r={RADIUS - 4}
              />
            )}
            {node.id === rootId && (
              <text className="sim-trie-root" x={x} y={y - RADIUS - 8}>
                root
              </text>
            )}
          </g>
        ))}
      </svg>

      {pathSoFar !== undefined && (
        <span className="t-caption">
          এ পর্যন্ত পড়া হয়েছে: <span className="t-accent">{pathSoFar || '—'}</span>
        </span>
      )}
    </div>
  );
}
