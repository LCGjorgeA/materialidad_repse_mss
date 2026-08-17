import { NextResponse } from "next/server";
import { MAX_UPLOAD_BYTES } from "@/lib/blob";
import { InstanceNotFoundError, uploadDocument } from "@/modules/m4-recopilacion/upload-service";

// FR-310–FR-322 (camino A), simplificado a una sola llamada — ver plan
// "Carga de documentos" para el detalle de qué se difiere a Fase 4.
export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Se esperaba multipart/form-data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const instanceId = formData.get("instanceId");
  const role = formData.get("role");
  const confirmedFilename = formData.get("confirmedFilename");
  const requirementComponentId = formData.get("requirementComponentId");
  const duplicateAction = formData.get("duplicateAction");

  if (
    !(file instanceof File) ||
    typeof instanceId !== "string" ||
    typeof role !== "string" ||
    typeof confirmedFilename !== "string"
  ) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "file, instanceId, role y confirmedFilename son obligatorios.",
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: "FILE_TOO_LARGE",
        message: `Este stub acepta hasta ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB. FR-316 (250 MB con reanudación) llega en Fase 4, contra Graph real.`,
      },
      { status: 400 }
    );
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadDocument({
      instanceId,
      role,
      requirementComponentId:
        typeof requirementComponentId === "string" && requirementComponentId.length > 0
          ? requirementComponentId
          : undefined,
      confirmedFilename,
      fileBuffer,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
      duplicateAction:
        duplicateAction === "link" || duplicateAction === "upload-anyway"
          ? duplicateAction
          : undefined,
    });

    if (result.kind === "duplicate") {
      return NextResponse.json({ error: "DUPLICATE_CONTENT", ...result }, { status: 409 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof InstanceNotFoundError) {
      return NextResponse.json({ error: "NOT_FOUND", message: err.message }, { status: 404 });
    }
    console.error("POST /api/documents/upload", err);
    return NextResponse.json({ error: "INTERNAL", message: "Error inesperado." }, { status: 500 });
  }
}
