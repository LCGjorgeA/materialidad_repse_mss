import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { label: string; href?: string };

export function PageHeader({
  title,
  scCode,
  description,
  crumbs,
  actions,
}: {
  title: string;
  scCode?: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 border-b border-zinc-200 pb-5 dark:border-zinc-800">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Migas de pan" className="text-xs text-zinc-500 dark:text-zinc-400">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`}>
              {c.href ? (
                <Link href={c.href} className="hover:text-zinc-900 dark:hover:text-zinc-100">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span className="mx-1.5">›</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {scCode && (
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 font-mono text-[11px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              {scCode}
            </span>
          )}
        </div>
        {actions}
      </div>
      {description && (
        <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      )}
    </div>
  );
}
