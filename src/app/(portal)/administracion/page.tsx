import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ADMIN_SECTIONS } from "@/lib/nav";

// Administración — índice de SC-080 a SC-086.
export default function AdministracionPage() {
  return (
    <>
      <PageHeader
        title="Administración"
        description="Configuración de taxonomía, usuarios y roles, rutas y nombres, catálogos, SharePoint y salud operativa."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.map((s) => (
          <Link
            key={s.slug}
            href={`/administracion/${s.slug}`}
            className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{s.label}</span>
              <span className="rounded-full border border-zinc-200 px-2 py-0.5 font-mono text-[11px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                {s.scCode}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
