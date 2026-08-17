import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConstructionNote } from "@/components/ui/construction-note";
import { exceptions } from "@/lib/mock-data";

// Excepciones — SC-050 (FR-520–FR-529). Toda excepción, sin importar impacto,
// la resuelve el validador final (DA-009) — sin escalonamiento por Coordinador.
export default function ExcepcionesPage() {
  return (
    <>
      <PageHeader
        title="Excepciones"
        scCode="SC-050"
        description="Registro consolidado de excepciones/riesgos — anexo del cierre del proyecto. Aprobación exclusiva del validador final (DA-009)."
      />

      <DataTable
        rows={exceptions}
        rowHref={(r) => `/excepciones/${r.exceptionId}`}
        columns={[
          { header: "Requisito", cell: (r) => <span className="font-mono text-xs">{r.requirement}</span> },
          {
            header: "Impacto",
            cell: (r) => (
              <span className="capitalize">{{ high: "Alto", medium: "Medio", low: "Bajo" }[r.impact]}</span>
            ),
          },
          { header: "Propuesta por", cell: (r) => r.proposedBy },
          { header: "Estatus", cell: (r) => <StatusBadge status={r.status} /> },
        ]}
      />

      <ConstructionNote fr="FR-520–FR-529" />
    </>
  );
}
