'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Topic } from '../utils/dsaParser';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useProgress } from '../hooks/useProgress';
import Navbar from './Navbar';
import Sidebar, { type ProblemIndexEntry } from './Sidebar';
import { PanelLeftOpen } from './icons';

/**
 * The chassis both routes share: the rail, the drawer and the search that
 * reaches them.
 *
 * It lives in the layout rather than the page so that navigating to the
 * progress route keeps one navigation column on screen instead of two
 * copies drifting apart. Which pattern is selected is held in localStorage,
 * which is also how the pattern panel reads it — nothing is threaded
 * through props across the route boundary.
 */
export default function Shell({
  topics,
  children,
}: {
  topics: Topic[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  /* Folding the rail away is a deliberate act, so it outlives a refresh.
     The server has no localStorage; the default keeps the rail visible for
     the first paint and the client reconciles on hydration. */
  const [collapsed, setCollapsed] = useLocalStorage('dsa_nav_collapsed', false);
  const [selectedPatternId, setSelectedPatternId] = useLocalStorage<string>(
    'dsa_selected_pattern_id',
    '1.1'
  );
  const searchRef = useRef<HTMLInputElement>(null);

  const { solvedSet, solvedCount } = useProgress();

  // Flat problem index for search, and the per-topic / per-pattern counters
  // for the list. `topics` never changes after the server hands it over, so
  // the index is built once rather than per render.
  const problemIndex = useMemo<ProblemIndexEntry[]>(
    () =>
      topics.flatMap((topic) =>
        topic.patterns.flatMap((pattern) =>
          pattern.problems.map((problem) => ({
            id: problem.id,
            name: problem.name,
            patternId: pattern.id,
            patternName: pattern.name,
          }))
        )
      ),
    [topics]
  );

  const totalProblems = problemIndex.length;
  const progressPercent =
    totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  const { byTopic, byPattern } = useMemo(() => {
    const topicCounts = new Map<number, { solved: number; total: number }>();
    const patternCounts = new Map<string, { solved: number; total: number }>();

    topics.forEach((topic) => {
      let topicSolved = 0;
      let topicTotal = 0;

      topic.patterns.forEach((pattern) => {
        let patternSolved = 0;
        pattern.problems.forEach((problem) => {
          if (solvedSet.has(problem.id)) patternSolved++;
        });
        patternCounts.set(pattern.id, { solved: patternSolved, total: pattern.problems.length });
        topicSolved += patternSolved;
        topicTotal += pattern.problems.length;
      });

      topicCounts.set(topic.id, { solved: topicSolved, total: topicTotal });
    });

    return { byTopic: topicCounts, byPattern: patternCounts };
  }, [topics, solvedSet]);

  const onWorkbook = pathname.replace(/\/$/, '') === '';

  /**
   * Put a pattern on screen, from either route.
   *
   * On the workbook itself the query is swapped in place, so back and
   * forward walk the patterns visited. From anywhere else the router has to
   * carry us to the workbook first.
   */
  const selectPattern = useCallback(
    (patternId: string, problemId?: string) => {
      setSelectedPatternId(patternId);
      setDrawerOpen(false);

      const hash = problemId ? `#problem-${problemId}` : '';

      if (!onWorkbook) {
        router.push(`/?pattern=${patternId}${hash}`);
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.set('pattern', patternId);
      url.hash = hash;
      window.history.pushState(null, '', url.toString());

      if (problemId) {
        // The card may belong to a pattern that is only now being rendered,
        // so the scroll waits for that paint.
        setTimeout(
          () =>
            document
              .getElementById(`problem-${problemId}`)
              ?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
          120
        );
      }
    },
    [onWorkbook, router, setSelectedPatternId]
  );

  // The drawer covers the page; the page behind it must not scroll.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // With the drawer open, bring the active pattern into view.
  useEffect(() => {
    if (!drawerOpen) return;
    const timer = setTimeout(() => {
      document
        .getElementById(`pattern-btn-${selectedPatternId}`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [drawerOpen, selectedPatternId]);

  /* `/` and Ctrl+K reach the rail's search from anywhere. A folded rail is
     unfolded first, or the focus would land on an input nobody can see; on a
     narrow screen the drawer is what holds the input, so that opens instead. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      const slash = event.key === '/' && !typing;
      const ctrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      if (!slash && !ctrlK) return;

      event.preventDefault();

      if (window.matchMedia('(min-width: 1024px)').matches) {
        setCollapsed(false);
        // A rail that was folded is not in the DOM yet on this tick.
        setTimeout(() => {
          searchRef.current?.focus();
          searchRef.current?.select();
        }, 0);
        return;
      }

      setDrawerOpen(true);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setCollapsed]);

  const sidebarProps = {
    topics,
    problemIndex,
    selectedPatternId,
    byTopic,
    byPattern,
    solvedSet,
    onSelect: (patternId: string) => selectPattern(patternId),
    onSelectProblem: (patternId: string, problemId: string) =>
      selectPattern(patternId, problemId),
    progressPercent,
  };

  return (
    /* The chassis owns the viewport and the two panes scroll inside it. A
       page-scrolled rail beside a page-scrolled panel would leave the rail
       scrolled off screen exactly when it is needed. */
    <div className="surface-app h-screen flex flex-col overflow-hidden">
      <Navbar
        solved={solvedCount}
        total={totalProblems}
        percent={progressPercent}
        onOpenSidebar={() => setDrawerOpen(true)}
      />

      <div className="flex flex-1 min-h-0">
        {/* With no desktop top bar, this strip is the only way back to the
            rail once it is folded away. */}
        {collapsed && (
          <div className="surface-panel hidden lg:flex shrink-0 flex-col items-center px-2 py-3">
            <button
              onClick={() => setCollapsed(false)}
              className="control control--quiet p-1.5"
              aria-label="সূচিপত্র খুলুন"
              aria-expanded={false}
              aria-controls="site-sidebar"
            >
              <PanelLeftOpen />
            </button>
          </div>
        )}

        <aside
          id="site-sidebar"
          className={`surface-panel hidden w-80 shrink-0 min-h-0 ${collapsed ? '' : 'lg:block'}`}
        >
          <Sidebar {...sidebarProps} onCollapse={() => setCollapsed(true)} searchRef={searchRef} />
        </aside>

        {/* The page owns its own width and padding; this pane only scrolls. */}
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true">
          <div className="overlay absolute inset-0" onClick={() => setDrawerOpen(false)} />
          <aside className="surface-panel absolute left-0 top-0 h-full w-[300px] sm:w-[360px] animate-slide-in-left">
            <Sidebar {...sidebarProps} onClose={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
