import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ConstructionNote } from "@/components/ui/construction-note";
import { ADMIN_SECTIONS } from "@/lib/nav";

export function generateStaticParams() {
  return ADMIN_SECTIONS.map((s) => ({ section: s.slug }));
}

// SC-080–SC-086 — módulo M10 (FR-900–FR-999).
export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const meta = ADMIN_SECTIONS.find((s) => s.slug === section);
  if (!meta) notFound();

  return (
    <>
      <PageHeader
        title={meta.label}
        scCode={meta.scCode}
        crumbs={[{ label: "Administración", href: "/administracion" }, { label: meta.label }]}
      />
      <ConstructionNote fr="FR-900–FR-999" />
    </>
  );
}
