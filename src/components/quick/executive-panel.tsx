import type { BreakEvenResult, EngineResult, ModelInputs } from "@/lib/model/types"
import { formatCurrency, formatMonths, formatPercent } from "@/lib/model/format"
import { cn } from "@/lib/utils"

const evidenceCopy: Record<string, { label: string; tone: "strong" | "medium" | "weak" }> = {
  company_historical: { label: "Company historical data", tone: "strong" },
  randomized_experiment: { label: "Randomized experiment", tone: "strong" },
  matched_comparison: { label: "Matched comparison", tone: "medium" },
  observational_case_study: { label: "Observational case study", tone: "weak" },
  external_benchmark: { label: "External benchmark", tone: "weak" },
  internal_assumption: { label: "Internal assumption", tone: "weak" },
  illustrative_example: { label: "Illustrative example", tone: "weak" },
}

function Stat({
  label,
  value,
  sub,
  emphasis,
  positive,
}: {
  label: string
  value: string
  sub?: string | undefined
  emphasis?: boolean | undefined
  positive?: boolean | undefined
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-md border border-border bg-card p-4",
        emphasis && "border-primary/40 bg-primary/[0.04]",
      )}
    >
      <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "mt-2 font-sans tabular-nums font-semibold leading-none",
          emphasis ? "text-3xl" : "text-xl",
          positive === true && "text-primary",
          positive === false && "text-destructive",
          positive === undefined && "text-foreground",
        )}
      >
        {value}
      </span>
      {sub ? <span className="mt-1.5 font-sans text-xs text-muted-foreground">{sub}</span> : null}
    </div>
  )
}

export function ExecutivePanel({
  inputs,
  engine,
  breakEven,
}: {
  inputs: ModelInputs
  engine: EngineResult
  breakEven: BreakEvenResult
}) {
  const cur = inputs.baseline.currency
  const evidence = evidenceCopy[inputs.effects.evidenceType] ?? { label: "Unspecified", tone: "weak" as const }
  const toneClass =
    evidence.tone === "strong"
      ? "bg-primary/10 text-primary"
      : evidence.tone === "medium"
        ? "bg-accent text-accent-foreground"
        : "bg-maroon/10 text-maroon"

  return (
    <section aria-labelledby="exec-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="exec-heading" className="font-serif text-2xl font-semibold text-foreground">
            Executive decision panel
          </h2>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            {inputs.name} · {inputs.vertical} · {inputs.baseline.analysisHorizonMonths}-month horizon
          </p>
        </div>
        <span className={cn("rounded-sm px-2.5 py-1 font-sans text-xs font-semibold", toneClass)}>
          Evidence: {evidence.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-1">
          <Stat
            label="Year-one net benefit"
            value={formatCurrency(engine.yearOneNetBenefit, cur)}
            emphasis
            positive={engine.yearOneNetBenefit >= 0}
            sub="After modelled benefits and included costs"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          <Stat
            label="Total-horizon net benefit"
            value={formatCurrency(engine.horizonNetBenefit, cur)}
            positive={engine.horizonNetBenefit >= 0}
          />
          <Stat
            label="NPV"
            value={formatCurrency(engine.npv, cur)}
            positive={engine.npv >= 0}
            sub={`at ${formatPercent(inputs.financial.annualDiscountRate, 0)} discount`}
          />
          <Stat
            label="Simple ROI"
            value={engine.simpleROI === null ? "Not calculable" : formatPercent(engine.simpleROI, 0)}
            positive={engine.simpleROI === null ? undefined : engine.simpleROI >= 0}
          />
          <Stat label="Payback" value={formatMonths(engine.paybackMonth)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Discounted payback" value={formatMonths(engine.discountedPaybackMonth)} />
        <Stat
          label="Break-even conversion lift"
          value={
            breakEven.requiredRelativeLift === null
              ? "Not calculable"
              : breakEven.feasibleLift
                ? formatPercent(breakEven.requiredRelativeLift)
                : "Infeasible"
          }
          sub={breakEven.feasibleLift ? "Relative lift to reach NPV = 0" : "Exceeds a plausible range"}
        />
        <Stat
          label="Break-even adoption"
          value={
            breakEven.requiredMaxCoverage === null
              ? "Not calculable"
              : breakEven.feasibleCoverage
                ? formatPercent(breakEven.requiredMaxCoverage)
                : "Infeasible"
          }
          sub="Max coverage to reach NPV = 0"
        />
        <Stat
          label="Total program cost"
          value={formatCurrency(engine.totalProgramCost, cur)}
          sub={`${formatCurrency(engine.totalOneTimeCost, cur, { compact: true })} one-time`}
        />
      </div>

      <p className="font-sans text-xs leading-relaxed text-muted-foreground">
        Indicative scenario estimate using {engine.marginLabel} margin. Not a forecast and not proof of
        incrementality. The break-even figures are the testable thresholds a pilot should aim to clear.
      </p>
    </section>
  )
}
