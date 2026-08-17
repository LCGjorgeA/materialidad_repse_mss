/**
 * MOCK — no hay backend todavía (Fase 1 en curso). Todo lo de este archivo se
 * reemplaza por llamadas reales a la API descrita en docs/04_MODELO_DATOS_API.md
 * §13-25. Los números y nombres son ilustrativos, tomados de los ejemplos de
 * docs/00_GLOSARIO.md y docs/01_PRD.md para que el skeleton se sienta representativo.
 */

export const sidebarCounts = {
  miTrabajo: 12,
  validacion: 8,
  excepciones: 3,
  reconciliacion: 5,
};

export const projectStatus = {
  name: "Proyecto MSS 2026",
  targetCloseDate: "2026-12-31",
  completenessPct: 58,
};

// FR-710/711 — indicadores del tablero de proyecto, sobre instancias.
export const projectKpis = [
  { label: "Requisitos totales", value: 214, hint: "Inventario Maestro" },
  { label: "Instancias esperadas", value: 8_412, hint: "Denominador de cobertura" },
  { label: "Instancias recopiladas", value: 4_927, hint: "58.6 % del total" },
  { label: "Instancias validadas", value: 3_801, hint: "45.2 % del total" },
  { label: "Excepciones abiertas", value: 17, hint: "Requieren validador final" },
  { label: "Requisitos cerrados", value: 22, hint: "de 214" },
];

// FR-712/713 — desglose por frente y área/servicio.
export const areaProgress = [
  { area: "Tesorería y Bancos", front: "Expediente MSS", collectionPct: 71, validationPct: 54, open: false },
  { area: "Fiscal y Cumplimiento", front: "Expediente MSS", collectionPct: 40, validationPct: 22, open: false },
  { area: "Nómina y Laboral", front: "Expediente MSS", collectionPct: 63, validationPct: 48, open: false },
  { area: "Corporativo y Legal", front: "Expediente MSS", collectionPct: 88, validationPct: 80, open: false },
  { area: "Atracción de Talento", front: "Materialidad de Servicios", collectionPct: 35, validationPct: 18, open: true },
  { area: "Backoffice", front: "Materialidad de Servicios", collectionPct: 52, validationPct: 30, open: false },
];

// FR-120/122 — Inventario Maestro, ejemplo con el caso "84 instancias" del Glosario §1.2.
export const requirements = [
  {
    readableId: "EXP-04-TES-0017",
    name: "Estado de cuenta Banorte 1234",
    area: "Tesorería y Bancos",
    periodicity: "monthly",
    expected: 84,
    collected: 40,
    validated: 31,
    status: "active",
  },
  {
    readableId: "EXP-03-FIS-0004",
    name: "Declaración anual ISR",
    area: "Fiscal y Cumplimiento",
    periodicity: "annual",
    expected: 7,
    collected: 5,
    validated: 4,
    status: "active",
  },
  {
    readableId: "MAT-03-ATR-0012",
    name: "Pipeline de candidatos",
    area: "Atracción de Talento",
    periodicity: "per_event",
    expected: null,
    collected: 14,
    validated: 9,
    status: "active",
  },
  {
    readableId: "EXP-01-COR-0001",
    name: "Acta constitutiva y modificaciones",
    area: "Corporativo y Legal",
    periodicity: "permanent",
    expected: 1,
    collected: 1,
    validated: 1,
    status: "closed",
  },
];

// FR-305 — lista de trabajo del usuario en sesión.
export const myWorkItems = [
  { instanceId: "i-1", requirement: "EXP-04-TES-0017", period: "2022-03", dueDate: "2026-08-22", status: "in_collection" },
  { instanceId: "i-2", requirement: "EXP-04-TES-0017", period: "2022-04", dueDate: "2026-08-22", status: "pending_collection" },
  { instanceId: "i-3", requirement: "EXP-06-NOM-0031", period: "2021-11", dueDate: "2026-08-10", status: "pending_collection" },
  { instanceId: "i-4", requirement: "MAT-08-BAK-0007", period: "2023-Q2", dueDate: "2026-09-01", status: "in_collection" },
];

// FR-500/501 — cola de validación.
export const validationQueue = [
  { instanceId: "v-1", requirement: "EXP-04-TES-0017", period: "2022-01", area: "Tesorería y Bancos", waitingSince: "2026-08-14", critical: true },
  { instanceId: "v-2", requirement: "EXP-02-CON-0009", period: "2023-05", area: "Contabilidad y EEFF", waitingSince: "2026-08-15", critical: false },
  { instanceId: "v-3", requirement: "MAT-06-RH-0002", period: "2024-Q1", area: "Recursos Humanos", waitingSince: "2026-08-16", critical: false },
];

// FR-520/527 — registro de excepciones.
export const exceptions = [
  { exceptionId: "e-1", requirement: "EXP-04-TES-0017", impact: "high", status: "proposed", proposedBy: "Coordinador Tesorería" },
  { exceptionId: "e-2", requirement: "MAT-03-ATR-0012", impact: "medium", status: "under_review", proposedBy: "Coordinador Talento" },
  { exceptionId: "e-3", requirement: "EXP-06-NOM-0031", impact: "low", status: "approved", proposedBy: "Coordinador Nómina" },
];

// FR-421/422 — colas de reconciliación (camino C).
export const orphanFiles = [
  { path: "01_Expediente_MSS/04_Tesoreria_y_Bancos/2022/07/estado_cuenta.pdf", detectedAt: "2026-08-15" },
  { path: "02_Materialidad_Servicios/06_Recursos_Humanos/evaluacion_q1.xlsx", detectedAt: "2026-08-16" },
];

export const brokenLinks = [
  { document: "2021-03_Tesoreria_EdoCuenta_Banorte1234.pdf", requirement: "EXP-04-TES-0017", detectedAt: "2026-08-16" },
];

// FR-540/544 — criterios de cierre a nivel proyecto.
export const closureCriteria = [
  { label: "Ambos frentes con requisitos validados o con excepción aprobada", met: false },
  { label: "Repositorio y respaldo de base de datos verificados", met: true },
  { label: "Versión final del Inventario Maestro generada", met: false },
  { label: "Registro de excepciones consolidado", met: false },
];
