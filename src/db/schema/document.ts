import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { project } from "./taxonomy";
import { requirementComponent } from "./requirement";
import { evidenceInstance } from "./instance";
import { appUser } from "./identity";
import { informationType } from "./catalog";
import { documentStatusEnum, ingestionPathEnum, sensitivityEnum } from "./enums";

// §3.3 Documentos — 04_MODELO_DATOS_API.md
// Camino A/B/C de ingesta (Glosario §1.4). Portado tal cual la DDL del documento,
// con dos desviaciones deliberadas de esta iteración (ver plan de "Carga de
// documentos"): sin upload_intent todavía (Fase 4), y document_blob como stub
// de almacenamiento en vez de sharepoint_location apuntando a Graph real.

export const document = pgTable(
  "document",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id),
    // FK circular con document_version: se declara sin .references() aquí y el
    // constraint DEFERRABLE se agrega a mano en la migración generada, tal como
    // lo hace la propia DDL de 04_MODELO_DATOS_API.md §4 (fk_doc_current).
    currentVersionId: uuid("current_version_id"),
    originalFilename: varchar("original_filename", { length: 400 }).notNull(), // FR-313, nunca se suprime
    canonicalFilename: varchar("canonical_filename", { length: 400 }).notNull(),
    informationTypeId: uuid("information_type_id").references(() => informationType.id),
    ingestionPath: ingestionPathEnum("ingestion_path").notNull(),
    sensitivity: sensitivityEnum("sensitivity").notNull().default("internal"),
    emailMetadata: jsonb("email_metadata"), // FR-322 — no poblado en esta iteración (ver plan)
    status: documentStatusEnum("status").notNull().default("active"),
    retiredReason: text("retired_reason"),
    // DA-002 / FR-315b: recalculado cuando otro documento activo comparte content_hash.
    hasDuplicateContent: boolean("has_duplicate_content").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => appUser.id),
  },
  (t) => [index("ix_doc_project").on(t.projectId)]
);

export const documentVersion = pgTable(
  "document_version",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => document.id, { onDelete: "restrict" }),
    versionNumber: bigint("version_number", { mode: "number" }).notNull(),
    filename: varchar("filename", { length: 400 }).notNull(), // sufijo _vXX desde la versión 2 (Glosario §5.3)
    contentHash: varchar("content_hash", { length: 64 }).notNull(), // SHA-256 (FR-314)
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    mimeType: varchar("mime_type", { length: 200 }).notNull(),
    extension: varchar("extension", { length: 20 }).notNull(),
    changeReason: text("change_reason"), // obligatorio desde la v2 (FR-343)
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
    uploadedByUserId: uuid("uploaded_by_user_id")
      .notNull()
      .references(() => appUser.id),
  },
  (t) => [
    uniqueIndex("uq_docver").on(t.documentId, t.versionNumber),
    index("ix_docver_hash").on(t.contentHash),
    check("ck_docver_size", sql`${t.sizeBytes} > 0`),
    check(
      "ck_docver_reason",
      sql`${t.versionNumber} = 1 OR ${t.changeReason} IS NOT NULL`
    ),
  ]
);

// STUB de esta iteración — reemplaza el rol que jugará SharePoint/Graph en Fase 4.
// No es parte de la DDL documentada: se agrega para poder guardar bytes reales
// sin esperar a la integración con Graph. sharepoint_location (abajo) sigue
// existiendo con la misma forma documentada, apuntando a este stub por ahora.
export const documentBlob = pgTable("document_blob", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentVersionId: uuid("document_version_id")
    .notNull()
    .unique()
    .references(() => documentVersion.id, { onDelete: "restrict" }),
  bytes: text("bytes").notNull(), // base64 — ver nota en src/lib/blob.ts sobre límites de esta iteración
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sharepointLocation = pgTable(
  "sharepoint_location",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentVersionId: uuid("document_version_id")
      .notNull()
      .unique()
      .references(() => documentVersion.id, { onDelete: "restrict" }),
    // En esta iteración estos cuatro campos llevan valores sintéticos (stub),
    // no identificadores reales de Graph — ver src/lib/blob.ts.
    siteId: varchar("site_id", { length: 300 }).notNull(),
    driveId: varchar("drive_id", { length: 300 }).notNull(),
    itemId: varchar("item_id", { length: 300 }).notNull(), // el ancla (FR-404)
    etag: varchar("etag", { length: 200 }).notNull(),
    ctag: varchar("ctag", { length: 200 }),
    relativePath: varchar("relative_path", { length: 1000 }).notNull(),
    webUrl: varchar("web_url", { length: 1500 }).notNull(),
    canonicalPath: varchar("canonical_path", { length: 1000 }).notNull(),
    pathDeviation: boolean("path_deviation").notNull().default(false), // FR-333
    nameDeviation: boolean("name_deviation").notNull().default(false), // FR-334
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    placedAt: timestamp("placed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_sp_item").on(t.driveId, t.itemId),
    index("ix_sp_deviation").on(t.pathDeviation).where(sql`${t.pathDeviation}`),
  ]
);

// El N:M documento↔instancia (FR-320).
export const documentInstanceLink = pgTable(
  "document_instance_link",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => document.id, { onDelete: "restrict" }),
    evidenceInstanceId: uuid("evidence_instance_id")
      .notNull()
      .references(() => evidenceInstance.id, { onDelete: "restrict" }),
    role: varchar("role", { length: 60 }).notNull(), // papel aquí (FR-104)
    requirementComponentId: uuid("requirement_component_id").references(
      () => requirementComponent.id
    ),
    isActive: boolean("is_active").notNull().default(true), // baja lógica al desvincular (FR-344)
    unlinkReason: text("unlink_reason"),
    linkedAt: timestamp("linked_at", { withTimezone: true }).notNull().defaultNow(),
    linkedByUserId: uuid("linked_by_user_id")
      .notNull()
      .references(() => appUser.id),
  },
  (t) => [
    uniqueIndex("uq_link_active")
      .on(t.documentId, t.evidenceInstanceId, t.role)
      .where(sql`${t.isActive}`),
    index("ix_link_instance").on(t.evidenceInstanceId).where(sql`${t.isActive}`),
    index("ix_link_document").on(t.documentId).where(sql`${t.isActive}`),
    check("ck_link_unlink", sql`${t.isActive} OR ${t.unlinkReason} IS NOT NULL`),
  ]
);
