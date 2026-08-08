// Video-Commerce Business Case Dashboard — data model
//
// All rates are stored as fractions (0.02 === 2%). Percentage-point inputs are
// also stored as fractions (0.002 === 0.2 percentage points). Currency amounts
// are in the model currency. Every field is labelled as a user input, sourced
// reference, or modelling assumption in the UI — not in the type itself.

export type ConversionInputMode = "relative" | "absolute"

export type AdoptionCurveType = "immediate" | "linear" | "logistic" | "manual"

export type EvidenceType =
  | "company_historical"
  | "randomized_experiment"
  | "matched_comparison"
  | "observational_case_study"
  | "external_benchmark"
  | "internal_assumption"
  | "illustrative_example"

export interface BusinessBaseline {
  currency: string
  analysisHorizonMonths: number
  eligibleMonthlySessions: number
  baselineConversionRate: number // fraction of sessions that convert
  baselineAverageOrderValue: number
  baselineOrderReturnRate: number // fraction of ORDERS returned
  grossMarginRate: number // fraction
  contributionMarginRate: number | null // fraction; null => use gross margin
  reverseLogisticsCostPerReturn: number
  baselineMonthlyGrowthRate: number // fraction, session growth per month
}

export interface ProgramReach {
  maxTrafficCoverage: number // A_max, fraction of eligible traffic in rollout
  initialTrafficCoverage: number // A_0
  adoptionCurveType: AdoptionCurveType
  adoptionStartMonth: number
  rampDurationMonths: number
  midpointMonth: number
  logisticGrowthRate: number // k
  manualAdoptionValues: number[] // fractions, per month
  validImpressionRate: number // fraction of covered sessions with a valid impression
  meaningfulEngagementRate: number // DIAGNOSTIC ONLY
}

export interface PerformanceEffects {
  conversionInputMode: ConversionInputMode
  relativeConversionLift: number // fraction, e.g. 0.10 = +10%
  absoluteConversionRateChange: number // fraction (percentage points), e.g. 0.002
  returnRateChangePP: number // fraction (percentage points) REDUCTION in return rate
  aovChangeRate: number // fraction change to AOV
  confidenceAdjustment: number // 0..1 haircut applied to modelled effect
  evidenceType: EvidenceType
}

export interface ProgramCosts {
  implementationCost: number // one-time
  integrationCost: number // one-time
  trainingCost: number // one-time
  equipmentCost: number // one-time
  annualPlatformCost: number
  annualProductionCost: number
  annualStaffingCost: number
  annualAgencyCost: number
  annualOperatingCost: number
  incrementalMediaCost: number // annual
  annualMaintenanceCost: number
  costInflationRate: number // fraction per year
  contractTermMonths: number
  residualExitCost: number // one-time at horizon end
}

export interface FinancialAssumptions {
  annualDiscountRate: number // fraction
  terminalValue: number // default 0
}

export interface ModelInputs {
  name: string
  vertical: string
  evidenceLabel: string
  baseline: BusinessBaseline
  reach: ProgramReach
  effects: PerformanceEffects
  costs: ProgramCosts
  financial: FinancialAssumptions
}

// A single month of the calculation engine.
export interface MonthRow {
  month: number
  eligibleSessions: number
  adoption: number
  coveredSessions: number
  exposedSessions: number
  baselineCounterfactualOrders: number
  treatmentOrders: number
  incrementalOrders: number
  incrementalRetainedOrders: number
  incrementalRetainedRevenue: number
  conversionContribution: number // margin on incremental retained revenue
  operationalReturnSavings: number // reverse-logistics only, no margin
  contributionBenefit: number
  recurringCost: number
  oneTimeCost: number
  netCashFlow: number
  discountFactor: number
  discountedCashFlow: number
  cumulativeCashFlow: number
  cumulativeDiscountedCashFlow: number
}

export interface EngineResult {
  months: MonthRow[]
  marginRateUsed: number
  marginLabel: "contribution" | "gross"
  // headline figures
  yearOneNetBenefit: number
  horizonNetBenefit: number
  totalUndiscountedBenefit: number
  totalProgramCost: number
  totalOneTimeCost: number
  totalRecurringCost: number
  simpleROI: number | null // null when denominator invalid
  npv: number
  paybackMonth: number | null
  discountedPaybackMonth: number | null
  // value decomposition (horizon totals)
  conversionContributionTotal: number
  operationalSavingsTotal: number
}

export interface BreakEvenResult {
  requiredRelativeLift: number | null
  requiredAbsoluteChange: number | null
  requiredMaxCoverage: number | null
  requiredMonthlyBenefit: number | null
  maxSupportableProgramCost: number | null
  requiredIncrementalRetainedOrders: number | null
  feasibleLift: boolean
  feasibleCoverage: boolean
}

export interface SensitivityRow {
  key: string
  label: string
  baselineValue: string
  lowValue: string
  highValue: string
  lowNpv: number
  highNpv: number
  swing: number
}

export type ScenarioKey = "conservative" | "working" | "strong"

export interface ScenarioResult {
  key: ScenarioKey
  label: string
  inputs: ModelInputs
  engine: EngineResult
  breakEven: BreakEvenResult
}

export interface ValidationIssue {
  level: "error" | "warning"
  field: string
  message: string
}
