import type { ScenarioResult } from "@/lib/model/types";
import { formatCurrency, formatMonths, formatNumber, formatPercent } from "@/lib/model/format";
import { cn } from "@/lib/utils";

function adoptionAtMonth(s: ScenarioResult, month: number): number {
  const row =
    s.engine.months.find((m) => m.month === month) ?? s.engine.months[s.engine.months.length - 1];
  return row ? row.adoption : 0;
}

export function ScenarioComparison({
  scenarios,
  currency,
}: {
  scenarios: ScenarioResult[];
  currency: string;
}) {
  const sumRetained = (s: ScenarioResult) =>
    s.engine.months.reduce((a, m) => a + m.incrementalRetainedOrders, 0);

  const rows: { label: string; render: (s: ScenarioResult) => string; highlight?: boolean }[] = [
    { label: "Adoption at month 3", render: (s) => formatPercent(adoptionAtMonth(s, 2)) },
    { label: "Adoption at month 6", render: (s) => formatPercent(adoptionAtMonth(s, 5)) },
    { label: "Adoption at month 12", render: (s) => formatPercent(adoptionAtMonth(s, 11)) },
    { label: "Adoption at month 24", render: (s) => formatPercent(adoptionAtMonth(s, 23)) },
    { label: "Incremental retained orders", render: (s) => formatNumber(sumRetained(s)) },
    {
      label: "Contribution benefit",
      render: (s) => formatCurrency(s.engine.totalUndiscountedBenefit, currency),
    },
    { label: "Total cost", render: (s) => formatCurrency(s.engine.totalProgramCost, currency) },
    {
      label: "Net benefit",
      render: (s) => formatCurrency(s.engine.horizonNetBenefit, currency),
      highlight: true,
    },
    {
      label: "ROI",
      render: (s) => (s.engine.simpleROI === null ? "n/a" : formatPercent(s.engine.simpleROI, 0)),
    },
    { label: "NPV", render: (s) => formatCurrency(s.engine.npv, currency), highlight: true },
    { label: "Payback", render: (s) => formatMonths(s.engine.paybackMonth) },
    {
      label: "Break-even lift",
      render: (s) =>
        s.breakEven.requiredRelativeLift === null
          ? "n/a"
          : s.breakEven.feasibleLift
            ? formatPercent(s.breakEven.requiredRelativeLift)
            : "infeasible",
    },
  ];

  return (
    <section aria-labelledby="scen-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="scen-heading" className="font-serif text-2xl font-semibold text-foreground">
          Scenario comparison
        </h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Conservative, working and strong. The middle case is your working input — not an
          expectation.
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/60">
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Metric
              </th>
              {scenarios.map((s) => (
                <th
                  key={s.key}
                  className={cn(
                    "px-4 py-3 text-right font-sans text-xs font-bold uppercase tracking-wide",
                    s.key === "working" ? "text-primary" : "text-foreground",
                  )}
                >
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-sans text-sm text-muted-foreground">{row.label}</td>
                {scenarios.map((s) => (
                  <td
                    key={s.key}
                    className={cn(
                      "px-4 py-2.5 text-right font-sans tabular-nums text-sm",
                      row.highlight ? "font-semibold text-foreground" : "text-foreground",
                      s.key === "working" && "bg-primary/[0.03]",
                    )}
                  >
                    {row.render(s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
