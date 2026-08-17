import { PageHeader } from "@/components/ui/page-header";
import { ConstructionNote } from "@/components/ui/construction-note";
import { closureCriteria } from "@/lib/mock-data";

// Cierre — SC-100 (FR-540–FR-545). Requisito → área/servicio → frente → proyecto,
// cada nivel con sus propios criterios; nunca ocurre de forma automática.
export default function CierrePage() {
  return (
    <>
      <PageHeader
        title="Cierre"
        scCode="SC-100"
        description="Criterios de cierre a nivel proyecto. El cierre requiere una acción explícita de un validador final."
      />

      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {closureCriteria.map((c, i) => (
          <div
            key={c.label}
            className={`flex items-center gap-3 px-4 py-3.5 text-sm ${
              i < closureCriteria.length - 1 ? "border-b border-zinc-100 dark:border-zinc-900" : ""
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                c.met
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
              }`}
            >
              {c.met ? "✓" : "○"}
            </span>
            <span className={c.met ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-400"}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      <button
        disabled
        className="mt-6 cursor-not-allowed rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Generar paquete de cierre
      </button>

      <ConstructionNote fr="FR-540–FR-545" />
    </>
  );
}
