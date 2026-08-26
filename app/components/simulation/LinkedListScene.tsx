'use client';

import type { LinkedListScene as LinkedListSceneData } from '../../lib/simulations/types';

/**
 * A chain of nodes drawn as `[ val | • ] → [ val | • ] → ∅`.
 *
 * The connector after each node is decided by that node's REAL `nextId`, not
 * by who happens to sit beside it:
 *
 *   →      next is the neighbour on the right (an intact chain)
 *   ↳ val  next is somewhere else entirely (mid-reversal, a spliced merge)
 *   ∅      tail
 *
 * That distinction is why in-place reversal is legible at all. Redrawing the
 * row in chain order every step would keep the arrows tidy and hide the one
 * thing worth watching — that a pointer now aims backwards.
 *
 * A cycle gets a rail under the chain spanning target→tail rather than a
 * curved arrow: the rail is per-node segments, so it stays aligned without
 * the component computing a single coordinate.
 */
export default function LinkedListScene({ scene }: { scene: LinkedListSceneData }) {
  const { nodes, pointers, dummy, cycleTargetId } = scene;

  const valueOf = (id: string) => nodes.find((node) => node.id === id)?.val;
  const pointersAt = (id: string) => (pointers ?? []).filter((p) => p.nodeId === id);

  const cycleFrom = cycleTargetId ? nodes.findIndex((n) => n.id === cycleTargetId) : -1;
  const inLoop = (index: number) => cycleFrom >= 0 && index >= cycleFrom;

  /** What the connector leaving `index` should say. */
  function connector(index: number) {
    const node = nodes[index];
    const isLast = index === nodes.length - 1;

    if (cycleTargetId && isLast) {
      return { kind: 'cycle', text: '↩' };
    }
    if (node.nextId === null || node.nextId === undefined) {
      return { kind: 'null', text: '∅' };
    }
    if (nodes[index + 1]?.id === node.nextId) {
      return { kind: 'next', text: '→' };
    }
    return { kind: 'jump', text: `↳ ${valueOf(node.nextId) ?? node.nextId}` };
  }

  return (
    <div className="flex flex-col gap-2 overflow-x-auto">
      <div className="flex items-start min-w-min">
        {dummy && (
          <div className="flex flex-col">
            <div className="h-4" />
            <div className="flex items-center">
              <div className="sim-node" data-dummy="true">
                <span className="sim-node-val">{dummy.val}</span>
                <span className="sim-node-link">•</span>
              </div>
              <span className="sim-link" data-kind="next">
                →
              </span>
            </div>
            <div className="sim-loop" data-in="false" />
          </div>
        )}

        {nodes.map((node, index) => {
          const link = connector(index);
          const here = pointersAt(node.id);

          return (
            <div key={node.id} className="flex flex-col">
              {/* Cursors ride above the node they point at. */}
              <div className="flex h-4 items-end gap-1">
                {here.map((pointer) => (
                  <span key={pointer.name} className="sim-pointer">
                    {pointer.name}
                  </span>
                ))}
              </div>

              <div className="flex items-center">
                <div className="sim-node" data-mark={node.mark}>
                  <span className="sim-node-val">{node.val}</span>
                  <span className="sim-node-link">•</span>
                </div>
                <span className="sim-link" data-kind={link.kind}>
                  {link.text}
                </span>
              </div>

              {/* One segment of the loop-back rail, if this node is inside it. */}
              <div
                className="sim-loop"
                data-in={inLoop(index)}
                data-edge={
                  inLoop(index)
                    ? index === cycleFrom
                      ? 'start'
                      : index === nodes.length - 1
                        ? 'end'
                        : undefined
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>

      {cycleTargetId && (
        <span className="t-caption">
          শেষ নোড থেকে তীর ফিরে যাচ্ছে মান {valueOf(cycleTargetId)}-এ — এটাই cycle।
        </span>
      )}
    </div>
  );
}
