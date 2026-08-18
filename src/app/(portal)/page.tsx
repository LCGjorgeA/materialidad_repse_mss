import { PageHeader } from "@/components/ui/page-header";
import { MetricBar } from "@/components/ui/metric-bar";
import { ConstructionNote } from "@/components/ui/construction-note";
import { areaProgress, projectKpis } from "@/lib/mock-data";

// Inicio — SC-001. Tablero de proyecto (FR-710/711): indicadores primarios de
// avance sobre instancias, nunca sobre requisitos ni documentos (Glosario §1.7).
export default function InicioPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Portal de Materialidad y Expediente MSS" }]}
        title="Inicio"
        scCode="SC-001"
        description="Vista general del proyecto de cierre de MSS: cobertura, validación y excepciones abiertas."
      />

      <MetricBar items={projectKpis} />

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Avance por área / servicio
        </h2>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
                <th className="select-none px-4 py-2 font-medium">Área / Servicio</th>
                <th className="select-none px-4 py-2 font-medium">Frente</th>
                <th className="cursor-pointer select-none px-4 py-2 text-right font-medium hover:text-zinc-700 dark:hover:text-zinc-300">
                  % Recopilación <span className="text-zinc-300 dark:text-zinc-600">↕</span>
                </th>
                <th className="cursor-pointer select-none px-4 py-2 text-right font-medium hover:text-zinc-700 dark:hover:text-zinc-300">
                  % Validación <span className="text-zinc-300 dark:text-zinc-600">↕</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {areaProgress.map((row) => (
                <tr
                  key={row.area}
                  className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-2 font-medium text-zinc-800 dark:text-zinc-200">
                    {row.area}
                    {row.open && (
                      <span className="ml-2 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        enumeración abierta
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {row.front}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <ProgressCell pct={row.collectionPct} />
                  </td>
                  <td className="px-4 py-2 text-right">
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
    <div className="flex items-center justify-end gap-2">
      <div className="h-1 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full rounded-full bg-brand-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-9 text-right tabular-nums text-zinc-600 dark:text-zinc-400">{pct}%</span>
    </div>
  );
}
