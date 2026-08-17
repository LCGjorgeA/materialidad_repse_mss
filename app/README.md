# Portal de Materialidad y Expediente MSS — App

Implementación del Portal descrito en [`../docs`](../docs). Stack: Next.js (App Router, TypeScript), Drizzle ORM, PostgreSQL 16. Ver el plan de fases en `../` (arranque documentado en la conversación de planeación) y la arquitectura completa en [`03_ARQUITECTURA_TECNICA.md`](../docs/03_ARQUITECTURA_TECNICA.md).

## Arranque local

```bash
npm install
cp .env.example .env.local   # ajustar DATABASE_URL si hace falta
npm run db:up                # levanta Postgres 16 vía Docker Compose
npm run db:migrate           # aplica las migraciones generadas
npm run db:seed              # carga catálogos semilla (FR-009): frentes, áreas, servicios, tipos
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

**Fase 0 (bootstrap) + inicio de Fase 1 (núcleo del dominio).** Esquema de base de datos para taxonomía, requisitos e instancias ya definido y migración generada. Pendiente: servicios de generación de instancias, endpoints de API, UI del Inventario Maestro.
