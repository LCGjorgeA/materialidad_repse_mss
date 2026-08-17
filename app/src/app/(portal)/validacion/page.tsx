import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConstructionNote } from "@/components/ui/construction-note";
import { validationQueue } from "@/lib/mock-data";

// Cola de validación — SC-040 (FR-500-503). Ordenada por criticidad y luego
// antigüedad de espera; cada validador ve solo su ámbito de rol asignado.
export default function ValidacionPage() {
  return (
    <>
      <PageHeader
        title="Validación"
        scCode="SC-040"
        description="Instancias en Recopilado, listas para revisar. Ordenada por criticidad y antigüedad de espera."
      />

      <DataTable
        rows={validationQueue}
        rowHref={(r) => `/validacion/${r.instanceId}`}
        columns={[
          { header: "Requisito", cell: (r) => <span className="font-mono text-xs">{r.requirement}</span> },
          { header: "Periodo", cell: (r) => r.period },
          { header: "Área", cell: (r) => r.area },
          { header: "Esperando desde", cell: (r) => r.waitingSince },
          {
            header: "Crítico",
            cell: (r) =>
              r.critical ? (
                <span className="text-amber-600 dark:text-amber-400">●</span>
              ) : (
                <span className="text-zinc-300 dark:text-zinc-700">●</span>
              ),
          },
        ]}
      />

      <ConstructionNote fr="FR-500–FR-515" />
    </>
  );
}
