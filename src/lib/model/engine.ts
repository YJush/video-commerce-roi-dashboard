import type { EngineResult, ModelInputs, MonthRow, ProgramReach } from "./types"

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/**
 * Adoption for month t as a fraction of eligible traffic included in the
 * operational rollout. This is coverage, NOT video watch-rate and NOT proof of
 * customer acceptance. Result is capped to [0, maxTrafficCoverage].
 */
export function adoptionAt(reach: ProgramReach, t: number): number {
  const {
    adoptionCurveType,
    maxTrafficCoverage: aMax,
    initialTrafficCoverage: a0,
    adoptionStartMonth,
    rampDurationMonths,
    midpointMonth,
    logisticGrowthRate: k,
    manualAdoptionValues,
  } = reach

  if (t < adoptionStartMonth) return 0

  switch (adoptionCurveType) {
    case "immediate":
      return aMax

    case "linear": {
      const progress = clamp((t - adoptionStartMonth) / Math.max(rampDurationMonths, 1e-9), 0, 1)
      return clamp(a0 + (aMax - a0) * progress, 0, aMax)
    }

    case "logistic": {
      // Normalized logistic: shift/scale the raw sigmoid so the curve starts at
      // a0 at adoptionStartMonth and asymptotes to aMax. We evaluate the raw
      // sigmoid at t and at the start month, then remap [L_start, 1] -> [a0, aMax].
      const raw = (x: number) => 1 / (1 + Math.exp(-k * (x - midpointMonth)))
      const lStart = raw(adoptionStartMonth)
      const lNow = raw(t)
      const denom = 1 - lStart
      const norm = denom <= 1e-9 ? 1 : (lNow - lStart) / denom
      return clamp(a0 + (aMax - a0) * clamp(norm, 0, 1), 0, aMax)
    }

    case "manual": {
      const idx = t
      const v = manualAdoptionValues[idx]
      if (v === undefined || Number.isNaN(v)) return 0 // missing months are NOT interpolated
      return clamp(v, 0, aMax)
    }

    default:
      return 0
  }
}

/** Resolve the margin rate used for benefit calculations. */
export function resolveMargin(inputs: ModelInputs): { rate: number; label: "contribution" | "gross" } {
  const c = inputs.baseline.contributionMarginRate
  if (c !== null && !Number.isNaN(c)) return { rate: c, label: "contribution" }
  return { rate: inputs.baseline.grossMarginRate, label: "gross" }
}

/**
 * Month-by-month engine. Never multiplies a mature monthly result by 12.
 * Returns one row per month across the analysis horizon.
 */
