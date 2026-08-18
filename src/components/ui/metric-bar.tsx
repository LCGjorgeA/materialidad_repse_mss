import type { ProjectKpi } from "@/lib/mock-data";

// Franja de métricas integrada — reemplaza el grid de cards independientes.
// Compuesto (no repetible por item): una sola pieza con divisores internos.
export function MetricBar({ items }: { items: ProjectKpi[] }) {
  return (
    <div className="flex flex-wrap divide-x divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {items.map((kpi) => (
        <div key={kpi.label} className="min-w-[9rem] flex-1 px-4 py-3">
          <div
            className={`font-semibold tabular-nums ${
              kpi.emphasis
                ? "text-3xl text-brand-primary dark:text-brand-accent"
                : "text-2xl text-zinc-900 dark:text-zinc-50"
            }`}
          >
            {kpi.value.toLocaleString("es-MX")}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {kpi.emphasis && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />}
            {kpi.label}
          </div>
          {kpi.hint && (
            <div className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">{kpi.hint}</div>
          )}
        </div>
      ))}
    </div>
  );
}
