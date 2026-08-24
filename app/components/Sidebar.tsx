'use client';

import { Topic } from '../utils/dsaParser';
import ProgressReadout from './ProgressReadout';

interface PatternCount {
  solved: number;
  total: number;
}

interface SidebarProps {
  topics: Topic[];
  selectedPatternId: string;
  byTopic: Map<number, PatternCount>;
  byPattern: Map<string, PatternCount>;
  onSelect: (patternId: string) => void;
  onClose: () => void;
  solvedCount: number;
  totalProblems: number;
  progressPercent: number;
}

/**
 * Topic → pattern navigation, as a drawer.
 *
 * It used to be a permanent desktop rail as well, which stranded roughly a
 * screen and a half of empty chassis under a short list and squeezed the
 * pattern panel. Behind the hamburger at every width, the panel gets the
 * full page and this list gets a whole viewport when it is open.
 */
export default function Sidebar({
  topics,
  selectedPatternId,
  byTopic,
  byPattern,
  onSelect,
  onClose,
  solvedCount,
  totalProblems,
  progressPercent,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="seam-b flex items-center justify-between px-5 py-4 shrink-0">
        <span className="t-label">টপিক ও প্যাটার্নসমূহ</span>
        <button
          onClick={onClose}
          className="control control--quiet p-2"
          aria-label="সাইডবার বন্ধ করুন"
        >
          ✕
        </button>
      </div>

      {/* The navbar pill is hidden below `sm:`, so on a small phone this is
          the only place the overall count appears. */}
      <div className="px-4 pt-4 shrink-0">
        <div className="surface-panel p-4">
          <ProgressReadout
            solved={solvedCount}
            total={totalProblems}
            percent={progressPercent}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-5">
          {topics.map((topic) => {
            const { solved, total } = byTopic.get(topic.id) ?? { solved: 0, total: 0 };

            return (
              <div key={topic.id} className="topic-group pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="t-strong text-sm min-w-0 truncate">
                    {topic.id}. {topic.name}
                  </h4>
                  <span className="chip shrink-0">
                    {solved}/{total}
                  </span>
                </div>

                <div className="seam-l flex flex-col gap-1.5 pl-2 ml-1">
                  {topic.patterns.map((pattern) => {
                    const isSelected = pattern.id === selectedPatternId;
                    const { solved: patternSolved, total: patternTotal } =
                      byPattern.get(pattern.id) ?? { solved: 0, total: 0 };

                    return (
                      <button
                        key={pattern.id}
                        id={`pattern-btn-${pattern.id}`}
                        onClick={() => onSelect(pattern.id)}
                        aria-current={isSelected}
                        className="row w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          {pattern.id} {pattern.name}
                        </span>
                        <span className="text-[10px] shrink-0">
                          ({patternSolved}/{patternTotal})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
