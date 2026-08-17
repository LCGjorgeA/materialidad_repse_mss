/**
 * STUB de almacenamiento — reemplaza el rol de Microsoft Graph/SharePoint
 * mientras esa integración no existe (Fase 4 del plan). Guarda los bytes como
 * base64 en `document_blob` (Postgres/Neon).
 *
 * Se intentó provisionar Vercel Blob para esto, pero el flujo de vinculación
 * del store al proyecto necesita un prompt interactivo de selección múltiple
 * que no se pudo automatizar en este entorno (sin TTY real). Postgres-bytea es
 * la alternativa de cero infraestructura nueva — ver plan "Carga de documentos".
 *
 * Límite deliberado de esta iteración: nada de streaming ni carga por partes
 * (FR-316 pide 250 MB con reanudación — eso es trabajo de Fase 4 contra Graph).
 * Un límite práctico razonable para hoy: ver MAX_UPLOAD_BYTES.
 */
import type { db } from "@/db/client";
import { documentBlob } from "@/db/schema";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB

// Recibe el cliente (db o una transacción) en vez de importar `db` directo:
// el insert de document_blob debe correr en la MISMA transacción que crea el
// document_version que referencia, o su FK falla porque esa fila todavía no
// es visible fuera de la transacción que la creó.
export async function putBlob(
  client: Pick<typeof db, "insert">,
  documentVersionId: string,
  bytes: Buffer
): Promise<void> {
  await client.insert(documentBlob).values({
    documentVersionId,
    bytes: bytes.toString("base64"),
  });
}
