"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { projectStatus, sidebarCounts } from "@/lib/mock-data";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Image
          src="/brand/logo-lockup-dark.png"
          alt="London Consulting Group"
          width={480}
          height={116}
          priority
          className="h-6 w-auto dark:hidden"
        />
        <Image
          src="/brand/logo-lockup-light.png"
          alt="London Consulting Group"
          width={480}
          height={116}
          priority
          className="hidden h-6 w-auto dark:block"
        />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {(["main", "analytics", "admin"] as const).map((group, i) => (
          <div key={group} className={i > 0 ? "mt-2 space-y-0.5 border-t border-zinc-100 pt-2 dark:border-zinc-900" : "space-y-0.5"}>
            {NAV_ITEMS.filter((item) => (item.group ?? "main") === group).map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const count = item.badgeKey ? sidebarCounts[item.badgeKey] : undefined;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm leading-none transition-colors ${
                    isActive
                      ? "bg-brand-primary/[0.06] font-medium text-brand-primary before:absolute before:bottom-1 before:left-0 before:top-1 before:w-0.5 before:rounded-full before:bg-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent dark:before:bg-brand-accent"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  }`}
                >
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-[13px] leading-none">
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {count !== undefined && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
                        isActive
                          ? "bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/15 dark:text-brand-accent"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-200 p-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <div className="font-medium text-zinc-700 dark:text-zinc-300">{projectStatus.name}</div>
        <div>Cierre: {projectStatus.targetCloseDate}</div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-brand-accent"
            style={{ width: `${projectStatus.completenessPct}%` }}
          />
        </div>
        <div className="mt-1 tabular-nums">{projectStatus.completenessPct}% completo</div>
      </div>
    </aside>
  );
}
