# 02 — Especificación UX/UI y flujos de usuario

**Portal de Materialidad y Expediente MSS**
Versión 1.0 · 17 de agosto de 2026

> Deriva de [01_PRD.md](01_PRD.md). Todo término está definido en [00_GLOSARIO.md](00_GLOSARIO.md). Cada pantalla y flujo cita los `FR-###` que implementa.

---

## Índice

1. [Arquitectura de información](#1-arquitectura-de-información)
2. [Navegación principal](#2-navegación-principal)
3. [Roles y vistas correspondientes](#3-roles-y-vistas-correspondientes)
4. [Tableros](#4-tableros)
5. [Vista del Inventario Maestro](#5-vista-del-inventario-maestro)
6. [Ficha del requisito](#6-ficha-del-requisito)
7. [Flujo de entrega de documentos](#7-flujo-de-entrega-de-documentos)
8. [Experiencia de colocación en SharePoint](#8-experiencia-de-colocación-en-sharepoint)
9. [Cola de validación](#9-cola-de-validación)
10. [Pantalla de validación](#10-pantalla-de-validación)
11. [Gestión de excepciones](#11-gestión-de-excepciones)
12. [Búsqueda](#12-búsqueda)
13. [Drill-down analítico](#13-drill-down-analítico)
14. [Pantallas de administración](#14-pantallas-de-administración)
15. [Perfil y trabajo asignado](#15-perfil-y-trabajo-asignado)
16. [Notificaciones](#16-notificaciones)
17. [Estados vacíos](#17-estados-vacíos)
18. [Estados de carga](#18-estados-de-carga)
19. [Estados de error](#19-estados-de-error)
20. [Estados de confirmación](#20-estados-de-confirmación)
21. [Responsividad](#21-responsividad)
22. [Flujos de usuario end-to-end](#22-flujos-de-usuario-end-to-end)
23. [Índice de pantallas](#23-índice-de-pantallas)

---

## 0. Principios de diseño

Cinco decisiones que gobiernan toda la especificación.

**1. El usuario nunca navega carpetas.** El modelo mental del Portal es "¿qué requisito estás cubriendo?", no "¿en qué carpeta va esto?". La ruta de SharePoint se **muestra** como confirmación, nunca se **pide**.

**2. La instancia es la unidad de trabajo.** Toda acción del colaborador y del validador ocurre sobre una instancia con periodo concreto, no sobre un requisito abstracto. Las pantallas que muestran requisitos siempre exponen su desglose por instancia.

**3. Densidad para quien trabaja, síntesis para quien supervisa.** Coordinadores y validadores viven en tablas densas con filtros persistentes. Dirección ve tarjetas y gráficas. Nunca la misma pantalla en dos modos: son pantallas distintas.

**4. Cada número lleva a su detalle.** Ningún indicador es un callejón sin salida (`FR-702`). Es requisito de auditabilidad, y también la forma de que la gente confíe en el tablero.

**5. El colaborador es el usuario más frágil.** Usa el Portal pocas horas al mes y no leyó nada. Su ruta —ver pendiente, cargar, confirmar— debe funcionar sin conocer la taxonomía y en menos de un minuto. Toda decisión de diseño que agregue fricción a esa ruta debe justificarse.

---

## 1. Arquitectura de información

```
Portal
│
├── Inicio                                        SC-001
│
├── Mi trabajo                                    SC-030
│   ├── Detalle de instancia                      SC-031
│   ├── Entregar documento                        SC-032
│   ├── Registrar documento existente             SC-033
│   └── Entrega múltiple                          SC-034
│
├── Inventario Maestro                            SC-020
│   ├── Ficha del requisito                       SC-021
│   │   ├── Cobertura por periodo                 SC-024
│   │   └── Historial y comentarios
│   ├── Editor de requisito                       SC-022
│   └── Importar inventario                       SC-023
│
├── Validación                                    SC-040
│   └── Validar instancia                         SC-041
│
├── Excepciones                                   SC-050
│   ├── Ficha de excepción                        SC-051
│   └── Pendientes de aprobación                  SC-052
│
├── Reconciliación                                SC-070
│   ├── Archivos huérfanos                        SC-070
│   └── Enlaces rotos                             SC-071
│
├── Búsqueda                                      SC-060
│   ├── Ficha de documento                        SC-062
│   └── Trazabilidad                              SC-061
│
├── Analítica                                     SC-010
│   ├── Por frente y área/servicio                SC-011
│   ├── Cobertura por periodo                     SC-012
│   ├── Por responsable                           SC-013
│   └── Volumen documental                        SC-014
│
├── Cierre                                        SC-100
│
├── Administración
│   ├── Taxonomía                                 SC-080
│   ├── Usuarios y roles                          SC-081
│   ├── Rutas y nombres                           SC-082
│   ├── Catálogos                                 SC-083
│   ├── Conexión SharePoint                       SC-084
│   ├── Validación y excepciones                  SC-085
│   └── Salud operativa                           SC-086
│
└── Perfil                                        SC-090
    └── Notificaciones                            SC-091
```

---

## 2. Navegación principal

Barra lateral izquierda, colapsable, con las secciones que el rol del usuario puede ver. Barra superior con búsqueda global, campana de notificaciones y menú de usuario.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ≡  Portal MSS        [🔍 Buscar en todo el proyecto...        ]     🔔 3  JG ▾│
├────────────────────┬─────────────────────────────────────────────────────────┤
│                    │                                                          │
│  ⌂  Inicio         │                                                          │
│  ☑  Mi trabajo  12 │                    Área de contenido                     │
│  ▤  Inventario     │                                                          │
│  ✓  Validación   8 │                                                          │
│  ⚠  Excepciones  3 │                                                          │
│  ⟳  Reconciliar  5 │                                                          │
│  🔍 Búsqueda       │                                                          │
│  ▮  Analítica      │                                                          │
│  🔒 Cierre         │                                                          │
│  ⚙  Administración │                                                          │
│                    │                                                          │
│ ─────────────────  │                                                          │
│  Proyecto MSS 2026 │                                                          │
│  Cierre: 31-dic-26 │                                                          │
│  ▓▓▓▓▓▓░░░░  58%   │                                                          │
└────────────────────┴─────────────────────────────────────────────────────────┘
```

**Reglas de navegación**

- Los contadores muestran trabajo pendiente **del usuario**, no totales del sistema.
- Los elementos que el rol no puede usar **no se muestran** (`FR-932`); no aparecen deshabilitados.
- El indicador de avance del proyecto está siempre visible: es el propósito de la herramienta.
- La búsqueda global es accesible desde cualquier pantalla con `/`.
- Migas de pan en toda pantalla de detalle, siguiendo la jerarquía del glosario: `Materialidad › Atracción de Talento › Selección y Reclutamiento › Evaluación › REQ-MAT-03-002 › 2021-03`.

---

## 3. Roles y vistas correspondientes

| Sección | admin | area_coordinator | contributor | validator | viewer |
|---|:---:|:---:|:---:|:---:|:---:|
| Inicio | Tablero global | Tablero de sus áreas | Sus pendientes | Su cola | Tablero global |
| Mi trabajo | ✔ | ✔ | ✔ | ✔ | ✘ |
| Inventario | Total, editable | Su ámbito, editable | Solo lectura, sus asignaciones | Su ámbito, solo lectura | Solo lectura |
| Validación | ✔ | Solo lectura | ✘ | ✔ | ✘ |
| Excepciones | ✔ + aprobar | Su ámbito + aprobar bajo | Proponer | Proponer | Solo lectura |
| Reconciliación | ✔ | Su ámbito | ✘ | ✘ | ✘ |
| Búsqueda | ✔ | ✔ | ✔ | ✔ | ✔ |
| Analítica | ✔ | Su ámbito | Su desempeño | Su ámbito | ✔ |
| Cierre | ✔ | Su ámbito | ✘ | Su ámbito | Solo lectura |
| Administración | ✔ | ✘ | ✘ | ✘ | ✘ |

### Pantalla de inicio por rol — `SC-001`

**Propósito.** Llevar a cada usuario a su siguiente acción en menos de cinco segundos.
**Permisos.** Todos los autenticados. El contenido cambia por rol.

| Rol | Qué ve |
|---|---|
| `admin` | Avance global, avance por frente, top 5 áreas rezagadas, excepciones abiertas por impacto, salud operativa, actividad reciente |
| `area_coordinator` | Avance de sus áreas, requisitos sin asignar, pendientes vencidos de su equipo, huérfanos de su ámbito, excepciones por aprobar |
| `contributor` | Sus pendientes agrupados por vencimiento (vencidos, esta semana, después), rechazos que atender, entregas recientes |
| `validator` | Tamaño de su cola, antigüedad del más viejo, validadas hoy, excepciones que propuso |
| `viewer` | Avance global, avance por frente y área, cobertura por periodo, excepciones abiertas |

**Estados.** Vacío (proyecto sin configurar → guía de primeros pasos para `admin`). Carga (esqueletos por tarjeta). Error (cada tarjeta falla de forma independiente y reintenta sola).

---

## 4. Tableros

### `SC-010` — Tablero de proyecto

**Propósito.** Responder "¿cómo va el proyecto y dónde está atorado?" (`FR-710`, `FR-711`, `FR-712`).
**Usuarios.** `admin`, `viewer`, `area_coordinator` (acotado a su ámbito).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Tablero de proyecto                        Actualizado 17-ago-2026 09:42  ⟳  │
│ Filtros: [Frente ▾] [Área ▾] [Periodo ▾] [Responsable ▾]      [Exportar ⭳]  │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ RECOPILACIÓN   │ │ VALIDACIÓN     │ │ COMPLETITUD    │ │ EXCEPCIONES    │ │
│ │     67.4%      │ │     58.1%      │ │     59.8%      │ │      23        │ │
│ │ ▓▓▓▓▓▓▓░░░     │ │ ▓▓▓▓▓▓░░░░     │ │ ▓▓▓▓▓▓░░░░     │ │ 4 alto · 19 ⋯  │ │
│ │ 84,220/125,000 │ │ 72,600/125,000 │ │  ⓘ fórmula     │ │  abiertas      │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
│                                                                              │
│ UNIVERSO DOCUMENTAL                          ESTADO DE LAS INSTANCIAS        │
│  Requisitos definidos          1,842          Pend. recopilar    40,780      │
│  Instancias esperadas        125,000          En recopilación     8,340      │
│  Fuera de alcance              2,110          Recopiladas        11,620      │
│  Sin denominador (12 req.)     ⚠ ver          Validadas          72,600      │
│                                               Parcial              1,240     │
│                                               No obtenido            420     │
│                                                                              │
│ AVANCE POR FRENTE                                                            │
│  Expediente MSS          ▓▓▓▓▓▓▓░░░ 71.2%   ·  62,400 / 87,600  · 14 exc.   │
│  Materialidad Servicios  ▓▓▓▓▓░░░░░ 51.9%   ·  19,400 / 37,400  ·  9 exc.   │
│                                                                              │
│ ÁREAS MÁS REZAGADAS                          SALUD OPERATIVA                 │
│  Sistemas y Respaldos      18.4%  ▸           Instancias vencidas    2,104   │
│  Estudios y Asesores       24.1%  ▸           Cola de validación    11,620   │
│  Knowledge Management      31.7%  ▸           Espera mediana       4.2 días  │
│  Seguros y Activos         38.2%  ▸           Tasa de rechazo         11.3%  │
│  Backoffice                41.0%  ▸           Cargas fallidas             3  │
│                                               Huérfanos sin resolver     47  │
│                                                                              │
│ ── VOLUMEN DOCUMENTAL (indicador complementario, no mide avance) ──────────  │
│  Documentos 48,220  ·  Almacenamiento 1.8 TB  ·  Por tipo ▸  Por periodo ▸   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes.** Cuatro tarjetas de indicador primario; bloque de universo; bloque de estados; avance por frente; áreas rezagadas; salud operativa; bloque de volumen visualmente separado (`FR-701`).

**Acciones.** Filtrar (persistente por sesión); clic en cualquier cifra → drill-down con filtro aplicado (`FR-702`); exportar con detalle (`FR-721`); recalcular agregados (`admin`).

**Reglas de presentación.**
- El bloque de volumen lleva separador visual y la leyenda explícita.
- El icono ⓘ junto a Completitud abre la fórmula (`FR-711`).
- Los requisitos sin denominador aparecen como advertencia con enlace a su lista, nunca diluidos en el porcentaje (`FR-704`).
- Los indicadores calculados sobre conteo declarado llevan marca de estimado (`FR-705`).
- La marca de tiempo del último cálculo es visible siempre (`FR-703`).

**Estados.** Vacío: "Aún no hay requisitos definidos" + acción de importar. Carga: esqueletos. Error: la tarjeta afectada muestra el fallo y reintenta; las demás siguen.

---

### `SC-011` — Avance por área/servicio

**Propósito.** Comparar áreas y bajar al detalle (`FR-713`, `FR-714`).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Avance por área / servicio      [Frente: Todos ▾] [Ordenar: % asc ▾]   ⭳    │
├───────────────────────────┬──────┬──────┬────────┬───────┬──────┬───────┬────┤
│ Área / Servicio           │ Req. │ Inst.│ Recop. │ Valid.│  %   │ Exc.  │    │
├───────────────────────────┼──────┼──────┼────────┼───────┼──────┼───────┼────┤
│ ▸ 09 Sistemas y Respaldos │  142 │ 4,120│    810 │   758 │ 18.4%│   6 ⚠ │  ▸ │
│ ▸ 10 Estudios y Asesores  │   48 │   612 │   162 │   147 │ 24.1%│   1   │  ▸ │
│ ▸ 05 Knowledge Management │   96 │ 2,880│  1,010 │   913 │ 31.7%│   2   │  ▸ │
│ ▾ 06 Nómina y Laboral     │  310 │28,400│ 21,300 │19,880 │ 70.0%│   3   │  ▾ │
│    ├ Contratación         │   84 │ 6,200│  5,100 │ 4,890 │ 78.9%│   0   │  ▸ │
│    ├ Nómina quincenal     │  120 │16,800│ 12,400 │11,600 │ 69.0%│   1   │  ▸ │
│    └ Bajas y finiquitos   │  106 │ 5,400│  3,800 │ 3,390 │ 62.8%│   2   │  ▸ │
│ ▸ 02 Contabilidad y EEFF  │  268 │21,400│ 18,900 │17,720 │ 82.8%│   4   │  ▸ │
├───────────────────────────┼──────┼──────┼────────┼───────┼──────┼───────┼────┤
│ TOTAL                     │1,842 │125,000│84,220 │72,600 │ 58.1%│  23   │    │
└───────────────────────────┴──────┴──────┴────────┴───────┴──────┴───────┴────┘
```

**Regla de integridad.** El renglón TOTAL es exactamente la suma de los renglones de primer nivel (`FR-722`). Si no cuadra, es defecto bloqueante.

**Acciones.** Expandir a proceso y actividad; clic en cualquier celda numérica → lista filtrada de instancias; ▸ → inventario filtrado por esa área.

---

### `SC-012` — Cobertura por periodo

**Propósito.** Identificar periodos históricos descubiertos (`FR-715`, `FR-716`).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Cobertura por periodo    [Frente ▾] [Área ▾] [Métrica: Validación ▾]    ⭳   │
├──────────────────────────────────────────────────────────────────────────────┤
│        ENE  FEB  MAR  ABR  MAY  JUN  JUL  AGO  SEP  OCT  NOV  DIC   AÑO      │
│ 2020   ███  ███  ███  ▓▓▓  ▓▓▓  ███  ███  ███  ███  ███  ███  ███   94%     │
│ 2021   ███  ███  ░░░  ░░░  ░░░  ░░░  ░░░  ▓▓▓  ███  ███  ███  ███   61%     │
│ 2022   ███  ███  ███  ███  ███  ███  ███  ███  ███  ▓▓▓  ▓▓▓  ▓▓▓   88%     │
│ 2023   ███  ███  ███  ███  ███  ███  ███  ███  ███  ███  ███  ███   99%     │
│ 2024   ███  ███  ███  ███  ███  ███  ▓▓▓  ▓▓▓  ▓▓▓  ░░░  ░░░  ░░░   68%     │
│ 2025   ▓▓▓  ▓▓▓  ▓▓▓  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░   23%     │
│ 2026   ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░   —    —    —    —     9%     │
│                                                                              │
│  ███ ≥90%   ▓▓▓ 40-89%   ░░░ <40%   — fuera de alcance                       │
│                                                                              │
│ PERIODOS CON MAYOR FALTANTE                                                  │
│  2021-03 a 2021-07   2,840 instancias sin validar   Tesorería, Contabilidad ▸│
│  2024-10 a 2024-12   1,920 instancias sin validar   Nómina, Facturación    ▸ │
│  2025-04 en adelante 4,610 instancias sin validar   Todas las áreas        ▸ │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Acciones.** Clic en celda → instancias de ese periodo. Cambiar métrica entre recopilación y validación. Cambiar granularidad a trimestre o año.

---

### `SC-013` — Avance por responsable

**Propósito.** Seguimiento de personas (`FR-717`).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Avance por responsable       [Área ▾] [Solo con vencidos ☐]  [Recordar 📧] ⭳ │
├──────────────────────┬───────┬────────┬─────────┬──────────┬─────────┬───────┤
│ Responsable          │ Asig. │ Pend.  │ Vencidas│ Entregad.│ Validad.│ Rech. │
├──────────────────────┼───────┼────────┼─────────┼──────────┼─────────┼───────┤
│ M. Ramírez  (Tes.)   │ 4,120 │  1,840 │   412 ⚠ │    2,280 │   2,104 │   36  │
│ J. Fuentes  (Nóm.)   │ 6,800 │    920 │    18   │    5,880 │   5,640 │   84  │
│ A. Delgado  (Sist.)  │ 4,120 │  3,310 │ 1,180 ⚠ │      810 │     758 │   12  │
│ Sin asignar          │ 2,240 │  2,240 │    —    │        — │       — │    —  │
├──────────────────────┼───────┼────────┼─────────┼──────────┼─────────┼───────┤
│ TOTAL                │125,000│ 40,780 │  2,104  │   84,220 │  72,600 │  944  │
└──────────────────────┴───────┴────────┴─────────┴──────────┴─────────┴───────┘
```

**Acciones.** Clic en persona → sus instancias; "Recordar" → recordatorio a los responsables del conjunto filtrado (`FR-805`); "Sin asignar" es un renglón siempre visible porque es el hallazgo más accionable del tablero.

---

### `SC-014` — Volumen documental

Indicadores complementarios (`FR-718`): documentos totales, por tipo, por periodo, por área, almacenamiento, tamaño promedio. Encabezado permanente: *"Estos indicadores dimensionan el trabajo realizado. No miden el avance del proyecto; para eso ver Cobertura y Validación."*

---

## 5. Vista del Inventario Maestro

### `SC-020` — Inventario Maestro

**Propósito.** Ver, filtrar y operar el universo documental (`FR-120`–`FR-124`).
**Usuarios.** `admin` y `area_coordinator` con edición; `validator`, `contributor` y `viewer` en lectura.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Inventario Maestro                     1,842 requisitos · 125,000 instancias │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │🔍 Buscar…    [Frente ▾][Área ▾][Proceso ▾][Tipo ▾][Periodicidad ▾]      │ │
│ │              [Responsable ▾][Estatus ▾][Sensibilidad ▾][Crítico ☐]      │ │
│ │  Filtros: Frente=Expediente MSS ✕  Área=Tesorería ✕      Limpiar todo    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ [+ Nuevo requisito] [⭱ Importar] [⭳ Exportar ▾]   [Columnas ⚙][Densidad ▤]  │
│ ☑ 3 seleccionados → [Asignar] [Fecha objetivo] [Criticidad] [Sensibilidad]   │
├──┬────────────────┬──────────────────────┬─────────┬──────────┬──────┬───────┤
│☑ │ ID             │ Documento requerido  │ Proceso │Periodici.│ Inst.│ Avance│
├──┼────────────────┼──────────────────────┼─────────┼──────────┼──────┼───────┤
│☑ │EXP-04-TES-0017 │Estado de cuenta      │ Bancos  │ Mensual  │   84 │▓▓▓▓░ 71%│
│  │                │Banorte 1234          │         │2020-2026 │      │ 60/84 │
│☑ │EXP-04-TES-0018 │Conciliación bancaria │ Bancos  │ Mensual  │   84 │▓▓▓░░ 58%│
│☑ │EXP-04-TES-0021 │Contrato de cuenta    │ Bancos  │Permanente│    1 │▓▓▓▓▓100%│
│  │EXP-04-TES-0024 │Comprobante transfer. │ Pagos   │ Por trx  │  ~⚠  │ ░░░░░ n/d│
│  │EXP-04-TES-0031 │Autorización de pago  │ Pagos   │ Por trx  │  412 │▓▓░░░ 34%│
├──┴────────────────┴──────────────────────┴─────────┴──────────┴──────┴───────┤
│ ◂ 1 2 3 … 74 ▸        50 por página ▾              1–50 de 3,680 requisitos  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Columnas disponibles** (seleccionables, con perfil guardado por usuario): ID, documento requerido, frente, área, proceso, actividad, tipo de información, periodicidad, rango, instancias esperadas, recopiladas, validadas, % cobertura, % validación, excepciones, responsable, fecha objetivo, sensibilidad, crítico, última actividad, campos de extensión.

**Reglas de presentación**
- `~⚠` en instancias señala requisito sin denominador (`FR-704`); la barra de avance muestra `n/d`, nunca 0 %.
- El requisito crítico lleva marca visual permanente.
- Las columnas de avance se calculan siempre sobre instancias (`FR-700`).
- Los filtros persisten por sesión y son compartibles por URL.
- Las acciones en lote solo aparecen con selección activa, y solo las permitidas por el rol.

**Estados.** Vacío general: "El inventario está vacío" + Importar / Crear (solo `admin` y coordinador). Vacío por filtro: "Ningún requisito coincide" + Limpiar filtros. Carga: esqueleto de tabla con encabezados reales. Error: banda superior con reintento; los filtros se conservan.

---

### `SC-023` — Importar inventario

**Propósito.** Cargar el inventario del Paso 1 desde Excel (`FR-130`–`FR-135`).
**Usuarios.** `admin`, `area_coordinator` (su ámbito).

Asistente de cuatro pasos, sin salto posible entre ellos:

```
 ① Plantilla        ② Cargar archivo      ③ Vista previa      ④ Confirmar

┌── Paso ③ Vista previa ───────────────────────────────────────────────────────┐
│  Archivo: Inventario_Tesoreria_v3.xlsx · 248 renglones · leído en 3.1 s      │
│                                                                              │
│   ✓ 231 válidos      ⚠ 5 con advertencia      ✕ 12 con error                 │
│                                                                              │
│  ⚠ Estos 231 requisitos generarán 18,412 instancias de evidencia esperada.   │
│    El área pasará de 4,120 a 22,532 instancias.                              │
│                                                                              │
│  Modo:  ◉ Solo aplicar los 231 válidos    ○ Cancelar todo si hay errores     │
│                                                                              │
│  ┌ Errores ────────────────────────────────────────────────────────────────┐ │
│  │ Ren. 14 │ Proceso "Cuentas Extranjeras" no existe en Tesorería          │ │
│  │ Ren. 22 │ Periodicidad "Bimestral" no es válida                         │ │
│  │ Ren. 47 │ Fin de periodo (2019-12) anterior al inicio (2020-01)         │ │
│  │ Ren. 61 │ Periodicidad "Por proveedor" requiere base de cálculo         │ │
│  │ Ren. 88 │ Responsable "mfuentes@" no existe en el directorio            │ │
│  │ … 7 más                                            [⭳ Descargar todos]  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ┌ Advertencias ──────────────────────────────────────────────────────────┐ │
│  │ Ren. 103 │ Genera 2,190 instancias (diario 2020-2026). ¿Es correcto?    │ │
│  │ Ren. 156 │ Ya existe EXP-04-TES-0017. Se actualizará, no se duplicará.  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    [◂ Volver]  [Cancelar]  [Confirmar 231 ▸] │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Reglas.** Nada se aplica antes del paso ④ (`FR-133`). El conteo de instancias proyectadas es obligatorio antes de confirmar (`FR-132`): es el momento en que alguien descubre que su inventario son 18,000 documentos. Al confirmar se ejecuta en segundo plano con progreso y resultado descargable (`FR-134`).

---

## 6. Ficha del requisito

### `SC-021` — Ficha del requisito

**Propósito.** Todo sobre un requisito y su cobertura. Es la pantalla más importante del Portal.
**Usuarios.** Todos, con acciones según rol.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ‹ Inventario  ›  Expediente MSS › Tesorería y Bancos › Bancos › Conciliación │
├──────────────────────────────────────────────────────────────────────────────┤
│ EXP-04-TES-0017 · Estado de cuenta bancario Banorte 1234        ★ Crítico    │
│ Mensual · ene-2020 a dic-2026 · Responsable: M. Ramírez · Restringido        │
│                          [Editar] [Asignar] [Comentar] [Cerrar requisito ⊘] │
├──────────────────────────────────────────────────────────────────────────────┤
│  84 esperadas   60 recopiladas   58 validadas   1 parcial   2 excepciones    │
│  Cobertura ▓▓▓▓▓▓▓░░░ 71.4%      Validación ▓▓▓▓▓▓▓░░░ 69.0%                │
│  Faltan: 2021-03 a 2021-07, 2024-11, 2025-02 a 2026-08          (24 periodos)│
├──────────────────────────────────────────────────────────────────────────────┤
│ [Cobertura] [Documentos 62] [Excepciones 2] [Historial] [Comentarios 4]      │
├──────────────────────────────────────────────────────────────────────────────┤
│ COBERTURA POR PERIODO                    ☑ 5 seleccionadas → [Asignar]       │
│                                            [Fecha objetivo] [Entregar juntas]│
│        ENE  FEB  MAR  ABR  MAY  JUN  JUL  AGO  SEP  OCT  NOV  DIC            │
│ 2020    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓            │
│ 2021    ✓    ✓    ○    ○    ○    ○    ○    ◐    ✓    ✓    ✓    ✓            │
│ 2022    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓            │
│ 2023    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ⚠            │
│ 2024    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✕    ✓            │
│ 2025    ✓    ○    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱            │
│ 2026    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱    ⏱            │
│                                                                              │
│  ✓ Validada   ● Recopilada, en validación   ◐ En recopilación                │
│  ○ Pendiente   ⏱ Vencida   ⚠ Parcial   ✕ No obtenida   — Fuera de alcance    │
├──────────────────────────────────────────────────────────────────────────────┤
│ DEFINICIÓN                                                                   │
│  Descripción   Estado de cuenta mensual emitido por Banorte para la cuenta   │
│                1234, en PDF original del banco. Debe conservar el formato    │
│                nativo emitido, sin reimpresión ni conversión.                │
│  Tipo          Estado de cuenta          Formato nativo   Sí · .pdf          │
│  Composición   Estado de cuenta (obligatorio)                                │
│                Carátula de conciliación (opcional)                           │
│  Referencias   Banco/Cuenta: Banorte-1234 (obligatoria)                      │
│  Ruta canónica 01_Expediente_MSS/04_Tesoreria_y_Bancos/Banorte_1234/         │
│                {AAAA}/{MM}/Estados_de_Cuenta/                                │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Datos mostrados.** Definición completa, cobertura agregada, lista de periodos faltantes en texto (`FR-212`), rejilla de cobertura (`FR-209`, `FR-210`), documentos vinculados, excepciones, historial (`FR-126`), comentarios (`FR-127`).

**Acciones por rol.** `admin`/coordinador: editar, asignar, cerrar, agregar instancia, marcar fuera de alcance. `contributor`: entregar contra las instancias que le tocan. `validator`: ir a validar las que están en cola. Todos: comentar y exportar.

**Reglas de validación en pantalla.** No se puede cerrar con instancias pendientes ni excepciones sin aprobar (`FR-526`, `FR-540`); el botón está deshabilitado con el motivo visible al pasar el cursor. Editar rango o periodicidad abre el diálogo de impacto (`SC-022`).

**Estados.** Sin instancias (requisito sin denominador): la rejilla se sustituye por lista con acción de agregar instancia. Carga: la cabecera aparece primero, la rejilla después. Error parcial: la cobertura carga aunque falle la lista de documentos.

---

### `SC-022` — Editor de requisito + diálogo de impacto

Formulario en secciones: identificación, ubicación en la taxonomía, definición, periodicidad y periodo, composición, referencias, asignación, clasificación, campos de extensión.

Al cambiar periodicidad o rango, antes de guardar (`FR-205`, `FR-116`):

```
┌── Efecto sobre las instancias ───────────────────────────────────────────────┐
│                                                                              │
│  Cambio: rango de periodo   ene-2020 – dic-2026  →  ene-2018 – dic-2026      │
│                                                                              │
│    Instancias actuales                84                                     │
│    Se crearán                       + 24   (ene-2018 a dic-2019)             │
│    Saldrán de alcance                  0                                     │
│    Total resultante                  108                                     │
│                                                                              │
│    Cobertura   71.4 %  →  55.6 %                                             │
│    ⚠ El porcentaje de este requisito y del área BAJARÁ al ampliar el rango.  │
│      Es el comportamiento correcto: el universo creció.                      │
│                                                                              │
│  Ninguna instancia con documentos, validaciones o historial será eliminada.  │
│                                                                              │
│                                          [Cancelar]  [Aplicar el cambio ▸]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

Si el cambio reduce el rango y hay instancias con documentos, el diálogo las lista y explica que quedarán *fuera de alcance* conservando todo su contenido (`FR-204`).

---

## 7. Flujo de entrega de documentos

### `SC-030` — Mi trabajo

**Propósito.** La única pantalla que un colaborador necesita conocer (`FR-305`).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Mi trabajo                                          12 pendientes · 3 vencidos│
│ [Agrupar por: Vencimiento ▾]  [Área ▾]  [Estatus ▾]      [☐ Solo rechazados] │
├──────────────────────────────────────────────────────────────────────────────┤
│ ⚠ RECHAZADOS — requieren tu atención (2)                                     │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Estado de cuenta Banorte 1234 · marzo 2021                    EXP-04-0017││
│  │ ✕ Rechazado por L. Herrera hace 2 días                                   ││
│  │   "El PDF corresponde a febrero, no a marzo. Verificar el periodo."      ││
│  │                                          [Ver detalle]  [Entregar otro ▸]││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ ⏱ VENCIDOS (3)                                                               │
│  □ Conciliación bancaria · nov 2024      venció hace 8 días    [Entregar ▸]  │
│  □ Conciliación bancaria · dic 2024      venció hace 8 días    [Entregar ▸]  │
│  □ Contrato de cuenta · Permanente       venció hace 21 días   [Entregar ▸]  │
│                                                                              │
│ 📅 ESTA SEMANA (4)                                                           │
│  □ Estado de cuenta Banorte · abr 2021   para el 19-ago        [Entregar ▸]  │
│  □ Estado de cuenta Banorte · may 2021   para el 19-ago        [Entregar ▸]  │
│  □ Estado de cuenta Banorte · jun 2021   para el 19-ago        [Entregar ▸]  │
│  □ Estado de cuenta Banorte · jul 2021   para el 19-ago        [Entregar ▸]  │
│      ☑ 4 seleccionados  →  [Entregar juntos ▸]  [No tengo esta información]  │
│                                                                              │
│ 📆 DESPUÉS (5)                                             [Ver todos ▾]     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Decisiones de diseño.** Los rechazos van hasta arriba con el motivo visible sin abrir nada — es la información que el colaborador necesita para no repetir el error. La agrupación por vencimiento hace la priorización obvia sin que el usuario ordene nada. La selección múltiple habilita la entrega conjunta (`FR-320`), que es el caso más frecuente en requisitos mensuales.

**Estados.** Vacío positivo: "No tienes pendientes. Todo lo asignado está entregado." con un resumen de lo validado. Vacío negativo (sin asignaciones): "Aún no tienes documentación asignada. Tu coordinador te avisará." con el nombre del coordinador.

---

### `SC-032` — Entregar documento

**Propósito.** La ruta crítica del producto (`FR-310`–`FR-322`).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Entregar documento                                                       ✕   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Estado de cuenta bancario Banorte 1234                                       │
│ Periodo: marzo 2021 · EXP-04-TES-0017                                        │
│ ⓘ PDF original emitido por el banco. Conservar formato nativo.               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌────────────────────────────────────────────────────────────────────┐    │
│    │            Arrastra el archivo aquí o [Selecciona…]                │    │
│    │      También puedes [vincular uno que ya está en SharePoint]       │    │
│    └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ✓ EdoCta_Banorte_Marzo2021.pdf · 2.4 MB · PDF                              │
│                                                                              │
│  Papel en la instancia    [Estado de cuenta (obligatorio) ▾]                 │
│  Banco / Cuenta *         [Banorte-1234                                  ]   │
│  Observaciones            [                                              ]   │
│                                                                              │
│  ┌ Destino en SharePoint ───────────────────────────────────────── ⓘ ──────┐ │
│  │ 01_Expediente_MSS / 04_Tesoreria_y_Bancos / Banorte_1234 / 2021 / 03 /  │ │
│  │ Estados_de_Cuenta/                                                      │ │
│  │                                                                         │ │
│  │ Nombre    2021-03_Tesoreria_EdoCuenta_Banorte1234.pdf         [Editar]  │ │
│  │ Original  EdoCta_Banorte_Marzo2021.pdf  (se conserva como metadato)     │ │
│  │ ⓘ La carpeta se creará automáticamente.                                 │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│                                              [Cancelar]  [Entregar ▸]        │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Reglas de validación.**
- Los campos de referencia marcados con `*` bloquean el envío si faltan (`FR-321`, `FR-352`).
- El nombre editado se valida contra el patrón vigente (`FR-312`).
- Extensión inesperada → advertencia no bloqueante; extensión prohibida → bloqueo (`FR-319`).
- El nombre original siempre visible y siempre conservado (`FR-313`).
- Duplicado detectado por hash → interrumpe con el diálogo de `FR-315`:

```
┌── Este archivo ya está en el sistema ────────────────────────────────────────┐
│  Contenido idéntico a:                                                       │
│    2021-03_Tesoreria_EdoCuenta_Banorte1234.pdf                               │
│    Entregado por M. Ramírez el 14-jun-2026 · Validado                        │
│    Vinculado a: EXP-04-TES-0017 · marzo 2021                                 │
│                                                                              │
│  ◉ Vincular el documento existente a esta instancia (no se vuelve a subir)   │
│  ○ Entregar de todas formas como documento distinto                          │
│      Motivo *  [                                                         ]   │
│  ○ Cancelar                                                                  │
│                                                          [Continuar ▸]       │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Entrega múltiple — `SC-034`.** Mismo diálogo con la lista de instancias destino visible arriba. Un archivo, N vínculos, un solo documento en SharePoint (`FR-320`):

```
│ Entregar a 4 instancias                                                      │
│  ☑ Estado de cuenta · abril 2021    ☑ Estado de cuenta · junio 2021         │
│  ☑ Estado de cuenta · mayo 2021     ☑ Estado de cuenta · julio 2021         │
│  ⓘ Se creará UN documento en SharePoint, vinculado a las 4 instancias.       │
│    La ruta se calcula con el periodo más antiguo (2021-04).                  │
```

---

### `SC-033` — Registrar documento existente

Camino B (`FR-330`–`FR-337`).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Vincular documento que ya está en SharePoint                             ✕   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Estado de cuenta bancario Banorte 1234 · marzo 2021                          │
│                                                                              │
│  ◉ Buscar en SharePoint    ○ Pegar URL o ruta                                │
│  ┌ 01_Expediente_MSS / 04_Tesoreria_y_Bancos / ─────────────────────────────┐│
│  │ 🔍 [banorte marzo                                                       ]││
│  │  📁 Banorte_1234/                                                       ││
│  │  📁 Migracion_Despacho_2026/                                            ││
│  │   └📄 EdoCta_Banorte_032021.pdf      2.4 MB   12-may-2026        ◉      ││
│  │   └📄 EdoCta_Banorte_042021.pdf      2.3 MB   12-may-2026        ○      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ⚠ Desviación de ubicación                                                   │
│    Está en   …/Migracion_Despacho_2026/                                      │
│    Canónica  …/Banorte_1234/2021/03/Estados_de_Cuenta/                       │
│    Se registrará en su ubicación actual y quedará marcada la desviación.     │
│    [Normalizar ubicación al vincular ☐]   ⓘ mueve el archivo en SharePoint   │
│                                                                              │
│  ⚠ Desviación de nombre                                                      │
│    Actual   EdoCta_Banorte_032021.pdf                                        │
│    Canónico 2021-03_Tesoreria_EdoCuenta_Banorte1234.pdf                      │
│    [Normalizar nombre al vincular ☐]                                         │
│                                                                              │
│  Papel  [Estado de cuenta (obligatorio) ▾]   Banco/Cuenta * [Banorte-1234 ]  │
│                                              [Cancelar]  [Vincular ▸]        │
└──────────────────────────────────────────────────────────────────────────────┘
```

Las casillas de normalización están **desmarcadas por defecto** (`DA-002`, opción A). Si el archivo ya está vinculado a otra instancia, el diálogo lo informa y agrega el vínculo en lugar de crear un documento (`FR-337`).

---

## 8. Experiencia de colocación en SharePoint

`FR-400`–`FR-412`. El principio: **el usuario ve el destino, no lo elige.**

### Progreso de entrega

```
┌── Entregando documento ──────────────────────────────────────────────────────┐
│  EdoCta_Banorte_Marzo2021.pdf · 2.4 MB                                       │
│                                                                              │
│  ✓ Verificando duplicados                                                    │
│  ✓ Resolviendo destino en SharePoint                                         │
│  ✓ Creando carpeta 2021/03/Estados_de_Cuenta                                 │
│  ⣾ Subiendo archivo…                             ▓▓▓▓▓▓▓▓▓░░░  74%           │
│  ○ Registrando ubicación                                                     │
│  ○ Actualizando estatus                                                      │
│                                                            [Cancelar]        │
└──────────────────────────────────────────────────────────────────────────────┘
```

Para archivos grandes se muestran velocidad y tiempo restante, y la ventana puede cerrarse dejando la carga en segundo plano con aviso al terminar (`FR-316`).

### Éxito

```
┌── Entregado ─────────────────────────────────────────────────────────────  ✓ │
│  2021-03_Tesoreria_EdoCuenta_Banorte1234.pdf                                 │
│  📁 …/Banorte_1234/2021/03/Estados_de_Cuenta/        [Abrir en SharePoint ↗] │
│  Estado: Recopilado → en cola de validación                                  │
│  Tu siguiente pendiente: Estado de cuenta · abril 2021                       │
│                              [Ver instancia]  [Siguiente pendiente ▸]  [Ok]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Fallo

```
┌── No se pudo completar la entrega ───────────────────────────────────────  ✕ │
│  El archivo se subió pero no pudimos confirmar su registro.                  │
│  Lo estamos reintentando automáticamente. No vuelvas a subirlo.              │
│                                                                              │
│  Referencia del error: ERR-7F2A-4C81                                         │
│  Reintentos: 2 de 5 · Siguiente en 40 s                                      │
│              [Ver estado]  [Avisar al administrador]  [Entendido]            │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Regla clave.** El mensaje distingue tres situaciones y nunca las confunde, porque de eso depende que el usuario no duplique el archivo:

| Situación | Mensaje | Acción del usuario |
|---|---|---|
| No se subió | "No se pudo subir. Puedes reintentar." | Reintentar |
| Se subió, no se registró | "Se subió. Estamos confirmando el registro. No vuelvas a subirlo." | Esperar |
| Se subió y registró, falló lo posterior | "Entregado. Algunos datos se actualizarán en unos minutos." | Continuar |

### Cola de reconciliación — `SC-070`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Archivos huérfanos                       47 sin resolver · última corrida 06:00│
│ ⓘ Archivos en SharePoint que ningún requisito del inventario referencia.     │
│ [Área ▾] [Detectados desde ▾] [Ordenar: más recientes ▾]     [Ejecutar ⟳]    │
├──────────────────────────────────────────────────────────────────────────────┤
│ 📄 Conciliacion_Banorte_Sep2024.xlsx                        Detectado 16-ago │
│    …/04_Tesoreria_y_Bancos/Banorte_1234/2024/09/  · 840 KB · por A. Delgado  │
│    💡 Sugerencia: EXP-04-TES-0018 · septiembre 2024 (91% de coincidencia)    │
│    [Vincular a la sugerencia] [Buscar otra instancia] [No relevante] [Escalar]│
├──────────────────────────────────────────────────────────────────────────────┤
│ 📄 Notas_reunion_cierre.docx                                Detectado 15-ago │
│    …/00_Control_Proyecto/  · 62 KB · por M. Ramírez                          │
│    Sin sugerencia                                                            │
│    [Buscar instancia] [Crear requisito nuevo] [No relevante] [Escalar]        │
└──────────────────────────────────────────────────────────────────────────────┘
```

La sugerencia se calcula por coincidencia de ruta, nombre y periodo detectado. Marcar "No relevante" exige motivo y deja registro de auditoría.

---

## 9. Cola de validación

### `SC-040` — Cola de validación

**Propósito.** Despachar volumen (`FR-500`–`FR-503`).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Cola de validación                     1,240 pendientes · más antigua 12 días│
│ [Área ▾][Proceso ▾][Tipo ▾][Responsable ▾][Periodo ▾][☑ Solo críticos]      │
│ Ordenar: [Criticidad y antigüedad ▾]              [Validar en lote (3) ▸]    │
├──┬─────────────────────────┬───────────┬──────────┬──────────┬───────┬───────┤
│☑ │ Requisito               │ Periodo   │ Área     │ Entregó  │ Espera│       │
├──┼─────────────────────────┼───────────┼──────────┼──────────┼───────┼───────┤
│☑ │★ Estado cta. Banorte    │ 2021-03   │ Tesorería│M.Ramírez │12 d ⚠ │[Rev ▸]│
│☑ │★ Estado cta. Banorte    │ 2021-04   │ Tesorería│M.Ramírez │12 d ⚠ │[Rev ▸]│
│☑ │★ Estado cta. Banorte    │ 2021-05   │ Tesorería│M.Ramírez │12 d ⚠ │[Rev ▸]│
│  │  Pipeline candidatos    │ 2025-02   │ Talento  │J.Fuentes │ 4 d   │[Rev ▸]│
│  │  Reporte agencia viajes │ 2024-Q3   │ Logística│A.Delgado │ 2 d   │[Rev ▸]│
├──┴─────────────────────────┴───────────┴──────────┴──────────┴───────┴───────┤
│ ◂ 1 2 3 … 25 ▸                                       1–50 de 1,240 instancias│
└──────────────────────────────────────────────────────────────────────────────┘
```

Las tres primeras comparten requisito y son consecutivas: candidatas naturales a validación en lote (`FR-511`), que el sistema detecta y sugiere. Las instancias donde el propio validador cargó el documento **no aparecen** en su cola (`FR-504`).

---

## 10. Pantalla de validación

### `SC-041` — Validar instancia

**Propósito.** Resolver una instancia en menos de un minuto (`FR-505`–`FR-515`).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ‹ Cola   Validando 1 de 1,240        [◂ Anterior] [Siguiente ▸]     Salir ✕  │
├─────────────────────────────────────┬────────────────────────────────────────┤
│                                     │ EXP-04-TES-0017 · marzo 2021       ★   │
│                                     │ Estado de cuenta Banorte 1234          │
│      ┌───────────────────────┐      │ Tesorería › Bancos › Conciliación      │
│      │                       │      │                                        │
│      │   Vista previa del    │      │ ┌ VERIFICADO AUTOMÁTICAMENTE ────────┐ │
│      │      documento        │      │ │ ✓ Ubicación coincide con la canónica│ │
│      │                       │      │ │ ✓ Formato nativo (.pdf) correcto    │ │
│      │                       │      │ │ ✓ Metadatos obligatorios completos  │ │
│      │                       │      │ │ ✓ Referencia Banorte-1234 presente  │ │
│      │                       │      │ │ ⚠ Nombre menciona "Marzo2021";      │ │
│      │                       │      │ │   la instancia es 2021-03 ✓         │ │
│      └───────────────────────┘      │ └────────────────────────────────────┘ │
│  2021-03_..._Banorte1234.pdf        │                                        │
│  2.4 MB · PDF · v1                  │ ┌ REVISIÓN ─────────────────────────┐  │
│  Original: EdoCta_Banorte_Marzo…    │ │ ☑ Documento correcto          (1) │  │
│  Entregó M. Ramírez · 05-ago 14:22  │ │ ☑ Periodo correcto            (2) │  │
│  [Abrir en SharePoint ↗] [Descargar]│ │ ☑ El archivo abre             (3) │  │
│                                     │ │ ☐ Completo y legible          (4) │  │
│                                     │ │ ☑ Ubicación correcta      auto    │  │
│                                     │ │ ☑ Formato nativo          auto    │  │
│                                     │ │ ☑ Metadatos capturados    auto    │  │
│                                     │ │ ☑ Relación transaccional  auto    │  │
│                                     │ └───────────────────────────────────┘  │
│                                     │ Comentario [                       ]   │
│                                     │                                        │
│                                     │ [✓ Validar (V)] [✕ Rechazar (R)]      │
│                                     │ [◐ Parcial (P)] [⊘ No obtenido (N)]   │
├─────────────────────────────────────┴────────────────────────────────────────┤
│ Definición: PDF original emitido por el banco. Conservar formato nativo.     │
│ Instancia: 1 de 84 · requisito al 71.4% · Historial ▾ · Comentarios (0) ▾    │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Decisiones de diseño.** Los cuatro puntos verificables por el sistema se marcan solos y se muestran arriba, separados de los que exigen criterio humano. El validador solo decide sobre los cuatro que importan. Atajos `V`/`R`/`P`/`N` (`FR-514`) y avance automático a la siguiente. Validar exige el checklist obligatorio completo; el botón está deshabilitado con el motivo visible mientras falte alguno.

### Rechazar

```
┌── Rechazar ──────────────────────────────────────────────────────────────────┐
│  Motivo *   [Periodo incorrecto                                          ▾]  │
│             Documento incorrecto · Periodo incorrecto · Archivo ilegible ·   │
│             Documentación incompleta · Formato no nativo · Metadatos ·       │
│             Ubicación incorrecta · Otro                                      │
│  Comentario para el responsable *                                            │
│  [El PDF corresponde a febrero, no a marzo. Verificar el periodo.        ]   │
│                                                                              │
│  ⓘ Vuelve a "En recopilación". Se notifica de inmediato a M. Ramírez.        │
│                                            [Cancelar]  [Rechazar ▸]          │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Parcial / No obtenido

Abre el formulario de excepción incrustado (`FR-510`); sin él, el estatus no se puede fijar y el botón de confirmar permanece deshabilitado.

---

## 11. Gestión de excepciones

### `SC-050` — Registro de excepciones

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Excepciones y riesgos documentales        23 abiertas · 4 de impacto alto    │
│ [Estado ▾][Impacto ▾][Área ▾][Frente ▾]     [+ Nueva]  [⭳ Exportar registro] │
├────────┬────────────────────────┬─────────┬────────┬──────────────┬──────────┤
│ ID     │ Qué falta              │ Impacto │ Estado │ Propuso      │ Aprueba  │
├────────┼────────────────────────┼─────────┼────────┼──────────────┼──────────┤
│ EXC-041│ Edos. cta. Banorte     │ ALTO    │En rev. │M.Ramírez 12/8│Dirección │
│        │ mar-jul 2021 (5 inst.) │         │        │              │          │
│ EXC-038│ Reporte agencia Q3-24  │ MEDIO   │Aprob.  │A.Delgado 02/8│Dueño ✓   │
│ EXC-035│ Correos coord. ene-21  │ BAJO    │Mitigada│J.Fuentes 28/7│Coord. ✓  │
├────────┴────────────────────────┴─────────┴────────┴──────────────┴──────────┤
│ Este registro es el anexo de excepciones del cierre del proyecto.            │
└──────────────────────────────────────────────────────────────────────────────┘
```

### `SC-051` — Ficha de excepción

Los cuatro campos obligatorios del Plan Macro (`FR-521`), el alcance (instancias afectadas), la evidencia de sustento (`FR-529`), el flujo de aprobación con nivel derivado del impacto (`FR-523`) y el historial.

```
│ EXC-041 · Impacto ALTO · En revisión                                         │
│ Alcance   EXP-04-TES-0017 · 5 instancias: 2021-03 a 2021-07                  │
│ Qué falta *      Estados de cuenta de marzo a julio de 2021, cuenta Banorte  │
│                  1234.                                                       │
│ Por qué *        El banco no conserva estados de cuenta con más de 5 años.   │
│                  Se solicitó por escrito (folio BNT-2026-0912) y se recibió  │
│                  negativa formal. No hay copia en el despacho contable ni en │
│                  los respaldos de correo revisados.                          │
│ Impacto *        No puede demostrarse el movimiento bancario de 5 meses de   │
│                  2021. Afecta la conciliación de ese periodo.                │
│ Tratamiento *    Se sustituye parcialmente con auxiliares contables y pólizas│
│                  del periodo. Se conserva la negativa del banco como sustento│
│ Sustento         📎 BNT-2026-0912_Negativa.pdf                               │
│ Aprobación       Requiere Dirección (impacto alto)     [Aprobar][Rechazar]   │
```

---

## 12. Búsqueda

### `SC-060` — Búsqueda global

**Propósito.** Localizar sin saber quién lo generó ni dónde vivía (`FR-600`–`FR-612`).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🔍 [A-4471                                                        ] [Buscar] │
├────────────────────┬─────────────────────────────────────────────────────────┤
│ FILTROS            │ 14 resultados · 0.4 s              [⭳ Exportar]         │
│                    │ [Todo 14] [Requisitos 2] [Instancias 5] [Documentos 7]  │
│ Frente             │                                                          │
│ ☑ Expediente  (9)  │ 📄 2024-07_Facturacion_FacturaEmitida_GM_A4471.pdf      │
│ ☑ Materialidad(5)  │    Documento · Facturación y Cobranza · 2024-07         │
│                    │    Satisface 4 instancias · Factura A-4471              │
│ Área               │    …/07_Facturacion_y_Cobranza/2024/07/Facturas/        │
│ ☐ Facturación (7)  │    [Ver documento] [Trazabilidad] [Abrir en SharePoint↗]│
│ ☐ Backoffice  (4)  │                                                          │
│ ☐ Tesorería   (3)  │ 📄 2024-07_Backoffice_BaseCalculo_FeeGM_A4471.xlsx      │
│                    │    Documento · Backoffice · 2024-07                     │
│ Periodo            │    Satisface 2 instancias · Factura A-4471              │
│ [2024 ▾][Julio ▾]  │                                                          │
│                    │ ☑ Estado de cuenta · 2024-07 · Tesorería               │
│ Tipo de documento  │    Instancia · Validada · Factura A-4471                │
│ ☐ Factura     (3)  │                                                          │
│ ☐ Base cálculo(2)  │ 🔒 Recibo de nómina · 2024-07 · Nómina y Laboral        │
│ ☐ Correo      (4)  │    Instancia · Confidencial — sin acceso al contenido   │
│                    │    Contacto: J. Fuentes                                 │
│ Referencia         │                                                          │
│ [Factura: A-4471]✕ │                                                          │
│ Estatus / Respons. │                                                          │
└────────────────────┴─────────────────────────────────────────────────────────┘
```

**Regla de sensibilidad.** El cuarto resultado ilustra `FR-603` y `FR-933`: el registro **existe y es visible**, con quién contactarlo, pero su contenido y metadatos sensibles están restringidos. La localización nunca se impide.

### `SC-061` — Trazabilidad

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Trazabilidad · EXP-07-FAC-0044 · julio 2024                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│  Expediente MSS                                                              │
│    └ 07 Facturación y Cobranza                                               │
│        └ Facturación intercompañía                                           │
│            └ Emisión de factura mensual a GM                                 │
│                └ REQUISITO EXP-07-FAC-0044 · Factura emitida + base cálculo  │
│                    └ INSTANCIA julio 2024 · ✓ Validada · vence 15-ago-2024   │
│                        ├ 📄 …_FacturaEmitida_GM_A4471.pdf   (principal)      │
│                        │    …/07_Facturacion/2024/07/Facturas/   [Abrir ↗]   │
│                        │    Entregó J. Fuentes · 12-ago-2026                 │
│                        └ 📄 …_BaseCalculo_FeeGM_A4471.xlsx   (base cálculo)  │
│                             …/08_Backoffice/2024/07/Fee/         [Abrir ↗]   │
│                                                                              │
│  Referencias: Factura A-4471 · Cliente GM · Pago PAG-2024-0871               │
│  Validó L. Herrera · 14-ago-2026 · sin observaciones                         │
│  Excepciones: ninguna                                                        │
│                                                                              │
│  El documento A-4471 también satisface 3 instancias de Materialidad:         │
│    Backoffice · Fee calculations · 2024-07                        [Ver ▸]    │
│    Backoffice · Facturación clientes · 2024-07                    [Ver ▸]    │
│    Asignación y Logística · Planeación de recursos · 2024-07      [Ver ▸]    │
└──────────────────────────────────────────────────────────────────────────────┘
```

Esta pantalla es la respuesta visual a la pregunta de cierre del Plan Macro: la información se explica sola, sin depender de quien la produjo.

---

## 13. Drill-down analítico

Regla de navegación uniforme (`FR-702`, `FR-714`): **cada clic conserva los filtros acumulados y agrega uno nuevo.**

```
Tablero de proyecto
  │ clic en "Validación 58.1%"
  ▼
Instancias validadas del proyecto        [filtro: estatus=Validada]
  │ clic en "Tesorería" en el desglose
  ▼
Instancias validadas de Tesorería        [+ área=Tesorería]
  │ clic en "2021"
  ▼
Instancias validadas Tesorería 2021      [+ periodo=2021]
  │ clic en un renglón
  ▼
Ficha de la instancia SC-031
  │
  ▼
Documento SC-062 → SharePoint ↗
```

La barra de filtros activos es visible siempre, cada filtro se puede quitar individualmente, y la URL es compartible con el estado completo. Un botón "Volver al tablero" regresa sin perder el contexto.

---

## 14. Pantallas de administración

| Pantalla | Propósito | FR |
|---|---|---|
| `SC-080` Taxonomía | Árbol editable de frentes, áreas, procesos y actividades; arrastrar para reordenar; activar/desactivar; segmento de carpeta y rango de periodo por nodo | `FR-003`–`FR-014` |
| `SC-081` Usuarios y roles | Alta desde el directorio; matriz usuario × rol × ámbito; vista de permisos efectivos de un usuario | `FR-900`, `FR-901` |
| `SC-082` Rutas y nombres | Editor de plantillas con tokens, vista previa en vivo con datos reales, simulación en masa, advertencia de longitud | `FR-440`–`FR-447` |
| `SC-083` Catálogos | Tipos de información, papeles, motivos de rechazo, sensibilidad, niveles de impacto, campos de extensión | `FR-902`, `FR-107` |
| `SC-084` Conexión SharePoint | Sitio, biblioteca, carpeta raíz; prueba de conectividad y de permisos con resultado detallado | `FR-903` |
| `SC-085` Validación y excepciones | Editor del checklist por área/tipo; matriz de aprobación por impacto | `FR-905`, `FR-906` |
| `SC-086` Salud operativa | Trabajos en segundo plano, cola de fallidos con reintento, última reconciliación, uso de límites de Graph | `FR-908`, `FR-909` |

### `SC-082` — Editor de plantillas de ruta

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Plantilla de ruta · Tesorería y Bancos                    Hereda de: Frente  │
├──────────────────────────────────────────────────────────────────────────────┤
│ [{frente}/{area}/{referencia:banco_cuenta}/{aaaa}/{mm}/{proceso}          ]  │
│                                                                              │
│ Tokens: {frente} {area} {proceso} {actividad} {aaaa} {mm} {trimestre}        │
│         {tipo_documento} {referencia:<tipo>} {permanente}                     │
│                                                                              │
│ ┌ Vista previa con EXP-04-TES-0017 · marzo 2021 ──────────────────────────┐  │
│ │ 01_Expediente_MSS/04_Tesoreria_y_Bancos/Banorte_1234/2021/03/           │  │
│ │ Estados_de_Cuenta/                                                      │  │
│ │ Longitud: 96 de 400 caracteres  ✓                                       │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ⚠ 18 requisitos de esta área ya tienen documentos colocados con la plantilla │
│   anterior. Cambiarla NO mueve archivos; quedarán marcados como desviación   │
│   de ubicación y podrán normalizarse desde la cola de higiene.               │
│                                                                              │
│  [Simular sobre los 142 requisitos del área]  [Cancelar]  [Guardar]          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Perfil y trabajo asignado

### `SC-090` — Perfil

Datos del directorio (solo lectura), roles y ámbitos asignados (solo lectura, con quién los otorgó), preferencias de notificación por tipo de evento (`FR-802`), preferencias de interfaz (densidad, columnas por defecto, búsquedas guardadas), y resumen personal de desempeño: asignadas, entregadas, validadas, rechazadas, tiempo promedio de entrega.

### `SC-091` — Centro de notificaciones

Lista cronológica agrupada por tipo, con no leídas destacadas, enlace directo al registro de origen (`FR-804`), y acciones de marcar leída y marcar todas.

---

## 16. Notificaciones

### Dentro del Portal

Campana con contador de no leídas; panel desplegable con las cinco más recientes; sin interrupciones modales; solo los eventos accionables de `FR-800`.

### Por correo

```
Asunto: [Portal MSS] Se rechazó tu entrega — Estado de cuenta Banorte, marzo 2021

Hola M. Ramírez,

L. Herrera revisó tu entrega y la devolvió para corrección.

  Requisito   Estado de cuenta bancario Banorte 1234
  Periodo     marzo 2021
  Motivo      Periodo incorrecto
  Comentario  El PDF corresponde a febrero, no a marzo. Verificar el periodo.

  [Ver y volver a entregar]

Portal de Materialidad y Expediente MSS · Preferencias de notificación
```

### Resumen diario

```
Asunto: [Portal MSS] Tus pendientes — 3 vencidos

Tienes 12 pendientes de entrega.

  ⚠ Vencidos (3)
     Conciliación bancaria · nov 2024 · venció hace 8 días
     Conciliación bancaria · dic 2024 · venció hace 8 días
     Contrato de cuenta · Permanente · venció hace 21 días

  📅 Esta semana (4)      📆 Después (5)

  [Ver todos mis pendientes]
```

Regla: cada correo cabe en una pantalla, dice qué hacer y lleva a un solo lugar (`FR-801`, `FR-804`).

---

## 17. Estados vacíos

Todo estado vacío responde tres cosas: qué está vacío, por qué, y qué hacer.

| Pantalla | Situación | Mensaje | Acción |
|---|---|---|---|
| `SC-020` | Sin requisitos | "El inventario está vacío. El Paso 1 define qué debe recopilarse." | Importar · Crear requisito |
| `SC-020` | Filtro sin resultados | "Ningún requisito coincide con estos filtros." | Limpiar filtros |
| `SC-030` | Sin pendientes | "No tienes pendientes. Todo lo asignado está entregado." + resumen de validados | Ver mis entregas |
| `SC-030` | Sin asignaciones | "Aún no tienes documentación asignada. Tu coordinador (M. Ramírez) te avisará." | Ver el inventario de mi área |
| `SC-040` | Cola vacía | "No hay nada por validar en tu ámbito." + cuántas validaste esta semana | Ver validadas |
| `SC-050` | Sin excepciones | "No hay excepciones registradas. Todo el universo se ha podido recopilar." | — |
| `SC-070` | Sin huérfanos | "Sin archivos huérfanos. Todo lo que está en SharePoint está en el inventario." + fecha de la última corrida | Ejecutar reconciliación |
| `SC-010` | Proyecto sin configurar | "El proyecto aún no tiene requisitos. Los tableros se activarán al cargar el inventario." | Ir a configuración |
| `SC-021` | Requisito sin instancias | "Este requisito no tiene denominador definido. Las instancias se crearán conforme se entreguen documentos." | Definir base de cálculo · Agregar instancia |
| `SC-060` | Búsqueda sin resultados | "Nada coincide con «X»." + sugerencias de términos cercanos | Buscar en todo el proyecto |

El estado vacío de `SC-050` es deliberadamente celebratorio: cero excepciones es el resultado ideal del proyecto.

---

## 18. Estados de carga

| Situación | Patrón | Criterio |
|---|---|---|
| Tabla | Esqueleto con encabezados reales y filtros ya operables | Nunca pantalla en blanco |
| Tablero | Esqueleto por tarjeta; cada una aparece al resolverse | Fallo independiente por tarjeta |
| Rejilla de cobertura | Cabecera del requisito primero, rejilla después | Lo importante primero |
| Subida de archivo | Progreso por etapas con porcentaje y bytes | El usuario entiende dónde va |
| Operación larga (importar, reconciliar) | Segundo plano con barra persistente; se puede navegar | Nunca bloquear la aplicación |
| Recálculo de agregados | Cifras anteriores atenuadas + "actualizando…" | Nunca ceros temporales, que se leen como pérdida de datos |
| Búsqueda | Indicador en línea; resultados anteriores atenuados | Sin salto de disposición |
| Guardado de formulario | Botón en estado de carga, formulario bloqueado | Evita doble envío |
| Vista previa de documento | Marco con carga; si falla, enlace directo | Degradación limpia |

Umbrales: < 300 ms sin indicador; 300 ms–1 s indicador en línea; > 1 s esqueleto o barra; > 10 s segundo plano con notificación al terminar.

---

## 19. Estados de error

Todo error dice: qué pasó (sin jerga), si se perdió algo, qué hacer, y una referencia para soporte (`NFR-022`).

| Error | Mensaje | Recuperación |
|---|---|---|
| Sin permiso | "No tienes acceso a esta área. Solicítalo a tu administrador." | Enlace al administrador |
| Sesión expirada | "Tu sesión terminó. Vuelve a iniciar sesión." | Reingreso conservando la pantalla y el formulario |
| SharePoint no responde | "No podemos conectar con SharePoint. Tu entrega quedó guardada y se subirá al restablecerse." | Reintento automático |
| Límite de tasa de Graph | "SharePoint está ocupado. Reintentando en 40 s." | Automático, sin acción |
| Archivo muy grande | "El archivo supera el límite de 250 MB. Divídelo o contacta al administrador." | Instrucción concreta |
| Extensión prohibida | "No se permiten archivos .exe por seguridad." | Bloqueo con motivo |
| Conflicto de edición | "Otra persona modificó este requisito mientras lo editabas." + comparación | Recargar o sobrescribir |
| Importación con errores | Ver `SC-023` | Corregir y reimportar |
| Enlace roto | "El archivo ya no está en SharePoint. Puede haberse movido o eliminado." | Buscar · Reabrir instancia · Excepción |
| Carga fallida definitiva | Ver §8 | Cola de fallidos + aviso al administrador |
| Error inesperado | "Algo salió mal. Referencia: ERR-XXXX-XXXX" | Reintentar · Reportar |

Principio: **el sistema nunca dice "error de red" a secas.** Siempre indica si el trabajo del usuario se conservó, porque eso determina si debe repetirlo.

---

## 20. Estados de confirmación

Se confirma lo que es difícil de deshacer o tiene efecto amplio.

| Acción | Tipo | Qué muestra |
|---|---|---|
| Entrega exitosa | Aviso no bloqueante | Nombre final, ubicación, siguiente pendiente |
| Validar | En línea, sin diálogo | Marca visual + avance automático |
| Rechazar | Diálogo | Motivo, comentario, a quién se notifica |
| Parcial / No obtenido | Diálogo con excepción incrustada | No se puede confirmar sin excepción |
| Cambiar rango o periodicidad | Diálogo de impacto | Instancias creadas, fuera de alcance, cambio de porcentaje |
| Importar inventario | Vista previa obligatoria | Válidos, errores, instancias proyectadas |
| Cerrar requisito | Diálogo | Verificación de criterios; bloqueado si falta alguno |
| Cerrar área o proyecto | Diálogo con lista de verificación | Todos los criterios con su estado |
| Normalizar ubicación | Diálogo | Ruta actual → nueva; advertencia de enlaces existentes |
| Marcar fuera de alcance | Diálogo con motivo | Qué se excluye del denominador |
| Reabrir requisito cerrado | Diálogo con motivo | Efecto sobre el cierre del área |
| Eliminar registro con historial | Bloqueado | Explica por qué y ofrece dar de baja |
| Recordatorio masivo | Diálogo | A cuántas personas, sobre cuántas instancias |

---

## 21. Responsividad

**Escritorio (≥ 1280 px) — experiencia completa.** Es donde ocurre el trabajo real: tablas densas, rejillas de cobertura, validación con vista previa lado a lado.

**Tableta (768–1279 px) — trabajo parcial.** Barra lateral colapsada; tablas con menos columnas y detalle expandible; rejilla de cobertura con desplazamiento horizontal; validación con vista previa apilada sobre el checklist.

**Móvil (< 768 px) — consulta y aprobación ligera.** Ruta soportada:

| Sí | No |
|---|---|
| Ver tableros y avance | Editar la taxonomía |
| Ver mis pendientes | Importar inventario |
| Ver detalle de instancia y documento | Validación con vista previa completa |
| Aprobar o rechazar una excepción | Configuración administrativa |
| Buscar y abrir en SharePoint | Resolver huérfanos |
| Comentar | Rejilla de cobertura completa (se sustituye por lista) |
| Recibir y abrir notificaciones | |

**Regla.** El móvil nunca ofrece una versión degradada de una tarea que exige precisión. Si la tarea no cabe bien, la pantalla explica que requiere escritorio en lugar de dejar que el usuario la intente y falle.

Accesibilidad transversal (`NFR-014`): navegación completa por teclado, foco visible, contraste AA, etiquetas en todo control, estado nunca comunicado solo por color —los estados de la rejilla de cobertura usan símbolo además de color—, y anuncios de región activa para cambios de estatus.

---

## 22. Flujos de usuario end-to-end

### `UF-001` — El administrador crea un requisito

```
Inventario (SC-020) → [+ Nuevo requisito] → Editor (SC-022)
  1. Selecciona frente, área, proceso, actividad
  2. Nombre corto y descripción                                    FR-103
  3. Tipo de información, formato nativo, extensiones              FR-105
  4. Composición: qué documentos, cuáles obligatorios              FR-104
  5. Periodicidad = Mensual                                        FR-110
  6. Rango: ene-2020 a dic-2026                                    FR-111
     ⚡ El sistema calcula 84 instancias y lo muestra en vivo       FR-116
  7. Referencias obligatorias: Banco/Cuenta                        FR-352
  8. Responsable y fecha objetivo                                  FR-300
  9. Sensibilidad: Restringido                                     FR-011
 10. Guardar
     → Confirmación: "84 instancias creadas"                       FR-200
     → Notificación al responsable (resumen diario)                FR-800
     → Ficha del requisito (SC-021) con la rejilla poblada
```

**Variante:** si supera el umbral configurado, exige confirmación adicional antes de guardar.

---

### `UF-002` — El colaborador recibe una asignación

```
Resumen diario por correo → [Ver mis pendientes] → Mi trabajo (SC-030)
  Agrupado por vencimiento; los rechazos arriba                    FR-305
  → Selecciona "Estado de cuenta · marzo 2021"
  → Detalle de instancia (SC-031): qué se pide, para cuándo,
    qué formato, quién lo pidió                                    FR-201
  → [Entregar]
```

---

### `UF-003` — El colaborador entrega un documento

```
SC-032 · Entregar documento
  1. Arrastra EdoCta_Banorte_Marzo2021.pdf
  2. El sistema calcula hash y busca duplicados                    FR-314
     ├ Duplicado → diálogo de FR-315 → decide vincular
     └ Sin duplicado → continúa
  3. Muestra destino y nombre propuesto                            FR-311
  4. Captura Banco/Cuenta (obligatoria)                            FR-321
  5. [Entregar]
```

---

### `UF-004` — El sistema determina el destino en SharePoint

```
Interno, sin intervención del usuario:
  1. Resuelve la plantilla del nivel más específico                FR-441
     {frente}/{area}/{referencia:banco_cuenta}/{aaaa}/{mm}/{proceso}
  2. Sustituye tokens con metadatos de la instancia                FR-401
  3. Normaliza: sin acentos, sin caracteres inválidos              FR-443
  4. Verifica longitud contra el límite                            FR-444
  5. Aplica la regla de nombrado                                   FR-445
     → 2021-03_Tesoreria_EdoCuenta_Banorte1234.pdf
  6. Devuelve ruta y nombre para mostrarlos antes de subir         FR-311
```

---

### `UF-005` — El documento se guarda

```
  1. Registra la intención de carga (idempotencia)                 FR-406
  2. Crea las carpetas faltantes                                   FR-402
  3. Abre sesión de carga por partes                               FR-405
  4. Sube con progreso                                             FR-316
  5. Verifica conflicto de nombre → aplica política                FR-410
  6. Recibe y guarda item_id, drive_id, etag, ruta, URL            FR-403
  7. Crea el documento y el vínculo con la instancia
  8. Evalúa la composición → ¿obligatorios completos?              FR-213
     ├ Sí → Recopilado → entra a cola de validación                FR-500
     └ No → sigue En recopilación, muestra qué falta
  9. Registra evento de auditoría                                  FR-920
 10. Encola recálculo de agregados                                 FR-703
 11. Confirmación al usuario con el siguiente pendiente
```

**Camino de fallo:** si el paso 4 falla, reintento con retroceso (`FR-407`); si agota reintentos, entra a la cola de fallidos y se notifica (`FR-408`, `FR-409`). Si falla el paso 6 con el archivo ya subido, el reintento **no vuelve a subir**: reconcilia por `item_id` (`FR-406`).

---

### `UF-006` — El validador revisa

```
Notificación / Cola (SC-040)
  Ordenada por criticidad y antigüedad                             FR-502
  Sin instancias donde él cargó el documento                       FR-504
  → [Revisar] → SC-041
     El sistema pre-verifica ubicación, formato, metadatos,
     referencias                                                   FR-506
     El validador revisa contenido, periodo y legibilidad
```

---

### `UF-007` — El validador aprueba

```
  [✓ Validar] (o tecla V)
  → Requiere checklist obligatorio completo                        FR-506
  → Registra validador, momento, checklist, comentario             FR-512
  → Instancia = Validada
  → Recalcula rollup del requisito, área y frente                  FR-700
  → Notificación al responsable (resumen semanal)                  FR-800
  → Evento de auditoría                                            FR-920
  → Avance automático a la siguiente instancia                     FR-514
  → Si todas las instancias quedan resueltas, el requisito
    queda elegible para cierre                                     FR-540
```

---

### `UF-008` — El validador rechaza

```
  [✕ Rechazar] (o tecla R)
  → Motivo obligatorio + comentario obligatorio                    FR-509
  → Instancia vuelve a En recopilación / Pendiente de validar
  → Notificación INMEDIATA al responsable                          FR-800
  → El documento permanece vinculado (no se borra)
  → Evento de auditoría con motivo
  → El responsable lo ve arriba en SC-030 con el motivo visible
  → Entrega corregida → vuelve a la cola
```

---

### `UF-009` — Se entrega documentación parcial

```
Escenario: se pidieron 12 meses de reportes; solo existen 8.

Camino A — el colaborador lo detecta antes:
  SC-030 → selecciona las 4 instancias sin documento
  → [No tengo esta información]                                    FR-307
  → Formulario: dónde buscó, por qué no existe
  → Genera excepción propuesta al coordinador
  → El colaborador NO puede fijar "No obtenido" por sí mismo

Camino B — el validador lo detecta:
  SC-041 → [◐ Parcial]                                             FR-508
  → Formulario de excepción incrustado, obligatorio                FR-510
  → Impacto → determina nivel de aprobación                        FR-523
  → Instancia = Parcial; no cuenta como validada
  → No suma a % de validación; sí a % de completitud si se aprueba
```

---

### `UF-010` — Se crea una excepción

```
Origen: colaborador (UF-009 A), validador (UF-009 B) o coordinador
  1. Captura los cuatro campos obligatorios                        FR-521
  2. Selecciona alcance: una, varias instancias o el requisito     FR-520
  3. Adjunta sustento (negativa del banco, correo del despacho)    FR-529
  4. Estado = Propuesta → En revisión
  5. Nivel de aprobación derivado del impacto                      FR-523
  6. Notificación INMEDIATA al aprobador                           FR-800
  7. El aprobador resuelve en SC-051:
     ├ Aprobar  → habilita el cierre del requisito                 FR-526
     ├ Rechazar → instancia vuelve a recopilación, notifica        FR-524
     └ Mitigar  → registra evidencia alternativa                   FR-525
  8. Entra al registro consolidado de excepciones                  FR-527
```

---

### `UF-011` — Un requisito llega al cierre

```
  1. El sistema evalúa continuamente los criterios                 FR-540
     · Todas las instancias validadas, o con excepción aprobada
     · Ninguna pendiente ni en recopilación
     · Ninguna excepción sin aprobar
  2. SC-021 muestra [Cerrar requisito] habilitado; si falta algo,
     el botón está deshabilitado con el motivo visible
  3. Un validador o coordinador lo cierra explícitamente           FR-541
  4. Diálogo con la verificación de criterios
  5. Requisito = Cerrado; registra quién y cuándo
  6. Rollup al área: ¿todos sus requisitos cerrados?               FR-542
  7. Notificación al coordinador (resumen semanal)
  8. Evento de auditoría
  9. Reapertura posible con motivo obligatorio                     FR-545
```

---

### `UF-012` — Dirección revisa el avance

```
Inicio (SC-001) → Tablero de proyecto (SC-010)
  Ve 58.1 % de validación
  → Clic en el porcentaje                                          FR-702
  → Lista de instancias validadas con el filtro aplicado
  → Vuelve; ve "Sistemas y Respaldos 18.4 %"
  → Clic → SC-011 expandido en esa área
  → Clic en su proceso más rezagado
  → Lista de requisitos → uno de ellos
  → SC-021: la rejilla muestra 2025 completo en pendiente
  → Pestaña de excepciones: 6 abiertas, 2 de impacto alto
  → SC-051: lee la causa y el tratamiento propuesto
  → [⭳ Exportar] con el detalle que sustenta cada cifra            FR-721
```

Este flujo es la prueba de `FR-702`: de un porcentaje a la causa raíz en cinco clics, sin preguntarle a nadie.

---

### `UF-013` — Se registra un documento que ya está en SharePoint

```
SC-031 → [Vincular uno que ya está en SharePoint] → SC-033
  1. Explora el sitio o pega la URL                                FR-331
  2. Selecciona el archivo
  3. El sistema captura identificadores y calcula hash             FR-332
  4. Compara ubicación real contra canónica                        FR-333
     → Muestra la desviación, no bloquea
  5. Compara nombre real contra canónico                           FR-334
  6. ¿Ya está vinculado a otra instancia?                          FR-337
     → Sí: agrega vínculo, no crea documento nuevo
  7. Captura papel y referencias obligatorias
  8. [Vincular] → mismo efecto de estatus que una carga
  9. Auditoría registra el origen como "registro de existente"
```

---

### `UF-014` — Se resuelve un archivo huérfano

```
Reconciliación programada (06:00 diaria)                           FR-420
  1. Recorre el sitio de forma incremental                         FR-427
  2. Detecta Conciliacion_Banorte_Sep2024.xlsx sin registro        FR-421
  3. Lo agrega a la cola de huérfanos con sugerencia por ruta,
     nombre y periodo detectado
  4. El coordinador abre SC-070
  5. Evalúa la sugerencia: EXP-04-TES-0018 · septiembre 2024
  6. [Vincular a la sugerencia]
     → Se crea el documento con los identificadores del archivo
     → Se vincula a la instancia
     → Se marca la desviación de ubicación si la hay
     → La instancia recalcula su estatus                           FR-213
     → Auditoría registra el origen como "reconciliación"
  7. Alternativas: buscar otra instancia, crear requisito nuevo,
     marcar no relevante con motivo, o escalar                     FR-425
```

Este flujo cierra el hueco que deja la ingesta opcional: **nada que llegue a SharePoint queda fuera del control del proyecto.**

---

## 23. Índice de pantallas

| ID | Pantalla | Usuarios | FR principales |
|---|---|---|---|
| `SC-001` | Inicio | Todos | `FR-305`, `FR-710`, `FR-717` |
| `SC-010` | Tablero de proyecto | admin, viewer, coord. | `FR-710`–`FR-712`, `FR-720` |
| `SC-011` | Avance por área/servicio | admin, viewer, coord. | `FR-713`, `FR-714`, `FR-722` |
| `SC-012` | Cobertura por periodo | admin, viewer, coord. | `FR-715`, `FR-716` |
| `SC-013` | Avance por responsable | admin, coord. | `FR-717`, `FR-805` |
| `SC-014` | Volumen documental | admin, viewer | `FR-701`, `FR-718` |
| `SC-020` | Inventario Maestro | Todos | `FR-120`–`FR-124`, `FR-136` |
| `SC-021` | Ficha del requisito | Todos | `FR-122`, `FR-209`–`FR-212` |
| `SC-022` | Editor de requisito | admin, coord. | `FR-100`–`FR-116`, `FR-205` |
| `SC-023` | Importar inventario | admin, coord. | `FR-130`–`FR-135` |
| `SC-024` | Cobertura del requisito | Todos | `FR-209`, `FR-210`, `FR-211` |
| `SC-030` | Mi trabajo | contributor, todos | `FR-305`, `FR-306` |
| `SC-031` | Detalle de instancia | Todos | `FR-201`, `FR-608` |
| `SC-032` | Entregar documento | contributor, coord. | `FR-310`–`FR-322` |
| `SC-033` | Registrar existente | contributor, coord. | `FR-330`–`FR-337` |
| `SC-034` | Entrega múltiple | contributor, coord. | `FR-320`, `FR-211` |
| `SC-040` | Cola de validación | validator | `FR-500`–`FR-504` |
| `SC-041` | Validar instancia | validator | `FR-505`–`FR-515` |
| `SC-050` | Registro de excepciones | admin, coord., validator | `FR-527`, `FR-528` |
| `SC-051` | Ficha de excepción | admin, coord., validator | `FR-520`–`FR-525` |
| `SC-052` | Pendientes de aprobación | Según impacto | `FR-523` |
| `SC-060` | Búsqueda global | Todos | `FR-600`–`FR-606` |
| `SC-061` | Trazabilidad | Todos | `FR-610` |
| `SC-062` | Ficha de documento | Todos | `FR-403`, `FR-607`, `FR-340` |
| `SC-070` | Archivos huérfanos | admin, coord. | `FR-421`, `FR-425` |
| `SC-071` | Enlaces rotos | admin, coord. | `FR-422`, `FR-426` |
| `SC-080` | Taxonomía | admin | `FR-003`–`FR-014` |
| `SC-081` | Usuarios y roles | admin | `FR-900`, `FR-901` |
| `SC-082` | Rutas y nombres | admin | `FR-440`–`FR-447` |
| `SC-083` | Catálogos | admin | `FR-902`, `FR-107` |
| `SC-084` | Conexión SharePoint | admin | `FR-903` |
| `SC-085` | Validación y excepciones | admin | `FR-905`, `FR-906` |
| `SC-086` | Salud operativa | admin | `FR-908`, `FR-909` |
| `SC-090` | Perfil | Todos | `FR-802` |
| `SC-091` | Centro de notificaciones | Todos | `FR-803`, `FR-804` |
| `SC-100` | Cierre | admin, coord., validator | `FR-540`–`FR-545` |

---

## Referencias

- [00_GLOSARIO.md](00_GLOSARIO.md) · [01_PRD.md](01_PRD.md) · [03_ARQUITECTURA_TECNICA.md](03_ARQUITECTURA_TECNICA.md) · [04_MODELO_DATOS_API.md](04_MODELO_DATOS_API.md) · [05_PLAN_PRUEBAS_UAT.md](05_PLAN_PRUEBAS_UAT.md) · [DECISIONES_ABIERTAS.md](DECISIONES_ABIERTAS.md)
