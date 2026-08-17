import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { activity } from "./taxonomy";
import { appUser } from "./identity";
import { informationType } from "./catalog";
import {
  denominatorBasisEnum,
  enumerationStatusEnum,
  periodicityEnum,
  requirementStatusEnum,
  sensitivityEnum,
} from "./enums";

// §3.2 Núcleo del inventario — 04_MODELO_DATOS_API.md
// P-1: Requisito ≠ Instancia ≠ Documento. Este es el nivel de *definición*.

export const requirement = pgTable(
  "requirement",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Estable ante edición y movimiento (FR-101). Formato {FRENTE}-{AREA}-{PROCESO}-{consecutivo}.
    readableId: varchar("readable_id", { length: 40 }).notNull().unique(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activity.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 300 }).notNull(),
    description: text("description").notNull(),
    informationTypeId: uuid("information_type_id")
      .notNull()
      .references(() => informationType.id),
    periodicity: periodicityEnum("periodicity").notNull(),
    periodStart: date("period_start"),
    periodEnd: date("period_end"),
    // DA-001: progressive es el default; obligatorio si la periodicidad no es enumerable.
    denominatorBasis: denominatorBasisEnum("denominator_basis"),
    enumerationStatus: enumerationStatusEnum("enumeration_status"),
    enumerationClosedAt: timestamp("enumeration_closed_at", { withTimezone: true }),
    enumerationClosedByUserId: uuid("enumeration_closed_by_user_id").references(() => appUser.id),
    requiresNativeFormat: boolean("requires_native_format").notNull().default(false),
    expectedExtensions: text("expected_extensions").array(),
    defaultResponsibleId: uuid("default_responsible_id").references(() => appUser.id),
    defaultDueDate: date("default_due_date"),
    sensitivity: sensitivityEnum("sensitivity").notNull().default("internal"),
    isCritical: boolean("is_critical").notNull().default(false),
    customFields: jsonb("custom_fields").notNull().default({}),
    pathTemplateOverride: varchar("path_template_override", { length: 500 }),
    namingRuleOverride: varchar("naming_rule_override", { length: 500 }),
    observations: text("observations"),
    status: requirementStatusEnum("status").notNull().default("draft"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    closedByUserId: uuid("closed_by_user_id").references(() => appUser.id),
    retiredReason: text("retired_reason"),
    rowVersion: integer("row_version").notNull().default(1), // control de concurrencia optimista (If-Match)
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => appUser.id),
  },
  (t) => [
    index("ix_req_activity").on(t.activityId),
    index("ix_req_resp").on(t.defaultResponsibleId),
    index("ix_req_custom").using("gin", t.customFields),

    check(
      "ck_req_period_order",
      sql`${t.periodEnd} IS NULL OR ${t.periodStart} IS NULL OR ${t.periodEnd} >= ${t.periodStart}`
    ),
    // Enumerable exige rango; no enumerable exige base de cálculo.
    check(
      "ck_req_denominator",
      sql`(${t.periodicity} IN ('monthly','quarterly','annual','date_range','permanent') AND ${t.periodStart} IS NOT NULL)
          OR (${t.periodicity} NOT IN ('monthly','quarterly','annual','date_range','permanent') AND ${t.denominatorBasis} IS NOT NULL)`
    ),
    check(
      "ck_req_enumeration",
      sql`${t.denominatorBasis} IS DISTINCT FROM 'progressive' OR ${t.enumerationStatus} IS NOT NULL`
    ),
    check(
      "ck_req_enum_closed",
      sql`${t.enumerationStatus} <> 'closed' OR (${t.enumerationClosedAt} IS NOT NULL AND ${t.enumerationClosedByUserId} IS NOT NULL)`
    ),
    check("ck_req_retired", sql`${t.status} <> 'retired' OR ${t.retiredReason} IS NOT NULL`),
  ]
);

// Qué documentos componen una instancia completa y cuáles son obligatorios (FR-104).
export const requirementComponent = pgTable("requirement_component", {
  id: uuid("id").primaryKey().defaultRandom(),
  requirementId: uuid("requirement_id")
    .notNull()
    .references(() => requirement.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 60 }).notNull(), // catálogo Glosario §4.7: principal, comprobante, ...
  label: varchar("label", { length: 200 }).notNull(),
  isMandatory: boolean("is_mandatory").notNull(), // determina collection_status (FR-213)
  displayOrder: smallint("display_order").notNull().default(0),
});
