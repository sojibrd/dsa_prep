'use client';

interface NavbarProps {
  solved: number;
  total: number;
  percent: number;
  syncing: boolean;
  onOpenSidebar: () => void;
  onOpenSyncSettings: () => void;
}

/**
 * The top bar: navigation trigger, identity, progress, sync state.
 *
 * The progress pill reads at every width now — with the desktop rail gone
 * this is the only place the overall count is always visible.
 */
export default function Navbar({
  solved,
  total,
  percent,
  syncing,
  onOpenSidebar,
  onOpenSyncSettings,
}: NavbarProps) {
  return (
    <header className="surface-app seam-b sticky top-0 z-40 w-full py-3 px-4 sm:px-6 md:px-12 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="control control--quiet p-2 shrink-0"
          aria-label="নেভিগেশন খুলুন"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="text-2xl shrink-0">📚</span>
        <div className="min-w-0">
          <h1 className="t-title text-base sm:text-xl truncate">DSA Practice Workbook</h1>
          <p className="t-caption hidden sm:block">Spot → Solve → Revise</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="surface-raised hidden sm:flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5">
          <span className="t-label hidden md:inline">Progress</span>
          <span className="t-mono t-accent text-xs sm:text-sm">
            {solved}/{total}
            <span className="hidden md:inline"> ({percent}%)</span>
          </span>
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="সার্বিক সম্পূর্ণতা"
            className="gauge h-2 w-16 sm:w-20"
          >
            <div className="gauge-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {syncing && <span className="t-label animate-pulse">Saving…</span>}

        <button
          onClick={onOpenSyncSettings}
          className="control control--quiet p-2"
          title="Cloud Sync settings"
          aria-label="ক্লাউড সিঙ্ক সেটিংস"
        >
          ☁️
        </button>
      </div>
    </header>
  );
}
