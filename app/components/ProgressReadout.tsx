'use client';

/** The overall completion readout: how many solved, out of how many, as a bar. */
export default function ProgressReadout({
  solved,
  total,
  percent,
}: {
  solved: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="t-label">সর্বমোট অগ্রগতি</span>
          <span className="t-title text-xl">
            {solved} / {total} Solved
          </span>
        </div>
        <span className="t-mono t-accent text-lg">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="সার্বিক সম্পূর্ণতা"
        className="gauge h-2.5 w-full"
      >
        <div className="gauge-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
