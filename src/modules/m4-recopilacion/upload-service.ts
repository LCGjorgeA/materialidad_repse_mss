/**
 * Orquesta el Camino A de ingesta (`app_upload`, Glosario §1.4) — FR-310–FR-322.
 *
 * Simplificación deliberada de esta iteración (ver plan "Carga de
 * documentos"): una sola llamada de servidor hace hash + detección de
 * duplicado + colocación (stub) + registro, en vez del flujo de dos fases
 * `upload_intent` de la API completa. Se retoma en Fase 4, cuando haya que
 * proteger reintentos contra los rate limits reales de Graph.
 */
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  activity,
  area,
  document,
  documentInstanceLink,
  documentVersion,
  evidenceInstance,
  front,
  informationType,
  process as processTable,
  requirement,
  requirementComponent,
  sharepointLocation,
} from "@/db/schema";
import { putBlob } from "@/lib/blob";
import { getCurrentUser } from "@/lib/current-user";
import { deriveCollectionStatus } from "@/modules/m3-instancias/collection-status";
import { extensionOf, resolveDestination } from "@/modules/m5-sharepoint/naming";

export class InstanceNotFoundError extends Error {}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Contexto completo de una instancia: requisito + árbol de taxonomía + componentes. */
export async function loadInstanceContext(instanceId: string) {
  const [row] = await db
    .select({
      instance: evidenceInstance,
      requirement,
      activity,
      process: processTable,
      area,
      front,
      informationType,
    })
    .from(evidenceInstance)
    .innerJoin(requirement, eq(evidenceInstance.requirementId, requirement.id))
    .innerJoin(activity, eq(requirement.activityId, activity.id))
    .innerJoin(processTable, eq(activity.processId, processTable.id))
    .innerJoin(area, eq(processTable.areaId, area.id))
    .innerJoin(front, eq(area.frontId, front.id))
    .innerJoin(informationType, eq(requirement.informationTypeId, informationType.id))
    .where(eq(evidenceInstance.id, instanceId))
    .limit(1);

  if (!row) throw new InstanceNotFoundError(`Instancia ${instanceId} no encontrada`);

  const components = await db
    .select()
    .from(requirementComponent)
    .where(eq(requirementComponent.requirementId, row.requirement.id))
    .orderBy(requirementComponent.displayOrder);

  return { ...row, components };
}

export type PreviewInput = {
  instanceId: string;
  originalFilename: string;
  sizeBytes: number;
};

export type PreviewResult = {
  targetPath: string;
  proposedFilename: string;
  originalFilename: string;
  extensionWarning: string | null;
};

export async function previewUpload(input: PreviewInput): Promise<PreviewResult> {
  const ctx = await loadInstanceContext(input.instanceId);

  const destination = resolveDestination({
    frontFolderSegment: ctx.front.folderSegment,
    areaFolderSegment: ctx.area.folderSegment,
    areaName: ctx.area.name,
    processFolderSegment: ctx.process.folderSegment,
    processName: ctx.process.name,
    periodicity: ctx.requirement.periodicity,
    periodLabel: ctx.instance.periodLabel,
    periodStart: ctx.instance.periodStart,
    informationTypeName: ctx.informationType.name,
    originalFilename: input.originalFilename,
  });

  // FR-319: extensión inesperada → advertencia no bloqueante (no en lista negra
  // implica solo verificar contra las esperadas por el requisito, si declaró alguna).
  const expected = ctx.requirement.expectedExtensions;
  const extensionWarning =
    expected && expected.length > 0 && !expected.includes(destination.extension)
      ? `La extensión ".${destination.extension}" no está entre las esperadas para este requisito (${expected.join(", ")}).`
      : null;

  return {
    targetPath: destination.pathSegments.join("/"),
    proposedFilename: destination.proposedFilename,
    originalFilename: input.originalFilename,
    extensionWarning,
  };
}

export type UploadInput = {
  instanceId: string;
  role: string;
  requirementComponentId?: string;
  confirmedFilename: string;
  fileBuffer: Buffer;
  originalFilename: string;
  mimeType: string;
  /** Ausente en el primer intento; presente cuando el usuario ya decidió tras ver el diálogo de duplicado (FR-315). */
  duplicateAction?: "link" | "upload-anyway";
};

export type DuplicateResult = {
  kind: "duplicate";
  existingDocument: {
    documentId: string;
    filename: string;
    uploadedAt: string;
  };
  linkedInstances: { instanceId: string; periodLabel: string; requirementReadableId: string }[];
  options: ["link", "upload-anyway"];
};

export type SuccessResult = {
  kind: "success";
  documentId: string;
  documentVersionId: string;
  instanceCollectionStatus: string;
};

