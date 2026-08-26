'use client';

import type { SimStep } from '../../lib/simulations/types';

/**
 * What just happened, and why anyone should care. `whyItMatters` is optional
 * on purpose — repeating an insight on every routine iteration would train
 * the reader to skip the line entirely.
 */
export default function ExplainPanel({ step }: { step: SimStep }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2 flex-wrap">
        <h5 className="t-title text-sm">{step.title}</h5>
      </div>

      {step.vars && step.vars.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {step.vars.map((variable) => (
            <span key={variable.name} className="sim-var">
              <span className="sim-var-name">{variable.name}</span>
              <span className="sim-var-value">{variable.value}</span>
            </span>
          ))}
        </div>
      )}

      <p className="t-body measure text-sm">{step.whatHappens}</p>

      {step.whyItMatters && (
        <div className="callout callout--accent p-3">
          <span className="t-label mb-1 block">কেন গুরুত্বপূর্ণ</span>
          <p className="t-body measure text-xs">{step.whyItMatters}</p>
        </div>
      )}
    </div>
  );
}
