"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileDropZone } from "./file-drop-zone";
import { DuplicateDialog } from "./duplicate-dialog";

type ComponentOption = { id: string; role: string; label: string; isMandatory: boolean };

type PreviewResult = {
  targetPath: string;
  proposedFilename: string;
  originalFilename: string;
  extensionWarning: string | null;
};

type DuplicateInfo = {
  existingDocument: { documentId: string; filename: string; uploadedAt: string };
  linkedInstances: { instanceId: string; periodLabel: string; requirementReadableId: string }[];
};

type Stage =
  | { name: "idle" }
  | { name: "previewing" }
  | { name: "ready"; preview: PreviewResult }
  | { name: "uploading"; preview: PreviewResult }
  | { name: "duplicate"; preview: PreviewResult; duplicate: DuplicateInfo }
  | { name: "success"; collectionStatus: string }
  | { name: "error"; message: string };

// Orquesta SC-032: selección → preview (FR-311) → confirmar → subir (FR-310) →
// si hay duplicado, el diálogo de FR-315 decide cómo continuar.
export function UploadForm({
  instanceId,
  components,
}: {
  instanceId: string;
  components: ComponentOption[];
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>({ name: "idle" });
  const [filename, setFilename] = useState("");
  const [roleId, setRoleId] = useState<string>(
    components.find((c) => c.isMandatory)?.id ?? components[0]?.id ?? ""
  );

  const selectedRole = components.find((c) => c.id === roleId);

  async function handleFileSelected(selected: File) {
    setFile(selected);
    setStage({ name: "previewing" });
    try {
      const res = await fetch("/api/documents/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceId,
          originalFilename: selected.name,
          sizeBytes: selected.size,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "No se pudo calcular la ruta destino.");
      }
      const preview: PreviewResult = await res.json();
      setFilename(preview.proposedFilename);
      setStage({ name: "ready", preview });
    } catch (err) {
      setStage({ name: "error", message: (err as Error).message });
    }
  }

  async function submit(duplicateAction?: "link" | "upload-anyway") {
    if (!file || (stage.name !== "ready" && stage.name !== "duplicate")) return;
    const preview = stage.preview;
    setStage({ name: "uploading", preview });

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("instanceId", instanceId);
      formData.set("role", selectedRole?.role ?? "principal");
      if (selectedRole) formData.set("requirementComponentId", selectedRole.id);
      formData.set("confirmedFilename", filename);
      if (duplicateAction) formData.set("duplicateAction", duplicateAction);

      const res = await fetch("/api/documents/upload", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setStage({
          name: "duplicate",
          preview,
          duplicate: { existingDocument: body.existingDocument, linkedInstances: body.linkedInstances },
        });
        return;
      }
      if (!res.ok) throw new Error(body.message ?? "No se pudo completar la entrega.");

      setStage({ name: "success", collectionStatus: body.instanceCollectionStatus });
      router.refresh();
    } catch (err) {
      setStage({ name: "error", message: (err as Error).message });
    }
  }

  if (stage.name === "success") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300">
        ✓ Documento entregado. Estatus de recopilación de la instancia:{" "}
        <span className="font-medium">{stage.collectionStatus}</span>.
        <button
          type="button"
          onClick={() => {
            setFile(null);
            setStage({ name: "idle" });
          }}
          className="ml-3 underline"
        >
          Entregar otro documento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stage.name === "idle" || stage.name === "previewing" ? (
        <FileDropZone onFileSelected={handleFileSelected} disabled={stage.name === "previewing"} />
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span>✓</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{file?.name}</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              · {((file?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>

          {components.length > 0 && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
                Papel en la instancia
              </span>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={stage.name === "uploading"}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                {components.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} {c.isMandatory ? "(obligatorio)" : "(opcional)"}
                  </option>
                ))}
              </select>
            </label>
          )}

          {"preview" in stage && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Destino en SharePoint</div>
              <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {stage.preview.targetPath}/
              </div>
              <label className="mt-2 block">
                <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Nombre</span>
                <input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  disabled={stage.name === "uploading"}
                  className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <div className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                Original: {stage.preview.originalFilename} (se conserva como metadato)
              </div>
              {stage.preview.extensionWarning && (
                <div className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                  ⚠ {stage.preview.extensionWarning}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {stage.name === "error" ? (
              <button
                type="button"
                onClick={() => file && handleFileSelected(file)}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Reintentar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submit()}
                disabled={stage.name === "uploading"}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {stage.name === "uploading" ? "Entregando…" : "Entregar"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setStage({ name: "idle" });
              }}
              disabled={stage.name === "uploading"}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancelar
            </button>
          </div>
        </>
      )}

      {stage.name === "error" && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
          {stage.message}
        </div>
      )}

      {stage.name === "duplicate" && (
        <DuplicateDialog
          existingDocument={stage.duplicate.existingDocument}
          linkedInstances={stage.duplicate.linkedInstances}
          onChoose={(action) => submit(action)}
          onCancel={() => setStage({ name: "ready", preview: stage.preview })}
        />
      )}
    </div>
  );
}
