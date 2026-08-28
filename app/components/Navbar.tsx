'use client';

import Link from 'next/link';
import { Menu } from './icons';

interface NavbarProps {
  solved: number;
  total: number;
  percent: number;
  onOpenSidebar: () => void;
}

/**
 * The narrow-screen top bar. From `lg:` up the rail carries the identity and
 * the progress readout, and this disappears entirely, so there is only ever
 * one brand on screen.
 */
export default function Navbar({ solved, total, percent, onOpenSidebar }: NavbarProps) {
  return (
    <header className="surface-app seam-b shrink-0 w-full py-3 px-4 sm:px-6 flex items-center justify-between gap-3 lg:hidden">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="control control--quiet p-2 shrink-0"
          aria-label="নেভিগেশন খুলুন"
        >
          <Menu />
        </button>

        <span className="text-2xl shrink-0">📚</span>
        <div className="min-w-0">
          <Link href="/" className="t-title block text-base sm:text-xl truncate">
            DSA Practice Workbook
          </Link>
          <p className="t-caption hidden sm:block">Spot → Solve → Revise</p>
        </div>
      </div>

      <div className="surface-raised hidden sm:flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 shrink-0">
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
    </header>
  );
}
