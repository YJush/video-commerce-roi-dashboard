import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader, type AppMode } from "@/components/app-header";
import { StartScreen } from "@/components/start-screen";
import { InputForm } from "@/components/quick/input-form";
import { ExecutivePanel } from "@/components/quick/executive-panel";
import { BreakEvenPanel } from "@/components/quick/breakeven-panel";
import { ValueDecomposition } from "@/components/quick/value-decomposition";
import { ScenarioComparison } from "@/components/quick/scenario-comparison";
import { SensitivityPanel } from "@/components/quick/sensitivity-panel";
import { Warnings } from "@/components/quick/warnings";
import { PilotView } from "@/components/pilot/pilot-view";
import { buildScenarios } from "@/lib/model";
import { runEngine } from "@/lib/model/engine";
import { computeBreakEven } from "@/lib/model/breakeven";
import { computeSensitivity } from "@/lib/model/sensitivity";
import { validateInputs } from "@/lib/model/validate";
import { fashionExample } from "@/lib/model/examples";
import type { ModelInputs } from "@/lib/model/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Video-Commerce Business Case Dashboard | Industry Contents" },
      {
        name: "description",
        content:
          "Estimate the incremental profit shoppable video could create, calculate the break-even lift, and define what a controlled pilot must measure.",
      },
      { property: "og:title", content: "Video-Commerce Business Case Dashboard" },
      {
        property: "og:description",
        content:
          "Model net benefit, ROI, payback and break-even lift for on-site shoppable video and live shopping.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function clone(inputs: ModelInputs): ModelInputs {
  return JSON.parse(JSON.stringify(inputs)) as ModelInputs;
}

function QuickView({
  inputs,
  setInputs,
}: {
  inputs: ModelInputs;
  setInputs: (i: ModelInputs) => void;
}) {
  const update = (fn: (draft: ModelInputs) => void) => {
    const draft = clone(inputs);
    fn(draft);
    setInputs(draft);
  };

  const engine = useMemo(() => runEngine(inputs), [inputs]);
  const breakEven = useMemo(() => computeBreakEven(inputs), [inputs]);
  const scenarios = useMemo(() => buildScenarios(inputs), [inputs]);
  const sensitivity = useMemo(() => computeSensitivity(inputs), [inputs]);
  const issues = useMemo(() => validateInputs(inputs), [inputs]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="font-sans text-sm font-bold uppercase tracking-wide text-foreground">
              Your assumptions
            </h2>
            <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
              Every field is labelled as an input, an assumption, or a sourced value. Nothing here
              is a benchmark or a promise.
            </p>
            <div className="mt-3">
              <InputForm inputs={inputs} update={update} />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <Warnings issues={issues} />
          <ExecutivePanel inputs={inputs} engine={engine} breakEven={breakEven} />
          <BreakEvenPanel inputs={inputs} engine={engine} breakEven={breakEven} />
          <ValueDecomposition inputs={inputs} engine={engine} />
          <ScenarioComparison scenarios={scenarios} currency={inputs.baseline.currency} />
          <SensitivityPanel rows={sensitivity} currency={inputs.baseline.currency} />
          <p className="font-sans text-xs leading-relaxed text-muted-foreground">
            All figures are indicative scenario estimates derived from your assumptions. They are
            not evidence that any platform causes the modelled lift — only a controlled pilot can
            show that.
          </p>
        </div>
      </div>
    </div>
  );
}

function Index() {
  const [mode, setMode] = useState<AppMode>("start");
  const [inputs, setInputs] = useState<ModelInputs>(() => clone(fashionExample));

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader mode={mode} onHome={() => setMode("start")} />
        <main>
          {mode === "start" ? (
            <StartScreen
              onExample={(data) => {
                setInputs(clone(data));
                setMode("quick");
              }}
              onQuick={() => {
                setInputs(clone(fashionExample));
                setMode("quick");
              }}
              onPilot={() => setMode("pilot")}
            />
          ) : mode === "quick" ? (
            <QuickView inputs={inputs} setInputs={setInputs} />
          ) : (
            <PilotView />
          )}
        </main>
        <footer className="border-t border-border py-6">
          <p className="mx-auto max-w-6xl px-5 font-sans text-xs text-muted-foreground">
            Industry Contents · Video-Commerce Business Case Dashboard · Calculated in your browser.
          </p>
        </footer>
      </div>
    </TooltipProvider>
  );
}
