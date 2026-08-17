export function ConstructionNote({ fr }: { fr?: string }) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">Skeleton — sin backend todavía.</span>{" "}
      Esta pantalla usa datos de ejemplo (<code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">src/lib/mock-data.ts</code>
      ). Se conecta a la API real en la Fase 1 del plan
      {fr && (
        <>
          {" "}
          (<span className="font-mono text-xs">{fr}</span>)
        </>
      )}
      .
    </div>
  );
}
