import { runEngine } from "./engine"
import type { ModelInputs, SensitivityRow } from "./types"
import { formatPercent, formatCurrency } from "./format"

interface VarDef {
  key: string
  label: string
  low: number
  high: number
  format: (v: number, inputs: ModelInputs) => string
  apply: (d: ModelInputs, v: number) => void
  read: (inputs: ModelInputs) => number
}

/**
 * One-variable-at-a-time sensitivity. Each variable is swept between a
 * defensible low and high value while all others hold at the working case.
 * Rows are ranked by absolute NPV swing so the output feeds a real tornado
 * chart rather than a decorative one.
 */
export function computeSensitivity(inputs: ModelInputs): SensitivityRow[] {
  const cur = inputs.baseline.currency
  const pct = (v: number) => formatPercent(v)
  const money = (v: number) => formatCurrency(v, cur)

  const vars: VarDef[] = [
    {
      key: "lift",
      label: "Conversion lift",
      low: Math.max(inputs.effects.relativeConversionLift * 0.5, 0),
      high: inputs.effects.relativeConversionLift * 1.5,
      format: pct,
      read: (i) => i.effects.relativeConversionLift,
      apply: (d, v) => {
        d.effects.conversionInputMode = "relative"
        d.effects.relativeConversionLift = v
      },
    },
    {
      key: "maxCoverage",
      label: "Maximum adoption",
      low: inputs.reach.maxTrafficCoverage * 0.5,
      high: Math.min(inputs.reach.maxTrafficCoverage * 1.5, 1),
      format: pct,
      read: (i) => i.reach.maxTrafficCoverage,
      apply: (d, v) => {
        d.reach.maxTrafficCoverage = v
      },
    },
    {
      key: "ramp",
      label: "Rollout speed (ramp months)",
      low: Math.max(inputs.reach.rampDurationMonths - 3, 1),
      high: inputs.reach.rampDurationMonths + 6,
      format: (v) => `${Math.round(v)} mo`,
      read: (i) => i.reach.rampDurationMonths,
      apply: (d, v) => {
        d.reach.rampDurationMonths = v
      },
    },
    {
      key: "returnChange",
      label: "Return-rate change",
      low: Math.max(inputs.effects.returnRateChangePP * 0.5, 0),
      high: inputs.effects.returnRateChangePP * 1.5,
      format: (v) => `${(v * 100).toFixed(1)} pp`,
      read: (i) => i.effects.returnRateChangePP,
      apply: (d, v) => {
        d.effects.returnRateChangePP = v
      },
    },
    {
      key: "aov",
      label: "AOV change",
      low: inputs.effects.aovChangeRate - 0.05,
      high: inputs.effects.aovChangeRate + 0.05,
      format: pct,
      read: (i) => i.effects.aovChangeRate,
      apply: (d, v) => {
        d.effects.aovChangeRate = v
      },
    },
    {
      key: "margin",
      label: "Gross / contribution margin",
      low: Math.max(marginOf(inputs) - 0.1, 0),
      high: Math.min(marginOf(inputs) + 0.1, 1),
      format: pct,
      read: marginOf,
      apply: (d, v) => {
        if (d.baseline.contributionMarginRate !== null) d.baseline.contributionMarginRate = v
        else d.baseline.grossMarginRate = v
      },
    },
    {
      key: "platform",
      label: "Platform cost",
      low: inputs.costs.annualPlatformCost * 0.7,
      high: inputs.costs.annualPlatformCost * 1.3,
      format: money,
      read: (i) => i.costs.annualPlatformCost,
      apply: (d, v) => {
        d.costs.annualPlatformCost = v
      },
    },
    {
      key: "prodStaff",
      label: "Production + staffing cost",
      low: (inputs.costs.annualProductionCost + inputs.costs.annualStaffingCost) * 0.7,
      high: (inputs.costs.annualProductionCost + inputs.costs.annualStaffingCost) * 1.3,
      format: money,
      read: (i) => i.costs.annualProductionCost + i.costs.annualStaffingCost,
      apply: (d, v) => {
        const base = inputs.costs.annualProductionCost + inputs.costs.annualStaffingCost
        const scale = base > 0 ? v / base : 1
        d.costs.annualProductionCost = inputs.costs.annualProductionCost * scale
        d.costs.annualStaffingCost = inputs.costs.annualStaffingCost * scale
      },
    },
    {
      key: "discount",
      label: "Discount rate",
      low: Math.max(inputs.financial.annualDiscountRate - 0.05, 0),
      high: inputs.financial.annualDiscountRate + 0.05,
      format: pct,
      read: (i) => i.financial.annualDiscountRate,
      apply: (d, v) => {
        d.financial.annualDiscountRate = v
      },
    },
  ]

  const rows: SensitivityRow[] = vars.map((v) => {
    const lowInputs = structuredClone(inputs)
    v.apply(lowInputs, v.low)
    const highInputs = structuredClone(inputs)
    v.apply(highInputs, v.high)
    const lowNpv = runEngine(lowInputs).npv
    const highNpv = runEngine(highInputs).npv
    return {
      key: v.key,
      label: v.label,
      baselineValue: v.format(v.read(inputs), inputs),
      lowValue: v.format(v.low, inputs),
      highValue: v.format(v.high, inputs),
      lowNpv,
      highNpv,
      swing: Math.abs(highNpv - lowNpv),
    }
  })

  return rows.sort((a, b) => b.swing - a.swing)
}

function marginOf(inputs: ModelInputs): number {
  return inputs.baseline.contributionMarginRate ?? inputs.baseline.grossMarginRate
}
