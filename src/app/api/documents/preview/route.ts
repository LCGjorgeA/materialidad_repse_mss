import { NextResponse } from "next/server";
import { InstanceNotFoundError, previewUpload } from "@/modules/m4-recopilacion/upload-service";

// FR-311 — mostrar ruta y nombre propuestos antes de transferir el archivo.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.instanceId !== "string" ||
    typeof body.originalFilename !== "string" ||
    typeof body.sizeBytes !== "number"
  ) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "instanceId, originalFilename y sizeBytes son obligatorios." },
      { status: 400 }
    );
  }

  try {
    const preview = await previewUpload({
      instanceId: body.instanceId,
      originalFilename: body.originalFilename,
      sizeBytes: body.sizeBytes,
    });
    return NextResponse.json(preview);
  } catch (err) {
    if (err instanceof InstanceNotFoundError) {
      return NextResponse.json({ error: "NOT_FOUND", message: err.message }, { status: 404 });
    }
    console.error("POST /api/documents/preview", err);
    return NextResponse.json({ error: "INTERNAL", message: "Error inesperado." }, { status: 500 });
  }
}
