import { pgEnum } from "drizzle-orm/pg-core";

// Tipos enumerados de 04_MODELO_DATOS_API.md §4. Nombres y valores tal cual la DDL del documento.

export const periodicityEnum = pgEnum("periodicity_t", [
  "monthly",
  "quarterly",
  "annual",
  "date_range",
  "permanent",
  "per_event",
  "per_employee",
  "per_supplier",
  "per_project",
  "per_transaction",
]);

// DA-001
export const denominatorBasisEnum = pgEnum("denominator_basis_t", [
  "progressive",
  "driver_list",
]);

// DA-001
export const enumerationStatusEnum = pgEnum("enumeration_status_t", [
  "open",
  "closed",
]);

export const collectionStatusEnum = pgEnum("collection_status_t", [
  "pending_collection",
  "in_collection",
  "collected",
]);

export const validationStatusEnum = pgEnum("validation_status_t", [
  "pending_validation",
  "validated",
  "partial",
  "not_obtained",
]);

export const sensitivityEnum = pgEnum("sensitivity_t", [
  "public",
  "internal",
  "restricted",
  "confidential",
]);

export const ingestionPathEnum = pgEnum("ingestion_path_t", [
  "app_upload",
  "existing_registration",
  "reconciliation",
]);

export const requirementStatusEnum = pgEnum("requirement_status_t", [
  "draft",
  "active",
  "closed",
  "retired",
]);

export const exceptionStatusEnum = pgEnum("exception_status_t", [
  "proposed",
  "under_review",
  "approved",
  "rejected",
  "mitigated",
]);

export const impactLevelEnum = pgEnum("impact_level_t", [
  "low",
  "medium",
  "high",
]);

export const scopeTypeEnum = pgEnum("scope_type_t", [
  "project",
  "front",
  "area",
]);

// project.status (FR-001, FR-910) — distinto de requirement_status_t
export const projectStatusEnum = pgEnum("project_status_t", [
  "active",
  "closing",
  "closed",
  "archived",
]);

// status_history.field (FR-924)
export const statusHistoryFieldEnum = pgEnum("status_history_field_t", [
  "collection",
  "validation",
]);

// evidence_instance.status_source (DA-001)
export const statusSourceEnum = pgEnum("status_source_t", [
  "derived",
  "manual",
]);

// audit_event.origin
export const auditOriginEnum = pgEnum("audit_origin_t", [
  "ui",
  "api",
  "import",
  "job",
  "system",
]);
