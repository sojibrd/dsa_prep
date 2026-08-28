'use client';

/** The overall completion readout: how far along, as a bar. */
export default function ProgressReadout({ percent }: { percent: number }) {
  return (
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
  );
}
