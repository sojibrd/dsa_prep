'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { LinkedListScene as LinkedListSceneData } from '../../lib/simulations/types';
import SceneAside from './SceneAside';

interface LinkedListSceneProps {
  scene: LinkedListSceneData;
}

/**
 * A chain of nodes connected by arrows — linked list traversal, reversal,
 * merge, cycle detection.
 *
 * Nodes are HTML elements (reusing `sim-cell`), arrows between them are drawn
 * as an SVG overlay so cycle-back curves and pointer reassignment animations
 * are straightforward. The SVG is repositioned on every render via refs.
 */
export default function LinkedListScene({ scene }: LinkedListSceneProps) {
  const { nodes, pointers = [], dummy, cycleTargetId, table, output, caption } = scene;

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [arrows, setArrows] = useState<ArrowData[]>([]);

  /** Which pointers sit on each node id. */
  const pointersAt = (nodeId: string) => pointers.filter((p) => p.nodeId === nodeId);

  /** All renderable items: optional dummy + nodes. */
  type RenderItem = { id: string; val: string | number; nextId?: string | null; isDummy: boolean; mark?: string };
  const nodeItems: RenderItem[] = nodes.map((n) => ({ ...n, isDummy: false }));
  const allItems: RenderItem[] = dummy
    ? [{ id: dummy.id, val: dummy.val, nextId: dummy.nextId, isDummy: true }, ...nodeItems]
    : nodeItems;

  const measureArrows = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const newArrows: ArrowData[] = [];

    for (const item of allItems) {
      if (!item.nextId) continue;
      const fromEl = nodeRefs.current.get(item.id);
      const toEl = nodeRefs.current.get(item.nextId);
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const x1 = fromRect.right - cRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - cRect.top;
      const x2 = toRect.left - cRect.left;
      const y2 = toRect.top + toRect.height / 2 - cRect.top;

      // Check if this is a cycle-back arrow (target is to the LEFT of source)
      const isCycle = cycleTargetId === item.nextId && x2 < x1;

      newArrows.push({ x1, y1, x2, y2, isCycle });
    }

    setArrows(newArrows);
  }, [allItems, cycleTargetId]);

  useEffect(() => {
    // Measure after DOM paints
    const raf = requestAnimationFrame(measureArrows);
    return () => cancelAnimationFrame(raf);
  }, [measureArrows]);

  const setNodeRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  return (
    <div className="flex items-start gap-6">
      <div className="flex flex-col gap-2 overflow-x-auto">
        <div ref={containerRef} className="relative flex items-center gap-6 min-w-max px-1 pb-8 pt-8">
          {/* SVG overlay for arrows */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <marker
                id="ll-arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <path
                  d="M0,0 L8,3 L0,6"
                  fill="none"
                  stroke="var(--t-sim-cell-border)"
                  strokeWidth="1.2"
                />
              </marker>
              <marker
                id="ll-arrowhead-cycle"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <path
                  d="M0,0 L8,3 L0,6"
                  fill="none"
                  stroke="var(--t-sim-active-border)"
                  strokeWidth="1.2"
                />
              </marker>
            </defs>
            {arrows.map((a, i) =>
              a.isCycle ? (
                <path
                  key={i}
                  d={`M${a.x1},${a.y1} C${a.x1 + 20},${a.y1 + 50} ${a.x2 - 20},${a.y2 + 50} ${a.x2},${a.y2}`}
                  fill="none"
                  stroke="var(--t-sim-active-border)"
                  strokeWidth="1.5"
                  strokeDasharray="5,3"
                  markerEnd="url(#ll-arrowhead-cycle)"
                />
              ) : (
                <line
                  key={i}
                  x1={a.x1}
                  y1={a.y1}
                  x2={a.x2 - 2}
                  y2={a.y2}
                  stroke="var(--t-sim-cell-border)"
                  strokeWidth="1.5"
                  markerEnd="url(#ll-arrowhead)"
                />
              )
            )}
          </svg>

          {/* Nodes */}
          {allItems.map((item) => {
            const here = pointersAt(item.id);
            const mark = 'mark' in item ? item.mark : undefined;

            return (
              <div key={item.id} className="flex flex-col items-center gap-1 z-10">
                {/* Pointer labels above */}
                <div className="flex flex-col items-center justify-end gap-0.5 h-6">
                  {here.map((p) => (
                    <span key={p.name} className="sim-pointer">
                      {p.name} ▼
                    </span>
                  ))}
                </div>

                {/* Node cell */}
                <div
                  ref={setNodeRef(item.id)}
                  className="sim-cell px-3"
                  data-mark={mark}
                  style={item.isDummy ? { borderStyle: 'dashed', opacity: 0.7 } : undefined}
                >
                  {item.val}
                </div>

                {/* Node id label below */}
                <span className="sim-index">{item.id}</span>
              </div>
            );
          })}

          {/* Null terminator for non-cycle lists */}
          {!cycleTargetId && (
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="h-6" />
              <span className="sim-index" style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                null
              </span>
              <div />
            </div>
          )}
        </div>

        {caption && <p className="t-caption measure">{caption}</p>}
      </div>

      <SceneAside table={table} output={output} />
    </div>
  );
}

interface ArrowData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isCycle: boolean;
}
