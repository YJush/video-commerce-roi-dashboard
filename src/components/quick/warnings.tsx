import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { ValidationIssue } from "@/lib/model/types";

export function Warnings({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) return null;
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  return (
    <div className="flex flex-col gap-2">
      {errors.length > 0 ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-4 w-4" />
            <h3 className="font-sans text-xs font-bold uppercase tracking-wide">
              {errors.length} input {errors.length === 1 ? "error" : "errors"}
            </h3>
          </div>
          <ul className="mt-2 flex flex-col gap-1">
            {errors.map((e, i) => (
              <li key={i} className="font-sans text-sm text-foreground">
                {e.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {warnings.length > 0 ? (
        <div className="rounded-md border border-primary/25 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-primary">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="font-sans text-xs font-bold uppercase tracking-wide">
              {warnings.length} {warnings.length === 1 ? "caution" : "cautions"}
            </h3>
          </div>
          <ul className="mt-2 flex flex-col gap-1">
            {warnings.map((w, i) => (
              <li key={i} className="font-sans text-sm text-muted-foreground">
                {w.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
