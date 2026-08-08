import { runEngine } from "./engine"
import type { BreakEvenResult, ModelInputs } from "./types"

/**
 * NPV is linear in the relative lift, the absolute conversion change, and in a
 * uniform scaling of adoption coverage (benefits scale linearly; costs are
 * fixed). We therefore recover the linear coefficients by evaluating NPV at two
 * points and solving analytically. This is exact for these variables and avoids
 * iterative root-finding.
 */
function npvWith(inputs: ModelInputs, mutate: (draft: ModelInputs) => void): number {
  const draft: ModelInputs = structuredClone(inputs)
  mutate(draft)
  return runEngine(draft).npv
}

/** Solve a + b*x = 0 given NPV at x=x0 and x=x1. Returns null if flat. */
function solveLinear(npv0: number, x0: number, npv1: number, x1: number): number | null {
  const b = (npv1 - npv0) / (x1 - x0)
  if (Math.abs(b) < 1e-9) return null
  const a = npv0 - b * x0
  return -a / b
}

export function computeBreakEven(inputs: ModelInputs): BreakEvenResult {
  const engine = runEngine(inputs)

  // Required relative lift (hold everything else constant).
  const relLo = npvWith(inputs, (d) => {
    d.effects.conversionInputMode = "relative"
    d.effects.relativeConversionLift = 0
  })
  const relHi = npvWith(inputs, (d) => {
    d.effects.conversionInputMode = "relative"
    d.effects.relativeConversionLift = 1
  })
  const requiredRelativeLift = solveLinear(relLo, 0, relHi, 1)

  // Required absolute percentage-point change.
  const absLo = npvWith(inputs, (d) => {
    d.effects.conversionInputMode = "absolute"
    d.effects.absoluteConversionRateChange = 0
  })
  const absHi = npvWith(inputs, (d) => {
    d.effects.conversionInputMode = "absolute"
    d.effects.absoluteConversionRateChange = 0.01
  })
  const requiredAbsoluteChange = solveLinear(absLo, 0, absHi, 0.01)

  // Required maximum coverage (scale adoption curve). Solve for A_max.
  const baseMax = inputs.reach.maxTrafficCoverage
  const covLo = npvWith(inputs, (d) => {
    d.reach.maxTrafficCoverage = 0
    d.reach.initialTrafficCoverage = 0
  })
  const covHi = npvWith(inputs, (d) => {
    d.reach.maxTrafficCoverage = 1
    d.reach.initialTrafficCoverage = Math.min(d.reach.initialTrafficCoverage / Math.max(baseMax, 1e-9), 1)
  })
  const requiredMaxCoverage = solveLinear(covLo, 0, covHi, 1)

  // Required additional retained orders across the horizon and equivalent
  // required monthly benefit, derived from the fixed program cost.
  const marginRate = engine.marginRateUsed
  const treatmentAOV =
    inputs.baseline.baselineAverageOrderValue * (1 + inputs.effects.aovChangeRate)
  const valuePerRetainedOrder = treatmentAOV * marginRate
  const requiredIncrementalRetainedOrders =
    valuePerRetainedOrder > 0 ? engine.totalProgramCost / valuePerRetainedOrder : null

  const requiredMonthlyBenefit =
    engine.totalProgramCost / Math.max(inputs.baseline.analysisHorizonMonths, 1)

  const feasibleLift =
    requiredRelativeLift !== null && requiredRelativeLift >= 0 && requiredRelativeLift <= 3
  // Coverage is only feasible if the required A_max stays within [0,1].
  const feasibleCoverage =
    requiredMaxCoverage !== null && requiredMaxCoverage >= 0 && requiredMaxCoverage <= 1

  return {
    requiredRelativeLift,
    requiredAbsoluteChange,
    requiredMaxCoverage,
    requiredMonthlyBenefit,
    maxSupportableProgramCost: engine.totalUndiscountedBenefit,
    requiredIncrementalRetainedOrders,
    feasibleLift,
    feasibleCoverage,
  }
}