export function runEngine(inputs: ModelInputs): EngineResult {
  const { baseline, reach, effects, costs, financial } = inputs
  const T = Math.max(1, Math.round(baseline.analysisHorizonMonths))
  const { rate: marginRate, label: marginLabel } = resolveMargin(inputs)

  const monthlyDiscountRate = Math.pow(1 + financial.annualDiscountRate, 1 / 12) - 1

  // Recurring annual costs collapsed to a monthly figure (before inflation).
  const annualRecurring =
    costs.annualPlatformCost +
    costs.annualProductionCost +
    costs.annualStaffingCost +
    costs.annualAgencyCost +
    costs.annualOperatingCost +
    costs.incrementalMediaCost +
    costs.annualMaintenanceCost
  const baseMonthlyRecurring = annualRecurring / 12

  const oneTimeUpfront =
    costs.implementationCost + costs.integrationCost + costs.trainingCost + costs.equipmentCost

  const confidence = clamp(effects.confidenceAdjustment, 0, 1)
  const baselineCR = baseline.baselineConversionRate
  const baselineRR = baseline.baselineOrderReturnRate
  const treatmentAOV = baseline.baselineAverageOrderValue * (1 + effects.aovChangeRate)

  // Treatment conversion rate (population-level, applied to exposed sessions).
  let treatmentCR: number
  if (effects.conversionInputMode === "relative") {
    treatmentCR = baselineCR * (1 + effects.relativeConversionLift * confidence)
  } else {
    treatmentCR = baselineCR + effects.absoluteConversionRateChange * confidence
  }
  treatmentCR = clamp(treatmentCR, 0, 1)

  // Treatment return rate: baseline minus the modelled reduction (confidence-adjusted).
  const treatmentRR = clamp(baselineRR - effects.returnRateChangePP * confidence, 0, 1)

  const months: MonthRow[] = []
  let cumulative = 0
  let cumulativeDiscounted = 0

  for (let t = 0; t < T; t++) {
    const eligibleSessions = baseline.eligibleMonthlySessions * Math.pow(1 + baseline.baselineMonthlyGrowthRate, t)
    const adoption = adoptionAt(reach, t)
    const coveredSessions = eligibleSessions * adoption
    const exposedSessions = coveredSessions * reach.validImpressionRate

    const baselineCounterfactualOrders = exposedSessions * baselineCR
    const treatmentOrders = exposedSessions * treatmentCR
    const incrementalOrders = treatmentOrders - baselineCounterfactualOrders

    // Retained-order decomposition (prevents double counting).
    const baselineRetained = baselineCounterfactualOrders * (1 - baselineRR)
    const treatmentRetained = treatmentOrders * (1 - treatmentRR)
    const incrementalRetainedOrders = treatmentRetained - baselineRetained
    const incrementalRetainedRevenue = incrementalRetainedOrders * treatmentAOV
    const conversionContribution = incrementalRetainedRevenue * marginRate

    // Operational return savings: reverse-logistics ONLY, computed on the orders
    // that would have happened anyway (the counterfactual base). This isolates
    // the handling-cost saving from the merchandise margin already captured in
    // conversionContribution, so no benefit is counted twice.
    const returnsAvoidedOnBase = baselineCounterfactualOrders * Math.max(baselineRR - treatmentRR, 0)
    const operationalReturnSavings = returnsAvoidedOnBase * baseline.reverseLogisticsCostPerReturn

    const contributionBenefit = conversionContribution + operationalReturnSavings

    // Costs
    const inflationFactor = Math.pow(1 + costs.costInflationRate, Math.floor(t / 12))
    const recurringCost = t >= reach.adoptionStartMonth ? baseMonthlyRecurring * inflationFactor : 0
    let oneTimeCost = t === 0 ? oneTimeUpfront : 0
    if (t === T - 1) oneTimeCost += costs.residualExitCost

    const netCashFlow = contributionBenefit - recurringCost - oneTimeCost
    const discountFactor = 1 / Math.pow(1 + monthlyDiscountRate, t)
    const discountedCashFlow = netCashFlow * discountFactor

    cumulative += netCashFlow
    cumulativeDiscounted += discountedCashFlow

    months.push({
      month: t,
      eligibleSessions,
      adoption,
      coveredSessions,
      exposedSessions,
      baselineCounterfactualOrders,
      treatmentOrders,
      incrementalOrders,
      incrementalRetainedOrders,
      incrementalRetainedRevenue,
      conversionContribution,
      operationalReturnSavings,
      contributionBenefit,
      recurringCost,
      oneTimeCost,
      netCashFlow,
      discountFactor,
      discountedCashFlow,
      cumulativeCashFlow: cumulative,
      cumulativeDiscountedCashFlow: cumulativeDiscounted,
    })
  }

  const totalUndiscountedBenefit = sum(months, (m) => m.contributionBenefit)
  const totalRecurringCost = sum(months, (m) => m.recurringCost)
  const totalOneTimeCost = sum(months, (m) => m.oneTimeCost)
  const totalProgramCost = totalRecurringCost + totalOneTimeCost
  const npv = cumulativeDiscounted + financial.terminalValue

  const yearOneNetBenefit = sum(
    months.filter((m) => m.month < 12),
    (m) => m.netCashFlow,
  )
  const horizonNetBenefit = cumulative

  const simpleROI =
    totalProgramCost > 0 ? (totalUndiscountedBenefit - totalProgramCost) / totalProgramCost : null

  return {
    months,
    marginRateUsed: marginRate,
    marginLabel,
    yearOneNetBenefit,
    horizonNetBenefit,
    totalUndiscountedBenefit,
    totalProgramCost,
    totalOneTimeCost,
    totalRecurringCost,
    simpleROI,
    npv,
    paybackMonth: firstNonNegative(months, (m) => m.cumulativeCashFlow),
    discountedPaybackMonth: firstNonNegative(months, (m) => m.cumulativeDiscountedCashFlow),
    conversionContributionTotal: sum(months, (m) => m.conversionContribution),
    operationalSavingsTotal: sum(months, (m) => m.operationalReturnSavings),
  }
}

function sum<T>(arr: T[], f: (x: T) => number): number {
  return arr.reduce((acc, x) => acc + f(x), 0)
}

/** First month index where the cumulative series becomes non-negative, else null. */
function firstNonNegative(months: MonthRow[], f: (m: MonthRow) => number): number | null {
  for (const m of months) {
    if (f(m) >= 0) return m.month
  }
  return null
}
