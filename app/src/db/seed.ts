/**
 * Semilla del Plan Macro (FR-009): 1 proyecto, 2 frentes, 11 áreas, 9 servicios
 * (con subservicios como process), tipos de información y roles.
 *
 * Fuente: docs/00_GLOSARIO.md §4. Ejecutar con: npx tsx src/db/seed.ts
 * Requiere DATABASE_URL apuntando a una base vacía o ya migrada.
 */
import { db } from "./client";
import { area, front, process as processTable, project } from "./schema/taxonomy";
import { informationType } from "./schema/catalog";
import { role } from "./schema/identity";

const ROLES = [
  { code: "admin", name: "Administrador / Dueño del Proyecto" },
  { code: "area_coordinator", name: "Coordinador de Área" },
  { code: "contributor", name: "Responsable / Colaborador" },
  { code: "validator", name: "Validador / Revisor" },
  { code: "viewer", name: "Consulta / Dirección" },
];

// Glosario §4.2 — Frente 1: Expediente MSS (11 áreas)
const EXPEDIENTE_AREAS = [
  ["01", "Corporativo y Legal", "01_Corporativo_y_Legal", "restricted"],
  ["02", "Contabilidad y EEFF", "02_Contabilidad_y_EEFF", "internal"],
  ["03", "Fiscal y Cumplimiento", "03_Fiscal_y_Cumplimiento", "restricted"],
  ["04", "Tesorería y Bancos", "04_Tesoreria_y_Bancos", "restricted"],
  ["05", "Proveedores y Pagos", "05_Proveedores_y_Pagos", "internal"],
  ["06", "Nómina y Laboral", "06_Nomina_y_Laboral", "confidential"],
  ["07", "Facturación y Cobranza", "07_Facturacion_y_Cobranza", "internal"],
  ["08", "Seguros y Activos", "08_Seguros_y_Activos", "internal"],
  ["09", "Sistemas y Respaldos", "09_Sistemas_y_Respaldos", "restricted"],
  ["10", "Estudios y Asesores", "10_Estudios_y_Asesores", "restricted"],
  ["11", "Cierre de MSS", "11_Cierre_de_MSS", "restricted"],
] as const;

// Glosario §4.3 — Frente 2: Materialidad de Servicios (9 servicios + subservicios semilla)
const MATERIALIDAD_SERVICIOS: Record<string, { folder: string; subservicios: string[] }> = {
  "Branding / Publicidad": {
    folder: "01_Branding_Publicidad",
    subservicios: ["Website y portal", "Redes sociales", "Creación interna de contenido", "Servicios de diseño"],
  },
  "Asesoría Legal Laboral": {
    folder: "02_Asesoria_Legal_Laboral",
    subservicios: ["Consultoría y defensa laboral", "Asesoría/documentación corporativa", "Propiedad intelectual"],
  },
  "Atracción de Talento": {
    folder: "03_Atraccion_de_Talento",
    subservicios: [
      "Atracción",
      "Selección y reclutamiento",
      "Cálculo de percepciones",
      "Medios sociales",
      "Seguros",
      "Cartas",
      "Onboarding y trainee",
    ],
  },
  "Soporte Técnico IT": {
    folder: "04_Soporte_Tecnico_IT",
    subservicios: ["Sitio web", "Soporte a usuarios", "Dominios", "Correo", "Repositorios", "Computadoras", "Aplicaciones internas"],
  },
  "Knowledge Management": {
    folder: "05_Knowledge_Management",
    subservicios: ["Casos de éxito/experiencia", "Cartas de recomendación", "Administración de KEEP"],
  },
  "Recursos Humanos": {
    folder: "06_Recursos_Humanos",
    subservicios: ["Evaluaciones y PID", "Capacitación", "Plan de carrera", "Vacaciones", "Comunicación interna"],
  },
  "Asignación y Logística": {
    folder: "07_Asignacion_y_Logistica",
    subservicios: ["Coordinación de viajes", "Tarifas aéreas", "Visas", "Planeación de recursos"],
  },
  Backoffice: {
    folder: "08_Backoffice",
    subservicios: [
      "Fondos/pagos",
      "Fees",
      "Facturación clientes",
      "SGMM",
      "Fiscal",
      "Tesorería",
      "Comisiones",
      "Viáticos",
      "Nómina",
    ],
  },
  "Estandarización e Innovación": {
    folder: "09_Estandarizacion_e_Innovacion",
    subservicios: ["Estandarización operativa", "Innovación operativa"],
  },
};

// Glosario §4.4 — tipos de información (extensiones/formato nativo se completan por admin después)
const INFORMATION_TYPES = [
  "contrato", "factura", "comprobante_pago", "estado_cuenta", "declaracion", "acuse",
  "poliza_contable", "poliza_seguro", "estado_financiero", "papel_de_trabajo",
  "base_calculo_excel", "reporte_sistema", "exportacion_datos", "correo", "entregable",
  "presentacion", "acta", "poder", "expediente_laboral", "recibo_nomina", "inventario",
  "backup", "evaluacion", "comunicacion", "otro",
];

function slug(code: string) {
  return code
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .toUpperCase()
    .slice(0, 32);
}

async function main() {
  console.log("Sembrando catálogos semilla (FR-009)...");

  const [proj] = await db
    .insert(project)
    .values({
      code: "MSS_CIERRE_2026",
      name: "Proyecto de cierre MSS 2026",
      status: "active",
      settings: {},
    })
    .returning();

  const [expediente] = await db
    .insert(front)
    .values({
      projectId: proj.id,
      code: "EXPEDIENTE_MSS",
      name: "Expediente MSS",
      folderSegment: "01_Expediente_MSS",
      displayOrder: 1,
    })
    .returning();

  const [materialidad] = await db
    .insert(front)
    .values({
      projectId: proj.id,
      code: "MATERIALIDAD",
      name: "Materialidad de Servicios",
      folderSegment: "02_Materialidad_Servicios",
      displayOrder: 2,
    })
    .returning();

  for (const [num, name, folder, sensitivity] of EXPEDIENTE_AREAS) {
    await db.insert(area).values({
      frontId: expediente.id,
      code: num,
      name,
      folderSegment: folder,
      displayOrder: Number(num),
      defaultSensitivity: sensitivity as (typeof area.$inferInsert)["defaultSensitivity"],
    });
  }

  let order = 1;
  for (const [name, def] of Object.entries(MATERIALIDAD_SERVICIOS)) {
    const [svc] = await db
      .insert(area)
      .values({
        frontId: materialidad.id,
        code: String(order).padStart(2, "0"),
        name,
        folderSegment: def.folder,
        displayOrder: order,
      })
      .returning();

    let subOrder = 1;
    for (const sub of def.subservicios) {
      await db.insert(processTable).values({
        areaId: svc.id,
        code: slug(`${order}_${subOrder}`),
        name: sub,
        folderSegment: sub.normalize("NFD").replace(/[0300-036f]/g, "").replace(/\s+/g, "_"),
        displayOrder: subOrder,
      });
      subOrder++;
    }
    order++;
  }

  for (const code of INFORMATION_TYPES) {
    await db.insert(informationType).values({
      code,
      name: code.replace(/_/g, " "),
    });
  }

  for (const r of ROLES) {
    await db.insert(role).values(r);
  }

  console.log("Semilla completa.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error sembrando catálogos:", err);
  process.exit(1);
});
