'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pattern } from '../utils/dsaParser';
import { ListFilter } from './icons';

interface TocItem {
  id: string;
  label: string;
  /** Second-level entries are the problems under "Practice Problems". */
  nested?: boolean;
  solved?: boolean;
}

/**
 * The in-panel index, with the section you are reading marked.
 *
 * The panel is built out of fixed sections rather than markdown headings, and
 * four of those would be a thin index on their own — so every practice
 * problem is listed under them, which is what makes the column worth its
 * width on a pattern carrying a dozen drills.
 *
 * State goes on `aria-current` rather than a class: what is current is the
 * component's business, how current looks is the theme's.
 */
export default function PatternToc({
  pattern,
  hasSimulation,
  solvedSet,
}: {
  pattern: Pattern;
  hasSimulation: boolean;
  solvedSet: Set<string>;
}) {
  const [activeId, setActiveId] = useState('');

  const items = useMemo<TocItem[]>(() => {
    const list: TocItem[] = [];
    if (pattern.recognize) list.push({ id: 'sec-recognize', label: '🔎 চিনবেন কীভাবে' });
    if (pattern.demoName) list.push({ id: 'sec-demo', label: `Demo: ${pattern.demoName}` });
    if (hasSimulation) list.push({ id: 'sec-simulation', label: '▶ সিমুলেশন' });
    if (pattern.problems.length > 0) {
      list.push({ id: 'sec-problems', label: `Practice Problems (${pattern.problems.length})` });
      pattern.problems.forEach((problem) =>
        list.push({
          id: `problem-${problem.id}`,
          label: problem.name,
          nested: true,
          solved: solvedSet.has(problem.id),
        })
      );
    }
    return list;
  }, [pattern, hasSimulation, solvedSet]);

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0.1 }
    );

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  // One entry is not an index; it is the panel.
  if (items.length < 2) return null;

  return (
    <aside aria-label="এই প্যাটার্নের সূচিপত্র" className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-4 flex flex-col gap-3">
        <div className="seam-b flex items-center gap-1.5 pb-2">
          <span className="t-muted flex">
            <ListFilter />
          </span>
          <span className="t-label">এই পাতায়</span>
        </div>

        <nav className="flex flex-col gap-0.5 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                const target = document.getElementById(item.id);
                if (!target) return;
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveId(item.id);
              }}
              aria-current={activeId === item.id}
              title={item.label}
              className={`row block py-1 text-xs leading-snug truncate ${
                item.nested ? 'pl-4' : 'pl-1.5'
              }`}
            >
              {item.nested && item.solved && <span className="t-ok">✓ </span>}
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
