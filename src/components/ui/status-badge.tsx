const STYLES: Record<string, string> = {
  // collection_status / validation_status (Glosario §1.5)
  pending_collection: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  in_collection: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  collected: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  pending_validation: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  validated: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  partial: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  not_obtained: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  // requirement/exception status
  active: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  closed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  draft: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  retired: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 line-through",
  proposed: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  under_review: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  mitigated: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

const LABELS: Record<string, string> = {
  pending_collection: "Pendiente de recopilar",
  in_collection: "En recopilación",
  collected: "Recopilado",
  pending_validation: "Pendiente de validar",
  validated: "Validado",
  partial: "Parcial",
  not_obtained: "No obtenido",
  active: "Activo",
  closed: "Cerrado",
  draft: "Borrador",
  retired: "De baja",
  proposed: "Propuesta",
  under_review: "En revisión",
  approved: "Aprobada",
  rejected: "Rechazada",
  mitigated: "Mitigada",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        STYLES[status] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
