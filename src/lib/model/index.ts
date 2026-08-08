import { computeBreakEven } from "./breakeven"
import { runEngine } from "./engine"
import { scenarioInputs, scenarioMeta } from "./examples"
import type { ModelInputs, ScenarioResult } from "./types"

export * from "./types"
export * from "./engine"
export * from "./breakeven"
export * from "./sensitivity"
export * from "./examples"
export * from "./pilot"
export * from "./validate"
export * from "./format"

/** Compute all three scenarios (conservative / working / strong) at once. */
export function buildScenarios(base: ModelInputs): ScenarioResult[] {
  return scenarioMeta.map(({ key, label }) => {
    const inputs = scenarioInputs(base, key)
    return {
      key,
      label,
      inputs,
      engine: runEngine(inputs),
      breakEven: computeBreakEven(inputs),
    }
  })
}
