import { ArrowRight, FlaskConical, LineChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exampleList } from "@/lib/model/examples";
import type { ModelInputs } from "@/lib/model/types";

export function StartScreen({
  onExample,
  onQuick,
  onPilot,
}: {
  onExample: (data: ModelInputs) => void;
  onQuick: () => void;
  onPilot: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Business Case Dashboard
        </p>
        <h1 className="mt-3 text-balance font-serif text-4xl font-semibold leading-[1.1] text-foreground md:text-5xl">
          Model the commercial impact of shoppable video before you commit.
        </h1>
        <p className="mt-4 text-pretty font-serif text-lg leading-relaxed text-muted-foreground">
          Estimate the incremental profit an on-site shoppable-video or live-shopping program could
          create, calculate the performance required to break even, and define what a controlled
          pilot must measure. Every result is an indicative scenario estimate, not a promise.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {/* Explore an example */}
        <section className="flex flex-col rounded-md border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <h2 className="font-sans text-sm font-bold uppercase tracking-wide">
              Explore an example
            </h2>
          </div>
          <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
            A fictional retailer is already loaded — no data entry required. Illustrative examples,
            not industry benchmarks.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {exampleList.map((ex) => (
              <button
                key={ex.key}
                type="button"
                onClick={() => onExample(ex.data)}
                className="group flex items-center justify-between rounded-sm border border-border bg-secondary/50 px-3 py-2.5 text-left transition-colors hover:border-primary hover:bg-secondary"
              >
                <span className="font-sans text-sm font-medium text-foreground">{ex.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </section>

        {/* Quick business case */}
        <section className="flex flex-col rounded-md border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-primary">
            <LineChart className="h-4 w-4" />
            <h2 className="font-sans text-sm font-bold uppercase tracking-wide">
              Build a quick scenario
            </h2>
          </div>
          <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
            Enter a limited set of approximate business inputs. The dashboard models additional
            retained orders, net benefit, ROI, payback and break-even.
          </p>
          <p className="mt-4 font-serif text-sm italic text-muted-foreground">
            Your inputs are calculated in your browser and are not stored or sent to Industry
            Contents.
          </p>
          <Button onClick={onQuick} className="mt-auto w-full font-sans text-sm">
            Start a business case
            <ArrowRight className="h-4 w-4" />
          </Button>
        </section>

        {/* Evaluate a pilot */}
        <section className="flex flex-col rounded-md border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-maroon">
            <FlaskConical className="h-4 w-4" />
            <h2 className="font-sans text-sm font-bold uppercase tracking-wide">
              Evaluate a pilot
            </h2>
          </div>
          <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
            Already ran a test? Enter real control and treatment results to measure incremental
            lift, significance and net pilot value — with a causal-validity check.
          </p>
          <Button
            onClick={onPilot}
            variant="outline"
            className="mt-auto w-full border-maroon/40 font-sans text-sm text-maroon hover:bg-maroon/5 hover:text-maroon"
          >
            Evaluate test results
            <ArrowRight className="h-4 w-4" />
          </Button>
        </section>
      </div>

      <p className="mt-8 max-w-3xl font-sans text-xs leading-relaxed text-muted-foreground">
        This model does not prove that any video-commerce platform causes the assumed lift, and does
        not substitute for a controlled pilot. It translates your economics into a testable
        break-even threshold.
      </p>
    </div>
  );
}
