import { PageHeader } from "@/components/ui/page-header";
import { DetailPlaceholder } from "@/components/ui/detail-placeholder";
import { ConstructionNote } from "@/components/ui/construction-note";
import { validationQueue } from "@/lib/mock-data";

// Validar instancia — SC-041 (FR-505–FR-514): checklist del Plan Macro,
// Validado/Rechazado/Parcial/No obtenido, atajos de teclado, avance automático.
export default async function ValidateInstancePage({
  params,
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const { instanceId } = await params;
  const item = validationQueue.find((i) => i.instanceId === instanceId);

  return (
    <>
      <PageHeader
        title={item ? `${item.requirement} · ${item.period}` : instanceId}
        scCode="SC-041"
        crumbs={[{ label: "Validación", href: "/validacion" }, { label: instanceId }]}
        description="Definición del requisito, documentos con vista previa, metadatos, referencias transaccionales y checklist — en una sola pantalla."
      />

      <DetailPlaceholder
        sections={[
          "Documentos vinculados con vista previa embebida (FR-505)",
          "Checklist de validación configurable (FR-506–FR-507)",
          "Validado / Rechazado / Parcial / No obtenido (FR-508)",
          "Atajos de teclado + avance automático a la siguiente (FR-514)",
        ]}
      />

      <ConstructionNote fr="FR-500–FR-515" />
    </>
  );
}
