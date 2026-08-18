import Link from "next/link";

export function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex-1">
        <label className="relative block max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
            🔍
          </span>
          <input
            type="search"
            placeholder="Buscar en todo el proyecto…"
            disabled
            className="w-full cursor-not-allowed rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-3 text-sm text-zinc-500 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </label>
      </div>

      <Link
        href="/perfil/notificaciones"
        className="relative rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        aria-label="Notificaciones"
      >
        🔔
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
          3
        </span>
      </Link>

      <Link
        href="/perfil"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-xs font-medium text-white dark:bg-brand-accent dark:text-zinc-950">
          JG
        </span>
        <span className="hidden sm:inline">Jorge González</span>
      </Link>
    </header>
  );
}
