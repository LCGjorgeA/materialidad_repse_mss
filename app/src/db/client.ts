import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Next.js carga .env.local solo. Los scripts standalone (seed.ts, corridos con
// tsx) no pasan por Next, así que lo cargamos aquí explícitamente; dotenv no
// pisa variables que ya existan en process.env, así que es seguro en ambos casos.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL no está definida. Copia .env.example a .env.local y ajústala."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