export async function uploadDocument(
  input: UploadInput
): Promise<DuplicateResult | SuccessResult> {
  const ctx = await loadInstanceContext(input.instanceId);
  const currentUser = await getCurrentUser();
  const contentHash = crypto.createHash("sha256").update(input.fileBuffer).digest("hex");

  if (!input.duplicateAction) {
    const duplicate = await findActiveDuplicate(contentHash);
    if (duplicate) return duplicate;
  }

  if (input.duplicateAction === "link") {
    const duplicate = await findActiveDuplicate(contentHash);
    if (!duplicate) {
      throw new Error("duplicateAction=link pero ya no hay un documento activo con ese hash.");
    }
    const documentId = duplicate.existingDocument.documentId;
    return db.transaction(async (tx) => {
      await tx.insert(documentInstanceLink).values({
        documentId,
        evidenceInstanceId: input.instanceId,
        role: input.role,
        requirementComponentId: input.requirementComponentId,
        linkedByUserId: currentUser.id,
      });
      const status = await recalculateCollectionStatus(tx, ctx);
      const [latestVersion] = await tx
        .select()
        .from(documentVersion)
        .where(eq(documentVersion.documentId, documentId))
        .orderBy(documentVersion.versionNumber);
      return {
        kind: "success" as const,
        documentId,
        documentVersionId: latestVersion.id,
        instanceCollectionStatus: status,
      };
    });
  }

  // Sin duplicado, o el usuario eligió "upload-anyway" (DA-002: ambas copias
  // quedan registradas como documentos válidos, sin exigir motivo).
  const destination = resolveDestination({
    frontFolderSegment: ctx.front.folderSegment,
    areaFolderSegment: ctx.area.folderSegment,
    areaName: ctx.area.name,
    processFolderSegment: ctx.process.folderSegment,
    processName: ctx.process.name,
    periodicity: ctx.requirement.periodicity,
    periodLabel: ctx.instance.periodLabel,
    periodStart: ctx.instance.periodStart,
    informationTypeName: ctx.informationType.name,
    originalFilename: input.originalFilename,
  });
  const extension = extensionOf(input.confirmedFilename) || destination.extension;
  const relativePath = [...destination.pathSegments, input.confirmedFilename].join("/");

  return db.transaction(async (tx) => {
    const [newDocument] = await tx
      .insert(document)
      .values({
        projectId: ctx.front.projectId,
        originalFilename: input.originalFilename,
        canonicalFilename: input.confirmedFilename,
        informationTypeId: ctx.informationType.id,
        ingestionPath: "app_upload",
        sensitivity: ctx.requirement.sensitivity,
        createdByUserId: currentUser.id,
      })
      .returning();

    const [newVersion] = await tx
      .insert(documentVersion)
      .values({
        documentId: newDocument.id,
        versionNumber: 1,
        filename: input.confirmedFilename,
        contentHash,
        sizeBytes: input.fileBuffer.length,
        mimeType: input.mimeType,
        extension,
        uploadedByUserId: currentUser.id,
      })
      .returning();

    await tx
      .update(document)
      .set({ currentVersionId: newVersion.id })
      .where(eq(document.id, newDocument.id));

    await putBlob(tx, newVersion.id, input.fileBuffer);

    // Stub — ver src/lib/blob.ts. En Fase 4 estos identificadores vienen de Graph real.
    await tx.insert(sharepointLocation).values({
      documentVersionId: newVersion.id,
      siteId: "stub-site",
      driveId: "postgres-stub",
      itemId: newVersion.id,
      etag: contentHash.slice(0, 16),
      relativePath,
      webUrl: `/api/documents/${newDocument.id}/download`,
      canonicalPath: relativePath,
    });

    await tx.insert(documentInstanceLink).values({
      documentId: newDocument.id,
      evidenceInstanceId: input.instanceId,
      role: input.role,
      requirementComponentId: input.requirementComponentId,
      linkedByUserId: currentUser.id,
    });

    const status = await recalculateCollectionStatus(tx, ctx);

    return {
      kind: "success" as const,
      documentId: newDocument.id,
      documentVersionId: newVersion.id,
      instanceCollectionStatus: status,
    };
  });
}

async function findActiveDuplicate(contentHash: string): Promise<DuplicateResult | null> {
  const [match] = await db
    .select({ version: documentVersion, document })
    .from(documentVersion)
    .innerJoin(document, eq(documentVersion.documentId, document.id))
    .where(and(eq(documentVersion.contentHash, contentHash), eq(document.status, "active")))
    .limit(1);

  if (!match) return null;

  const links = await db
    .select({ link: documentInstanceLink, instance: evidenceInstance, requirement })
    .from(documentInstanceLink)
    .innerJoin(evidenceInstance, eq(documentInstanceLink.evidenceInstanceId, evidenceInstance.id))
    .innerJoin(requirement, eq(evidenceInstance.requirementId, requirement.id))
    .where(
      and(
        eq(documentInstanceLink.documentId, match.document.id),
        eq(documentInstanceLink.isActive, true)
      )
    );

  return {
    kind: "duplicate",
    existingDocument: {
      documentId: match.document.id,
      filename: match.version.filename,
      uploadedAt: match.version.uploadedAt.toISOString(),
    },
    linkedInstances: links.map((l) => ({
      instanceId: l.instance.id,
      periodLabel: l.instance.periodLabel,
      requirementReadableId: l.requirement.readableId,
    })),
    options: ["link", "upload-anyway"],
  };
}

async function recalculateCollectionStatus(
  tx: Tx,
  ctx: Awaited<ReturnType<typeof loadInstanceContext>>
): Promise<string> {
  const activeLinks = await tx
    .select()
    .from(documentInstanceLink)
    .where(
      and(
        eq(documentInstanceLink.evidenceInstanceId, ctx.instance.id),
        eq(documentInstanceLink.isActive, true)
      )
    );

  const nextStatus = deriveCollectionStatus(
    ctx.components,
    activeLinks,
    ctx.instance.collectionStatus
  );

  const becameCollected = nextStatus === "collected" && ctx.instance.collectionStatus !== "collected";

  await tx
    .update(evidenceInstance)
    .set({
      collectionStatus: nextStatus,
      statusSource: "derived",
      updatedAt: new Date(),
      ...(becameCollected ? { collectedAt: new Date() } : {}),
    })
    .where(eq(evidenceInstance.id, ctx.instance.id));

  return nextStatus;
}
