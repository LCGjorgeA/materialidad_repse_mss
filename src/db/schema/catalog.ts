import { boolean, pgTable, smallint, uuid, varchar } from "drizzle-orm/pg-core";
import { sensitivityEnum } from "./enums";

// §3.6 Configuración y operación — catálogo mínimo para Fase 1.
// Semilla: Glosario §4.4 (tipos de información).

export const informationType = pgTable("information_type", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  expectedExtensions: varchar("expected_extensions", { length: 20 }).array(),
  requiresNativeFormat: boolean("requires_native_format").notNull().default(false),
  defaultSensitivity: sensitivityEnum("default_sensitivity").notNull().default("internal"),
  displayOrder: smallint("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});
