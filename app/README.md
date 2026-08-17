# Portal de Materialidad y Expediente MSS — App

Implementación del Portal descrito en [`../docs`](../docs). Stack: Next.js (App Router, TypeScript), Drizzle ORM, PostgreSQL. Ver el plan de fases en `../` (arranque documentado en la conversación de planeación) y la arquitectura completa en [`03_ARQUITECTURA_TECNICA.md`](../docs/03_ARQUITECTURA_TECNICA.md).

**Base de datos: Neon (Vercel Postgres)**, vía la integración de marketplace conectada al proyecto de Vercel. Es la fuente de verdad compartida por dev/preview/producción — no una base local por desarrollador. `.env.local` se llena automáticamente con `vercel env pull` (ver abajo) y nunca se commitea.

## Arranque local

```bash
npm install
vercel link            # solo la primera vez, si el directorio no está ya vinculado
vercel env pull .env.local
npm run db:migrate     # aplica las migraciones generadas contra Neon
npm run db:seed        # carga catálogos semilla (FR-009): frentes, áreas, servicios, tipos — idempotente solo en base vacía
npm run dev
```

**Alternativa sin cuenta de Vercel** (Postgres local con Docker, no la base compartida):

```bash
cp .env.example .env.local   # DATABASE_URL apunta a localhost
npm run db:up                # levanta Postgres 16 vía Docker Compose
npm run db:migrate
npm run db:seed
npm run dev
```

## Estructura

```
src/
├── db/
│   ├── schema/        # Entidades Drizzle, una por archivo temático (ver docs/04_MODELO_DATOS_API.md)
│   ├── migrations/     # SQL generado por drizzle-kit — no editar a mano
│   ├── client.ts        # Conexión Drizzle + pg Pool
│   └── seed.ts           # Catálogos semilla del Plan Macro
├── modules/
│   ├── m1-taxonomia/      # FR-001–FR-099
│   ├── m2-inventario/     # FR-100–FR-199
│   ├── m3-instancias/     # FR-200–FR-299
│   ├── m4-recopilacion/   # FR-300–FR-399
│   ├── m5-sharepoint/     # FR-400–FR-499 (Fase 4 del plan)
│   ├── m6-validacion/     # FR-500–FR-599
│   ├── m7-busqueda/       # FR-600–FR-699
│   ├── m8-analitica/      # FR-700–FR-799
│   ├── m9-notificaciones/ # FR-800–FR-899
│   └── m10-administracion/# FR-900–FR-999
└── app/                    # Rutas Next.js (App Router)
```

Cada módulo corresponde 1:1 al rango `FR-` del [PRD](../docs/01_PRD.md) §8, para que el mapeo requisito → código sea directo.

## Estado

**Fase 0 completa. Fase 1 en curso.** Esquema de base de datos para taxonomía, requisitos e instancias definido, migrado y sembrado contra Neon (producción). UI de skeleton navegable en `src/app/(portal)` con datos mock (`src/lib/mock-data.ts`). Pendiente: servicio de generación de instancias, endpoints de API reales, conectar la UI a esos endpoints.
