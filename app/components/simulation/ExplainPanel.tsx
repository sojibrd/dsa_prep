'use client';

import type { SimStep } from '../../lib/simulations/types';

interface ExplainPanelProps {
  step: SimStep;
}

/**
 * What is happening and why it is the right move.
 *
 * The two are kept apart deliberately. "কী হচ্ছে" can be read off the picture;
 * "কেন" is the part that has to survive to the interview, and folding it into
 * the same paragraph is how it gets skimmed past.
 */
export default function ExplainPanel({ step }: ExplainPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {step.vars && step.vars.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {step.vars.map((variable) => (
            <span key={variable.name} className="chip px-2.5 py-1">
              {variable.name}
              <span className="t-mono t-accent">{variable.value}</span>
            </span>
          ))}
        </div>
      )}

      <div className="callout callout--accent p-4 flex flex-col gap-2">
        <h4 className="t-label">{step.title}</h4>
        <p className="t-body measure text-sm">{step.whatHappens}</p>
        {step.whyItMatters && (
          <p className="t-caption t-quote measure">{step.whyItMatters}</p>
        )}
      </div>
    </div>
  );
}
