import { Button } from "@/components/ui/button";

export type AppMode = "start" | "quick" | "pilot";

export function AppHeader({ mode, onHome }: { mode: AppMode; onHome: () => void }) {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <button
          onClick={onHome}
          className="group flex items-baseline gap-2 text-left"
          type="button"
        >
          <span className="font-sans text-sm font-extrabold uppercase tracking-[0.12em] text-primary">
            Industry Contents
          </span>
          <span className="hidden font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-muted-foreground sm:inline">
            / Video-Commerce
          </span>
        </button>
        {mode !== "start" ? (
          <Button variant="ghost" size="sm" onClick={onHome} className="font-sans text-xs">
            Start over
          </Button>
        ) : null}
      </div>
    </header>
  );
}
