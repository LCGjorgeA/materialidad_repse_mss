import { PageHeader } from "@/components/ui/page-header";
import { ConstructionNote } from "@/components/ui/construction-note";

const FACETS = [
  "Frente",
  "Área / Servicio",
  "Proceso / Subservicio",
  "Actividad",
  "Tipo de documento",
  "Periodo",
  "Responsable",
  "Estatus",
  "Factura",
  "Pago",
  "Proveedor",
  "Empleado",
  "Proyecto",
];

// Búsqueda — SC-060 (FR-600–FR-612): 3 tipos de resultado (requisitos,
// instancias, documentos), facetada por los 14 criterios del Plan Macro.
export default function BusquedaPage() {
  return (
    <>
      <PageHeader
        title="Búsqueda"
        scCode="SC-060"
        description="Búsqueda global facetada. Los resultados respetan permisos por clasificación de sensibilidad (FR-603)."
      />

      <label className="relative block max-w-2xl">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
          🔍
        </span>
        <input
          type="search"
          disabled
          placeholder="Buscar por nombre, descripción, metadatos de correo, referencia…"
          className="w-full cursor-not-allowed rounded-md border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
        />
      </label>

      <div className="mt-6 flex flex-wrap gap-2">
        {FACETS.map((f) => (
          <span
            key={f}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
          >
            {f}
          </span>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        Escribe para buscar entre requisitos, instancias y documentos.
      </div>

      <ConstructionNote fr="FR-600–FR-612" />
    </>
  );
}
