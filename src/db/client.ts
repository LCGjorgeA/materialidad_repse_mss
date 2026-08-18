import { config } from "dotenv";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Next.js carga .env.local solo. Los scripts standalone (seed.ts, corridos con
// tsx) no pasan por Next, así que lo cargamos aquí explícitamente; dotenv no
// pisa variables que ya existan en process.env, así que es seguro en ambos casos.
config({ path: ".env.local" });

type DbClient = NodePgDatabase<typeof schema>;

let cached: DbClient | null = null;

// La conexión se crea de forma perezosa (al primer uso real), no al importar
// este módulo. Next.js analiza estáticamente cada ruta durante el build (para
// recolectar su config) y eso importa este archivo aunque nunca se ejecute una
// query — si validáramos DATABASE_URL en el top-level, el build fallaría en
// cualquier entorno sin base de datos (CI, `vercel build` local, etc.).
function getDb(): DbClient {
  if (cached) return cached;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL no está definida. Copia .env.example a .env.local y ajústala."
    );
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  cached = drizzle(pool, { schema });
  return cached;
}

export const db: DbClient = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
