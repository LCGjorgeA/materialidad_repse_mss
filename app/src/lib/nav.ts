/**
 * Fuente única de la navegación principal — refleja docs/02_UX_UI_FLUJOS.md §1-2.
 * Los contadores (`badgeKey`) son de trabajo pendiente DEL USUARIO, no totales del
 * sistema (regla de navegación §2). Hoy no hay backend: se muestran con mock-data.ts.
 */
export type NavItem = {
  href: string;
  label: string;
  icon: string;
  scCode: string;
  badgeKey?: "miTrabajo" | "validacion" | "excepciones" | "reconciliacion";
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: "⌂", scCode: "SC-001" },
  { href: "/mi-trabajo", label: "Mi trabajo", icon: "☑", scCode: "SC-030", badgeKey: "miTrabajo" },
  { href: "/inventario", label: "Inventario Maestro", icon: "▤", scCode: "SC-020" },
  { href: "/validacion", label: "Validación", icon: "✓", scCode: "SC-040", badgeKey: "validacion" },
  { href: "/excepciones", label: "Excepciones", icon: "⚠", scCode: "SC-050", badgeKey: "excepciones" },
  { href: "/reconciliacion", label: "Reconciliación", icon: "⟳", scCode: "SC-070", badgeKey: "reconciliacion" },
  { href: "/busqueda", label: "Búsqueda", icon: "🔍", scCode: "SC-060" },
  { href: "/analitica", label: "Analítica", icon: "▮", scCode: "SC-010" },
  { href: "/cierre", label: "Cierre", icon: "🔒", scCode: "SC-100" },
  { href: "/administracion", label: "Administración", icon: "⚙", scCode: "SC-080" },
];

export const ADMIN_SECTIONS = [
  { slug: "taxonomia", label: "Taxonomía", scCode: "SC-080" },
  { slug: "usuarios-roles", label: "Usuarios y roles", scCode: "SC-081" },
  { slug: "rutas-nombres", label: "Rutas y nombres", scCode: "SC-082" },
  { slug: "catalogos", label: "Catálogos", scCode: "SC-083" },
  { slug: "sharepoint", label: "Conexión SharePoint", scCode: "SC-084" },
  { slug: "validacion-excepciones", label: "Validación y excepciones", scCode: "SC-085" },
  { slug: "salud-operativa", label: "Salud operativa", scCode: "SC-086" },
] as const;
