import type { ModelInputs, ScenarioKey } from "./types";

// All example values are ROUND, ILLUSTRATIVE numbers. They are NOT industry
// benchmarks and must be labelled as fictional examples in the UI.

export const fashionExample: ModelInputs = {
  name: "Meridian Apparel",
  vertical: "Fashion",
  evidenceLabel: "Illustrative example — not a benchmark",
  baseline: {
    currency: "EUR",
    analysisHorizonMonths: 24,
    eligibleMonthlySessions: 800_000,
    baselineConversionRate: 0.025,
    baselineAverageOrderValue: 90,
    baselineOrderReturnRate: 0.35,
    grossMarginRate: 0.6,
    contributionMarginRate: 0.45,
    reverseLogisticsCostPerReturn: 12,
    baselineMonthlyGrowthRate: 0.004,
  },
  reach: {
    maxTrafficCoverage: 0.6,
    initialTrafficCoverage: 0.1,
    adoptionCurveType: "logistic",
    adoptionStartMonth: 1,
    rampDurationMonths: 9,
    midpointMonth: 6,
    logisticGrowthRate: 0.6,
    manualAdoptionValues: [],
    validImpressionRate: 0.7,
    meaningfulEngagementRate: 0.25,
  },
  effects: {
    conversionInputMode: "relative",
    relativeConversionLift: 0.1,
    absoluteConversionRateChange: 0.0025,
    returnRateChangePP: 0.03,
    aovChangeRate: 0.03,
    confidenceAdjustment: 0.8,
    evidenceType: "external_benchmark",
  },
  costs: {
    implementationCost: 40_000,
    integrationCost: 15_000,
    trainingCost: 5_000,
    equipmentCost: 10_000,
    annualPlatformCost: 60_000,
    annualProductionCost: 48_000,
    annualStaffingCost: 60_000,
    annualAgencyCost: 0,
    annualOperatingCost: 12_000,
    incrementalMediaCost: 0,
    annualMaintenanceCost: 6_000,
    costInflationRate: 0.03,
    contractTermMonths: 24,
    residualExitCost: 0,
  },
  financial: {
    annualDiscountRate: 0.12,
    terminalValue: 0,
  },
};

export const beautyExample: ModelInputs = {
  name: "Lumière Beauty",
  vertical: "Beauty",
  evidenceLabel: "Illustrative example — not a benchmark",
  baseline: {
    currency: "EUR",
    analysisHorizonMonths: 24,
    eligibleMonthlySessions: 500_000,
    baselineConversionRate: 0.032,
    baselineAverageOrderValue: 55,
    baselineOrderReturnRate: 0.12,
    grossMarginRate: 0.7,
    contributionMarginRate: 0.55,
    reverseLogisticsCostPerReturn: 8,
    baselineMonthlyGrowthRate: 0.006,
  },
  reach: {
    maxTrafficCoverage: 0.7,
    initialTrafficCoverage: 0.15,
    adoptionCurveType: "logistic",
    adoptionStartMonth: 1,
    rampDurationMonths: 8,
    midpointMonth: 5,
    logisticGrowthRate: 0.7,
    manualAdoptionValues: [],
    validImpressionRate: 0.75,
    meaningfulEngagementRate: 0.3,
  },
  effects: {
    conversionInputMode: "relative",
    relativeConversionLift: 0.12,
    absoluteConversionRateChange: 0.0038,
    returnRateChangePP: 0.015,
    aovChangeRate: 0.04,
    confidenceAdjustment: 0.8,
    evidenceType: "external_benchmark",
  },
  costs: {
    implementationCost: 30_000,
    integrationCost: 12_000,
    trainingCost: 4_000,
    equipmentCost: 8_000,
    annualPlatformCost: 54_000,
    annualProductionCost: 60_000,
    annualStaffingCost: 72_000,
    annualAgencyCost: 0,
    annualOperatingCost: 10_000,
    incrementalMediaCost: 0,
    annualMaintenanceCost: 5_000,
    costInflationRate: 0.03,
    contractTermMonths: 24,
    residualExitCost: 0,
  },
  financial: {
    annualDiscountRate: 0.12,
    terminalValue: 0,
  },
};

