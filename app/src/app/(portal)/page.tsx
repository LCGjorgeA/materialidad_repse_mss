import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ConstructionNote } from "@/components/ui/construction-note";
import { areaProgress, projectKpis } from "@/lib/mock-data";

// Inicio — SC-001. Tablero de proyecto (FR-710/711): indicadores primarios de
// avance sobre instancias, nunca sobre requisitos ni documentos (Glosario §1.7).
export default function InicioPage() {
  return (
    <>
      <PageHeader
        title="Inicio"
        scCode="SC-001"
        description="Vista general del proyecto de cierre de MSS: cobertura, validación y excepciones abiertas."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {projectKpis.map((kpi) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Avance por área / servicio
        </h2>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                <th className="px-4 py-2.5 font-medium">Área / Servicio</th>
                <th className="px-4 py-2.5 font-medium">Frente</th>
                <th className="px-4 py-2.5 font-medium">% Recopilación</th>
                <th className="px-4 py-2.5 font-medium">% Validación</th>
              </tr>
            </thead>
            <tbody>
              {areaProgress.map((row) => (
                <tr
                  key={row.area}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                >
                  <td className="px-4 py-2.5 font-medium text-zinc-800 dark:text-zinc-200">
                    {row.area}
                    {row.open && (
                      <span className="ml-2 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        enumeración abierta
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{row.front}</td>
                  <td className="px-4 py-2.5">
                    <ProgressCell pct={row.collectionPct} />
                  </td>
                  <td className="px-4 py-2.5">
                    <ProgressCell pct={row.validationPct} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConstructionNote fr="FR-710–FR-717" />
    </>
  );
}

function ProgressCell({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums text-zinc-600 dark:text-zinc-400">{pct}%</span>
    </div>
  );
}
