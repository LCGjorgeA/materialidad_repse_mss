import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConstructionNote } from "@/components/ui/construction-note";
import { requirements } from "@/lib/mock-data";

// Ficha del requisito — SC-021, con cobertura por periodo — SC-024 (FR-209/210).
export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ readableId: string }>;
}) {
  const { readableId } = await params;
  const requirement = requirements.find((r) => r.readableId === readableId);
  if (!requirement) notFound();

  const years = requirement.periodicity === "monthly" ? [2020, 2021, 2022, 2023, 2024, 2025, 2026] : [];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return (
    <>
      <PageHeader
        title={requirement.name}
        scCode="SC-021"
        crumbs={[{ label: "Inventario Maestro", href: "/inventario" }, { label: requirement.readableId }]}
        description={`${requirement.readableId} · ${requirement.area} · periodicidad ${requirement.periodicity}`}
        actions={<StatusBadge status={requirement.status} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Instancias esperadas" value={requirement.expected ?? "sin denominador"} />
        <SummaryCard label="Recopiladas" value={requirement.collected} />
        <SummaryCard label="Validadas" value={requirement.validated} />
      </div>

      {years.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Cobertura por periodo (SC-024)
          </h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <th className="px-3 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">Año</th>
                  {months.map((m) => (
                    <th key={m} className="px-2 py-2 text-center font-medium text-zinc-500 dark:text-zinc-400">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {years.map((year, yi) => (
                  <tr key={year} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                    <td className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">{year}</td>
                    {months.map((m, mi) => {
                      const idx = yi * 12 + mi;
                      const state =
                        idx < requirement.validated
                          ? "validated"
                          : idx < requirement.collected
                            ? "collected"
                            : "pending";
                      return (
                        <td key={m} className="p-1 text-center">
                          <div
                            title={`${year}-${String(mi + 1).padStart(2, "0")}`}
                            className={`mx-auto h-4 w-4 rounded-sm ${
                              state === "validated"
                                ? "bg-emerald-500"
                                : state === "collected"
                                  ? "bg-blue-400"
                                  : "bg-zinc-200 dark:bg-zinc-800"
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <Legend color="bg-emerald-500" label="Validado" />
            <Legend color="bg-blue-400" label="Recopilado" />
            <Legend color="bg-zinc-200 dark:bg-zinc-800" label="Pendiente" />
          </div>
        </div>
      )}

      <ConstructionNote fr="FR-100–FR-215" />
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${color}`} />
      {label}
    </span>
  );
}
