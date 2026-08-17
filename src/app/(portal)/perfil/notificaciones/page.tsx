import { PageHeader } from "@/components/ui/page-header";
import { ConstructionNote } from "@/components/ui/construction-note";

// Notificaciones — SC-091 (FR-800–FR-899). Siete eventos accionables.
export default function NotificacionesPage() {
  return (
    <>
      <PageHeader
        title="Notificaciones"
        scCode="SC-091"
        crumbs={[{ label: "Perfil", href: "/perfil" }, { label: "Notificaciones" }]}
      />
      <ConstructionNote fr="FR-800–FR-899" />
    </>
  );
}
