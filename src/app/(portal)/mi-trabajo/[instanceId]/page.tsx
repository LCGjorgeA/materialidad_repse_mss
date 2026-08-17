import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { document, documentInstanceLink, documentVersion } from "@/db/schema";
import { PageHeader } from "@/components/ui/page-header";
import { DetailPlaceholder } from "@/components/ui/detail-placeholder";
import { StatusBadge } from "@/components/ui/status-badge";
import { UploadForm } from "@/components/upload/upload-form";
import {
  InstanceNotFoundError,
  loadInstanceContext,
} from "@/modules/m4-recopilacion/upload-service";

// Entregar documento / Detalle de instancia — SC-031/SC-032.
export default async function InstanceDetailPage({
  params,
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const { instanceId } = await params;

  let ctx: Awaited<ReturnType<typeof loadInstanceContext>>;
  try {
    ctx = await loadInstanceContext(instanceId);
  } catch (err) {
    if (err instanceof InstanceNotFoundError) notFound();
    throw err;
  }

  const linkedDocuments = await db
    .select({ link: documentInstanceLink, document, version: documentVersion })
    .from(documentInstanceLink)
    .innerJoin(document, eq(documentInstanceLink.documentId, document.id))
    .innerJoin(documentVersion, eq(document.currentVersionId, documentVersion.id))
    .where(
      and(
        eq(documentInstanceLink.evidenceInstanceId, instanceId),
        eq(documentInstanceLink.isActive, true)
      )
    );

  return (
    <>
      <PageHeader
        title={`${ctx.requirement.readableId} · ${ctx.instance.periodLabel}`}
        scCode="SC-031"
        crumbs={[{ label: "Mi trabajo", href: "/mi-trabajo" }, { label: instanceId }]}
        description={ctx.requirement.name}
        actions={<StatusBadge status={ctx.instance.collectionStatus} />}
      />

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Composición esperada
          </h2>
          <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            {ctx.components.length === 0 ? (
              <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                Este requisito no declaró componentes — un solo documento cubre la instancia.
              </div>
            ) : (
              ctx.components.map((c, i) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                    i < ctx.components.length - 1 ? "border-b border-zinc-100 dark:border-zinc-900" : ""
                  }`}
                >
                  <span className="text-zinc-700 dark:text-zinc-300">{c.label}</span>
                  <span
                    className={`text-xs ${c.isMandatory ? "text-amber-700 dark:text-amber-400" : "text-zinc-400"}`}
                  >
                    {c.isMandatory ? "Obligatorio" : "Opcional"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Entregar documento
          </h2>
          <UploadForm
            instanceId={instanceId}
            components={ctx.components.map((c) => ({
              id: c.id,
              role: c.role,
              label: c.label,
              isMandatory: c.isMandatory,
            }))}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Documentos vinculados ({linkedDocuments.length})
          </h2>
          {linkedDocuments.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              Todavía no hay documentos vinculados a esta instancia.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    <th className="px-4 py-2.5 font-medium">Nombre</th>
                    <th className="px-4 py-2.5 font-medium">Papel</th>
                    <th className="px-4 py-2.5 font-medium">Subido</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedDocuments.map((row) => (
                    <tr
                      key={row.link.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                    >
                      <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200">
                        {row.version.filename}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{row.link.role}</td>
                      <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">
                        {row.version.uploadedAt.toLocaleDateString("es-MX")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Por implementar
          </h2>
          <DetailPlaceholder
            sections={[
              "Registrar documento existente por URL/ruta (FR-330–FR-337)",
              "Historial y comentarios de la instancia",
            ]}
          />
        </section>
      </div>
    </>
  );
}
