import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { requirement } from "./requirement";
import { appUser } from "./identity";
import {
  collectionStatusEnum,
  statusHistoryFieldEnum,
  statusSourceEnum,
  validationStatusEnum,
} from "./enums";

// §3.2 evidence_instance — "la tabla más consultada del sistema" (04_MODELO_DATOS_API.md).
// P-1: es aquí donde vive el estatus y el denominador de cobertura, nunca en requirement.
export const evidenceInstance = pgTable(
  "evidence_instance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requirementId: uuid("requirement_id")
      .notNull()
      .references(() => requirement.id, { onDelete: "restrict" }),
    // "2021-03", "2021-Q2", "2021", "Permanente", o etiqueta del driver (FR-202).
    periodLabel: varchar("period_label", { length: 60 }).notNull(),
    periodStart: date("period_start"),
    periodEnd: date("period_end"),
    driverKey: varchar("driver_key", { length: 200 }),
    driverLabel: varchar("driver_label", { length: 300 }),
    collectionStatus: collectionStatusEnum("collection_status")
      .notNull()
      .default("pending_collection"),
    // 'derived' desde componentes obligatorios; 'manual' en requisitos progressive (DA-001).
    statusSource: statusSourceEnum("status_source").notNull().default("derived"),
    validationStatus: validationStatusEnum("validation_status")
      .notNull()
      .default("pending_validation"),
    responsibleId: uuid("responsible_id").references(() => appUser.id), // sobrescribe el del requisito (FR-301)
    dueDate: date("due_date"),
    isOverdue: boolean("is_overdue").notNull().default(false), // calculado por job (FR-215)
    outOfScope: boolean("out_of_scope").notNull().default(false), // excluye del denominador (FR-204, FR-207)
    outOfScopeReason: text("out_of_scope_reason"),
    isManual: boolean("is_manual").notNull().default(false), // agregada a mano (FR-206)
    manualReason: text("manual_reason"),
    forcedCollected: boolean("forced_collected").notNull().default(false), // FR-214
    forcedReason: text("forced_reason"),
    collectedAt: timestamp("collected_at", { withTimezone: true }),
    collectedByUserId: uuid("collected_by_user_id").references(() => appUser.id),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
    validatedByUserId: uuid("validated_by_user_id").references(() => appUser.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Idempotencia de la generación de instancias (§9 del modelo de datos).
    uniqueIndex("uq_instance").on(t.requirementId, t.periodLabel, t.driverKey),
    index("ix_inst_req").on(t.requirementId, t.periodStart),
    index("ix_inst_status")
      .on(t.collectionStatus, t.validationStatus)
      .where(sql`NOT ${t.outOfScope}`),
    index("ix_inst_resp")
      .on(t.responsibleId, t.dueDate)
      .where(sql`NOT ${t.outOfScope}`),
    // Cola de validación (FR-500-503).
    index("ix_inst_queue")
      .on(t.validationStatus, t.collectedAt)
      .where(sql`${t.collectionStatus} = 'collected' AND ${t.validationStatus} = 'pending_validation'`),
    index("ix_inst_period").on(t.periodStart, t.periodEnd).where(sql`NOT ${t.outOfScope}`),

    check(
      "ck_inst_oos",
      sql`NOT ${t.outOfScope} OR ${t.outOfScopeReason} IS NOT NULL`
    ),
    check("ck_inst_manual", sql`NOT ${t.isManual} OR ${t.manualReason} IS NOT NULL`),
    check("ck_inst_forced", sql`NOT ${t.forcedCollected} OR ${t.forcedReason} IS NOT NULL`),
    // No se puede validar lo que no está recopilado.
    check(
      "ck_inst_flow",
      sql`${t.collectionStatus} = 'collected' OR ${t.validationStatus} = 'pending_validation'`
    ),
  ]
);

// Padrón cargado que da denominador a periodicidades no enumerables (FR-114).
export const driverListItem = pgTable(
  "driver_list_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requirementId: uuid("requirement_id")
      .notNull()
      .references(() => requirement.id, { onDelete: "cascade" }),
    driverKey: varchar("driver_key", { length: 200 }).notNull(),
    driverLabel: varchar("driver_label", { length: 300 }).notNull(),
    attributes: jsonb("attributes").notNull().default({}),
    importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
    importedByUserId: uuid("imported_by_user_id")
      .notNull()
      .references(() => appUser.id),
  },
  (t) => [uniqueIndex("uq_driver_item").on(t.requirementId, t.driverKey)]
);

// Cada transición de estatus de una instancia (FR-924). Complementa audit_event
// con una vista optimizada para la línea de tiempo de la ficha de instancia.
export const statusHistory = pgTable("status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  evidenceInstanceId: uuid("evidence_instance_id")
    .notNull()
    .references(() => evidenceInstance.id, { onDelete: "restrict" }),
  field: statusHistoryFieldEnum("field").notNull(), // 'collection' | 'validation'
  fromStatus: varchar("from_status", { length: 40 }),
  toStatus: varchar("to_status", { length: 40 }).notNull(),
  changedById: uuid("changed_by_id").references(() => appUser.id),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  reason: text("reason"),
  sourceEntity: varchar("source_entity", { length: 60 }),
  sourceId: uuid("source_id"),
});
