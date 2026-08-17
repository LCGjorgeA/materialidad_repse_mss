import type { ReactNode } from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

// Shell persistente de toda la app autenticada (docs/02_UX_UI_FLUJOS.md §2).
// Sin control de acceso todavía — Entra ID / Auth.js llega en la Fase 4 del plan.
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-zinc-50 px-6 py-6 dark:bg-zinc-900/40">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
