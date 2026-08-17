import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ConstructionNote } from "@/components/ui/construction-note";
import { brokenLinks, orphanFiles } from "@/lib/mock-data";

// Reconciliación — SC-070/071 (FR-420–FR-429), camino C de ingesta (Glosario §1.4):
// compara periódicamente SharePoint contra el registro del Portal.
export default function ReconciliacionPage() {
  return (
    <>
      <PageHeader
        title="Reconciliación"
        scCode="SC-070"
        description="Archivos que llegaron a SharePoint por fuera del Portal, y registros cuyo documento ya no es accesible."
      />

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Archivos huérfanos ({orphanFiles.length})
          </h2>
          <DataTable
            rows={orphanFiles}
            columns={[
              { header: "Ruta", cell: (r) => <span className="font-mono text-xs">{r.path}</span> },
              { header: "Detectado", cell: (r) => r.detectedAt },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Enlaces rotos ({brokenLinks.length})
          </h2>
          <DataTable
            rows={brokenLinks}
            columns={[
              { header: "Documento", cell: (r) => r.document },
              { header: "Requisito", cell: (r) => <span className="font-mono text-xs">{r.requirement}</span> },
              { header: "Detectado", cell: (r) => r.detectedAt },
            ]}
          />
        </section>
      </div>

      <ConstructionNote fr="FR-420–FR-429" />
    </>
  );
}
