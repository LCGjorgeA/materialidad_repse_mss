/**
 * STUB de sesión — reemplaza a Entra ID/SSO mientras esa integración no existe
 * (Fase 4 del plan). Devuelve siempre el mismo app_user de desarrollo,
 * sembrado por src/db/seed-demo.ts.
 *
 * TODO Fase 4: reemplazar por la sesión real (Auth.js/MSAL contra Entra ID) —
 * no borrar esta función sin más, el resto del código depende de su forma
 * (`{ id, displayName }`).
 */
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { appUser } from "@/db/schema";

export const DEV_STUB_ENTRA_OBJECT_ID = "dev-stub-jorge";

export async function getCurrentUser() {
  const [user] = await db
    .select()
    .from(appUser)
    .where(eq(appUser.entraObjectId, DEV_STUB_ENTRA_OBJECT_ID))
    .limit(1);

  if (!user) {
    throw new Error(
      "No existe el app_user de desarrollo. Corre `npm run db:seed-demo` primero."
    );
  }

  return user;
}