export const electronicsExample: ModelInputs = {
  name: "Volt & Co.",
  vertical: "Electronics",
  evidenceLabel: "Illustrative example — not a benchmark",
  baseline: {
    currency: "EUR",
    analysisHorizonMonths: 24,
    eligibleMonthlySessions: 1_200_000,
    baselineConversionRate: 0.018,
    baselineAverageOrderValue: 240,
    baselineOrderReturnRate: 0.1,
    grossMarginRate: 0.25,
    contributionMarginRate: 0.18,
    reverseLogisticsCostPerReturn: 22,
    baselineMonthlyGrowthRate: 0.003,
  },
  reach: {
    maxTrafficCoverage: 0.5,
    initialTrafficCoverage: 0.08,
    adoptionCurveType: "logistic",
    adoptionStartMonth: 2,
    rampDurationMonths: 10,
    midpointMonth: 7,
    logisticGrowthRate: 0.5,
    manualAdoptionValues: [],
    validImpressionRate: 0.65,
    meaningfulEngagementRate: 0.2,
  },
  effects: {
    conversionInputMode: "relative",
    relativeConversionLift: 0.08,
    absoluteConversionRateChange: 0.0014,
    returnRateChangePP: 0.02,
    aovChangeRate: 0.02,
    confidenceAdjustment: 0.75,
    evidenceType: "external_benchmark",
  },
  costs: {
    implementationCost: 60_000,
    integrationCost: 25_000,
    trainingCost: 6_000,
    equipmentCost: 14_000,
    annualPlatformCost: 90_000,
    annualProductionCost: 72_000,
    annualStaffingCost: 84_000,
    annualAgencyCost: 0,
    annualOperatingCost: 18_000,
    incrementalMediaCost: 0,
    annualMaintenanceCost: 9_000,
    costInflationRate: 0.03,
    contractTermMonths: 24,
    residualExitCost: 0,
  },
  financial: {
    annualDiscountRate: 0.12,
    terminalValue: 0,
  },
};

export const examples: Record<string, ModelInputs> = {
  fashion: fashionExample,
  beauty: beautyExample,
  electronics: electronicsExample,
};

export const exampleList = [
  { key: "fashion", label: "Mid-sized fashion retailer", data: fashionExample },
  { key: "beauty", label: "Premium beauty retailer", data: beautyExample },
  { key: "electronics", label: "Consumer-electronics retailer", data: electronicsExample },
];

/**
 * Derive Conservative / Working / Strong scenarios from a working-case input.
 * Business baseline stays constant; only program reach, performance effects and
 * cost intensity differ. The middle case is "Working", never "Expected".
 */
export function scenarioInputs(base: ModelInputs, key: ScenarioKey): ModelInputs {
  const d: ModelInputs = structuredClone(base);
  if (key === "working") return d;

  if (key === "conservative") {
    d.effects.relativeConversionLift = base.effects.relativeConversionLift * 0.5;
    d.effects.absoluteConversionRateChange = base.effects.absoluteConversionRateChange * 0.5;
    d.effects.returnRateChangePP = base.effects.returnRateChangePP * 0.5;
    d.effects.aovChangeRate = 0;
    d.effects.confidenceAdjustment = Math.min(base.effects.confidenceAdjustment, 0.6);
    d.reach.maxTrafficCoverage = base.reach.maxTrafficCoverage * 0.8;
    d.reach.rampDurationMonths = base.reach.rampDurationMonths + 3;
    d.costs.annualProductionCost = base.costs.annualProductionCost * 1.15;
    d.costs.annualStaffingCost = base.costs.annualStaffingCost * 1.15;
    return d;
  }

  // strong
  d.effects.relativeConversionLift = base.effects.relativeConversionLift * 1.5;
  d.effects.absoluteConversionRateChange = base.effects.absoluteConversionRateChange * 1.5;
  d.effects.returnRateChangePP = base.effects.returnRateChangePP * 1.3;
  d.effects.aovChangeRate = base.effects.aovChangeRate + 0.02;
  d.effects.confidenceAdjustment = Math.min(base.effects.confidenceAdjustment + 0.1, 0.95);
  d.reach.maxTrafficCoverage = Math.min(base.reach.maxTrafficCoverage * 1.15, 1);
  d.reach.rampDurationMonths = Math.max(base.reach.rampDurationMonths - 3, 1);
  d.costs.annualProductionCost = base.costs.annualProductionCost * 0.9;
  return d;
}

export const scenarioMeta: { key: ScenarioKey; label: string; blurb: string }[] = [
  {
    key: "conservative",
    label: "Conservative",
    blurb: "Muted effect, slower rollout, higher operating cost.",
  },
  { key: "working", label: "Working case", blurb: "The values you entered. Not an expectation." },
  { key: "strong", label: "Strong", blurb: "Favourable effect, faster rollout, leaner cost." },
];
