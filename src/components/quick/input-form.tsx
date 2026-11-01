import { NumberField, PercentField } from "@/components/fields";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdoptionCurveType,
  ConversionInputMode,
  EvidenceType,
  ModelInputs,
} from "@/lib/model/types";

type Updater = (fn: (draft: ModelInputs) => void) => void;

export function InputForm({ inputs, update }: { inputs: ModelInputs; update: Updater }) {
  const b = inputs.baseline;
  const r = inputs.reach;
  const e = inputs.effects;
  const c = inputs.costs;
  const f = inputs.financial;

  return (
    <Accordion type="multiple" defaultValue={["baseline", "reach", "effects"]} className="w-full">
      {/* Business baseline */}
      <AccordionItem value="baseline">
        <AccordionTrigger className="font-sans text-sm font-semibold uppercase tracking-wide">
          Business baseline
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="font-sans text-[0.8rem] font-medium">Currency</Label>
              <Select
                value={b.currency}
                onValueChange={(v) => update((d) => void (d.baseline.currency = v))}
              >
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["EUR", "USD", "GBP", "SEK"].map((cur) => (
                    <SelectItem key={cur} value={cur}>
                      {cur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <NumberField
              id="horizon"
              label="Analysis horizon"
              suffix="months"
              value={b.analysisHorizonMonths}
              min={1}
              onChange={(v) => update((d) => void (d.baseline.analysisHorizonMonths = v))}
              hint="Number of months modelled. Should be at least as long as the implementation period."
              kind="input"
            />
            <NumberField
              id="sessions"
              label="Eligible monthly sessions"
              value={b.eligibleMonthlySessions}
              min={0}
              onChange={(v) => update((d) => void (d.baseline.eligibleMonthlySessions = v))}
              hint="Sessions on pages where video could realistically be shown — not total site traffic."
              kind="input"
            />
            <PercentField
              id="cr"
              label="Current conversion rate"
              value={b.baselineConversionRate}
              step={0.01}
              onChange={(v) => update((d) => void (d.baseline.baselineConversionRate = v))}
              hint="Share of eligible sessions that currently lead to a purchase (session-based)."
              kind="input"
            />
            <NumberField
              id="aov"
              label="Average order value"
              suffix={b.currency}
              value={b.baselineAverageOrderValue}
              min={0}
              onChange={(v) => update((d) => void (d.baseline.baselineAverageOrderValue = v))}
              hint="Average revenue per order on the eligible pages."
              kind="input"
            />
            <PercentField
              id="returnrate"
              label="Order return rate"
              value={b.baselineOrderReturnRate}
              onChange={(v) => update((d) => void (d.baseline.baselineOrderReturnRate = v))}
              hint="Percentage of ORDERS returned (not units). Version one is order-based."
              kind="input"
            />
            <PercentField
              id="grossmargin"
              label="Gross margin"
              value={b.grossMarginRate}
              onChange={(v) => update((d) => void (d.baseline.grossMarginRate = v))}
              hint="Share of revenue left after cost of goods. Revenue is not profit."
              kind="input"
            />
            <PercentField
              id="contribmargin"
              label="Contribution margin"
              value={b.contributionMarginRate ?? 0}
              onChange={(v) => update((d) => void (d.baseline.contributionMarginRate = v))}
              hint="Margin after variable costs (fulfilment, payment). Used in place of gross margin when set."
              kind="assumption"
            />
            <NumberField
              id="revlog"
              label="Reverse-logistics cost / return"
              suffix={b.currency}
              value={b.reverseLogisticsCostPerReturn}
              min={0}
              onChange={(v) => update((d) => void (d.baseline.reverseLogisticsCostPerReturn = v))}
              hint="Shipping, inspection, repackaging, handling, markdown. Enter 0 if unknown."
              kind="input"
            />
            <PercentField
              id="growth"
              label="Monthly session growth"
              value={b.baselineMonthlyGrowthRate}
              step={0.1}
              onChange={(v) => update((d) => void (d.baseline.baselineMonthlyGrowthRate = v))}
              hint="Organic month-over-month growth in eligible sessions."
              kind="assumption"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Program reach & adoption */}
      <AccordionItem value="reach">
        <AccordionTrigger className="font-sans text-sm font-semibold uppercase tracking-wide">
          Program reach &amp; adoption
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="font-sans text-[0.8rem] font-medium">Adoption curve</Label>
              <Select
                value={r.adoptionCurveType}
                onValueChange={(v) =>
                  update((d) => void (d.reach.adoptionCurveType = v as AdoptionCurveType))
                }
              >
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="linear">Linear ramp</SelectItem>
                  <SelectItem value="logistic">Logistic S-curve</SelectItem>
                  <SelectItem value="manual">Manual monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <PercentField
              id="maxcov"
              label="Maximum traffic coverage"
              value={r.maxTrafficCoverage}
              onChange={(v) => update((d) => void (d.reach.maxTrafficCoverage = v))}
              hint="Ceiling on the share of eligible traffic included in the rollout (A_max)."
              kind="assumption"
            />
            <PercentField
              id="initcov"
              label="Initial traffic coverage"
              value={r.initialTrafficCoverage}
              onChange={(v) => update((d) => void (d.reach.initialTrafficCoverage = v))}
              hint="Coverage at launch (A_0)."
              kind="assumption"
            />
            <NumberField
              id="startmonth"
              label="Adoption start month"
              value={r.adoptionStartMonth}
              min={0}
              onChange={(v) => update((d) => void (d.reach.adoptionStartMonth = v))}
              hint="First month the program is live to selected traffic."
              kind="input"
            />
            <NumberField
              id="ramp"
              label="Ramp duration"
              suffix="months"
              value={r.rampDurationMonths}
              min={1}
              onChange={(v) => update((d) => void (d.reach.rampDurationMonths = v))}
              hint="Months to reach maximum coverage (linear ramp)."
              kind="assumption"
            />
            <NumberField
              id="midpoint"
              label="Logistic midpoint month"
              value={r.midpointMonth}
              min={0}
              onChange={(v) => update((d) => void (d.reach.midpointMonth = v))}
              hint="Month of steepest adoption growth (logistic curve)."
              kind="assumption"
            />
            <PercentField
              id="impression"
              label="Valid impression rate"
              value={r.validImpressionRate}
              onChange={(v) => update((d) => void (d.reach.validImpressionRate = v))}
              hint="Share of covered sessions that actually receive a valid video impression."
              kind="assumption"
            />
            <PercentField
              id="engagement"
              label="Meaningful engagement rate"
              value={r.meaningfulEngagementRate}
              onChange={(v) => update((d) => void (d.reach.meaningfulEngagementRate = v))}
              hint="Diagnostic only. Not used to scale a population-level treatment effect (avoids selection bias)."
              kind="assumption"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Performance effects */}
      <AccordionItem value="effects">
        <AccordionTrigger className="font-sans text-sm font-semibold uppercase tracking-wide">
          Performance effects
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="font-sans text-[0.8rem] font-medium">Conversion input mode</Label>
              <Select
                value={e.conversionInputMode}
                onValueChange={(v) =>
                  update((d) => void (d.effects.conversionInputMode = v as ConversionInputMode))
                }
              >
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relative">Relative lift (%)</SelectItem>
                  <SelectItem value="absolute">Percentage-point change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {e.conversionInputMode === "relative" ? (
              <PercentField
                id="lift"
                label="Relative conversion lift"
                value={e.relativeConversionLift}
                onChange={(v) => update((d) => void (d.effects.relativeConversionLift = v))}
                hint="A +10% lift raises a 2.0% conversion rate to 2.2% — not to 12%."
                kind="assumption"
              />
            ) : (
              <PercentField
                id="abschange"
                label="Percentage-point change"
                value={e.absoluteConversionRateChange}
                points
                step={0.01}
                onChange={(v) => update((d) => void (d.effects.absoluteConversionRateChange = v))}
                hint="A +0.2pp change raises a 2.0% conversion rate to 2.2%."
                kind="assumption"
              />
            )}
            <PercentField
              id="returnchange"
              label="Return-rate reduction"
              value={e.returnRateChangePP}
              points
              onChange={(v) => update((d) => void (d.effects.returnRateChangePP = v))}
              hint="Percentage-point reduction in return rate, e.g. 30% to 27% is 3pp."
              kind="assumption"
            />
            <PercentField
              id="aovchange"
              label="AOV change"
              value={e.aovChangeRate}
              onChange={(v) => update((d) => void (d.effects.aovChangeRate = v))}
              hint="Relative change to average order value under treatment."
              kind="assumption"
            />
            <PercentField
              id="confidence"
              label="Confidence adjustment"
              value={e.confidenceAdjustment}
              onChange={(v) => update((d) => void (d.effects.confidenceAdjustment = v))}
              hint="Haircut applied to the modelled effect to reflect evidence quality (0–100%)."
              kind="assumption"
            />
            <div className="flex flex-col gap-1.5">
              <Label className="font-sans text-[0.8rem] font-medium">Evidence type</Label>
              <Select
                value={e.evidenceType}
                onValueChange={(v) =>
                  update((d) => void (d.effects.evidenceType = v as EvidenceType))
                }
              >
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_historical">Company historical data</SelectItem>
                  <SelectItem value="randomized_experiment">Randomized experiment</SelectItem>
                  <SelectItem value="matched_comparison">Matched comparison</SelectItem>
                  <SelectItem value="observational_case_study">Observational case study</SelectItem>
                  <SelectItem value="external_benchmark">External benchmark</SelectItem>
                  <SelectItem value="internal_assumption">Internal assumption</SelectItem>
                  <SelectItem value="illustrative_example">Illustrative example</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Costs */}
      <AccordionItem value="costs">
        <AccordionTrigger className="font-sans text-sm font-semibold uppercase tracking-wide">
          Program costs
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(
              [
                ["implementationCost", "Implementation (one-time)"],
                ["integrationCost", "Integration (one-time)"],
                ["trainingCost", "Training (one-time)"],
                ["equipmentCost", "Equipment (one-time)"],
                ["annualPlatformCost", "Platform / licence (annual)"],
                ["annualProductionCost", "Video production (annual)"],
                ["annualStaffingCost", "Staffing / presenter (annual)"],
                ["annualAgencyCost", "Agency (annual)"],
                ["annualOperatingCost", "Operating / campaign (annual)"],
                ["incrementalMediaCost", "Incremental media (annual)"],
                ["annualMaintenanceCost", "Maintenance (annual)"],
                ["residualExitCost", "Residual / exit (one-time)"],
              ] as const
            ).map(([key, label]) => (
              <NumberField
                key={key}
                id={key}
                label={label}
                suffix={b.currency}
                min={0}
                value={c[key]}
                onChange={(v) => update((d) => void ((d.costs[key] as number) = v))}
              />
            ))}
            <PercentField
              id="inflation"
              label="Cost inflation (annual)"
              value={c.costInflationRate}
              onChange={(v) => update((d) => void (d.costs.costInflationRate = v))}
              hint="Applied to recurring costs each year."
              kind="assumption"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Financial */}
      <AccordionItem value="financial">
        <AccordionTrigger className="font-sans text-sm font-semibold uppercase tracking-wide">
          Financial assumptions
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PercentField
              id="discount"
              label="Annual discount rate"
              value={f.annualDiscountRate}
              onChange={(v) => update((d) => void (d.financial.annualDiscountRate = v))}
              hint="Used to discount future cash flows to present value."
              kind="assumption"
            />
            <NumberField
              id="terminal"
              label="Terminal value"
              suffix={b.currency}
              value={f.terminalValue}
              onChange={(v) => update((d) => void (d.financial.terminalValue = v))}
              hint="Defaults to zero. Speculative terminal values can dominate NPV."
              kind="assumption"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
