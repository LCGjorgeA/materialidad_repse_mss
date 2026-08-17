# 05 — Plan de pruebas, UAT y aceptación

**Portal de Materialidad y Expediente MSS**
Versión 1.0 · 17 de agosto de 2026

> Deriva de [01_PRD.md](01_PRD.md), [02_UX_UI_FLUJOS.md](02_UX_UI_FLUJOS.md), [03_ARQUITECTURA_TECNICA.md](03_ARQUITECTURA_TECNICA.md) y [04_MODELO_DATOS_API.md](04_MODELO_DATOS_API.md). Terminología en [00_GLOSARIO.md](00_GLOSARIO.md).

---

## Índice

1. [Estrategia de pruebas](#1-estrategia-de-pruebas)
2. [Pruebas unitarias](#2-pruebas-unitarias)
3. [Pruebas de integración](#3-pruebas-de-integración)
4. [Pruebas de integración con SharePoint](#4-pruebas-de-integración-con-sharepoint)
5. [Autenticación y permisos](#5-autenticación-y-permisos)
6. [Pruebas de workflow](#6-pruebas-de-workflow)
7. [Integridad de datos](#7-integridad-de-datos)
8. [Carga de archivos](#8-carga-de-archivos)
9. [Escenarios de duplicados](#9-escenarios-de-duplicados)
10. [Documento contra múltiples requisitos](#10-documento-contra-múltiples-requisitos)
11. [Cálculo de cobertura por periodo](#11-cálculo-de-cobertura-por-periodo)
12. [Validación de la analítica](#12-validación-de-la-analítica)
13. [Búsqueda](#13-búsqueda)
14. [Flujo de validación](#14-flujo-de-validación)
15. [Flujo de excepciones](#15-flujo-de-excepciones)
16. [Bitácora de auditoría](#16-bitácora-de-auditoría)
17. [Errores y reintentos](#17-errores-y-reintentos)
18. [Seguridad](#18-seguridad)
19. [Rendimiento](#19-rendimiento)
20. [Cobertura complementaria de requisitos](#20-cobertura-complementaria-de-requisitos)
21. [UAT](#21-uat)
22. [Lista de verificación de producción](#22-lista-de-verificación-de-producción)
23. [Criterios de aceptación final](#23-criterios-de-aceptación-final)
24. [Escenarios end-to-end](#24-escenarios-end-to-end)
25. [Matriz de trazabilidad](#25-matriz-de-trazabilidad)

---

## 1. Estrategia de pruebas

### 1.1 Qué hay que demostrar

Este plan existe para sostener una afirmación concreta:

> **El sistema controla correctamente el universo documental, y todo archivo puede rastrearse hasta su requisito y su ubicación en SharePoint.**

De ahí se derivan cinco preguntas que el plan responde con evidencia, no con opinión:

1. ¿El universo esperado se calcula bien? (§11 — generación de periodos y cobertura)
2. ¿Todo archivo llega a su lugar y queda registrado? (§4, §8 — colocación y trazabilidad)
3. ¿Nada se pierde ni se duplica ante fallos? (§9, §17 — duplicados e idempotencia)
4. ¿Los números del tablero son ciertos? (§12 — reconciliación analítica)
5. ¿El cierre resiste una revisión externa? (§14, §15, §16 — validación, excepciones, auditoría)

### 1.2 Pirámide y alcance

| Nivel | Qué cubre | Cantidad | Dónde corre |
|---|---|---|---|
| Unitarias | Lógica pura: periodos, rutas, nombres, fórmulas, derivación de estatus | ~350 | CI, cada PR |
| Integración | Servicios contra base real y simulador de Graph | ~120 | CI, cada PR |
| Integración SharePoint | Contra Graph y sitio de pruebas reales | ~35 | Despliegue a pruebas |
| End-to-end | Flujos completos por interfaz | ~25 | Despliegue a pruebas |
| Rendimiento | Volumen y concurrencia | ~12 | Semanal y antes de producción |
| Seguridad | Permisos, ámbitos, sensibilidad | ~30 | CI + revisión previa a producción |
| UAT | Guiones por rol con usuarios reales | 5 guiones | Antes de producción |

### 1.3 Criterios de entrada y salida

**Entrada a pruebas de sistema:** todas las unitarias y de integración en verde; cobertura de código ≥ 80 % en `lib/services`; migraciones aplicadas; datos semilla cargados.

**Salida hacia producción:** cero defectos críticos abiertos; cero defectos altos sin plan aceptado; los `TC-` marcados como **bloqueantes** todos en verde; UAT firmado por los cinco roles; lista de verificación de producción completa.

**Definición de severidad**

| Sev. | Criterio | Ejemplo |
|---|---|---|
| **Crítica** | Pérdida de datos, archivo mal ubicado sin detección, número de tablero incorrecto, permiso violado | Un documento se coloca en el área equivocada y nada lo señala |
| **Alta** | Bloquea un flujo principal sin alternativa | No se puede validar en lote y la cola es inmanejable |
| **Media** | Degrada la experiencia; hay rodeo | Un filtro no persiste al volver |
| **Baja** | Cosmético | Alineación de una columna |

### 1.4 Datos de prueba

Un conjunto fijo, versionado, que reproduce las situaciones difíciles del proyecto real:

| Conjunto | Contenido | Para qué |
|---|---|---|
| `SEED-TAX` | Catálogos del Plan Macro completos: 2 frentes, 11 áreas, 9 servicios con subservicios | Base de todo |
| `SEED-REQ-ENUM` | 40 requisitos con las cinco periodicidades enumerables | Generación de periodos |
| `SEED-REQ-NOENUM` | 15 requisitos no enumerables: 10 con marcado manual progresivo (5 con enumeración abierta, 5 cerrada) y 5 con padrón (`driver_list`) | Denominadores (`DA-001`) |
| `SEED-COV` | Un requisito mensual 2020-2026 con **huecos deliberados**: faltan 2021-03 a 2021-07 y 2024-11 | Cobertura por periodo |
| `SEED-MULTI` | Una factura vinculada a 4 instancias de 2 frentes distintos | N:M y descuadre de volumen |
| `SEED-DUP` | Dos archivos de contenido idéntico y nombre distinto | Duplicados |
| `SEED-EXC` | 6 excepciones en los cinco estados posibles | Flujo de excepciones |
| `SEED-USERS` | 10 usuarios cubriendo las combinaciones de rol y ámbito, incluidos roles mixtos | Permisos |
| `SEED-ORPHAN` | 5 archivos colocados en SharePoint **por fuera del Portal** | Reconciliación |
| `SEED-VOL` | 5,000 requisitos / 300,000 instancias / 100,000 documentos, sintéticos | Rendimiento |

Ningún conjunto contiene documentos reales de nómina, fiscales ni bancarios ([Arquitectura §22](03_ARQUITECTURA_TECNICA.md)).

### 1.5 Herramientas

Vitest (unitarias e integración) · Testcontainers con PostgreSQL real · simulador de Graph para CI · Playwright (E2E) · k6 (rendimiento) · consultas SQL de reconciliación ejecutadas como pruebas (§12).

---

## 2. Pruebas unitarias

Lógica pura, sin base de datos ni red. Es donde vive el mayor riesgo de defecto silencioso: un error en la generación de periodos o en una fórmula no se ve, solo produce números equivocados.

### 2.1 Generación de periodos (`PeriodService`)

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-001` 🔴 | `FR-200`, `FR-110` | Requisito mensual 2020-01 a 2026-12 | Generar instancias | 84 instancias, etiquetas `2020-01` … `2026-12` | Conteo = 84 y etiquetas exactas y sin huecos |
| `TC-002` | `FR-200` | Trimestral 2020-2026 | Generar | 28 instancias `2020-Q1` … `2026-Q4` | Conteo = 28 |
| `TC-003` | `FR-200` | Anual 2020-2026 | Generar | 7 instancias `2020` … `2026` | Conteo = 7 |
| `TC-004` | `FR-200` | `date_range` 2020-01 a 2026-12 | Generar | **1** instancia con etiqueta de rango completo | Conteo = 1 |
| `TC-005` | `FR-200` | `permanent` | Generar | 1 instancia `Permanente`, sin fechas | Conteo = 1 y `period_start` nulo |
| `TC-006` | `FR-111` | Mensual con fin anterior al inicio | Guardar | Rechazo con error de validación | La restricción `ck_req_period_order` rechaza |
| `TC-007` | `FR-200` | Mensual del 2021-03 al 2021-03 | Generar | 1 instancia `2021-03` | Los rangos de un solo periodo no se pierden |
| `TC-008` | `FR-200` | Mensual con inicio a mitad de mes (2020-01-15) | Generar | La primera instancia es `2020-01` completa | El día del mes no altera el conteo |
| `TC-009` 🔴 | `FR-114` | Padrón de 38 renglones, periodicidad `per_employee` | Generar | 38 instancias, `driver_key` y `driver_label` de cada renglón | Conteo = 38 y claves únicas |
| `TC-010` 🔴 | `FR-112`, `FR-113` | Requisito `progressive` recién creado | Consultar | `enumeration_status = 'open'`; **cero** instancias iniciales | Sin instancias generadas al crear |
| `TC-010b` 🔴 | `FR-208` | Requisito `progressive` abierto | Cargar 3 documentos en 3 fechas distintas, marcando cada instancia | 3 instancias con `status_source = 'manual'`, `collection_status = 'collected'` | Marcado manual correcto |
| `TC-011` 🔴 | `FR-113b` | Requisito `progressive` con 14 instancias marcadas | Cerrar la enumeración | `enumeration_status = 'closed'`, `enumeration_closed_at`/`by_user_id` registrados; denominador congelado en 14 | Cobertura pasa de "en progreso" a 100 % (14/14) |
| `TC-011b` 🔴 | `FR-113b` | Requisito con enumeración cerrada | Reabrir con motivo | `enumeration_status = 'open'` de nuevo; evento de auditoría con el motivo | Reapertura auditable |
| `TC-012` 🔴 | `FR-200` | Generación ya ejecutada | Ejecutar de nuevo | Sin instancias nuevas ni duplicadas | Idempotencia: conteo sin cambio |
| `TC-013` | `FR-202` | Periodicidades varias | Generar | Etiquetas ordenables alfabéticamente en orden cronológico | `sort(labels)` = orden cronológico |

### 2.2 Resolución de ruta y nombre

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-014` 🔴 | `FR-401`, `FR-440` | Plantilla `{frente}/{area}/{referencia:banco_cuenta}/{aaaa}/{mm}/{proceso}`, instancia 2021-03 | Resolver | `01_Expediente_MSS/04_Tesoreria_y_Bancos/Banorte_1234/2021/03/Estados_de_Cuenta` | Cadena exacta |
| `TC-015` | `FR-446` | Plantilla con `{referencia:x}` sin valor | Resolver | El token se omite **con su separador**; sin `//` ni carpeta vacía | Sin dobles separadores |
| `TC-016` | `FR-443` | Área "Tesorería y Bancos" con acentos | Resolver | `04_Tesoreria_y_Bancos`, sin acentos | Sin caracteres acentuados |
| `TC-017` 🔴 | `FR-443` | Referencia con `"`, `*`, `:`, `<`, `>`, `?`, `/`, `\`, `\|` | Resolver | Todos sustituidos; ruta válida para SharePoint | Sin caracteres prohibidos |
| `TC-018` | `FR-441` | Plantilla en frente, área y requisito | Resolver | Gana la del requisito | Se usa la más específica |
| `TC-019` | `FR-441` | Solo plantilla de frente | Resolver | Se hereda la del frente | Herencia correcta |
| `TC-020` 🔴 | `FR-444` | Ruta resuelta de 420 caracteres | Resolver | Advertencia de longitud y propuesta de abreviación | Advertencia emitida antes de intentar la carga |
| `TC-021` | `FR-401` | Instancia `permanent` | Resolver | Se usa `00_Permanente` en lugar de `{aaaa}/{mm}` | Segmento correcto |
| `TC-022` 🔴 | `FR-445` | Instancia 2021-03, Tesorería, estado de cuenta, Banorte 1234 | Generar nombre | `2021-03_Tesoreria_EdoCuenta_Banorte1234.pdf` | Cadena exacta |
| `TC-023` | `FR-445` | Documento permanente | Generar nombre | Sin prefijo de mes; usa fecha efectiva | Formato correcto |
| `TC-024` | `FR-445`, `FR-340` | Versión 3 | Generar nombre | Sufijo `_v03` presente | Sufijo desde la v2 |
| `TC-025` | `FR-312` | Nombre editado que rompe el patrón | Validar | Rechazo con el motivo | Validación aplicada |

### 2.3 Derivación de estatus

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-026` 🔴 | `FR-213` | Requisito con 3 componentes, 2 obligatorios; 1 obligatorio cargado | Derivar | `in_collection`, con la lista de faltantes | No pasa a `collected` |
| `TC-027` 🔴 | `FR-213` | Los 2 obligatorios cargados | Derivar | `collected` | Transición correcta |
| `TC-028` | `FR-213` | Los 2 obligatorios más el opcional | Derivar | `collected` | El opcional no cambia nada |
| `TC-029` | `FR-213` | Requisito sin componentes declarados, 1 documento | Derivar | `collected` | Comportamiento por defecto |
| `TC-030` | `FR-344` | Instancia `collected`, se desvincula un obligatorio | Derivar | Vuelve a `in_collection` | Reversión correcta |
| `TC-031` | `FR-214` | Forzado a `collected` con justificación | Derivar | `collected` pese a faltantes; bandera y motivo persistidos | Bandera activa |
| `TC-032` 🔴 | `FR-540` | Requisito con 84 instancias: 80 validadas, 4 parciales con excepción aprobada | Evaluar cierre | Elegible para cierre | `eligible = true` |
| `TC-033` 🔴 | `FR-526`, `FR-540` | Igual pero una excepción sin aprobar | Evaluar cierre | **No** elegible, con el bloqueante identificado | `eligible = false` |
| `TC-034` | `FR-540` | Una instancia pendiente de validar | Evaluar cierre | No elegible | `eligible = false` |
| `TC-035` | `FR-204` | Instancias fuera de alcance pendientes | Evaluar cierre | Elegible: las fuera de alcance no bloquean | `eligible = true` |

### 2.4 Fórmulas analíticas

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-036` 🔴 | `FR-711` | 100 en alcance: 60 recopiladas, 55 validadas, 3 parciales, 2 no obtenidas | Calcular | Recopilación 65 %, validación 55 % | Valores exactos |
| `TC-037` 🔴 | `FR-711` | Igual, con 3 parciales y 2 no obtenidas **aprobadas** | Calcular completitud | 60 % | `(55+3+2)/100` |
| `TC-038` 🔴 | `FR-711` | Igual, con las excepciones **sin aprobar** | Calcular completitud | 55 % | Solo las aprobadas suman |
| `TC-039` 🔴 | `FR-704`, `FR-115` | 100 en alcance + 20 instancias marcadas de un requisito `progressive` con enumeración **abierta** | Calcular | Denominador = 100; las 20 se reportan aparte como volumen en progreso | Las de enumeración abierta no diluyen el % |
| `TC-040` 🔴 | `FR-204` | 100 instancias, 10 fuera de alcance | Calcular | Denominador = 90 | Exclusión aplicada |
| `TC-041` | `FR-705` | Requisito `progressive` con enumeración cerrada | Consultar su avance | Marcado visualmente como "denominador por enumeración cerrada" | Bandera presente |
| `TC-042` | `FR-711` | Cero instancias en alcance | Calcular | Sin división por cero; porcentaje nulo, no 0 % | Nulo, no cero |

---

## 3. Pruebas de integración

Servicios contra base de datos real (Testcontainers) y simulador de Graph.

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-043` | `FR-100` | Actividad activa | Crear requisito por API | 201; instancias generadas; `readable_id` asignado | Requisito e instancias persistidos |
| `TC-044` 🔴 | `FR-101` | Requisito creado | Editar nombre y mover de actividad | `readable_id` **no cambia** | Identificador estable |
| `TC-045` 🔴 | `FR-205` | Requisito con 84 instancias, 60 con documentos | `preview-change` ampliando a 2018 | `instancesToCreate: 24`, `toExclude: 0`, cobertura antes/después | Vista previa correcta y sin mutación |
| `TC-046` 🔴 | `FR-204` | Igual, se reduce a 2021-2026 | Aplicar cambio | Las de 2020 quedan `out_of_scope` con motivo, **conservan documentos y validaciones** | Cero instancias eliminadas |
| `TC-047` 🔴 | `FR-204` | Instancia con documento, validación y excepción, sale de alcance | Aplicar | Todo su contenido persiste y es consultable | Documentos, validaciones e historial intactos |
| `TC-048` | `FR-116` | Requisito que generaría 2,190 instancias, umbral 200 | Crear sin confirmación | 422 con `rule:"FR-116"` | Confirmación exigida por contrato |
| `TC-049` | `FR-116` | Igual con `confirmInstanceCount` correcto | Crear | 201 y 2,190 instancias | Confirmación aceptada |
| `TC-050` 🔴 | `FR-131`, `FR-132` | Excel de 248 renglones, 12 inválidos | Importar en `preview` | 231 válidos, 5 advertencias, 12 errores con renglón y motivo; instancias proyectadas | Conteos exactos; **nada persistido** |
| `TC-051` 🔴 | `FR-133` | Igual, modo `abort-all` | Aplicar | Rechazo total; cero requisitos creados | Transaccionalidad |
| `TC-052` | `FR-133` | Igual, modo `skip-invalid` | Aplicar | 231 creados, 12 omitidos, archivo de resultados | Comportamiento correcto |
| `TC-053` 🔴 | `FR-135` | Reimportar el mismo archivo corregido | Aplicar con `updateExisting` | Los existentes se actualizan; **cero duplicados**; instancias con documentos intactas | Sin duplicación ni pérdida |
| `TC-054` | `FR-134` | Importación con errores | Descargar resultados | Archivo con estatus y motivo por renglón | Archivo generado y completo |
| `TC-055` | `FR-007` | Área con requisitos | Intentar eliminar | Rechazo; solo permite desactivar | `RESTRICT` aplicado |
| `TC-056` | `FR-008` | Proceso con requisitos y documentos colocados | Mover de área | Rutas canónicas recalculadas; **archivos no movidos**; desviaciones marcadas | Desviaciones registradas |
| `TC-057` | `FR-303` | 50 requisitos filtrados | Asignar en lote | Los 50 con responsable nuevo; una notificación agrupada | Asignación y notificación correctas |
| `TC-058` | `FR-125` | Requisito con documentos | Intentar eliminar | Rechazo; ofrece baja lógica con motivo | Sin borrado físico |

---

## 4. Pruebas de integración con SharePoint

Contra Graph y sitio de pruebas **reales**. Nunca contra el sitio de producción.

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-059` 🔴 | `FR-402` | Ruta destino inexistente | Cargar documento | Carpetas creadas recursivamente; archivo colocado | Ruta existe en SharePoint |
| `TC-060` 🔴 | `FR-403` | Carga completada | Consultar el documento | `site_id`, `drive_id`, `item_id`, `etag`, `ctag`, ruta, URL, tamaño, MIME y hash persistidos | Los nueve campos presentes y no vacíos |
| `TC-061` 🔴 | `FR-404` | Documento colocado | Mover el archivo en SharePoint; ejecutar reconciliación | El documento sigue resolviendo por `item_id`; ruta actualizada; desviación marcada | Vínculo intacto |
| `TC-062` 🔴 | `FR-406` | Carga interrumpida tras subir pero antes de registrar | Reintentar con el mismo `intentId` | **Un solo archivo** en SharePoint; registro completado | Conteo de ítems en la carpeta = 1 |
| `TC-063` 🔴 | `FR-406` | Reintentar un intent ya en `placed` | Reintentar | Devuelve el documento existente; sin subida nueva | Idempotencia |
| `TC-064` | `FR-410` | Archivo con nombre existente, política `rename` | Cargar | Sufijo consecutivo aplicado; ambos archivos presentes | Nombres distintos |
| `TC-065` | `FR-410` | Política `replace` | Cargar | Se crea versión nueva del documento existente | Versión incrementada |
| `TC-066` | `FR-410` | Política `fail` | Cargar | 409 con mensaje claro; nada escrito | Sin efecto |
| `TC-067` 🔴 | `FR-405`, `FR-316` | Archivo de 250 MB | Cargar | Sesión por partes; progreso; colocación exitosa; hash coincide | Hash del archivo en SharePoint = original |
| `TC-068` 🔴 | `FR-411` | Excel con fórmulas y macros | Cargar y descargar de SharePoint | Byte por byte idéntico al original | Hash idéntico |
| `TC-069` | `FR-407` | Forzar respuesta 429 con `Retry-After: 30` | Cargar | Espera 30 s y reintenta; no falla | Reintento respetando el encabezado |
| `TC-070` 🔴 | `FR-421` | 5 archivos colocados directo en SharePoint (`SEED-ORPHAN`) | Ejecutar reconciliación | Los 5 aparecen como huérfanos con sugerencia | 5 hallazgos `orphan` |
| `TC-071` 🔴 | `FR-422` | Documento registrado, archivo eliminado en SharePoint | Reconciliar | Hallazgo `broken_link`; instancia marcada | 1 hallazgo `broken_link` |
| `TC-072` 🔴 | `FR-423` | Documento registrado, archivo movido | Reconciliar | Hallazgo `moved`; ruta actualizada; vínculo conservado | Ruta nueva persistida |
| `TC-073` 🔴 | `FR-424` | Documento validado, archivo editado en SharePoint | Reconciliar | `etag` distinto detectado; instancia vuelve a `pending_validation` | Revalidación disparada |
| `TC-074` | `FR-427` | Reconciliación previa con token delta | Ejecutar incremental | Solo procesa cambios; duración muy inferior a la completa | Ítems revisados << total |
| `TC-075` | `FR-425` | Huérfano con sugerencia | Vincular a la instancia sugerida | Documento creado; instancia recalcula estatus; auditoría con origen `reconciliation` | Vínculo y auditoría correctos |
| `TC-076` | `FR-426` | Enlace roto | Resolver como `mark-deleted` | Instancia vuelve a `in_collection`; responsable notificado | Estatus y notificación |
| `TC-077` | `FR-903` | Configuración de SharePoint | Probar conexión | Reporte con sitio, biblioteca, permisos de lectura, escritura y creación de carpetas | Todos los indicadores presentes |
| `TC-078` | `FR-335` | Documento con desviación de ubicación | Normalizar ubicación | Archivo movido a la ruta canónica; identificadores actualizados; desviación resuelta | `path_deviation = false` |
| `TC-079` | `FR-428` | Corrida ejecutada | Consultar el reporte | Ítems revisados, hallazgos por tipo, duración, marca de tiempo | Reporte completo |

---

## 5. Autenticación y permisos

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-080` | `FR-930` | Usuario sin sesión | Acceder a `/inventario` | Redirección a Entra ID | Redirección correcta |
| `TC-081` | `FR-930` | Autenticación exitosa | Volver del callback | Sesión creada; usuario local con `entra_object_id` | Sesión y usuario persistidos |
| `TC-082` | `FR-936` | Sesión inactiva más allá del límite | Actuar | Sesión terminada; reingreso conservando pantalla y formulario | Sin pérdida de trabajo |
| `TC-083` 🔴 | `FR-931` | Usuario `validator` en Tesorería y `contributor` en Nómina | Consultar permisos efectivos | Puede validar solo Tesorería; cargar solo Nómina | Unión correcta, sin filtración |
| `TC-084` 🔴 | `FR-932` | `contributor` de Nómina | Llamar `POST /validations` de una instancia de Tesorería **directo a la API** | 403 | La API bloquea, no solo la interfaz |
| `TC-085` 🔴 | `FR-932` | `viewer` | Llamar `POST /requirements` directo a la API | 403 | Control en el servidor |
| `TC-086` 🔴 | `FR-504` | Usuario que cargó el documento | Intentar validar esa instancia | 422 `rule:"FR-504"`; además no aparece en su cola | Bloqueo en API y en cola |
| `TC-087` 🔴 | `FR-933` | `contributor` sin acceso a Nómina | Buscar una instancia confidencial de Nómina | La instancia **aparece**; metadatos sensibles ocultos; sin enlace al contenido; contacto visible | Localización preservada, contenido restringido |
| `TC-088` 🔴 | `FR-934` | Usuario sin permiso en SharePoint sobre la carpeta | Abrir el enlace del documento | SharePoint rechaza el acceso | El Portal no otorga acceso |
| `TC-089` | `FR-901` | Rol otorgado con ámbito de área | Consultar el inventario | Solo ve requisitos de esa área | Filtrado por ámbito en la consulta |
| `TC-090` | `FR-938` | Usuario autenticado | Enumerar identificadores secuenciales | Los identificadores son UUID no adivinables; los ajenos devuelven 404 | Sin enumeración posible |
| `TC-091` | `FR-939` | Intento de acceso denegado | Consultar la auditoría | El intento quedó registrado | Evento presente |
| `TC-092` | `FR-900` | Usuario deshabilitado en Entra | Ejecutar `sync-users` | Desactivado en el Portal; su historial se conserva | Desactivación sin pérdida |
| `TC-093` | `FR-910` | Proyecto en modo archivo | Intentar cualquier escritura | 423 `PROJECT_ARCHIVED`; consulta y búsqueda siguen funcionando | Solo lectura efectiva |

---

## 6. Pruebas de workflow

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-094` | `FR-306` | Instancia asignada, pendiente | Marcar en recopilación con nota | `in_collection`; historial registrado | Transición e historial |
| `TC-095` 🔴 | `FR-500` | Instancia alcanza `collected` | Verificar la cola | Aparece en la cola del validador del ámbito | Entrada automática |
| `TC-096` 🔴 | `FR-509` | Instancia en cola | Rechazar con motivo y comentario | Vuelve a `in_collection`; documento **sigue vinculado**; responsable notificado de inmediato | Estatus, vínculo y notificación |
| `TC-097` 🔴 | `FR-509` | Instancia rechazada | Consultar `my-work` del responsable | Aparece arriba, con motivo y comentario visibles sin abrir | Prioridad y contexto |
| `TC-098` 🔴 | `FR-342` | Instancia validada | Cargar versión nueva del documento | Todas las instancias vinculadas vuelven a `pending_validation`; validadores notificados | Revalidación en cascada |
| `TC-099` | `FR-341` | Documento vinculado a 4 instancias | Cargar versión nueva | Los 4 vínculos se conservan | Sin revinculación manual |
| `TC-100` 🔴 | `FR-307` | Responsable sin el documento | Declarar no disponible | Se crea excepción `proposed`; el responsable **no** puede fijar `not_obtained` | Solo propuesta |
| `TC-101` | `FR-304` | Instancia asignada | Delegar a otro con motivo | Responsable actualizado; ambos y el coordinador notificados | Delegación registrada |
| `TC-102` 🔴 | `FR-541` | Requisito elegible | Cerrar | Requiere acción explícita; registra quién y cuándo | Sin cierre automático |
| `TC-103` | `TC-102` + `FR-545` | Requisito cerrado | Reabrir con motivo | Estado `active`; auditoría con motivo | Reapertura registrada |
| `TC-104` | `FR-542` | Área con 12 requisitos sin cerrar | Consultar elegibilidad | No elegible; los cuatro criterios con su bloqueante | Criterios y bloqueantes |
| `TC-105` | `FR-544` | Área cerrada | Generar paquete de cierre | Inventario final, excepciones, mapa de ubicaciones, cobertura | Los cuatro artefactos |

---

## 7. Integridad de datos

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-106` 🔴 | §6.2 modelo | Instancia `pending_collection` | Fijar `validated` por SQL directo | La restricción `ck_inst_flow` rechaza | Restricción activa |
| `TC-107` 🔴 | `FR-510` | Instancia sin excepción | Fijar `partial` por SQL directo | El trigger rechaza | Trigger activo |
| `TC-108` 🔴 | `FR-504` | — | Insertar `validation` de quien cargó, por SQL directo | El trigger rechaza | Trigger activo |
| `TC-108b` 🔴 | `FR-523`, `DA-009` | — | Aprobar una excepción por SQL directo con un usuario sin rol `validator` de ámbito `project` | El trigger `trg_exception_final_validator` rechaza | Trigger activo |
| `TC-109` 🔴 | `FR-200` | Instancia existente | Insertar otra con mismo requisito, periodo y driver | Restricción única rechaza | Sin duplicados posibles |
| `TC-110` | `FR-346` | Documento vinculado | Intentar borrar por API | Endpoint inexistente; el borrado en base está restringido | Sin borrado desde el Portal |
| `TC-111` | Modelo §6.1 | Área con procesos | Borrar por SQL | `RESTRICT` rechaza | Integridad referencial |
| `TC-112` 🔴 | `FR-922` | Evento de auditoría | Intentar `UPDATE` y `DELETE` con el rol de aplicación | Ambos rechazados por privilegios | Inmutabilidad garantizada por la base |
| `TC-113` 🔴 | `FR-920` | Cualquier operación de escritura | Verificar la transacción | El evento de auditoría se escribió en la **misma** transacción | Reversión conjunta |
| `TC-114` | Modelo §3.5 | `user_role` con `scope_id` inválido | Insertar | La prueba de integridad de ámbitos lo detecta | Validación polimórfica cubierta |
| `TC-115` | `FR-313` | Documento cargado | Consultar tras varias versiones | `original_filename` presente e inmutable | Nombre original preservado |
| `TC-116` 🔴 | `FR-204` | Recálculo de instancias | Contar antes y después | Ninguna instancia con contenido fue eliminada | Conteo de eliminadas = 0 |

---

## 8. Carga de archivos

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-117` 🔴 | `FR-310`, `FR-311` | Instancia asignada | Cargar por interfaz | Ruta y nombre propuestos visibles **antes** de subir | Vista previa presente |
| `TC-118` | `FR-321` | Requisito con referencia obligatoria | Cargar sin capturarla | Envío bloqueado con el campo señalado | Bloqueo aplicado |
| `TC-119` | `FR-319` | Archivo `.exe` | Cargar | Rechazo con motivo | Extensión prohibida |
| `TC-120` | `FR-319` | Requisito que espera `.pdf`, se sube `.jpg` | Cargar | **Advertencia** no bloqueante | Se permite con aviso |
| `TC-121` 🔴 | `FR-316` | Archivo de 120 MB, red interrumpida al 60 % | Reanudar | La carga continúa desde donde iba | Sin reiniciar desde cero |
| `TC-122` | `FR-317` | Carga en curso | Cancelar | Sin archivo parcial en SharePoint ni registro huérfano | Limpieza completa |
| `TC-123` 🔴 | `FR-322` | Archivo `.msg` con 3 adjuntos | Cargar | Remitente, destinatarios, fecha, asunto y nombres de adjuntos extraídos; archivo íntegro | Metadatos y archivo intactos |
| `TC-124` | `FR-318` | Archivo `.zip` | Cargar | Registrado como un documento; **no** se descomprime | Sin extracción |
| `TC-125` | `FR-313` | Archivo `Estado marzo (final) v2.pdf` | Cargar | Nombre canónico aplicado; original conservado como metadato | Ambos presentes |

---

## 9. Escenarios de duplicados

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-126` 🔴 | `FR-314`, `FR-315` | Documento ya cargado | Cargar archivo de contenido idéntico | 409 con el documento existente y **dos** opciones (vincular o cargar como copia adicional), sin exigir motivo en ninguna (`DA-002`) | Detección antes de subir |
| `TC-127` 🔴 | `FR-315` | Igual, se elige "vincular existente" | Confirmar | Vínculo nuevo creado; **cero archivos nuevos** en SharePoint | Conteo de ítems sin cambio |
| `TC-127b` 🔴 | `FR-315`, `FR-315b` | Igual, se elige "cargar como copia adicional" | Confirmar **sin motivo** | Documento nuevo creado en SharePoint; **ambos** documentos quedan con `has_duplicate_content = true`, cada uno listando al otro | Marca de duplicado bidireccional, sin bloqueo |
| `TC-128` | `FR-315b` | Dos documentos con `has_duplicate_content = true` | Abrir la ficha de cada uno | Cada uno muestra "contenido duplicado — también existe en: [ruta del otro]" | Marca visible en ambos |
| `TC-129` | `FR-315` | Documento ya vinculado a esta misma instancia | Cargar idéntico | 409 `ALREADY_LINKED`; sin acción | Sin duplicación de vínculo |
| `TC-130` | §7.2 modelo | Dos archivos idénticos con nombres distintos | Cargar el segundo | Detectado como duplicado pese al nombre distinto | Detección por hash, no por nombre |
| `TC-131` | §7.1 modelo | Dos archivos distintos con el mismo nombre | Cargar ambos | **No** son duplicados; ambos se cargan; `has_duplicate_content` permanece `false` en ambos | Sin falso positivo |
| `TC-132` 🔴 | `DA-002` | Un archivo subido por fuera del Portal cuyo contenido coincide con uno ya registrado en otra ruta | Reconciliar y registrar el huérfano | Se acepta como documento adicional válido, marcado `has_duplicate_content = true`; **no** se bloquea ni se exige elegir uno | Aceptación sin consolidación forzada |

---

## 10. Documento contra múltiples requisitos

Es el escenario que el Plan Macro exige explícitamente y donde más fácil se descuadran los números.

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-133` 🔴 | `FR-320` | 4 instancias seleccionadas de 2 frentes distintos | Cargar un archivo contra las 4 | **Un** documento, **un** archivo en SharePoint, **cuatro** vínculos | 1 ítem, 4 `document_instance_link` |
| `TC-134` 🔴 | `FR-320` | Igual | Consultar cada instancia | Las 4 muestran el mismo documento con su papel | Documento compartido correctamente |
| `TC-135` 🔴 | §10.3 modelo | Igual | Validar una, rechazar otra | Estatus independientes; el documento no cambia | Independencia de estatus |
| `TC-136` 🔴 | `FR-342` | Igual, las 4 validadas | Cargar versión nueva | Las 4 vuelven a `pending_validation` | Cascada completa |
| `TC-137` 🔴 | `FR-344` | Igual | Desvincular de una instancia con motivo | Esa instancia recalcula estatus; las otras 3 intactas; documento vivo | Aislamiento del desvínculo |
| `TC-138` 🔴 | `FR-718`, §11.5 modelo | Igual | Consultar volumen y cobertura | Volumen cuenta **1** documento; cobertura cuenta **4** instancias | La distinción se sostiene |
| `TC-139` | `FR-607` | Igual | Abrir la ficha del documento | Lista las 4 instancias que satisface, con su requisito | Navegación inversa completa |
| `TC-140` | §10.2 modelo | Igual | Verificar la ruta | Calculada con la instancia primaria; las otras la referencian | Una sola ubicación física |

---

## 11. Cálculo de cobertura por periodo

Usa `SEED-COV`: requisito mensual 2020-01 a 2026-12 (84 instancias) con huecos deliberados en 2021-03 a 2021-07 y 2024-11.

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-141` 🔴 | `FR-209` | `SEED-COV` | Abrir la rejilla de cobertura | 7 años × 12 meses; los 6 huecos visualmente distinguibles | Rejilla exacta |
| `TC-142` 🔴 | `FR-212` | `SEED-COV` | Consultar periodos faltantes | "2021-03 a 2021-07, 2024-11" — rangos consecutivos agrupados | Texto legible y correcto |
| `TC-143` 🔴 | `FR-715` | `SEED-COV` | Consultar cobertura por periodo del área | 2021 al 58 % (7 de 12); 2024 al 92 % (11 de 12) | Porcentajes exactos |
| `TC-144` | `FR-210` | Instancias en los 8 estados posibles | Abrir la rejilla | Los 8 estados distinguibles por **símbolo**, no solo por color | Accesibilidad cumplida |
| `TC-145` 🔴 | `FR-716` | Varias áreas con huecos | Consultar periodos con mayor faltante | Ordenados por cantidad de instancias faltantes, con las áreas involucradas | Priorización correcta |
| `TC-146` | `FR-211` | 5 instancias seleccionadas en la rejilla | Asignar en lote | Las 5 con responsable nuevo | Acción en lote |
| `TC-147` 🔴 | `FR-715` | Requisitos `permanent` y por driver | Consultar cobertura por periodo | **No** aparecen forzados a un periodo; se reportan aparte | Sin distorsión de la rejilla |
| `TC-148` 🔴 | `FR-203` | `SEED-COV` ampliado a 2018 | Recalcular y consultar | 108 instancias; la rejilla muestra 2018 y 2019 completos en pendiente | Ampliación correcta |
| `TC-149` 🔴 | §9.3 modelo | Igual | Comparar cobertura antes y después | El porcentaje **bajó**, y la vista previa lo había anunciado | Comportamiento correcto y anunciado |

---

## 12. Validación de la analítica

**La sección más importante del plan.** Si estos casos no pasan, el tablero no es utilizable como instrumento de reporte.

### 12.1 Reconciliación tablero ↔ registros base

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-150` 🔴 | `FR-702`, `FR-722` | Conjunto completo cargado | Leer "validadas" del tablero; llamar `drill-down` con el mismo filtro | `meta.total` = valor del indicador; `matchesAggregate: true` | **Coincidencia exacta**, sin tolerancia |
| `TC-151` 🔴 | `FR-722` | Igual | Sumar los desgloses por área | Suma = total del proyecto | Diferencia = 0 |
| `TC-152` 🔴 | `FR-722` | Igual | Sumar los desgloses por frente | Suma = total del proyecto | Diferencia = 0 |
| `TC-153` 🔴 | `FR-722` | Igual | Sumar por proceso dentro de un área | Suma = total del área | Diferencia = 0 |
| `TC-154` 🔴 | `FR-722` | Igual | Sumar los seis estados de instancia | Suma = instancias en alcance | Sin instancia sin estado ni contada dos veces |
| `TC-155` 🔴 | `FR-704` | Requisitos `progressive` con enumeración abierta presentes | Comparar denominador del tablero contra `count(*)` de instancias en alcance | Coinciden; las de enumeración abierta reportadas aparte | Exclusión correcta |
| `TC-156` 🔴 | `FR-702` | Cifra de "pendientes de validar" | Drill-down y contar manualmente | Igual | Coincidencia |
| `TC-157` 🔴 | §12.1 este plan | `SEED-MULTI` (1 documento, 4 instancias) | Comparar volumen contra cobertura | Volumen = 1; cobertura = 4 | Sin doble conteo en volumen |
| `TC-158` 🔴 | `FR-703` | Vistas materializadas desactualizadas a propósito | Consultar tablero y drill-down | `matchesAggregate: false`; la interfaz lo advierte | **La discrepancia se hace visible**, no se oculta |
| `TC-159` | `FR-703` | Tablero cargado | Verificar la marca de tiempo | Presente y correcta | Fecha de cálculo visible |
| `TC-160` | `FR-721` | Tablero cargado | Exportar | El Excel contiene el detalle, no solo los agregados | Detalle exportado |

### 12.2 Consistencia de indicadores

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-161` 🔴 | `FR-711` | Conjunto conocido | Verificar las tres fórmulas contra cálculo manual | Coinciden a cuatro decimales | Fórmulas correctas |
| `TC-162` | `FR-711` | Tablero | Consultar el icono de fórmula | Muestra la fórmula real usada | Transparencia |
| `TC-163` 🔴 | `FR-701` | Tablero | Inspeccionar la presentación | Volumen en sección separada con leyenda explícita | Separación visual efectiva |
| `TC-164` | `FR-705` | Requisito `progressive` con enumeración cerrada | Consultar su avance | Marcado como "denominador por enumeración cerrada" | Bandera visible |
| `TC-165` | `FR-717` | Varios responsables | Consultar tablero por responsable | Suma de asignadas = total con responsable; "Sin asignar" cuadra el resto | Sin instancias perdidas |
| `TC-166` | `FR-719` | 30 días de operación | Consultar tendencia | 30 puntos; el último coincide con el tablero actual | Histórico consistente |
| `TC-167` | `FR-720` | Sistema en operación | Consultar salud operativa | Vencidas, espera mediana, tasa de rechazo, fallidas y huérfanos presentes y correctos | Indicadores completos |

---

## 13. Búsqueda

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-168` 🔴 | `FR-609` | Factura A-4471 referenciada en 4 instancias y 3 documentos | Buscar "A-4471" | Los 7 registros | Resultados completos |
| `TC-169` | `FR-600` | Conjunto completo | Filtrar por área, periodo y tipo | Solo lo que cumple los tres | Facetas combinadas |
| `TC-170` | `FR-612` | Área "Tesorería" | Buscar "tesoreria" sin acento | La encuentra | `unaccent` funcionando |
| `TC-171` | `FR-601` | Documento con nombre original distintivo | Buscar por ese nombre original | Lo encuentra | Nombre original indexado |
| `TC-172` | `FR-601` | Correo `.msg` cargado | Buscar por remitente y por asunto | Lo encuentra por ambos | Metadatos de correo indexados |
| `TC-173` 🔴 | `FR-603` | Instancia confidencial fuera del ámbito del usuario | Buscarla | **Aparece**, sin metadatos sensibles, sin enlace, con contacto | Localización sin acceso |
| `TC-174` | `FR-602` | Búsqueda amplia | Revisar resultados | Requisitos, instancias y documentos claramente diferenciados | Tipos distinguibles |
| `TC-175` | `FR-610` | Instancia con documentos y validación | Abrir trazabilidad | Cadena completa frente→…→SharePoint, más otras instancias del documento | Cadena íntegra |
| `TC-176` | `FR-611` | `SEED-VOL` | Búsqueda facetada típica | Respuesta < 2 s | Umbral cumplido |
| `TC-177` | `FR-605` | Resultados | Exportar | Excel con todos los resultados y sus campos | Exportación completa |

---

## 14. Flujo de validación

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-178` 🔴 | `FR-506` | Instancia en cola | Abrir la pantalla de validación | Los 5 puntos automáticos resueltos; los 4 manuales pendientes | Separación correcta |
| `TC-179` 🔴 | `FR-506` | Documento en ubicación no canónica | Abrir validación | El punto de ubicación aparece **no** superado, con el detalle | Detección automática |
| `TC-180` 🔴 | `FR-506` | Requisito que exige `.pdf`, documento `.jpg` | Abrir validación | El punto de formato nativo aparece no superado | Detección automática |
| `TC-181` | `FR-506` | Checklist obligatorio incompleto | Intentar validar | Bloqueado con el punto faltante señalado | Bloqueo aplicado |
| `TC-182` | `FR-507` | Checklist configurado por área | Validar en dos áreas distintas | Cada una muestra su checklist | Configuración por ámbito |
| `TC-183` 🔴 | `FR-508` | Instancia en cola | Validar | `validated`; cobertura del requisito actualizada; siguiente instancia cargada | Estatus, cobertura y avance |
| `TC-184` | `FR-514` | Cola con varias instancias | Usar teclas `V`, `R`, `P`, `N` | Cada una ejecuta su acción | Atajos funcionando |
| `TC-185` 🔴 | `FR-511` | 3 instancias del mismo requisito, mismo checklist | Validar en lote | Las 3 validadas; **tres** registros de validación individuales | Registro individual preservado |
| `TC-186` | `FR-513` | Instancia validada | Revertir con motivo | Vuelve a `pending_validation`; ambos registros en el historial | Reversión auditable |
| `TC-187` | `FR-502` | Cola con instancias críticas y antiguas | Consultar orden por defecto | Críticas primero, luego por antigüedad | Orden correcto |
| `TC-188` | `FR-515` | Instancia en validación | Comentar sin cambiar estatus | Comentario registrado; estatus intacto | Comentario independiente |
| `TC-189` | `FR-505` | Instancia con 2 documentos y referencias | Abrir validación | Definición, periodo, documentos con vista previa, metadatos, referencias, ubicación e historial visibles | Contexto completo |

---

## 15. Flujo de excepciones

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-190` 🔴 | `FR-510` | Instancia en validación | Marcar `partial` sin excepción | Bloqueado; el formulario de excepción es obligatorio | Sin excepción no hay estatus |
| `TC-191` 🔴 | `FR-521` | Formulario de excepción | Enviar con un campo vacío | Rechazo; los cuatro campos son obligatorios | Validación completa |
| `TC-192` 🔴 | `FR-523` | Excepción de impacto alto en área crítica | Enviar a revisión | Debe resolverla un validador final; no existe ruta de aprobación distinta por ser área crítica | Sin escalonamiento adicional |
| `TC-193` 🔴 | `FR-523` | Excepción de impacto **bajo** | Un Coordinador de Área intenta aprobarla directo por API | 403/422 — el Coordinador puede proponer, no aprobar, sin importar el impacto (`DA-009`) | Sin nivel intermedio de Coordinador |
| `TC-194` 🔴 | `FR-526` | Requisito con excepción `under_review` | Intentar cerrar | Bloqueado con el bloqueante identificado | Cierre impedido |
| `TC-195` 🔴 | `FR-524` | Excepción rechazada | Verificar la instancia | Vuelve a `in_collection`; responsable notificado con el motivo | Reapertura correcta |
| `TC-196` | `FR-525` | Excepción mitigada con evidencia alternativa | Aprobar mitigación | Documentos alternativos vinculados; descripción registrada | Mitigación completa |
| `TC-197` | `FR-520` | Excepción sobre un requisito completo | Crear | Cubre todas sus instancias | Alcance a nivel requisito |
| `TC-198` | `FR-527` | 6 excepciones en distintos estados | Exportar el registro | Anexo completo con los cuatro campos, alcance y aprobación | Anexo utilizable como entregable |
| `TC-199` | `FR-528` | Excepciones abiertas | Abrir el tablero | Conteo por impacto con prominencia equivalente al porcentaje | Visibilidad garantizada |
| `TC-200` | `FR-529` | Excepción | Adjuntar la negativa del banco | Adjunto vinculado y consultable | Sustento adjunto |

---

## 16. Bitácora de auditoría

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-201` 🔴 | `FR-920` | Sistema limpio | Ejecutar las 15 acciones auditables del catálogo | Un evento por cada una, con usuario, momento, antes y después | 15 de 15 registradas |
| `TC-202` 🔴 | `FR-921` | Evento generado | Inspeccionarlo | Usuario, momento, tipo, entidad, antes, después, origen y correlación presentes | Campos completos |
| `TC-203` 🔴 | `FR-922` | Evento existente | Intentar modificar y borrar | Rechazado por privilegios de base | Inmutabilidad |
| `TC-204` 🔴 | `FR-920` | Importación masiva | Verificar auditoría | Registrada con `origin: import` | Las operaciones masivas también auditan |
| `TC-205` 🔴 | `FR-920` | Reconciliación automática | Verificar auditoría | Registrada con `origin: job` | Las operaciones automáticas también auditan |
| `TC-206` | `FR-923` | Auditoría poblada | Filtrar por usuario, entidad, tipo y fechas | Resultados correctos | Filtros funcionando |
| `TC-207` | `FR-924` | Requisito con historial | Abrir su ficha | Línea de tiempo cronológica legible | Historial en ficha |
| `TC-208` | `FR-926` | Documento confidencial | Abrirlo | Acceso de lectura registrado | Trazabilidad de lectura |
| `TC-209` | `FR-925` | Auditoría poblada | Exportar un rango | Archivo completo del rango | Exportación funcional |
| `TC-210` 🔴 | §3.3 arquitectura | Transacción que falla tras el cambio | Verificar | Ni el cambio ni el evento persistieron | Atomicidad conjunta |

---

## 17. Errores y reintentos

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-211` 🔴 | `FR-407` | Graph responde 429 con `Retry-After: 60` | Cargar | Espera 60 s, reintenta, tiene éxito; sin error al usuario | Encabezado respetado |
| `TC-212` 🔴 | `FR-407` | Graph responde 503 tres veces y luego 200 | Cargar | Reintentos con retroceso exponencial; éxito | Retroceso aplicado |
| `TC-213` 🔴 | §19.2 arquitectura | Graph responde 403 | Cargar | **Sin** reintento; falla de inmediato | Los 4xx no se reintentan |
| `TC-214` 🔴 | `FR-408` | Graph falla en los 5 intentos | Cargar | Job en cola de fallidos con error, intentos y carga útil | Cola poblada |
| `TC-215` 🔴 | `FR-409` | Igual | Verificar al usuario | Notificado con mensaje comprensible y acción sugerida | **Nada falla en silencio** |
| `TC-216` 🔴 | `FR-909` | Job en cola de fallidos, Graph recuperado | Reintentar desde administración | Éxito; job resuelto | Reintento manual efectivo |
| `TC-217` 🔴 | `FR-406` | Falla tras subir, antes de registrar | Reintentar | El archivo **no** se vuelve a subir; se completa el registro | Idempotencia verificada en SharePoint |
| `TC-218` 🔴 | §18.2 arquitectura | Los tres modos de fallo de carga | Provocar cada uno | Cada mensaje declara si el trabajo se conservó | Sin ambigüedad |
| `TC-219` | `NFR-022` | Cualquier error | Ver el mensaje | Referencia de error presente y correlacionable con la traza | Trazabilidad de soporte |
| `TC-220` | §18.2 arquitectura | Analítica caída | Abrir el Portal | El resto funciona; solo el tablero degrada | Degradación por partes |
| `TC-221` | `FR-410` | Nombre en conflicto durante reintento | Reintentar | No crea archivo duplicado | Conflicto resuelto sin duplicar |
| `TC-222` | §8.2 arquitectura | 10 fallos consecutivos de Graph | Observar | Circuit breaker abre; se encola en lugar de fallar de cara al usuario | Protección activa |

---

## 18. Seguridad

| ID | Requisito | Precondición | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|---|
| `TC-223` 🔴 | `FR-932` | Todos los endpoints de escritura | Llamarlos sin permiso, directo a la API | 403 en todos | Sin endpoint desprotegido |
| `TC-224` 🔴 | `FR-931` | Usuario con ámbito de un área | Consultar listados | El predicado de ámbito está en el `WHERE`, no en filtrado posterior | Sin filtración a nivel de consulta |
| `TC-225` | `FR-937` | Archivo con firma de ejecutable renombrado a `.pdf` | Cargar | Detectado por firma real y rechazado | Validación por contenido |
| `TC-226` | Arquitectura §16.4 | Entrada con SQL en campos de texto | Enviar | Tratada como texto; sin efecto | Consultas parametrizadas |
| `TC-227` | Arquitectura §16.4 | Entrada con script en observaciones | Guardar y mostrar | Escapada al renderizar | Sin XSS |
| `TC-228` | Arquitectura §16.4 | Petición sin token CSRF | Enviar | Rechazada | Protección activa |
| `TC-229` | `NFR-016` | Tráfico del Portal | Inspeccionar | TLS 1.2+ en todo | Cifrado en tránsito |
| `TC-230` | `NFR-017` | Repositorio e imagen | Escanear secretos | Cero hallazgos | Sin credenciales expuestas |
| `TC-231` | `FR-926` | Documentos confidenciales | Acceder | Cada lectura registrada | Trazabilidad completa |
| `TC-232` | Arquitectura §16.4 | Endpoint de búsqueda | Llamar en exceso | Límite de tasa aplicado | Protección contra abuso |
| `TC-233` 🔴 | Arquitectura §6.1 | Registro de aplicación | Auditar permisos concedidos | Solo `Sites.Selected` sobre el sitio del proyecto; sin `Sites.ReadWrite.All` | Mínimo privilegio verificado |

---

## 19. Rendimiento

Contra `SEED-VOL`: 5,000 requisitos, 300,000 instancias, 100,000 documentos.

| ID | Requisito | Escenario | Umbral | Aprueba si |
|---|---|---|---|---|
| `TC-234` 🔴 | `NFR-001` | Inventario con filtros, página 1 | < 2 s | p95 bajo umbral |
| `TC-235` | `NFR-001` | Inventario, página 50 | < 2 s | Paginación profunda sin degradar |
| `TC-236` 🔴 | `NFR-003` | Tablero de proyecto | < 3 s | p95 bajo umbral |
| `TC-237` | `NFR-003` | Drill-down desde un indicador | < 3 s | p95 bajo umbral |
| `TC-238` 🔴 | `NFR-002` | Búsqueda facetada | < 2 s | p95 bajo umbral |
| `TC-239` | `FR-209` | Rejilla de cobertura de un requisito de 108 instancias | < 1 s | Umbral cumplido |
| `TC-240` 🔴 | `NFR-004` | Carga de 100 MB | < 3 min, progreso cada 2 s | Umbral cumplido |
| `TC-241` 🔴 | `NFR-006` | 50 usuarios concurrentes, 10 cargando | Sin degradación perceptible | p95 dentro de umbrales |
| `TC-242` | `NFR-009` | Refresco de vistas materializadas | < 5 min con volumen completo | Umbral cumplido |
| `TC-243` | `FR-427` | Reconciliación incremental sobre 100,000 archivos | < 30 min | Umbral cumplido |
| `TC-244` | `FR-133` | Importación de 5,000 renglones | < 10 min, con progreso | Umbral cumplido |
| `TC-245` | `FR-136` | Exportación de 300,000 instancias | Genera en segundo plano con aviso | Sin expiración de la petición |

---

## 20. Cobertura complementaria de requisitos

Las secciones 2 a 19 cubren los requisitos de mayor riesgo con casos detallados. Esta sección cierra la cobertura del resto, de modo que **ningún `FR-` del PRD quede sin al menos un caso de prueba** — regla de mantenimiento declarada en el [README](../README.md).

Son casos de verificación funcional directa: precondición implícita "conjunto de datos de prueba cargado y usuario con el rol indicado".

### 20.1 Taxonomía y configuración del inventario

| ID | Requisito | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|
| `TC-305` | `FR-001` | Recorrer los cuatro estados del proyecto (`activo`, `en cierre`, `cerrado`, `archivado`) | Transiciones válidas; el estado condiciona la escritura | Máquina de estados correcta |
| `TC-306` 🔴 | `FR-002` | Intentar crear un tercer frente y eliminar uno de los dos | Ambas operaciones rechazadas; no hay interfaz ni endpoint para ello | Los dos frentes son inmutables |
| `TC-307` | `FR-004` | Crear, editar, reordenar y desactivar un proceso | Las cuatro operaciones funcionan sin despliegue | Taxonomía configurable |
| `TC-308` | `FR-006` | Consultar cualquier nodo de la taxonomía | Código, nombre, descripción, orden, estado y segmento de carpeta presentes | Atributos completos |
| `TC-309` | `FR-010` | Fijar rango predeterminado en un área y crear un requisito sin rango propio | El requisito hereda el rango del área | Herencia aplicada |
| `TC-310` | `FR-011` | Fijar sensibilidad predeterminada en un área y sobrescribirla en un requisito | El requisito conserva la suya; los demás heredan | Herencia y sobrescritura |
| `TC-311` | `FR-014` | Clonar la estructura de procesos y actividades de un área a otra | Estructura replicada; sin requisitos copiados | Clonación limpia |
| `TC-246` | `FR-012` | Importar taxonomía desde Excel con jerarquía inválida | Errores por renglón con la jerarquía señalada | Validación de jerarquía aplicada |
| `TC-247` | `FR-013` | Exportar la taxonomía vigente | Excel con los cuatro niveles y sus atributos | Estructura completa |
| `TC-248` | `FR-102` | Consultar un requisito | Los 15 campos del Inventario Maestro presentes o resolubles por navegación | Ningún campo del Plan Macro perdido |
| `TC-249` | `FR-103` | Crear requisito sin descripción | Rechazo: la descripción es obligatoria | Campo obligatorio |
| `TC-250` | `FR-104` | Declarar 3 componentes con obligatoriedad distinta | Persistidos con papel, etiqueta y obligatoriedad | Composición guardada |
| `TC-251` | `FR-105` | Declarar formato nativo `.pdf` obligatorio | Persistido; se usa en la validación automática | Enlaza con `TC-180` |
| `TC-252` | `FR-106` | Marcar requisito como crítico | Aparece priorizado en cola y tableros | Prioridad efectiva |
| `TC-253` | `FR-107` | Definir campo de extensión tipo lista y usarlo | Disponible en todos los requisitos, sin despliegue | Configuración sin código |
| `TC-254` | `FR-108` | Marcar campo de extensión obligatorio para un área | Bloquea el guardado en esa área, no en otras | Ámbito respetado |
| `TC-255` | `FR-112` | Crear requisito `per_supplier` sin base de cálculo | Rechazo por la restricción `ck_req_denominator` | Base obligatoria |

### 20.2 Operación del Inventario Maestro

| ID | Requisito | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|
| `TC-256` | `FR-120` | Abrir el inventario | Tabla filtrable, ordenable, paginada, con columnas y densidad configurables | Controles presentes |
| `TC-257` | `FR-121` | Aplicar los 11 filtros disponibles | Resultado correcto para cada uno y combinados | Filtros funcionando |
| `TC-258` | `FR-122` | Revisar un renglón | Esperadas, recopiladas, validadas, con excepción y ambos porcentajes | Avance derivado visible |
| `TC-259` | `FR-123` | Seleccionar 10 requisitos y editar criticidad en lote | Los 10 actualizados; los campos estructurales no se ofrecen | Edición en lote acotada |
| `TC-260` | `FR-124` | Duplicar un requisito | Copia editable con `readable_id` propio; sin instancias hasta activar | Duplicado limpio |
| `TC-261` | `FR-126` | Editar un requisito tres veces | Historial con las tres versiones y sus diferencias | Historial completo |
| `TC-262` | `FR-137` | Filtrar el inventario y exportar | El Excel contiene solo el resultado filtrado | Exportación sobre filtro |

### 20.3 Instancias y asignación

| ID | Requisito | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|
| `TC-263` | `FR-201` | Consultar una instancia | Los 12 campos del modelo presentes | Estructura completa |
| `TC-264` | `FR-206` | Agregar instancia manual con motivo | Creada con `is_manual` y motivo; cuenta en el denominador | Instancia manual válida |
| `TC-265` | `FR-207` | Marcar una instancia fuera de alcance con motivo | Excluida del denominador; visible con su motivo | Exclusión reversible |
| `TC-266` | `FR-301` | Asignar responsable distinto a 6 de 84 instancias | Esas 6 con responsable propio; las demás heredan del requisito | Sobrescritura por instancia |
| `TC-267` | `FR-302` | Fijar fecha objetivo a nivel requisito y a nivel instancia | La de instancia prevalece | Precedencia correcta |

### 20.4 Registro de documentos existentes y versiones

| ID | Requisito | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|
| `TC-268` | `FR-331` | Registrar por explorador y por URL pegada | Ambos métodos resuelven el mismo ítem | Dos vías equivalentes |
| `TC-269` | `FR-332` | Registrar un archivo existente | Identificadores capturados y hash calculado | Datos equivalentes a una carga |
| `TC-270` 🔴 | `FR-333` | Registrar en ubicación no canónica | Aceptado, con `path_deviation = true`; **archivo no movido** | Desviación marcada sin bloquear |
| `TC-271` | `FR-334` | Registrar con nombre no canónico | Nombre conservado; `name_deviation = true` | Desviación de nombre marcada |
| `TC-272` | `FR-336` | Normalizar nombre de un documento | Renombrado en SharePoint; identificadores actualizados | `name_deviation = false` |
| `TC-273` | `FR-343` | Cargar versión nueva sin motivo | Rechazo por `ck_docver_reason` | Motivo obligatorio |
| `TC-274` | `FR-345` | Marcar documento como retirado con motivo | Estado `retired`; sigue en SharePoint y en el historial | Retiro sin destrucción |

### 20.5 Referencias transaccionales

| ID | Requisito | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|
| `TC-275` | `FR-351` | Capturar referencia con tipo, clave, etiqueta, fecha y monto | Los cinco campos persistidos | Estructura completa |
| `TC-276` | `FR-352` | Cargar omitiendo una referencia declarada obligatoria | 422; carga bloqueada | Obligatoriedad aplicada |
| `TC-277` | `FR-353` | Abrir una referencia de proveedor | Lista todas las instancias y documentos que la mencionan | Navegación inversa |

### 20.6 SharePoint y plantillas

| ID | Requisito | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|
| `TC-278` | `FR-412` | Abrir el enlace de un documento como usuario con permiso y sin él | Con permiso abre; sin permiso lo rechaza SharePoint | El Portal no otorga acceso |
| `TC-279` | `FR-442` | Guardar una plantilla de ruta inválida | Rechazo con el error; vista previa con datos de ejemplo al corregir | Validación y vista previa |

### 20.7 Validación y cierre

| ID | Requisito | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|
| `TC-280` | `FR-501` | Aplicar los 8 filtros de la cola | Resultado correcto para cada uno | Filtros funcionando |
| `TC-281` 🔴 | `FR-503` | Validador con ámbito de un área abre su cola | Solo instancias de esa área | Ámbito aplicado en la consulta |
| `TC-282` | `FR-512` | Validar y consultar el registro | Validador, momento, resultado, checklist, motivo y comentario | Registro completo |
| `TC-283` | `FR-522` | Recorrer una excepción por sus cinco estados | Transiciones válidas; las inválidas rechazadas | Máquina de estados correcta |
| `TC-284` | `FR-543` | Consultar elegibilidad de cierre del proyecto | Los cuatro criterios con su estado y bloqueantes | Criterios del Plan Macro |

### 20.8 Búsqueda y analítica

| ID | Requisito | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|
| `TC-285` | `FR-604` | Guardar una búsqueda y reutilizarla | Se restaura con todos sus filtros | Búsqueda guardada |
| `TC-286` | `FR-606` | Revisar resultados con y sin permiso | Enlace directo en unos; indicación clara en otros | Diferenciación visible |
| `TC-287` | `FR-608` | Abrir una instancia | Navega a documentos, requisito, validación, excepciones e historial | Navegación completa |
| `TC-288` | `FR-712` | Consultar desglose por frente | Los mismos indicadores que el proyecto, por frente | Estructura consistente |
| `TC-289` | `FR-713` | Ordenar áreas por porcentaje y por pendientes | Ambos órdenes correctos, con drill-down | Ordenamiento y navegación |
| `TC-290` 🔴 | `FR-714` | Bajar de proyecto a área, proceso, actividad y requisito | Los filtros se acumulan y se conservan en la URL | Drill-down encadenado |

### 20.9 Notificaciones

| ID | Requisito | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|
| `TC-291` 🔴 | `FR-801` | Generar 15 eventos del mismo tipo para un usuario | **Un** resumen, no 15 correos | Agrupación efectiva |
| `TC-292` | `FR-802` | Configurar inmediato, diario y semanal por tipo | Cada tipo respeta su preferencia | Preferencias aplicadas |
| `TC-293` | `FR-803` | Generar un evento notificable | Llega por correo y aparece en el Portal | Doble canal |
| `TC-294` | `FR-804` | Abrir una notificación | Lleva directo al registro que la originó | Enlace correcto |
| `TC-295` | `FR-806` | Consultar el registro de envíos | Destinatario, tipo, canal, momento y estado de entrega | Registro completo |
| `TC-296` 🔴 | `FR-807` | Disparar el mismo evento dos veces en la ventana de deduplicación | Una sola notificación | Deduplicación efectiva |
| `TC-297` 🔴 | `FR-808` | Validar una instancia y observar el rollup del área | **Sin** notificación por el cambio derivado | Rollup no notifica |

### 20.10 Administración

| ID | Requisito | Pasos | Resultado esperado | Aprueba si |
|---|---|---|---|---|
| `TC-298` | `FR-902` | Agregar un tipo de información y un motivo de rechazo | Disponibles de inmediato, sin despliegue | Catálogos configurables |
| `TC-299` | `FR-904` | Crear plantilla de ruta y regla de nombrado con vista previa | Vista previa con datos reales antes de guardar | Previsualización efectiva |
| `TC-300` | `FR-905` | Agregar/quitar a un usuario de la lista de validadores finales | Una excepción nueva solo puede resolverla quien está en la lista vigente | Configuración efectiva, sin niveles por impacto |
| `TC-301` | `FR-906` | Configurar checklist distinto para dos áreas | Cada validación muestra el suyo | Ámbito respetado |
| `TC-302` | `FR-907` | Cambiar umbral de instancias y días de anticipación | Los cambios surten efecto sin desplegar | Parámetros efectivos |
| `TC-303` | `FR-908` | Abrir el panel de salud | Jobs, cola de fallidos, última reconciliación, conectividad y uso de límites | Panel completo |
| `TC-304` 🔴 | `FR-935` | Provocar divergencia entre clasificación del Portal y permisos de SharePoint | El reporte semanal la señala | Conciliación de permisos efectiva |

---

## 21. UAT

Ejecutado en el entorno de pruebas, con usuarios reales del proyecto, sobre datos anonimizados. Cada guion lo ejecuta al menos una persona del rol correspondiente y se firma.

### `UAT-01` — Administrador / Dueño del Proyecto

| # | Tarea | Cubre | Criterio de aceptación |
|---|---|---|---|
| 1 | Crear un área nueva con dos procesos y tres actividades | `TC-055`, `FR-003`–`FR-005` | Lo logra sin ayuda técnica |
| 2 | Importar el inventario de esa área desde Excel, con errores deliberados | `TC-050`–`TC-052` | Entiende los errores y los corrige sin asistencia |
| 3 | Verificar el conteo de instancias generadas | `TC-001` | El número corresponde a lo esperado |
| 4 | Asignar roles a cinco usuarios con ámbitos distintos | `TC-089` | Los permisos efectivos son los esperados |
| 5 | Configurar la plantilla de ruta del área y simularla | `TC-014`, `FR-447` | La vista previa muestra la ruta correcta |
| 6 | Probar la conexión con SharePoint | `TC-077` | El reporte es comprensible |
| 7 | Revisar la cola de operaciones fallidas y reintentar | `TC-216` | Resuelve el pendiente |
| 8 | Generar el paquete de cierre de un área | `TC-105` | Los cuatro artefactos son utilizables |

**Se acepta si:** completa las 8 tareas sin intervención técnica y confirma que puede operar el inventario conforme el Paso 1 avanza.

### `UAT-02` — Coordinador de Área

| # | Tarea | Cubre | Criterio |
|---|---|---|---|
| 1 | Revisar la cobertura de su área e identificar los periodos descubiertos | `TC-143`, `TC-145` | Identifica los huecos reales |
| 2 | Asignar 20 requisitos en lote a tres personas | `TC-057` | Asignación correcta |
| 3 | Identificar quién de su equipo va vencido | `TC-165` | Encuentra la información en menos de un minuto |
| 4 | Enviar un recordatorio al conjunto filtrado | `FR-805` | Confirma destinatarios antes de enviar |
| 5 | Resolver tres archivos huérfanos | `TC-070`, `TC-075` | Los vincula correctamente |
| 6 | Corregir el rango de un requisito revisando el impacto | `TC-045`, `TC-149` | Entiende por qué baja el porcentaje |
| 7 | Proponer una excepción de impacto bajo e intentar aprobarla él mismo | `TC-193` | Entiende que solo propone; ve la excepción pasar a la cola del validador final, no a la suya |

**Se acepta si:** confirma que puede dar seguimiento a su área sin hojas de cálculo paralelas.

### `UAT-03` — Responsable / Colaborador

**El guion más importante.** Es el rol con menos tolerancia a la fricción y el que determina si el Portal se usa o se elude.

| # | Tarea | Cubre | Criterio |
|---|---|---|---|
| 1 | Entrar y entender qué le toca entregar | `FR-305` | Lo entiende en < 30 s, sin capacitación |
| 2 | Entregar un documento contra una instancia | `TC-117` | **En menos de 90 s**, sin conocer la taxonomía |
| 3 | Entregar un archivo contra 4 periodos a la vez | `TC-133` | Lo logra sin repetir la operación |
| 4 | Vincular un archivo que ya está en SharePoint | `TC-075`, `FR-330` | Lo logra sin ayuda |
| 5 | Recibir un rechazo, entender el motivo y volver a entregar | `TC-096`, `TC-097` | Entiende el motivo sin preguntar |
| 6 | Declarar que un documento no existe | `TC-100` | Entiende que propone, no decide |
| 7 | Intentar cargar un duplicado y elegir vincular | `TC-126`, `TC-127` | Entiende la opción y sus consecuencias |

**Se acepta si:** completa las 7 tareas sin capacitación previa más allá de un correo de bienvenida, y la tarea 2 se cronometra bajo 90 s.

### `UAT-04` — Validador

| # | Tarea | Cubre | Criterio |
|---|---|---|---|
| 1 | Trabajar su cola durante 30 minutos | `TC-183`, `TC-187` | Mide instancias por hora |
| 2 | Validar una instancia usando solo teclado | `TC-184` | Sin usar el ratón |
| 3 | Rechazar con motivo | `TC-096` | El comentario llega íntegro al responsable |
| 4 | Marcar Parcial creando la excepción | `TC-190`, `TC-191` | Entiende que la excepción es obligatoria |
| 5 | Validar en lote tres instancias del mismo requisito | `TC-185` | Comprende que quedan tres registros |
| 6 | Intentar validar algo que él cargó | `TC-086` | Entiende por qué está bloqueado |

**Se acepta si:** el ritmo sostenido permite proyectar que la cola se despacha antes de la fecha de cierre, y confirma que la pre-verificación automática le ahorra trabajo real.

### `UAT-05` — Dirección / Consulta

| # | Tarea | Cubre | Criterio |
|---|---|---|---|
| 1 | Responder "¿cómo va el proyecto?" | `TC-161` | En una sola pantalla |
| 2 | Explicar de dónde sale el porcentaje de validación | `TC-150` | Llega a los registros base |
| 3 | Identificar el área más rezagada y su causa | `TC-151` | En menos de cinco clics |
| 4 | Revisar las excepciones de impacto alto | `TC-199` | Entiende el riesgo documental |
| 5 | Encontrar todo el soporte de una factura | `TC-168` | Sin saber quién lo generó |
| 6 | Exportar el estado del proyecto | `TC-160` | Presentable fuera del Portal |

**Se acepta si:** confirma que confía en las cifras y que puede reportar con ellas sin verificación paralela.

---

## 22. Lista de verificación de producción

### Infraestructura

- [ ] Container Apps desplegado con web y trabajador, escalado configurado
- [ ] PostgreSQL con HA por zona, endpoint privado, respaldo automático de 35 días
- [ ] Key Vault operativo; ningún secreto fuera de él
- [ ] Managed Identity con credencial federada funcionando contra Graph
- [ ] Blob de staging con lifecycle de 24 h
- [ ] Front Door y WAF configurados; TLS válido
- [ ] Application Insights recibiendo trazas de web y trabajador

### Microsoft 365

- [ ] Sitio `MSS_Cierre_2026` creado con las tres carpetas raíz del Plan Macro
- [ ] `Sites.Selected` concedido **solo** sobre ese sitio (`TC-233`)
- [ ] Versionado nativo habilitado en la biblioteca
- [ ] Buzón de servicio creado con `Mail.Send` restringido por política
- [ ] Registros de aplicación separados para web y servicio
- [ ] Permisos de SharePoint alineados con las clasificaciones de sensibilidad

### Aplicación

- [ ] Migraciones aplicadas y verificadas
- [ ] Catálogos semilla del Plan Macro cargados (`FR-009`)
- [ ] Plantillas de ruta y reglas de nombrado configuradas por área
- [ ] Checklist de validación configurado
- [ ] Matriz de aprobación de excepciones configurada
- [ ] Parámetros del proyecto fijados: fecha de cierre, umbrales, frecuencias
- [ ] Usuarios y roles cargados con sus ámbitos
- [ ] Trabajos programados activos y verificados

### Verificación funcional

- [ ] Todos los `TC-` marcados 🔴 en verde
- [ ] Cero defectos críticos abiertos
- [ ] Cero defectos altos sin plan aceptado
- [ ] Los cinco guiones de UAT firmados
- [ ] Prueba de reconciliación analítica (§12.1) en verde
- [ ] Prueba de restauración ejecutada y cronometrada dentro del RTO
- [ ] Primera reconciliación completa ejecutada contra el sitio real

### Operación

- [ ] Alertas configuradas conforme a [Arquitectura §20.3](03_ARQUITECTURA_TECNICA.md)
- [ ] Runbook de operación documentado
- [ ] Responsable de la cola de fallidos designado
- [ ] Responsable de las colas de reconciliación designado
- [ ] Canal de soporte a usuarios definido
- [ ] `DA-007` (respaldo del repositorio) resuelto o con fecha comprometida
- [ ] `DA-003` (modelo de validación) resuelto
- [ ] `DA-001` (denominadores) resuelto

### Documentación

- [ ] Guía de una página para el colaborador
- [ ] Guía del validador
- [ ] Guía del coordinador
- [ ] Los cinco documentos de desarrollo actualizados con las decisiones resueltas

---

## 23. Criterios de aceptación final

El sistema se acepta cuando las cinco afirmaciones de §1.1 quedan demostradas con evidencia.

### A · El universo esperado se calcula bien

- [ ] `TC-001`–`TC-013`: las diez periodicidades generan el conteo correcto
- [ ] `TC-141`–`TC-149`: la cobertura por periodo refleja los huecos reales
- [ ] `TC-045`–`TC-047`: cambiar una definición nunca destruye trabajo
- [ ] `TC-011`, `TC-039`, `TC-155`: los requisitos sin denominador no distorsionan el porcentaje

### B · Todo archivo llega a su lugar y queda registrado

- [ ] `TC-059`–`TC-060`: colocación y registro completos
- [ ] `TC-014`–`TC-025`: ruta y nombre canónicos correctos
- [ ] `TC-061`, `TC-072`: mover el archivo no rompe el vínculo
- [ ] `TC-070`: lo que entra por fuera del Portal se detecta
- [ ] `TC-175`: la cadena de trazabilidad es completa para cualquier documento

### C · Nada se pierde ni se duplica

- [ ] `TC-062`–`TC-063`, `TC-217`: idempotencia verificada en SharePoint
- [ ] `TC-126`–`TC-132`: duplicados detectados por contenido
- [ ] `TC-133`–`TC-140`: un documento, N instancias, un solo archivo
- [ ] `TC-214`–`TC-216`: nada falla en silencio
- [ ] `TC-116`: cero instancias con contenido eliminadas

### D · Los números del tablero son ciertos

- [ ] `TC-150`–`TC-158`: **todo indicador reconcilia exactamente con sus registros base**
- [ ] `TC-151`–`TC-154`: los desgloses suman el total sin diferencia
- [ ] `TC-157`: volumen y cobertura no se confunden
- [ ] `TC-158`: si un agregado se desactualiza, el sistema lo declara

### E · El cierre resiste una revisión externa

- [ ] `TC-178`–`TC-189`: la validación es completa y evidenciada
- [ ] `TC-086`, `TC-108`: quien cargó no valida, garantizado por la base
- [ ] `TC-190`–`TC-200`: toda excepción tiene causa, impacto, tratamiento y aprobación
- [ ] `TC-201`–`TC-210`: la auditoría es completa e inmutable
- [ ] `TC-105`: el paquete de cierre es autosuficiente

### Firma

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Dueño del Proyecto | | | |
| Responsable de Sistemas | | | |
| Responsable de UAT | | | |
| Responsable de Desarrollo | | | |

---

## 24. Escenarios end-to-end

### `E2E-01` 🔴 — Ciclo completo: requisito → asignación → entrega → SharePoint → validación → analítica → cierre

**Cubre:** `FR-100`, `FR-200`, `FR-300`, `FR-310`, `FR-401`, `FR-403`, `FR-500`, `FR-508`, `FR-710`, `FR-541`

```
 1. Admin crea "Estado de cuenta Banorte 1234", mensual, 2026-01 a 2026-06
    → Verificar: 6 instancias con etiquetas 2026-01 … 2026-06
 2. Admin asigna a M. Ramírez con fecha objetivo
    → Verificar: 6 instancias con responsable; notificación encolada
 3. M. Ramírez ve sus 6 pendientes en Mi trabajo
 4. Carga el estado de cuenta de enero
    → Verificar: ruta y nombre propuestos correctos antes de subir
 5. Confirma la entrega
    → Verificar en SharePoint: archivo en
       01_Expediente_MSS/04_Tesoreria_y_Bancos/Banorte_1234/2026/01/Estados_de_Cuenta/
       con nombre 2026-01_Tesoreria_EdoCuenta_Banorte1234.pdf
    → Verificar en base: item_id, drive_id, etag, ruta, URL, hash
    → Verificar: instancia 2026-01 en collected, en cola de validación
 6. L. Herrera abre la cola y ve la instancia
    → Verificar: los 5 puntos automáticos resueltos
 7. Valida
    → Verificar: validated; requisito al 16.7 % de validación
 8. Repetir 4-7 para febrero a junio
 9. Consultar el tablero
    → Verificar: el requisito al 100 % de recopilación y validación
    → Verificar: drill-down devuelve exactamente 6 instancias
10. Cerrar el requisito
    → Verificar: elegible; requiere acción explícita; registra quién y cuándo
11. Consultar la auditoría del requisito
    → Verificar: 1 creación + 6 asignaciones + 6 cargas + 6 colocaciones +
                 6 validaciones + 1 cierre, todas con usuario y momento
```

**Aprueba si:** los 11 pasos se completan y **cada verificación** se cumple sin excepción.

---

### `E2E-02` 🔴 — Rechazo y corrección

**Cubre:** `FR-509`, `FR-305`, `FR-800`, `FR-920`

```
1. Contribuidor entrega el estado de cuenta de marzo, pero sube el de febrero
2. Validador lo detecta y rechaza: motivo "Periodo incorrecto"
   → Verificar: instancia vuelve a in_collection; documento sigue vinculado
   → Verificar: notificación INMEDIATA al responsable
3. Responsable abre Mi trabajo
   → Verificar: aparece arriba, con motivo y comentario visibles sin abrir
4. Entrega el archivo correcto
   → Verificar: instancia vuelve a collected y a la cola
5. Validador valida
   → Verificar: la instancia registra DOS validaciones (rechazo y aprobación)
   → Verificar: la auditoría conserva ambas
```

---

### `E2E-03` 🔴 — Un documento contra múltiples requisitos

**Cubre:** `FR-320`, `FR-342`, `FR-718`, §10 modelo

```
1. Existen 4 instancias de julio 2024: 1 de Expediente, 3 de Materialidad
2. Contribuidor carga la factura A-4471 contra las 4
   → Verificar en SharePoint: UN solo archivo
   → Verificar en base: 1 document, 4 document_instance_link
3. Consultar cada instancia
   → Verificar: las 4 muestran el documento con su papel
4. Validar 3 y rechazar 1
   → Verificar: estatus independientes; el documento no cambia
5. Consultar analítica
   → Verificar: volumen cuenta 1 documento
   → Verificar: cobertura cuenta 4 instancias (3 validadas, 1 en recopilación)
6. Cargar versión nueva del documento
   → Verificar: las 3 validadas vuelven a pending_validation
7. Desvincular de una instancia con motivo
   → Verificar: esa instancia recalcula; las otras 3 intactas; documento vivo
```

---

### `E2E-04` 🔴 — Ingesta por fuera del Portal y reconciliación

**Cubre:** `FR-420`–`FR-425`, y la premisa de que la ingesta por el Portal es **opcional**

```
1. Alguien coloca Conciliacion_Banorte_Sep2024.xlsx directo en SharePoint,
   en la ruta canónica del requisito EXP-04-TES-0018
2. Ejecutar la reconciliación
   → Verificar: aparece como huérfano
   → Verificar: sugerencia EXP-04-TES-0018 · 2024-09 con confianza alta
3. Coordinador acepta la sugerencia
   → Verificar: documento creado con los identificadores del archivo existente
   → Verificar: vínculo creado; instancia pasa a collected
   → Verificar: auditoría con origin = reconciliation
   → Verificar: SharePoint NO fue modificado — mismo item_id, misma ruta
4. Mover el archivo a otra carpeta en SharePoint
5. Ejecutar reconciliación
   → Verificar: hallazgo "moved"; ruta actualizada; vínculo intacto
   → Verificar: desviación de ubicación marcada
6. Eliminar el archivo en SharePoint
7. Ejecutar reconciliación
   → Verificar: hallazgo "broken_link"
   → Verificar: al resolverlo como eliminado, la instancia vuelve a in_collection
   → Verificar: responsable notificado
```

---

### `E2E-05` 🔴 — Documentación parcial y excepción hasta el cierre

**Cubre:** `FR-307`, `FR-508`–`FR-510`, `FR-520`–`FR-526`, `FR-541`

```
 1. Requisito mensual 2021-01 a 2021-12, 12 instancias
 2. Se entregan y validan 7
 3. Responsable declara que 5 no existen: el banco no conserva > 5 años
    → Verificar: excepción en proposed; NO puede fijar not_obtained
 4. La excepción llega a la cola del validador final (Dueño del Proyecto o su segunda persona) — el Coordinador de Área no puede aprobarla, sin importar el impacto (`DA-009`)
 5. Intentar cerrar el requisito
    → Verificar: BLOQUEADO, con la excepción no aprobada como bloqueante
 6. El validador final aprueba la excepción
    → Verificar: las 5 instancias pasan a not_obtained
 7. Consultar analítica
    → Verificar: validación 58.3 % (7/12)
    → Verificar: completitud 100 % (7 validadas + 5 no obtenidas aprobadas)
    → Verificar: ambas cifras visibles por separado, sin confundirse
 8. Cerrar el requisito
    → Verificar: ahora elegible; se cierra
 9. Exportar el registro de excepciones
    → Verificar: la excepción aparece con sus cuatro campos y su aprobación
10. Generar el paquete de cierre del área
    → Verificar: el anexo de excepciones es autosuficiente para un tercero
```

---

### `E2E-06` 🔴 — Reconciliación completa de la analítica

**Cubre:** `FR-702`, `FR-722`, y la afirmación central del §1.1

```
1. Cargar el conjunto completo de datos de prueba
2. Consultar el tablero de proyecto y anotar los seis conteos de estado
3. Para CADA UNO, llamar /analytics/drill-down y comparar meta.total
   → Verificar: coincidencia EXACTA en los seis, matchesAggregate = true
4. Sumar los desgloses por frente
   → Verificar: suma = total del proyecto, diferencia = 0
5. Para cada frente, sumar sus áreas
   → Verificar: suma = total del frente, diferencia = 0
6. Para un área, sumar sus procesos
   → Verificar: suma = total del área, diferencia = 0
7. Sumar los seis estados de instancia
   → Verificar: suma = instancias en alcance
8. Verificar el conjunto SEED-MULTI
   → Verificar: volumen cuenta 1 documento, cobertura cuenta 4 instancias
9. Verificar los requisitos `progressive` con enumeración abierta
   → Verificar: no aparecen en el denominador; se reportan aparte como volumen en progreso
10. Desactualizar las vistas materializadas a propósito
    → Verificar: matchesAggregate = false y la interfaz lo advierte
```

**Aprueba si:** los diez pasos dan coincidencia exacta, sin tolerancia de redondeo. **Cualquier diferencia es defecto crítico.**

---

## 25. Matriz de trazabilidad

`Objetivo de negocio → FR → Flujo/Pantalla → Componente técnico → Entidad/Endpoint → Caso de prueba`

| Objetivo | FR | UF / SC | Componente | Entidad / Endpoint | TC |
|---|---|---|---|---|---|
| **O-1** Definir y mantener el universo documental | `FR-003`–`FR-015` | `SC-080` | `TaxonomyService` | `area`, `process`, `activity` · `/taxonomy/*` | `TC-055`, `TC-056`, `TC-111` |
| | `FR-100`–`FR-127` | `UF-001`, `SC-021`, `SC-022` | `RequirementService` | `requirement` · `/requirements/*` | `TC-043`, `TC-044`, `TC-058` |
| | `FR-130`–`FR-138` | `SC-023` | `ImportService` | `/requirements/import` | `TC-050`–`TC-054` |
| | `FR-200`–`FR-215` | `SC-024` | `PeriodService` | `evidence_instance` · `/instances/*` | `TC-001`–`TC-013`, `TC-045`–`TC-047` |
| **O-2** Distribuir y dar seguimiento a la recopilación | `FR-300`–`FR-307` | `UF-002`, `SC-030` | `AssignmentService` | `assignment` · `/instances/bulk-assign` | `TC-057`, `TC-094`, `TC-100`, `TC-101` |
| | `FR-717`, `FR-805` | `SC-013` | `AnalyticsService`, `NotificationService` | `/analytics/by-responsible` | `TC-165` |
| **O-3** Colocar en la ubicación canónica sin navegación | `FR-310`–`FR-322` | `UF-003`, `SC-032` | `DocumentService` | `upload_intent`, `document` · `/uploads/*` | `TC-117`–`TC-125` |
| | `FR-401`, `FR-440`–`FR-447` | `UF-004`, `SC-082` | `PlacementService` | `path_template`, `naming_rule` | `TC-014`–`TC-025` |
| | `FR-400`–`FR-413` | `UF-005` | `SharePointService` | `sharepoint_location` | `TC-059`–`TC-069`, `TC-078` |
| **O-4** Absorber lo que llega por fuera del Portal | `FR-330`–`FR-337` | `UF-013`, `SC-033` | `DocumentService` | `/documents/register-existing` | `TC-075`, `E2E-04` |
| | `FR-420`–`FR-429` | `UF-014`, `SC-070`, `SC-071` | `ReconciliationService` | `reconciliation_finding` · `/reconciliation/*` | `TC-070`–`TC-076`, `TC-079` |
| **O-5** Ejecutar y evidenciar la validación | `FR-500`–`FR-515` | `UF-006`–`UF-008`, `SC-040`, `SC-041` | `ValidationService` | `validation` · `/validations/*` | `TC-178`–`TC-189` |
| | `FR-504` | `SC-040` | Trigger de base | `trg_validator_segregation` | `TC-086`, `TC-108` |
| | `FR-520`–`FR-529` | `UF-009`, `UF-010`, `SC-050`, `SC-051` | `ExceptionService` | `exception` · `/exceptions/*` | `TC-190`–`TC-200` |
| | `FR-540`–`FR-545` | `UF-011`, `SC-100` | `ClosureService` | `/closure/*` | `TC-102`–`TC-105`, `TC-194` |
| **O-6** Medir por cobertura con reconciliación | `FR-700`–`FR-723` | `UF-012`, `SC-010`–`SC-014` | `AnalyticsService` | `mv_coverage_*` · `/analytics/*` | `TC-036`–`TC-042`, `TC-150`–`TC-167` |
| | `FR-702`, `FR-722` | `SC-010` drill-down | Consulta a registros base | `/analytics/drill-down` | `TC-150`–`TC-158`, `E2E-06` |
| | `FR-715`, `FR-716` | `SC-012` | `mv_coverage_by_period` | `/analytics/by-period` | `TC-141`–`TC-149` |
| **O-7** Localizar sin conocer el origen | `FR-600`–`FR-612` | `SC-060`, `SC-061` | `SearchService` | `related_reference` · `/search/*` | `TC-168`–`TC-177` |
| | `FR-350`–`FR-354` | `SC-061` | `DocumentService` | `related_reference` | `TC-168`, `TC-175` |
| **O-8** Sostener el cierre ante revisión externa | `FR-920`–`FR-926` | Todas | `AuditService` | `audit_event` · `/audit/*` | `TC-201`–`TC-210` |
| | `FR-930`–`FR-939` | Todas | `AuthzService` | `user_role` · `/admin/users/*` | `TC-080`–`TC-093`, `TC-223`–`TC-233` |
| | `FR-544`, `FR-911` | `SC-100` | `ClosureService` | `/closure/package` | `TC-105` |
| **Transversal** — resiliencia | `FR-406`–`FR-409` | §8 UX | Cliente Graph, colas | `upload_intent` | `TC-211`–`TC-222` |
| **Transversal** — notificaciones | `FR-800`–`FR-809` | §16 UX, `SC-091` | `NotificationService` | `notification` · `/notifications/*` | `TC-096`, `TC-215`, `UAT-02` |
| **Transversal** — administración | `FR-900`–`FR-911` | `SC-080`–`SC-086` | Varios | `/admin/*` | `TC-077`, `TC-093`, `TC-216` |

### Cobertura de requisitos no funcionales

| NFR | Cómo se verifica | TC |
|---|---|---|
| `NFR-001` Rendimiento de listados | Prueba de carga con `SEED-VOL` | `TC-234`, `TC-235` |
| `NFR-002` Rendimiento de búsqueda | Prueba de carga | `TC-238` |
| `NFR-003` Rendimiento de tableros | Prueba de carga | `TC-236`, `TC-237` |
| `NFR-004` Carga de archivos | Prueba con archivo real | `TC-240` |
| `NFR-005` Volumen documental | Conjunto sintético | `TC-234`–`TC-243` |
| `NFR-006` Concurrencia | Prueba con k6 | `TC-241` |
| `NFR-007` Disponibilidad | Monitoreo continuo durante UAT; ventanas de mantenimiento fuera de horario | Lista de verificación §22 |
| `NFR-008` Durabilidad | Reconciliación bidireccional | `TC-070`–`TC-073` |
| `NFR-009` Consistencia analítica | Reconciliación | `TC-150`, `TC-158`, `TC-242` |
| `NFR-010` Respaldo | Restauración cronometrada | Lista de verificación §22 |
| `NFR-011` Retención de auditoría | Verificación de política | `TC-203` |
| `NFR-012` Navegadores | Los guiones de UAT se ejecutan en Edge y Chrome, últimas dos versiones | `UAT-01`–`UAT-05` |
| `NFR-013` Responsividad | Recorrido de consulta y aprobación a 375 px y 768 px; verificación de que las tareas de precisión indican requerir escritorio | `UAT-05` |
| `NFR-014` Accesibilidad | Auditoría de accesibilidad | `TC-144`, `TC-184` |
| `NFR-015` Idioma | Revisión de interfaz completa en español; cadenas externalizadas | Revisión previa a producción |
| `NFR-020` Mantenibilidad | Los `TC-` de configuración demuestran cambios sin despliegue | `TC-253`, `TC-298`–`TC-302`, `TC-307` |
| `NFR-016`–`NFR-018` Seguridad | Revisión y escaneo | `TC-229`–`TC-233` |
| `NFR-019` Portabilidad | Exportación completa | `TC-105` |
| `NFR-021` Modo archivo | Prueba funcional | `TC-093` |
| `NFR-022` Registro de errores | Verificación de correlación | `TC-219` |

---

## Referencias

- [00_GLOSARIO.md](00_GLOSARIO.md) · [01_PRD.md](01_PRD.md) · [02_UX_UI_FLUJOS.md](02_UX_UI_FLUJOS.md) · [03_ARQUITECTURA_TECNICA.md](03_ARQUITECTURA_TECNICA.md) · [04_MODELO_DATOS_API.md](04_MODELO_DATOS_API.md) · [DECISIONES_ABIERTAS.md](DECISIONES_ABIERTAS.md)

🔴 = caso bloqueante para la salida a producción.
