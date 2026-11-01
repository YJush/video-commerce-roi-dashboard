import type { BreakEvenResult, EngineResult, ModelInputs } from "@/lib/model/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/model/format";

export function BreakEvenPanel({
  inputs,
  engine,
  breakEven,
}: {
  inputs: ModelInputs;
  engine: EngineResult;
  breakEven: BreakEvenResult;
}) {
  const cur = inputs.baseline.currency;
  const assumedLift = inputs.effects.relativeConversionLift;
  const be = breakEven.requiredRelativeLift;

  const rows: { label: string; value: string }[] = [
    {
      label: "Required relative conversion lift",
      value:
        be === null
          ? "Not calculable"
          : breakEven.feasibleLift
            ? formatPercent(be)
            : "No feasible solution",
    },
    {
      label: "Required percentage-point change",
      value:
        breakEven.requiredAbsoluteChange === null
          ? "Not calculable"
          : `${(breakEven.requiredAbsoluteChange * 100).toFixed(2)} pp`,
    },
    {
      label: "Required incremental retained orders",
      value:
        breakEven.requiredIncrementalRetainedOrders === null
          ? "Not calculable"
          : `${formatNumber(breakEven.requiredIncrementalRetainedOrders)} over horizon`,
    },
    {
      label: "Required monthly benefit",
      value:
        breakEven.requiredMonthlyBenefit === null
          ? "Not calculable"
          : formatCurrency(breakEven.requiredMonthlyBenefit, cur),
    },
    {
      label: "Max supportable program cost",
      value:
        breakEven.maxSupportableProgramCost === null
          ? "Not calculable"
          : formatCurrency(breakEven.maxSupportableProgramCost, cur),
    },
    {
      label: "Required adoption (max coverage)",
      value:
        breakEven.requiredMaxCoverage === null
          ? "Not calculable"
          : breakEven.feasibleCoverage
            ? formatPercent(breakEven.requiredMaxCoverage)
            : "No feasible solution",
    },
  ];

  const clears = be !== null && breakEven.feasibleLift && assumedLift >= be;

  return (
    <section
      aria-labelledby="be-heading"
      className="flex flex-col gap-4 rounded-md border border-border bg-card p-6"
    >
      <div>
        <h2 id="be-heading" className="font-serif text-2xl font-semibold text-foreground">
          Break-even
        </h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          The minimum performance the program must reach — a testable pilot threshold, not a
          forecast.
        </p>
      </div>

      {be !== null && breakEven.feasibleLift ? (
        <p className="text-pretty font-serif text-lg leading-relaxed text-foreground">
          At the current cost and traffic assumptions, the program needs a{" "}
          <span className="font-semibold text-primary">{formatPercent(be)}</span> relative
          conversion improvement to break even over the horizon. Your working assumption is{" "}
          <span className="font-semibold">{formatPercent(assumedLift)}</span>
          {clears ? ", which clears the threshold." : ", which does not clear it."}
        </p>
      ) : (
        <p className="text-pretty font-serif text-lg leading-relaxed text-foreground">
          There is no feasible conversion lift within a plausible range that makes this program
          break even at the current cost and traffic assumptions.
        </p>
      )}

      <dl className="grid grid-cols-1 gap-x-8 gap-y-0 divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-sans text-sm text-muted-foreground">{row.label}</dt>
            <dd className="shrink-0 font-sans tabular-nums text-sm font-semibold text-foreground">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
