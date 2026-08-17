import Link from "next/link";
import type { ReactNode } from "react";

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
};

export function DataTable<T>({
  columns,
  rows,
  rowHref,
  emptyLabel = "Sin registros.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowHref?: (row: T) => string;
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-2.5 font-medium ${col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const href = rowHref?.(row);
            const cells = columns.map((col) => (
              <td
                key={col.header}
                className={`px-4 py-2.5 text-zinc-700 dark:text-zinc-300 ${col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.cell(row)}
              </td>
            ));
            const rowClass =
              "border-b border-zinc-100 last:border-0 dark:border-zinc-900" +
              (href ? " hover:bg-zinc-50 dark:hover:bg-zinc-900/60" : "");

            return href ? (
              <tr key={i} className={rowClass}>
                {columns.map((col, j) => (
                  <td
                    key={col.header}
                    className={`px-0 py-0 ${col.align === "right" ? "text-right" : "text-left"}`}
                  >
                    <Link href={href} className="block px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                      {col.cell(row)}
                    </Link>
                  </td>
                ))}
              </tr>
            ) : (
              <tr key={i} className={rowClass}>
                {cells}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
