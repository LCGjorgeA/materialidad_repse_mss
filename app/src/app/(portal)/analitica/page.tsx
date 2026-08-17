import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ConstructionNote } from "@/components/ui/construction-note";
import { projectKpis } from "@/lib/mock-data";

const SUBSECTIONS = [
  { label: "Por frente y área/servicio", scCode: "SC-011" },
  { label: "Cobertura por periodo", scCode: "SC-012" },
  { label: "Por responsable", scCode: "SC-013" },
  { label: "Volumen documental", scCode: "SC-014" },
];

// Analítica — SC-010 (FR-700–FR-717). Indicadores primarios sobre instancias;
// volumen documental separado y nunca sumado al % de avance (FR-701).
export default function AnaliticaPage() {
  return (
    <>
      <PageHeader
        title="Analítica"
        scCode="SC-010"
        description="Todo indicador es navegable: un clic lleva a los registros que lo componen (FR-702)."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {projectKpis.map((kpi) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SUBSECTIONS.map((s) => (
          <div
            key={s.scCode}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{s.label}</span>
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 font-mono text-[11px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              {s.scCode}
            </span>
          </div>
        ))}
      </div>

      <ConstructionNote fr="FR-700–FR-717" />
    </>
  );
}
