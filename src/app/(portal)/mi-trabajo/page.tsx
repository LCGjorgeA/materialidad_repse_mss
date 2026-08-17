import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConstructionNote } from "@/components/ui/construction-note";
import { myWorkItems } from "@/lib/mock-data";

// Mi trabajo — SC-030. La instancia es la unidad de trabajo del colaborador
// (UX §0, principio 2), agrupable por área/requisito/periodo/fecha (FR-305).
export default function MiTrabajoPage() {
  return (
    <>
      <PageHeader
        title="Mi trabajo"
        scCode="SC-030"
        description="Instancias asignadas a ti, con periodo concreto y fecha objetivo. Los vencidos van destacados."
      />

      <DataTable
        rows={myWorkItems}
        rowHref={(r) => `/mi-trabajo/${r.instanceId}`}
        columns={[
          { header: "Requisito", cell: (r) => <span className="font-mono text-xs">{r.requirement}</span> },
          { header: "Periodo", cell: (r) => r.period },
          { header: "Fecha objetivo", cell: (r) => r.dueDate },
          { header: "Estatus", cell: (r) => <StatusBadge status={r.status} /> },
        ]}
      />

      <ConstructionNote fr="FR-305–FR-322" />
    </>
  );
}
