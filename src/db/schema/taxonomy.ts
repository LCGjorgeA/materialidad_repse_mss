import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { projectStatusEnum, sensitivityEnum } from "./enums";

// §3.1 Taxonomía — 04_MODELO_DATOS_API.md
// Los 4 niveles (front → area → process → activity) son datos configurables, no enums (Glosario §1.1).

export const project = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  targetCloseDate: date("target_close_date"),
  status: projectStatusEnum("status").notNull().default("active"),
  sharepointSiteId: varchar("sharepoint_site_id", { length: 300 }),
  sharepointDriveId: varchar("sharepoint_drive_id", { length: 300 }),
  sharepointRootPath: varchar("sharepoint_root_path", { length: 500 }),
  settings: jsonb("settings").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Exactamente dos frentes por proyecto (FR-002). Cerrado: no editable por interfaz.
export const front = pgTable(
  "front",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "restrict" }),
    code: varchar("code", { length: 32 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    folderSegment: varchar("folder_segment", { length: 120 }).notNull(),
    displayOrder: smallint("display_order").notNull().default(0),
  },
  (t) => [uniqueIndex("uq_front_code").on(t.projectId, t.code)]
);

export const area = pgTable(
  "area",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    frontId: uuid("front_id")
      .notNull()
      .references(() => front.id, { onDelete: "restrict" }),
    code: varchar("code", { length: 32 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    folderSegment: varchar("folder_segment", { length: 120 }).notNull(),
    displayOrder: smallint("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    defaultPeriodStart: date("default_period_start"), // DA-004
    defaultPeriodEnd: date("default_period_end"),
    defaultSensitivity: sensitivityEnum("default_sensitivity").notNull().default("internal"),
    isCriticalArea: boolean("is_critical_area").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_area_code").on(t.frontId, t.code),
    check(
      "ck_area_period",
      sql`${t.defaultPeriodEnd} IS NULL OR ${t.defaultPeriodStart} IS NULL OR ${t.defaultPeriodEnd} >= ${t.defaultPeriodStart}`
    ),
  ]
);

export const process = pgTable(
  "process",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    areaId: uuid("area_id")
      .notNull()
      .references(() => area.id, { onDelete: "restrict" }),
    code: varchar("code", { length: 32 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    folderSegment: varchar("folder_segment", { length: 120 }).notNull(),
    displayOrder: smallint("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_process_code").on(t.areaId, t.code)]
);

// Único nivel al que se ancla un requisito (FR-100).
export const activity = pgTable(
  "activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    processId: uuid("process_id")
      .notNull()
      .references(() => process.id, { onDelete: "restrict" }),
    code: varchar("code", { length: 32 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    folderSegment: varchar("folder_segment", { length: 120 }).notNull(),
    displayOrder: smallint("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_activity_code").on(t.processId, t.code)]
);
