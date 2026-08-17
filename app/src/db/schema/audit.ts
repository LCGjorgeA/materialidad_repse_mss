import { inet, jsonb, pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { appUser } from "./identity";
import { auditOriginEnum } from "./enums";

// Append-only, particionada por mes en producción (FR-920–FR-925).
// P-6: toda escritura deja evento de auditoría en la misma transacción.
// El rol de aplicación solo tiene INSERT y SELECT (sin UPDATE/DELETE) — se aplica via GRANT en la migración SQL,
// Drizzle no expresa REVOKE/GRANT.
export const auditEvent = pgTable(
  "audit_event",
  {
    id: uuid("id").notNull().defaultRandom(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    actorUserId: uuid("actor_user_id").references(() => appUser.id),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 60 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    origin: auditOriginEnum("origin").notNull(),
    correlationId: varchar("correlation_id", { length: 80 }),
    ipAddress: inet("ip_address"),
  },
  (t) => [primaryKey({ columns: [t.id, t.occurredAt] })]
);
