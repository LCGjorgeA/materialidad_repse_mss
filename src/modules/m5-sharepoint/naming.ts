/**
 * Resolución de ruta y nombre propuestos — FR-311, FR-440–FR-446, Glosario §5.2/§5.3.
 *
 * Alcance de esta iteración (ver plan "Carga de documentos"): subconjunto de
 * tokens {frente}/{area}/{proceso}/{aaaa}/{mm}, sin {referencia:<tipo>} (depende
 * de related_reference, que no existe todavía). Sin path_template/naming_rule
 * configurables (FR-440/FR-445) — la regla es fija por ahora; cuando se
 * construyan esas tablas, esta función es el punto de reemplazo.
 *
 * No hace llamadas a Graph — eso es Fase 4. Solo calcula strings.
 */

const INVALID_SHAREPOINT_CHARS = /["*:<>?/\\|]/g;

/** FR-443: sin acentos, sin caracteres inválidos de SharePoint, espacios a guion bajo. */
export function normalizeSegment(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(INVALID_SHAREPOINT_CHARS, "")
    .trim()
    .replace(/\s+/g, "_");
}

/** Convierte un nombre libre (p. ej. "Tesorería y Bancos") en un token de nombre de archivo sin separadores ("TesoreriaYBancos"), como en los ejemplos de Glosario §5.3. */
export function toFilenameToken(input: string): string {
  return normalizeSegment(input)
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 && dot < filename.length - 1 ? filename.slice(dot + 1).toLowerCase() : "";
}

export type ResolveDestinationInput = {
  frontFolderSegment: string;
  areaFolderSegment: string;
  areaName: string;
  processFolderSegment: string;
  processName: string;
  /** valor de periodicityEnum del requisito */
  periodicity: string;
  /** evidence_instance.period_label, p. ej. "2021-03" o "Permanente" */
  periodLabel: string;
  /** evidence_instance.period_start, si existe */
  periodStart: Date | string | null;
  informationTypeName: string;
  originalFilename: string;
  /** documentVersion.versionNumber — el sufijo _vXX solo aparece desde la v2 (Glosario §5.3) */
  versionNumber?: number;
};

export type ResolvedDestination = {
  pathSegments: string[];
  proposedFilename: string;
  extension: string;
};

export function resolveDestination(input: ResolveDestinationInput): ResolvedDestination {
  const extension = extensionOf(input.originalFilename);
  const isPermanent = input.periodicity === "permanent";

  let dateToken: string | null = null;
  let periodPathSegments: string[];

  if (isPermanent) {
    periodPathSegments = ["00_Permanente"];
  } else {
    const parsed = parsePeriod(input.periodStart, input.periodLabel);
    periodPathSegments = parsed ? [parsed.yyyy, parsed.mm] : [];
    dateToken = parsed ? `${parsed.yyyy}-${parsed.mm}` : null;
  }

  const pathSegments = [
    input.frontFolderSegment,
    input.areaFolderSegment,
    input.processFolderSegment,
    ...periodPathSegments,
  ]
    .filter(Boolean)
    .map(normalizeSegment);

  const filenameParts = [
    dateToken,
    toFilenameToken(input.areaName),
    toFilenameToken(input.processName),
    toFilenameToken(input.informationTypeName),
  ].filter((p): p is string => Boolean(p));

  const versionSuffix =
    input.versionNumber && input.versionNumber >= 2
      ? `_v${String(input.versionNumber).padStart(2, "0")}`
      : "";

  const base = filenameParts.join("_") + versionSuffix;
  const proposedFilename = extension ? `${base}.${extension}` : base;

  return { pathSegments, proposedFilename, extension };
}

function parsePeriod(
  periodStart: Date | string | null,
  periodLabel: string
): { yyyy: string; mm: string } | null {
  if (periodStart) {
    const d = typeof periodStart === "string" ? new Date(periodStart) : periodStart;
    if (!Number.isNaN(d.getTime())) {
      return { yyyy: String(d.getUTCFullYear()), mm: String(d.getUTCMonth() + 1).padStart(2, "0") };
    }
  }
  // Respaldo: period_label tipo "2021-03" o "2021-Q2" (usa el primer mes del trimestre).
  const monthly = /^(\d{4})-(\d{2})$/.exec(periodLabel);
  if (monthly) return { yyyy: monthly[1], mm: monthly[2] };
  const quarterly = /^(\d{4})-Q(\d)$/.exec(periodLabel);
  if (quarterly) {
    const q = Number(quarterly[2]);
    return { yyyy: quarterly[1], mm: String((q - 1) * 3 + 1).padStart(2, "0") };
  }
  return null;
}
