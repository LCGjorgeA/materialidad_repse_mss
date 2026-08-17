import { PageHeader } from "@/components/ui/page-header";
import { ConstructionNote } from "@/components/ui/construction-note";

// Importar inventario — SC-023 (FR-130–FR-135): plantilla descargable, vista
// previa con conteo de renglones válidos/con error, importación transaccional.
export default function ImportarInventarioPage() {
  return (
    <>
      <PageHeader
        title="Importar inventario"
        scCode="SC-023"
        crumbs={[{ label: "Inventario Maestro", href: "/inventario" }, { label: "Importar" }]}
        description="Carga masiva desde Excel con validación por renglón y vista previa antes de confirmar."
      />

      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <div className="text-3xl">📄</div>
        <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Arrastra la plantilla de Excel aquí, o
        </p>
        <button
          disabled
          className="mt-3 cursor-not-allowed rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Seleccionar archivo
        </button>
        <p className="mt-4 text-xs text-zinc-400">
          Después de cargar: vista previa con conteo de renglones válidos, con error y con
          advertencia, y el total de instancias que se generarían (FR-132).
        </p>
      </div>

      <ConstructionNote fr="FR-130–FR-135" />
    </>
  );
}
