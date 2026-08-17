import { PageHeader } from "@/components/ui/page-header";
import { DetailPlaceholder } from "@/components/ui/detail-placeholder";
import { ConstructionNote } from "@/components/ui/construction-note";
import { exceptions } from "@/lib/mock-data";

// Ficha de excepción — SC-051 (FR-521–FR-525).
export default async function ExceptionDetailPage({
  params,
}: {
  params: Promise<{ exceptionId: string }>;
}) {
  const { exceptionId } = await params;
  const item = exceptions.find((e) => e.exceptionId === exceptionId);

  return (
    <>
      <PageHeader
        title={item ? item.requirement : exceptionId}
        scCode="SC-051"
        crumbs={[{ label: "Excepciones", href: "/excepciones" }, { label: exceptionId }]}
        description="Qué falta, por qué no pudo recuperarse, impacto y tratamiento acordado."
      />

      <DetailPlaceholder
        sections={[
          "Qué falta / causa / impacto / tratamiento (FR-521)",
          "Flujo: propuesta → en revisión → aprobada/rechazada/mitigada (FR-522)",
          "Aprobar / rechazar — solo validador final, scope_type='project' (FR-523, DA-009)",
          "Documentos de sustento (FR-529)",
        ]}
      />

      <ConstructionNote fr="FR-520–FR-529" />
    </>
  );
}
