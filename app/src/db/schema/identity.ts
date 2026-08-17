import { sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { scopeTypeEnum } from "./enums";

// §3.5 Identidad y gobierno — 04_MODELO_DATOS_API.md

export const appUser = pgTable("app_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  entraObjectId: varchar("entra_object_id", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  notificationPreferences: jsonb("notification_preferences").notNull().default({}),
  uiPreferences: jsonb("ui_preferences").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Catálogo cerrado de 5 roles (Glosario §4.6): admin, area_coordinator, contributor, validator, viewer.
export const role = pgTable("role", {
  code: varchar("code", { length: 32 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
});

// usuario × rol × ámbito (FR-901, FR-931)
export const userRole = pgTable(
  "user_role",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "restrict" }),
    roleCode: varchar("role_code", { length: 32 })
      .notNull()
      .references(() => role.code, { onDelete: "restrict" }),
    scopeType: scopeTypeEnum("scope_type").notNull(),
    // Polimórfico: apunta a project / front / area según scopeType.
    // Sin FK única posible (documentado en 04_MODELO_DATOS_API.md §3.5) — se valida en la app.
    scopeId: uuid("scope_id").notNull(),
    grantedById: uuid("granted_by_id").references(() => appUser.id),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    uniqueIndex("uq_user_role_active")
      .on(t.userId, t.roleCode, t.scopeType, t.scopeId)
      .where(sql`${t.isActive}`),
  ]
);
