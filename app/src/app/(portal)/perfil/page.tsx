import { PageHeader } from "@/components/ui/page-header";
import { ConstructionNote } from "@/components/ui/construction-note";

// Perfil — SC-090. Login vía Entra ID / SSO llega en la Fase 4 del plan.
export default function PerfilPage() {
  return (
    <>
      <PageHeader title="Perfil" scCode="SC-090" description="Tus roles y ámbitos, preferencias de notificación." />
      <ConstructionNote fr="FR-901, FR-931" />
    </>
  );
}
