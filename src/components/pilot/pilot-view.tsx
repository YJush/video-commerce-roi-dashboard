import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { NumberField, PercentField } from "@/components/fields";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { evaluatePilot, type AllocationMethod, type PilotInputs } from "@/lib/model/pilot";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/model/format";
import { cn } from "@/lib/utils";

const defaultPilot: PilotInputs = {
  currency: "EUR",
  controlSessions: 120000,
  treatmentSessions: 120000,
  controlOrders: 2400,
  treatmentOrders: 2580,
  controlRevenue: 264000,
  treatmentRevenue: 288960,
  controlReturns: 600,
  treatmentReturns: 606,
  pilotProgramCost: 60000,
  grossMarginRate: 0.45,
  allocationMethod: "randomized",
};

const allocationLabels: Record<AllocationMethod, string> = {
  randomized: "Randomised split (A/B)",
  matched: "Matched comparison",
  viewer_vs_nonviewer: "Viewers vs non-viewers",
  pre_post: "Before vs after (pre/post)",
};

const recommendationCopy = {
  scale: {
    label: "Scale",
    body: "The measured lift is statistically significant, the design supports a causal claim, and the pilot created positive net value.",
    tone: "primary" as const,
  },
  continue: {
    label: "Continue testing",
    body: "The direction is encouraging but the evidence is not yet strong enough to claim incrementality. Extend the test or strengthen the design.",
    tone: "muted" as const,
  },
  revise: {
    label: "Revise",
    body: "Performance did not cover the cost of the program. Revise placement, production model or cost base before deciding again.",
    tone: "maroon" as const,
  },
  stop: {
    label: "Stop",
    body: "No positive measured effect. Stopping is the rational default unless the design was flawed.",
    tone: "destructive" as const,
  },
};

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string | undefined;
}) {
  return (
    <div className="rounded-sm border border-border bg-secondary/40 p-4">
      <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-sans text-xl font-bold tabular-nums text-foreground">{value}</p>
      {sub ? <p className="mt-1 font-serif text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

const nc = (v: number | null, fn: (n: number) => string) =>
  v === null || !Number.isFinite(v) ? "Not calculable" : fn(v);

export function PilotView() {
  const [pilot, setPilot] = useState<PilotInputs>(defaultPilot);
  const update = (fn: (draft: PilotInputs) => void) =>
    setPilot((prev) => {
      const next = { ...prev };
      fn(next);
      return next;
    });

  const result = useMemo(() => evaluatePilot(pilot), [pilot]);
  const cur = pilot.currency;
  const rec = recommendationCopy[result.recommendation];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="max-w-2xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-maroon">
          Pilot evaluation
        </p>
        <h1 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight text-foreground md:text-4xl">
          Measure what the test actually proved.
        </h1>
        <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
          Enter real control and treatment results. Attributed revenue is not incremental revenue —
          only a valid experimental design supports a causal claim.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <section className="rounded-md border border-border bg-card p-6">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wide text-foreground">
            Test results
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label className="font-sans text-[0.8rem] font-medium">Allocation method</Label>
              <Select
                value={pilot.allocationMethod}
                onValueChange={(v) =>
                  update((d) => void (d.allocationMethod = v as AllocationMethod))
                }
              >
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(allocationLabels) as AllocationMethod[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {allocationLabels[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label className="font-sans text-[0.8rem] font-medium">Currency</Label>
              <Select
                value={pilot.currency}
                onValueChange={(v) => update((d) => void (d.currency = v))}
              >
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["EUR", "USD", "GBP", "SEK"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <NumberField
              id="cs"
              label="Control sessions"
              value={pilot.controlSessions}
              min={0}
              onChange={(v) => update((d) => void (d.controlSessions = v))}
              kind="input"
            />
            <NumberField
              id="ts"
              label="Treatment sessions"
              value={pilot.treatmentSessions}
              min={0}
              onChange={(v) => update((d) => void (d.treatmentSessions = v))}
              kind="input"
            />
            <NumberField
              id="co"
              label="Control orders"
              value={pilot.controlOrders}
              min={0}
              onChange={(v) => update((d) => void (d.controlOrders = v))}
              kind="input"
            />
            <NumberField
              id="to"
              label="Treatment orders"
              value={pilot.treatmentOrders}
              min={0}
              onChange={(v) => update((d) => void (d.treatmentOrders = v))}
              kind="input"
            />
            <NumberField
              id="crev"
              label="Control revenue"
              suffix={cur}
              value={pilot.controlRevenue}
              min={0}
              onChange={(v) => update((d) => void (d.controlRevenue = v))}
              kind="input"
            />
            <NumberField
              id="trev"
              label="Treatment revenue"
              suffix={cur}
              value={pilot.treatmentRevenue}
              min={0}
              onChange={(v) => update((d) => void (d.treatmentRevenue = v))}
              kind="input"
            />
            <NumberField
              id="cret"
              label="Control returned orders"
              value={pilot.controlReturns}
              min={0}
              onChange={(v) => update((d) => void (d.controlReturns = v))}
              kind="input"
            />
            <NumberField
              id="tret"
              label="Treatment returned orders"
              value={pilot.treatmentReturns}
              min={0}
              onChange={(v) => update((d) => void (d.treatmentReturns = v))}
              kind="input"
            />
            <NumberField
              id="pcost"
              label="Pilot program cost"
              suffix={cur}
              value={pilot.pilotProgramCost}
              min={0}
              onChange={(v) => update((d) => void (d.pilotProgramCost = v))}
              hint="All costs incurred to run the pilot: platform, production, staffing, media."
              kind="input"
            />
            <PercentField
              id="pmargin"
              label="Gross margin"
              value={pilot.grossMarginRate}
              onChange={(v) => update((d) => void (d.grossMarginRate = v))}
              kind="input"
            />
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section
            className={cn(
              "rounded-md border p-6",
              rec.tone === "primary"
                ? "border-primary/40 bg-primary/5"
                : rec.tone === "destructive"
                  ? "border-destructive/40 bg-destructive/5"
                  : rec.tone === "maroon"
                    ? "border-maroon/40 bg-maroon/5"
                    : "border-border bg-card",
            )}
          >
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Recommendation
            </p>
            <h2 className="mt-1 font-serif text-3xl font-semibold text-foreground">{rec.label}</h2>
            <p className="mt-2 max-w-prose font-serif text-sm leading-relaxed text-muted-foreground">
              {rec.body}
            </p>
            {result.causalWarning ? (
              <div className="mt-4 flex gap-2 rounded-sm border border-maroon/30 bg-maroon/5 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-maroon" />
                <p className="font-sans text-xs leading-relaxed text-maroon">
                  This design cannot establish incrementality. Viewer-versus-non-viewer and pre/post
                  comparisons are confounded by self-selection and seasonality. Treat the result as
                  directional only.
                </p>
              </div>
            ) : null}
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Control conversion"
              value={nc(result.controlConversion, (v) => formatPercent(v, 2))}
            />
            <Stat
              label="Treatment conversion"
              value={nc(result.treatmentConversion, (v) => formatPercent(v, 2))}
            />
            <Stat
              label="Relative lift"
              value={nc(result.relativeLift, (v) => formatPercent(v, 1))}
              sub={result.significant ? "Significant at 95%" : "Not significant at 95%"}
            />
            <Stat
              label="Absolute difference"
              value={nc(result.absoluteDifference, (v) => `${(v * 100).toFixed(2)} pp`)}
              sub={
                result.ciLow !== null && result.ciHigh !== null
                  ? `95% CI ${(result.ciLow * 100).toFixed(2)} to ${(result.ciHigh * 100).toFixed(2)} pp`
                  : undefined
              }
            />
            <Stat
              label="Incremental orders"
              value={nc(result.incrementalOrders, (v) => formatNumber(v, 0))}
              sub="Applied to treatment sessions only"
            />
            <Stat
              label="Return-rate change"
              value={nc(result.returnRateDifference, (v) => `${(v * 100).toFixed(2)} pp`)}
              sub="Positive means fewer returns in treatment"
            />
            <Stat
              label="Incremental contribution"
              value={nc(result.incrementalContribution, (v) => formatCurrency(v, cur))}
              sub="Retained incremental orders × AOV × margin"
            />
            <Stat
              label="Cost per incremental order"
              value={nc(result.costPerIncrementalOrder, (v) => formatCurrency(v, cur))}
            />
            <Stat
              label="Net pilot value"
              value={nc(result.netPilotValue, (v) => formatCurrency(v, cur))}
              sub="Contribution minus pilot cost"
            />
          </section>

          {result.notCalculable.length > 0 ? (
            <section className="rounded-md border border-border bg-card p-5">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Not calculable
              </h3>
              <ul className="mt-2 list-disc pl-5 font-serif text-sm text-muted-foreground">
                {result.notCalculable.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="font-sans text-xs leading-relaxed text-muted-foreground">
            A statistically significant lift in a randomised split is evidence of incrementality for
            this test period and this traffic. It is not a guarantee of the same effect at full
            rollout.
          </p>
        </div>
      </div>
    </div>
  );
}
