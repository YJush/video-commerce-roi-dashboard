import type { ModelInputs, ValidationIssue } from "./types"

const isPct = (v: number) => v >= 0 && v <= 1

/** Validation and warning rules from the specification. */
export function validateInputs(i: ModelInputs): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const err = (field: string, message: string) => issues.push({ level: "error", field, message })
  const warn = (field: string, message: string) => issues.push({ level: "warning", field, message })

  const b = i.baseline
  const r = i.reach
  const e = i.effects
  const f = i.financial

  if (b.eligibleMonthlySessions < 0) err("eligibleMonthlySessions", "Eligible sessions cannot be negative.")
  if (!isPct(b.baselineConversionRate)) err("baselineConversionRate", "Conversion rate must be between 0% and 100%.")
  if (!isPct(b.baselineOrderReturnRate)) err("baselineOrderReturnRate", "Return rate must be between 0% and 100%.")
  if (!isPct(b.grossMarginRate)) err("grossMarginRate", "Gross margin must be between 0% and 100%.")
  if (b.contributionMarginRate !== null && !isPct(b.contributionMarginRate))
    err("contributionMarginRate", "Contribution margin must be between 0% and 100%.")
  if (b.baselineAverageOrderValue < 0) err("baselineAverageOrderValue", "AOV cannot be negative.")
  if (b.analysisHorizonMonths < r.adoptionStartMonth + 1)
    warn("analysisHorizonMonths", "Analysis horizon is shorter than the implementation/adoption start.")

  if (!isPct(r.maxTrafficCoverage)) err("maxTrafficCoverage", "Maximum coverage must be between 0% and 100%.")
  if (r.initialTrafficCoverage > r.maxTrafficCoverage)
    warn("initialTrafficCoverage", "Initial coverage exceeds maximum coverage; it will be capped.")
  if (!isPct(r.validImpressionRate)) err("validImpressionRate", "Valid impression rate must be between 0% and 100%.")
  if (r.adoptionCurveType === "manual") {
    r.manualAdoptionValues.forEach((v, idx) => {
      if (v !== undefined && !isPct(v)) err("manualAdoptionValues", `Month ${idx + 1} coverage must be 0–100%.`)
      if (v !== undefined && v > r.maxTrafficCoverage)
        warn("manualAdoptionValues", `Month ${idx + 1} coverage exceeds maximum coverage.`)
    })
  }

  // Treatment conversion sanity.
  const treatmentCR =
    e.conversionInputMode === "relative"
      ? b.baselineConversionRate * (1 + e.relativeConversionLift)
      : b.baselineConversionRate + e.absoluteConversionRateChange
  if (treatmentCR > 1) err("relativeConversionLift", "Treatment conversion exceeds 100%.")
  if (treatmentCR < 0) err("relativeConversionLift", "Treatment conversion falls below 0%.")

  if (e.returnRateChangePP > b.baselineOrderReturnRate)
    warn("returnRateChangePP", "Return-rate reduction exceeds the baseline return rate; treatment return rate is floored at 0%.")
  if (e.returnRateChangePP < 0)
    warn("returnRateChangePP", "A negative return-rate change means video increases returns.")

  if (!isPct(e.confidenceAdjustment)) err("confidenceAdjustment", "Confidence adjustment must be between 0 and 1.")
  if (e.evidenceType === "observational_case_study" || e.evidenceType === "external_benchmark")
    warn("evidenceType", "Effect is based on observational or external evidence — treat as indicative, not proven incrementality.")
  if (e.evidenceType === "illustrative_example")
    warn("evidenceType", "This is an illustrative example, not company data or a benchmark.")

  if (f.annualDiscountRate <= -1) err("annualDiscountRate", "Discount rate must be greater than −100%.")
  if (f.terminalValue !== 0) warn("terminalValue", "A non-zero terminal value can dominate NPV — confirm it is defensible.")

  const totalProgramCost =
    i.costs.implementationCost + i.costs.integrationCost + i.costs.annualPlatformCost
  if (totalProgramCost <= 0)
    warn("cost", "Total program cost is zero — ROI and payback are undefined without costs.")

  return issues
}
