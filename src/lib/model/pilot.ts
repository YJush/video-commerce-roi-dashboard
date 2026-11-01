// Pilot-evaluation mode: uses ACTUAL control/treatment data, not assumed lift.

export type AllocationMethod = "randomized" | "matched" | "viewer_vs_nonviewer" | "pre_post";

export interface PilotInputs {
  currency: string;
  controlSessions: number;
  treatmentSessions: number;
  controlOrders: number;
  treatmentOrders: number;
  controlRevenue: number;
  treatmentRevenue: number;
  controlReturns: number; // returned ORDERS
  treatmentReturns: number;
  pilotProgramCost: number;
  grossMarginRate: number;
  allocationMethod: AllocationMethod;
}

export type PilotRecommendation = "scale" | "continue" | "revise" | "stop";

export interface PilotResult {
  controlConversion: number | null;
  treatmentConversion: number | null;
  absoluteDifference: number | null;
  relativeLift: number | null;
  ciLow: number | null; // 95% CI for the conversion-rate difference
  ciHigh: number | null;
  zScore: number | null;
  significant: boolean;
  incrementalOrders: number | null;
  controlAov: number | null;
  treatmentAov: number | null;
  controlReturnRate: number | null;
  treatmentReturnRate: number | null;
  returnRateDifference: number | null;
  incrementalContribution: number | null;
  costPerIncrementalOrder: number | null;
  netPilotValue: number | null;
  causalWarning: boolean;
  recommendation: PilotRecommendation;
  notCalculable: string[];
}

const safeDiv = (a: number, b: number): number | null => (b > 0 ? a / b : null);

export function evaluatePilot(p: PilotInputs): PilotResult {
  const notCalculable: string[] = [];

  const controlConversion = safeDiv(p.controlOrders, p.controlSessions);
  const treatmentConversion = safeDiv(p.treatmentOrders, p.treatmentSessions);
  if (controlConversion === null) notCalculable.push("Control conversion (no control sessions)");
  if (treatmentConversion === null)
    notCalculable.push("Treatment conversion (no treatment sessions)");

  let absoluteDifference: number | null = null;
  let relativeLift: number | null = null;
  let zScore: number | null = null;
  let ciLow: number | null = null;
  let ciHigh: number | null = null;
  let significant = false;

  if (controlConversion !== null && treatmentConversion !== null) {
    absoluteDifference = treatmentConversion - controlConversion;
    relativeLift = controlConversion > 0 ? absoluteDifference / controlConversion : null;

    // Two-proportion z-test (unpooled SE for the CI, pooled for the test stat).
    const p1 = treatmentConversion;
    const p2 = controlConversion;
    const n1 = p.treatmentSessions;
    const n2 = p.controlSessions;
    const pooled = (p.treatmentOrders + p.controlOrders) / (n1 + n2);
    const sePooled = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
    zScore = sePooled > 0 ? absoluteDifference / sePooled : null;
    const seUnpooled = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
    ciLow = absoluteDifference - 1.96 * seUnpooled;
    ciHigh = absoluteDifference + 1.96 * seUnpooled;
    significant = zScore !== null && Math.abs(zScore) >= 1.96;
  }

  const incrementalOrders =
    treatmentConversion !== null && controlConversion !== null
      ? (treatmentConversion - controlConversion) * p.treatmentSessions
      : null;

  const controlAov = safeDiv(p.controlRevenue, p.controlOrders);
  const treatmentAov = safeDiv(p.treatmentRevenue, p.treatmentOrders);
  const controlReturnRate = safeDiv(p.controlReturns, p.controlOrders);
  const treatmentReturnRate = safeDiv(p.treatmentReturns, p.treatmentOrders);
  const returnRateDifference =
    controlReturnRate !== null && treatmentReturnRate !== null
      ? controlReturnRate - treatmentReturnRate
      : null;

  // Incremental contribution: retained incremental orders x treatment AOV x margin.
  let incrementalContribution: number | null = null;
  if (incrementalOrders !== null && treatmentAov !== null && treatmentReturnRate !== null) {
    const retained = incrementalOrders * (1 - treatmentReturnRate);
    incrementalContribution = retained * treatmentAov * p.grossMarginRate;
  }

  const costPerIncrementalOrder =
    incrementalOrders !== null && incrementalOrders > 0
      ? p.pilotProgramCost / incrementalOrders
      : null;
  const netPilotValue =
    incrementalContribution !== null ? incrementalContribution - p.pilotProgramCost : null;

  const causalWarning =
    p.allocationMethod === "viewer_vs_nonviewer" || p.allocationMethod === "pre_post";

  // Recommendation logic: evidence-driven, but the human still chooses.
  let recommendation: PilotRecommendation = "revise";
  if (!significant) {
    recommendation = incrementalOrders !== null && incrementalOrders > 0 ? "continue" : "stop";
  } else if (netPilotValue !== null && netPilotValue > 0 && !causalWarning) {
    recommendation = "scale";
  } else if (netPilotValue !== null && netPilotValue <= 0) {
    recommendation = "revise";
  } else if (causalWarning) {
    recommendation = "continue";
  }

  return {
    controlConversion,
    treatmentConversion,
    absoluteDifference,
    relativeLift,
    ciLow,
    ciHigh,
    zScore,
    significant,
    incrementalOrders,
    controlAov,
    treatmentAov,
    controlReturnRate,
    treatmentReturnRate,
    returnRateDifference,
    incrementalContribution,
    costPerIncrementalOrder,
    netPilotValue,
    causalWarning,
    recommendation,
    notCalculable,
  };
}
