CREATE TYPE "public"."audit_origin_t" AS ENUM('ui', 'api', 'import', 'job', 'system');--> statement-breakpoint
CREATE TYPE "public"."collection_status_t" AS ENUM('pending_collection', 'in_collection', 'collected');--> statement-breakpoint
CREATE TYPE "public"."denominator_basis_t" AS ENUM('progressive', 'driver_list');--> statement-breakpoint
CREATE TYPE "public"."enumeration_status_t" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."exception_status_t" AS ENUM('proposed', 'under_review', 'approved', 'rejected', 'mitigated');--> statement-breakpoint
CREATE TYPE "public"."impact_level_t" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."ingestion_path_t" AS ENUM('app_upload', 'existing_registration', 'reconciliation');--> statement-breakpoint
CREATE TYPE "public"."periodicity_t" AS ENUM('monthly', 'quarterly', 'annual', 'date_range', 'permanent', 'per_event', 'per_employee', 'per_supplier', 'per_project', 'per_transaction');--> statement-breakpoint
CREATE TYPE "public"."project_status_t" AS ENUM('active', 'closing', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."requirement_status_t" AS ENUM('draft', 'active', 'closed', 'retired');--> statement-breakpoint
CREATE TYPE "public"."scope_type_t" AS ENUM('project', 'front', 'area');--> statement-breakpoint
CREATE TYPE "public"."sensitivity_t" AS ENUM('public', 'internal', 'restricted', 'confidential');--> statement-breakpoint
CREATE TYPE "public"."status_history_field_t" AS ENUM('collection', 'validation');--> statement-breakpoint
CREATE TYPE "public"."status_source_t" AS ENUM('derived', 'manual');--> statement-breakpoint
CREATE TYPE "public"."validation_status_t" AS ENUM('pending_validation', 'validated', 'partial', 'not_obtained');--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entra_object_id" varchar(100) NOT NULL,
	"email" varchar(320) NOT NULL,
	"display_name" varchar(200) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"notification_preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ui_preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_user_entra_object_id_unique" UNIQUE("entra_object_id")
);
--> statement-breakpoint
CREATE TABLE "role" (
	"code" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_code" varchar(32) NOT NULL,
	"scope_type" "scope_type_t" NOT NULL,
	"scope_id" uuid NOT NULL,
	"granted_by_id" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"process_id" uuid NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"folder_segment" varchar(120) NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "area" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"front_id" uuid NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"folder_segment" varchar(120) NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"default_period_start" date,
	"default_period_end" date,
	"default_sensitivity" "sensitivity_t" DEFAULT 'internal' NOT NULL,
	"is_critical_area" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_area_period" CHECK ("area"."default_period_end" IS NULL OR "area"."default_period_start" IS NULL OR "area"."default_period_end" >= "area"."default_period_start")
);
--> statement-breakpoint
CREATE TABLE "front" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(200) NOT NULL,
	"folder_segment" varchar(120) NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "process" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area_id" uuid NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"folder_segment" varchar(120) NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"target_close_date" date,
	"status" "project_status_t" DEFAULT 'active' NOT NULL,
	"sharepoint_site_id" varchar(300),
	"sharepoint_drive_id" varchar(300),
	"sharepoint_root_path" varchar(500),
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "information_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(60) NOT NULL,
	"name" varchar(200) NOT NULL,
	"expected_extensions" varchar(20)[],
	"requires_native_format" boolean DEFAULT false NOT NULL,
	"default_sensitivity" "sensitivity_t" DEFAULT 'internal' NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "information_type_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "requirement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"readable_id" varchar(40) NOT NULL,
	"activity_id" uuid NOT NULL,
	"name" varchar(300) NOT NULL,
	"description" text NOT NULL,
	"information_type_id" uuid NOT NULL,
	"periodicity" "periodicity_t" NOT NULL,
	"period_start" date,
	"period_end" date,
	"denominator_basis" "denominator_basis_t",
	"enumeration_status" "enumeration_status_t",
	"enumeration_closed_at" timestamp with time zone,
	"enumeration_closed_by_user_id" uuid,
	"requires_native_format" boolean DEFAULT false NOT NULL,
	"expected_extensions" text[],
	"default_responsible_id" uuid,
	"default_due_date" date,
	"sensitivity" "sensitivity_t" DEFAULT 'internal' NOT NULL,
	"is_critical" boolean DEFAULT false NOT NULL,
	"custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"path_template_override" varchar(500),
	"naming_rule_override" varchar(500),
	"observations" text,
	"status" "requirement_status_t" DEFAULT 'draft' NOT NULL,
	"closed_at" timestamp with time zone,
	"closed_by_user_id" uuid,
	"retired_reason" text,
	"row_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	CONSTRAINT "requirement_readable_id_unique" UNIQUE("readable_id"),
	CONSTRAINT "ck_req_period_order" CHECK ("requirement"."period_end" IS NULL OR "requirement"."period_start" IS NULL OR "requirement"."period_end" >= "requirement"."period_start"),
	CONSTRAINT "ck_req_denominator" CHECK (("requirement"."periodicity" IN ('monthly','quarterly','annual','date_range','permanent') AND "requirement"."period_start" IS NOT NULL)
          OR ("requirement"."periodicity" NOT IN ('monthly','quarterly','annual','date_range','permanent') AND "requirement"."denominator_basis" IS NOT NULL)),
	CONSTRAINT "ck_req_enumeration" CHECK ("requirement"."denominator_basis" IS DISTINCT FROM 'progressive' OR "requirement"."enumeration_status" IS NOT NULL),
	CONSTRAINT "ck_req_enum_closed" CHECK ("requirement"."enumeration_status" <> 'closed' OR ("requirement"."enumeration_closed_at" IS NOT NULL AND "requirement"."enumeration_closed_by_user_id" IS NOT NULL)),
	CONSTRAINT "ck_req_retired" CHECK ("requirement"."status" <> 'retired' OR "requirement"."retired_reason" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "requirement_component" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requirement_id" uuid NOT NULL,
	"role" varchar(60) NOT NULL,
	"label" varchar(200) NOT NULL,
	"is_mandatory" boolean NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_list_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requirement_id" uuid NOT NULL,
	"driver_key" varchar(200) NOT NULL,
	"driver_label" varchar(300) NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"imported_by_user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_instance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requirement_id" uuid NOT NULL,
	"period_label" varchar(60) NOT NULL,
	"period_start" date,
	"period_end" date,
	"driver_key" varchar(200),
	"driver_label" varchar(300),
	"collection_status" "collection_status_t" DEFAULT 'pending_collection' NOT NULL,
	"status_source" "status_source_t" DEFAULT 'derived' NOT NULL,
	"validation_status" "validation_status_t" DEFAULT 'pending_validation' NOT NULL,
	"responsible_id" uuid,
	"due_date" date,
	"is_overdue" boolean DEFAULT false NOT NULL,
	"out_of_scope" boolean DEFAULT false NOT NULL,
	"out_of_scope_reason" text,
	"is_manual" boolean DEFAULT false NOT NULL,
	"manual_reason" text,
	"forced_collected" boolean DEFAULT false NOT NULL,
	"forced_reason" text,
	"collected_at" timestamp with time zone,
	"collected_by_user_id" uuid,
	"validated_at" timestamp with time zone,
	"validated_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_inst_oos" CHECK (NOT "evidence_instance"."out_of_scope" OR "evidence_instance"."out_of_scope_reason" IS NOT NULL),
	CONSTRAINT "ck_inst_manual" CHECK (NOT "evidence_instance"."is_manual" OR "evidence_instance"."manual_reason" IS NOT NULL),
	CONSTRAINT "ck_inst_forced" CHECK (NOT "evidence_instance"."forced_collected" OR "evidence_instance"."forced_reason" IS NOT NULL),
	CONSTRAINT "ck_inst_flow" CHECK ("evidence_instance"."collection_status" = 'collected' OR "evidence_instance"."validation_status" = 'pending_validation')
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evidence_instance_id" uuid NOT NULL,
	"field" "status_history_field_t" NOT NULL,
	"from_status" varchar(40),
	"to_status" varchar(40) NOT NULL,
	"changed_by_id" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reason" text,
	"source_entity" varchar(60),
	"source_id" uuid
);
--> statement-breakpoint
CREATE TABLE "audit_event" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(60) NOT NULL,
	"entity_id" uuid NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"origin" "audit_origin_t" NOT NULL,
	"correlation_id" varchar(80),
	"ip_address" "inet",
	CONSTRAINT "audit_event_id_occurred_at_pk" PRIMARY KEY("id","occurred_at")
);
--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_code_role_code_fk" FOREIGN KEY ("role_code") REFERENCES "public"."role"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_granted_by_id_app_user_id_fk" FOREIGN KEY ("granted_by_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_process_id_process_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."process"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "area" ADD CONSTRAINT "area_front_id_front_id_fk" FOREIGN KEY ("front_id") REFERENCES "public"."front"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "front" ADD CONSTRAINT "front_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process" ADD CONSTRAINT "process_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_information_type_id_information_type_id_fk" FOREIGN KEY ("information_type_id") REFERENCES "public"."information_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_enumeration_closed_by_user_id_app_user_id_fk" FOREIGN KEY ("enumeration_closed_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_default_responsible_id_app_user_id_fk" FOREIGN KEY ("default_responsible_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_closed_by_user_id_app_user_id_fk" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_created_by_user_id_app_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement_component" ADD CONSTRAINT "requirement_component_requirement_id_requirement_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."requirement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_list_item" ADD CONSTRAINT "driver_list_item_requirement_id_requirement_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."requirement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_list_item" ADD CONSTRAINT "driver_list_item_imported_by_user_id_app_user_id_fk" FOREIGN KEY ("imported_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_instance" ADD CONSTRAINT "evidence_instance_requirement_id_requirement_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."requirement"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_instance" ADD CONSTRAINT "evidence_instance_responsible_id_app_user_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_instance" ADD CONSTRAINT "evidence_instance_collected_by_user_id_app_user_id_fk" FOREIGN KEY ("collected_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_instance" ADD CONSTRAINT "evidence_instance_validated_by_user_id_app_user_id_fk" FOREIGN KEY ("validated_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_evidence_instance_id_evidence_instance_id_fk" FOREIGN KEY ("evidence_instance_id") REFERENCES "public"."evidence_instance"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_changed_by_id_app_user_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actor_user_id_app_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_role_active" ON "user_role" USING btree ("user_id","role_code","scope_type","scope_id") WHERE "user_role"."is_active";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_activity_code" ON "activity" USING btree ("process_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_area_code" ON "area" USING btree ("front_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_front_code" ON "front" USING btree ("project_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_process_code" ON "process" USING btree ("area_id","code");--> statement-breakpoint
CREATE INDEX "ix_req_activity" ON "requirement" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "ix_req_resp" ON "requirement" USING btree ("default_responsible_id");--> statement-breakpoint
CREATE INDEX "ix_req_custom" ON "requirement" USING gin ("custom_fields");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_driver_item" ON "driver_list_item" USING btree ("requirement_id","driver_key");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_instance" ON "evidence_instance" USING btree ("requirement_id","period_label","driver_key");--> statement-breakpoint
CREATE INDEX "ix_inst_req" ON "evidence_instance" USING btree ("requirement_id","period_start");--> statement-breakpoint
CREATE INDEX "ix_inst_status" ON "evidence_instance" USING btree ("collection_status","validation_status") WHERE NOT "evidence_instance"."out_of_scope";--> statement-breakpoint
CREATE INDEX "ix_inst_resp" ON "evidence_instance" USING btree ("responsible_id","due_date") WHERE NOT "evidence_instance"."out_of_scope";--> statement-breakpoint
CREATE INDEX "ix_inst_queue" ON "evidence_instance" USING btree ("validation_status","collected_at") WHERE "evidence_instance"."collection_status" = 'collected' AND "evidence_instance"."validation_status" = 'pending_validation';--> statement-breakpoint
CREATE INDEX "ix_inst_period" ON "evidence_instance" USING btree ("period_start","period_end") WHERE NOT "evidence_instance"."out_of_scope";