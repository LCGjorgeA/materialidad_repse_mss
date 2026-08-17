/**
 * Datos de demostración para probar la carga de documentos (SC-032) sin
 * esperar al servicio de generación de instancias (todavía no existe).
 *
 * Crea: un app_user de desarrollo (stub de sesión, ver src/lib/current-user.ts),
 * un proceso + actividad bajo el área "Tesorería y Bancos" (la semilla de
 * taxonomía solo trae hasta área), un requisito mensual de ejemplo con dos
 * requirement_component, y unas cuantas evidence_instance insertadas a mano.
 *
 * Idempotente: cada inserción verifica existencia antes de crear.
 * Ejecutar con: npm run db:seed-demo (requiere haber corrido db:seed antes).
 */
import { eq, and } from "drizzle-orm";
import { db } from "./client";
import { front, area, process as processTable, activity } from "./schema/taxonomy";
import { informationType } from "./schema/catalog";
import { appUser } from "./schema/identity";
import { requirement, requirementComponent } from "./schema/requirement";
import { evidenceInstance } from "./schema/instance";
import { DEV_STUB_ENTRA_OBJECT_ID } from "../lib/current-user";

async function main() {
  console.log("Sembrando datos de demostración...");

  // 1. app_user de desarrollo
  let [devUser] = await db
    .select()
    .from(appUser)
    .where(eq(appUser.entraObjectId, DEV_STUB_ENTRA_OBJECT_ID))
    .limit(1);
  if (!devUser) {
    [devUser] = await db
      .insert(appUser)
      .values({
        entraObjectId: DEV_STUB_ENTRA_OBJECT_ID,
        email: "jorge.agonzalez@londoncg.mx",
        displayName: "Jorge González",
      })
      .returning();
    console.log("  app_user de desarrollo creado.");
  }

  // 2. Área Tesorería y Bancos (semilla de taxonomía, Expediente MSS)
  const [expedienteFront] = await db.select().from(front).where(eq(front.code, "EXPEDIENTE_MSS")).limit(1);
  if (!expedienteFront) {
    throw new Error("No existe el frente EXPEDIENTE_MSS. Corre `npm run db:seed` primero.");
  }
  const [tesoreriaArea] = await db
    .select()
    .from(area)
    .where(and(eq(area.frontId, expedienteFront.id), eq(area.code, "04")))
    .limit(1);
  if (!tesoreriaArea) {
    throw new Error("No existe el área 04 (Tesorería y Bancos). Corre `npm run db:seed` primero.");
  }

  // 3. Proceso + actividad de ejemplo (la semilla de taxonomía no baja hasta ahí para Expediente MSS)
  let [tesoreriaProcess] = await db
    .select()
    .from(processTable)
    .where(and(eq(processTable.areaId, tesoreriaArea.id), eq(processTable.code, "TES")))
    .limit(1);
  if (!tesoreriaProcess) {
    [tesoreriaProcess] = await db
      .insert(processTable)
      .values({
        areaId: tesoreriaArea.id,
        code: "TES",
        name: "Tesorería",
        folderSegment: "Tesoreria",
        displayOrder: 1,
      })
      .returning();
  }

  let [pagoActivity] = await db
    .select()
    .from(activity)
    .where(and(eq(activity.processId, tesoreriaProcess.id), eq(activity.code, "BANCOS")))
    .limit(1);
  if (!pagoActivity) {
    [pagoActivity] = await db
      .insert(activity)
      .values({
        processId: tesoreriaProcess.id,
        code: "BANCOS",
        name: "Conciliación bancaria",
        folderSegment: "Conciliacion_Bancaria",
        displayOrder: 1,
      })
      .returning();
  }

  // 4. Tipo de información "estado_cuenta" (sembrado por db:seed)
  const [estadoCuentaType] = await db
    .select()
    .from(informationType)
    .where(eq(informationType.code, "estado_cuenta"))
    .limit(1);
  if (!estadoCuentaType) {
    throw new Error("No existe el tipo de información 'estado_cuenta'. Corre `npm run db:seed` primero.");
  }

  // 5. Requisito de ejemplo — el mismo caso ilustrativo del Glosario §1.2
  let [demoRequirement] = await db
    .select()
    .from(requirement)
    .where(eq(requirement.readableId, "EXP-04-TES-0001"))
    .limit(1);
  if (!demoRequirement) {
    [demoRequirement] = await db
      .insert(requirement)
      .values({
        readableId: "EXP-04-TES-0001",
        activityId: pagoActivity.id,
        name: "Estado de cuenta Banorte 1234",
        description:
          "Estado de cuenta bancario mensual de la cuenta Banorte 1234, para reconstruir la operación histórica de tesorería.",
        informationTypeId: estadoCuentaType.id,
        periodicity: "monthly",
        periodStart: "2020-01-01",
        periodEnd: "2026-12-31",
        expectedExtensions: ["pdf"],
        sensitivity: "restricted",
        status: "active",
        createdByUserId: devUser.id,
      })
      .returning();

    await db.insert(requirementComponent).values([
      {
        requirementId: demoRequirement.id,
        role: "principal",
        label: "Estado de cuenta bancario",
        isMandatory: true,
        displayOrder: 0,
      },
      {
        requirementId: demoRequirement.id,
        role: "anexo",
        label: "Nota aclaratoria (si aplica)",
        isMandatory: false,
        displayOrder: 1,
      },
    ]);
    console.log("  Requisito de demostración creado: EXP-04-TES-0001");
  }

  // 6. Unas cuantas instancias a mano (no generadas por servicio — ese es Opción A, pendiente)
  const demoPeriods = [
    { label: "2021-01", start: "2021-01-01", end: "2021-01-31" },
    { label: "2021-02", start: "2021-02-01", end: "2021-02-28" },
    { label: "2021-03", start: "2021-03-01", end: "2021-03-31" },
    { label: "2021-04", start: "2021-04-01", end: "2021-04-30" },
  ];

  for (const period of demoPeriods) {
    const [existing] = await db
      .select()
      .from(evidenceInstance)
      .where(
        and(
          eq(evidenceInstance.requirementId, demoRequirement.id),
          eq(evidenceInstance.periodLabel, period.label)
        )
      )
      .limit(1);
    if (existing) continue;

    const [inserted] = await db
      .insert(evidenceInstance)
      .values({
        requirementId: demoRequirement.id,
        periodLabel: period.label,
        periodStart: period.start,
        periodEnd: period.end,
      })
      .returning();
    console.log(`  Instancia creada: ${period.label} → ${inserted.id}`);
  }

  console.log("Demostración lista. Navega a /mi-trabajo/<instanceId> con uno de los IDs de arriba.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error sembrando datos de demostración:", err);
  process.exit(1);
});
