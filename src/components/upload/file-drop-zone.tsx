"use client";

import { useRef, useState } from "react";

// SC-032: "Arrastra el archivo aquí o [Selecciona…]".
export function FileDropZone({
  onFileSelected,
  disabled,
}: {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        disabled
          ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/40"
          : isDragOver
            ? "border-brand-accent bg-brand-mint/20 dark:border-brand-accent dark:bg-brand-accent/10"
            : "border-zinc-300 bg-white hover:border-brand-accent/60 dark:border-zinc-700 dark:bg-zinc-950"
      }`}
    >
      <div className="text-3xl">📄</div>
      <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Arrastra el archivo aquí o
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-3 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Selecciona…
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
