import { Info } from "lucide-react"
import type { ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type InputKind = "input" | "assumption" | "sourced"

const kindStyles: Record<InputKind, string> = {
  input: "bg-secondary text-muted-foreground",
  assumption: "bg-accent text-accent-foreground",
  sourced: "bg-maroon/10 text-maroon",
}

const kindLabel: Record<InputKind, string> = {
  input: "input",
  assumption: "assumption",
  sourced: "sourced",
}

function FieldShell({
  id,
  label,
  hint,
  kind,
  suffix,
  children,
}: {
  id: string
  label: string
  hint?: string | undefined
  kind?: InputKind | undefined
  suffix?: string | undefined
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="font-sans text-[0.8rem] font-medium text-foreground">
          {label}
        </Label>
        {kind ? (
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 font-sans text-[0.6rem] font-semibold uppercase tracking-wide",
              kindStyles[kind],
            )}
          >
            {kindLabel[kind]}
          </span>
        ) : null}
        {hint ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground/70 transition-colors hover:text-primary" aria-label={`About ${label}`}>
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs font-sans text-xs leading-relaxed">{hint}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div className="relative">
        {children}
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-sans text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  kind,
  suffix,
  step,
  min,
}: {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
  kind?: InputKind
  suffix?: string
  step?: number
  min?: number
}) {
  return (
    <FieldShell id={id} label={label} hint={hint} kind={kind} suffix={suffix}>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="font-sans tabular-nums"
      />
    </FieldShell>
  )
}

/** Percent field: stores a fraction, displays/edits as a percentage. */
export function PercentField({
  id,
  label,
  value,
  onChange,
  hint,
  kind,
  step = 0.1,
  points = false,
}: {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
  kind?: InputKind
  step?: number
  points?: boolean
}) {
  return (
    <FieldShell id={id} label={label} hint={hint} kind={kind} suffix={points ? "pp" : "%"}>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        value={Number.isFinite(value) ? Number((value * 100).toFixed(4)) : ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value) / 100)}
        className="font-sans tabular-nums pr-9"
      />
    </FieldShell>
  )
}
