CREATE TYPE "public"."document_status_t" AS ENUM('active', 'replaced', 'retired', 'broken_link');--> statement-breakpoint
CREATE TABLE "document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"current_version_id" uuid,
	"original_filename" varchar(400) NOT NULL,
	"canonical_filename" varchar(400) NOT NULL,
	"information_type_id" uuid,
	"ingestion_path" "ingestion_path_t" NOT NULL,
	"sensitivity" "sensitivity_t" DEFAULT 'internal' NOT NULL,
	"email_metadata" jsonb,
	"status" "document_status_t" DEFAULT 'active' NOT NULL,
	"retired_reason" text,
	"has_duplicate_content" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_blob" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_version_id" uuid NOT NULL,
	"bytes" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_blob_document_version_id_unique" UNIQUE("document_version_id")
);
--> statement-breakpoint
CREATE TABLE "document_instance_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"evidence_instance_id" uuid NOT NULL,
	"role" varchar(60) NOT NULL,
	"requirement_component_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"unlink_reason" text,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"linked_by_user_id" uuid NOT NULL,
	CONSTRAINT "ck_link_unlink" CHECK ("document_instance_link"."is_active" OR "document_instance_link"."unlink_reason" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "document_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"version_number" bigint NOT NULL,
	"filename" varchar(400) NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"mime_type" varchar(200) NOT NULL,
	"extension" varchar(20) NOT NULL,
	"change_reason" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"uploaded_by_user_id" uuid NOT NULL,
	CONSTRAINT "ck_docver_size" CHECK ("document_version"."size_bytes" > 0),
	CONSTRAINT "ck_docver_reason" CHECK ("document_version"."version_number" = 1 OR "document_version"."change_reason" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "sharepoint_location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_version_id" uuid NOT NULL,
	"site_id" varchar(300) NOT NULL,
	"drive_id" varchar(300) NOT NULL,
	"item_id" varchar(300) NOT NULL,
	"etag" varchar(200) NOT NULL,
	"ctag" varchar(200),
	"relative_path" varchar(1000) NOT NULL,
	"web_url" varchar(1500) NOT NULL,
	"canonical_path" varchar(1000) NOT NULL,
	"path_deviation" boolean DEFAULT false NOT NULL,
	"name_deviation" boolean DEFAULT false NOT NULL,
	"last_verified_at" timestamp with time zone,
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sharepoint_location_document_version_id_unique" UNIQUE("document_version_id")
);
--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_information_type_id_information_type_id_fk" FOREIGN KEY ("information_type_id") REFERENCES "public"."information_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_created_by_user_id_app_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_blob" ADD CONSTRAINT "document_blob_document_version_id_document_version_id_fk" FOREIGN KEY ("document_version_id") REFERENCES "public"."document_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_instance_link" ADD CONSTRAINT "document_instance_link_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_instance_link" ADD CONSTRAINT "document_instance_link_evidence_instance_id_evidence_instance_id_fk" FOREIGN KEY ("evidence_instance_id") REFERENCES "public"."evidence_instance"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_instance_link" ADD CONSTRAINT "document_instance_link_requirement_component_id_requirement_component_id_fk" FOREIGN KEY ("requirement_component_id") REFERENCES "public"."requirement_component"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_instance_link" ADD CONSTRAINT "document_instance_link_linked_by_user_id_app_user_id_fk" FOREIGN KEY ("linked_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_uploaded_by_user_id_app_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sharepoint_location" ADD CONSTRAINT "sharepoint_location_document_version_id_document_version_id_fk" FOREIGN KEY ("document_version_id") REFERENCES "public"."document_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
-- FK circular document.current_version_id -> document_version.id. Deferrable
-- porque el documento y su primera versión se insertan en la misma transacción
-- (se crea el documento sin current_version_id, luego la versión, luego se
-- actualiza current_version_id) — igual que la DDL de 04_MODELO_DATOS_API.md §4.
ALTER TABLE "document" ADD CONSTRAINT "fk_doc_current" FOREIGN KEY ("current_version_id") REFERENCES "public"."document_version"("id") DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
CREATE INDEX "ix_doc_project" ON "document" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_link_active" ON "document_instance_link" USING btree ("document_id","evidence_instance_id","role") WHERE "document_instance_link"."is_active";--> statement-breakpoint
CREATE INDEX "ix_link_instance" ON "document_instance_link" USING btree ("evidence_instance_id") WHERE "document_instance_link"."is_active";--> statement-breakpoint
CREATE INDEX "ix_link_document" ON "document_instance_link" USING btree ("document_id") WHERE "document_instance_link"."is_active";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_docver" ON "document_version" USING btree ("document_id","version_number");--> statement-breakpoint
CREATE INDEX "ix_docver_hash" ON "document_version" USING btree ("content_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_sp_item" ON "sharepoint_location" USING btree ("drive_id","item_id");--> statement-breakpoint
CREATE INDEX "ix_sp_deviation" ON "sharepoint_location" USING btree ("path_deviation") WHERE "sharepoint_location"."path_deviation";