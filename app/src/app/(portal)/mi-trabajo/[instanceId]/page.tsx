import { PageHeader } from "@/components/ui/page-header";
import { DetailPlaceholder } from "@/components/ui/detail-placeholder";
import { ConstructionNote } from "@/components/ui/construction-note";
import { myWorkItems } from "@/lib/mock-data";

// Entregar documento / Detalle de instancia — SC-031/SC-032.
export default async function InstanceDetailPage({
  params,
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const { instanceId } = await params;
  const item = myWorkItems.find((i) => i.instanceId === instanceId);

  return (
    <>
      <PageHeader
        title={item ? `${item.requirement} · ${item.period}` : instanceId}
        scCode="SC-031"
        crumbs={[{ label: "Mi trabajo", href: "/mi-trabajo" }, { label: instanceId }]}
        description="Detalle de la instancia: entrega de documento (Camino A), registro de existente (Camino B) o entrega múltiple."
      />

      <DetailPlaceholder
        sections={[
          "Definición del requisito y composición esperada (FR-104)",
          "Ruta y nombre propuestos en SharePoint (FR-311)",
          "Zona de carga de archivo — arrastrar y soltar (FR-310–FR-322)",
          "Registrar documento existente por URL/ruta (FR-330–FR-337)",
          "Historial y comentarios de la instancia",
        ]}
      />

      <ConstructionNote fr="FR-310–FR-346" />
    </>
  );
}
