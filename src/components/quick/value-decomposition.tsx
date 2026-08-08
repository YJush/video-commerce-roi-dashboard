import type { EngineResult, ModelInputs } from "@/lib/model/types"
import { formatCurrency } from "@/lib/model/format"

export function ValueDecomposition({ inputs, engine }: { inputs: ModelInputs; engine: EngineResult }) {
  const cur = inputs.baseline.currency
  const conversion = engine.conversionContributionTotal
  const returns = engine.operationalSavingsTotal
  const totalBenefit = conversion + returns
  const totalCost = engine.totalProgramCost
  const net = totalBenefit - totalCost
  const maxBar = Math.max(totalBenefit, totalCost, 1)

  const rows = [
    {
      label: "Additional retained orders",
      what: "Margin on incremental purchases that are not returned",
      value: conversion,
      tone: "bg-primary",
    },
    {
      label: "Reduced return handling",
      what: "Reverse-logistics cost avoided on preserved baseline orders",
      value: returns,
      tone: "bg-chart-3",
    },
    {
      label: "Total program cost",
      what: "Platform, implementation, production and operations",
      value: -totalCost,
      tone: "bg-maroon",
    },
  ]

  return (
    <section aria-labelledby="decomp-heading" className="flex flex-col gap-4 rounded-md border border-border bg-card p-6">
      <div>
        <h2 id="decomp-heading" className="font-serif text-2xl font-semibold text-foreground">
          Value decomposition
        </h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Where the modelled benefit comes from, kept separate so no value is double-counted.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-2 py-3">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="font-sans text-sm font-medium text-foreground">{row.label}</p>
                <p className="font-sans text-xs text-muted-foreground">{row.what}</p>
              </div>
              <span className="shrink-0 font-sans tabular-nums text-sm font-semibold text-foreground">
                {row.value < 0 ? "−" : ""}
                {formatCurrency(Math.abs(row.value), cur)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className={row.tone} style={{ width: `${(Math.abs(row.value) / maxBar) * 100}%`, height: "100%" }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-md bg-secondary px-4 py-3">
        <span className="font-sans text-sm font-semibold uppercase tracking-wide text-foreground">Net benefit</span>
        <span
          className={`font-sans tabular-nums text-lg font-bold ${net >= 0 ? "text-primary" : "text-destructive"}`}
        >
          {net < 0 ? "−" : ""}
          {formatCurrency(Math.abs(net), cur)}
        </span>
      </div>
    </section>
  )
}
