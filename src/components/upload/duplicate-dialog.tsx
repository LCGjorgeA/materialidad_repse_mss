"use client";

// FR-315 / DA-002: "sin exigir motivo en ninguna" de las dos opciones —
// vincular el existente, o cargar como copia adicional. Nunca se bloquea.
export function DuplicateDialog({
  existingDocument,
  linkedInstances,
  onChoose,
  onCancel,
  busy,
}: {
  existingDocument: { filename: string; uploadedAt: string };
  linkedInstances: { periodLabel: string; requirementReadableId: string }[];
  onChoose: (action: "link" | "upload-anyway") => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Este archivo ya está en el sistema
          </h2>
        </div>
        <div className="space-y-3 px-4 py-4 text-sm">
          <div>
            <div className="text-zinc-500 dark:text-zinc-400">Contenido idéntico a:</div>
            <div className="font-medium text-zinc-800 dark:text-zinc-200">
              {existingDocument.filename}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Subido el {new Date(existingDocument.uploadedAt).toLocaleDateString("es-MX")}
            </div>
          </div>
          {linkedInstances.length > 0 && (
            <div>
              <div className="text-zinc-500 dark:text-zinc-400">Vinculado a:</div>
              <ul className="mt-1 space-y-0.5">
                {linkedInstances.map((li, i) => (
                  <li key={i} className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    {li.requirementReadableId} · {li.periodLabel}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <button
            type="button"
            disabled={busy}
            onClick={() => onChoose("link")}
            className="rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:bg-brand-primary/90 disabled:opacity-50"
          >
            Vincular el documento existente a esta instancia
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onChoose("upload-anyway")}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Entregar de todas formas como documento distinto
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-md px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
