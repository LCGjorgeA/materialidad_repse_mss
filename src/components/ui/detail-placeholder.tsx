export function DetailPlaceholder({ sections }: { sections: string[] }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {sections.map((s, i) => (
        <div
          key={s}
          className={`px-4 py-3.5 text-sm text-zinc-500 dark:text-zinc-400 ${
            i < sections.length - 1 ? "border-b border-zinc-100 dark:border-zinc-900" : ""
          }`}
        >
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{s}</span>
          <span className="ml-2 text-zinc-400 dark:text-zinc-600">— por implementar</span>
        </div>
      ))}
    </div>
  );
}
