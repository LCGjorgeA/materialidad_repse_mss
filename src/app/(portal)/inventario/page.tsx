import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConstructionNote } from "@/components/ui/construction-note";
import { requirements } from "@/lib/mock-data";

// Inventario Maestro — SC-020. En el Portal, el Inventario Maestro *es* el
// conjunto de Requisitos con sus Instancias (Glosario, término "Inventario Maestro").
export default function InventarioPage() {
  return (
    <>
      <PageHeader
        title="Inventario Maestro"
        scCode="SC-020"
        description="Filtrable por frente, área, proceso, actividad, tipo de información, periodicidad, responsable y estatus (FR-121)."
        actions={
          <div className="flex gap-2">
            <Link
              href="/inventario/importar"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Importar
            </Link>
            <button
              disabled
              className="cursor-not-allowed rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              + Nuevo requisito
            </button>
          </div>
        }
      />

      <DataTable
        rows={requirements}
        rowHref={(r) => `/inventario/${r.readableId}`}
        columns={[
          { header: "ID", cell: (r) => <span className="font-mono text-xs">{r.readableId}</span> },
          { header: "Requisito", cell: (r) => r.name },
          { header: "Área", cell: (r) => r.area },
          { header: "Periodicidad", cell: (r) => r.periodicity },
          {
            header: "Cobertura",
            cell: (r) =>
              r.expected
                ? `${r.collected} / ${r.expected} (${Math.round((r.collected / r.expected) * 100)}%)`
                : `${r.collected} marcadas — enumeración abierta`,
          },
          { header: "Estatus", cell: (r) => <StatusBadge status={r.status} /> },
        ]}
      />

      <ConstructionNote fr="FR-100–FR-138" />
    </>
  );
}
