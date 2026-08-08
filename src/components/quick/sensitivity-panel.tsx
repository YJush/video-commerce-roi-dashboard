import type { SensitivityRow } from "@/lib/model/types";
import { formatCurrency } from "@/lib/model/format";

export function SensitivityPanel({
  rows,
  currency,
}: {
  rows: SensitivityRow[];
  currency: string;
}) {
  if (rows.length === 0) return null;
  const maxSwing = Math.max(...rows.map((r) => Math.abs(r.swing)), 1);

  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="font-sans text-sm font-bold uppercase tracking-wide text-primary">
        What moves the result
      </h2>
      <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
        Each assumption is varied one at a time. Bars show the swing in net present value, ranked by
        influence — the top rows are what a pilot must measure most carefully.
      </p>
      <div className="mt-5 flex flex-col gap-4">
        {rows.map((r) => (
          <div key={r.key} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-sans text-sm font-medium text-foreground">{r.label}</span>
              <span className="font-sans text-xs tabular-nums text-muted-foreground">
                {r.lowValue} → {r.highValue} · swing {formatCurrency(r.swing, currency, { compact: true })}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-sm bg-secondary">
              <div
                className="h-full rounded-sm bg-primary"
                style={{ width: `${Math.max((Math.abs(r.swing) / maxSwing) * 100, 2)}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-4 font-sans text-xs tabular-nums text-muted-foreground">
              <span>Low: {formatCurrency(r.lowNpv, currency, { compact: true })} NPV</span>
              <span>High: {formatCurrency(r.highNpv, currency, { compact: true })} NPV</span>
              <span>Base: {r.baselineValue}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
