# Decisiones abiertas

**Portal de Materialidad y Expediente MSS**
Versión 2.0 · 17 de agosto de 2026 — **Las 12 decisiones fueron resueltas** por el Dueño del Proyecto en esta fecha.

---

## Para qué existe este documento

El master prompt del proyecto pedía explícitamente: *"Flag unresolved business decisions explicitly rather than silently making assumptions."* Este archivo nació como el lugar donde vivían esas preguntas de negocio sin resolver.

Las doce quedaron resueltas el 17 de agosto de 2026. El documento se conserva completo, con las opciones descartadas, porque el registro de **por qué no se eligió algo** vale tanto como la elección — y porque futuras decisiones (nuevas áreas, cambios de alcance) van a necesitar el mismo tipo de ficha.

**Cómo leer cada ficha:**

- **Contexto** — por qué la pregunta existió.
- **Opciones consideradas** — las alternativas reales evaluadas, con la elegida marcada.
- **Decisión** — lo que se resolvió, con fecha y quién la tomó.
- **Efecto en la documentación** — qué `FR-`, entidades o secciones cambiaron como consecuencia.

**Estados:** todas `Resuelta`. Una decisión resuelta puede reabrirse si cambian las condiciones del proyecto; en ese caso se documenta como una revisión con su propia fecha, sin borrar la resolución anterior.

---

## Tablero de decisiones

| ID | Decisión | Resolución |
|---|---|---|
| `DA-001` | Denominador para periodicidades no enumerables | Marcado manual 1/0 por periodo + enumeración abierta/cerrada por requisito |
| `DA-002` | Documentos ya existentes en SharePoint en ubicaciones distintas | Se aceptan copias múltiples como válidas, con marca de duplicado — sin mover ni forzar consolidación |
| `DA-003` | Modelo de validación y auto-validación | Híbrido por área; los 2 validadores finales solo cierran, aprueban excepciones y revisan casos críticos |
| `DA-004` | Alcance temporal por área del Expediente MSS | Por área según obligación legal; documentación fundacional sin requerimiento de fecha |
| `DA-005` | Dónde se aplica la restricción de información sensible | Ambos sistemas por separado, con reporte semanal de conciliación |
| `DA-006` | Destino del Portal después del cierre de MSS | El Portal se apaga; SharePoint continúa como repositorio vivo |
| `DA-007` | Retención y respaldo del repositorio | SharePoint: fuera del alcance de la app. Base de datos del Portal: sí, respaldo automático |
| `DA-008` | ¿El Portal impone o propone el estándar de nombres? | Propuesto y editable con validación de patrón |
| `DA-009` | Aprobación formal de una Excepción/Riesgo | Siempre los 2 validadores finales, sin importar el impacto; sin nivel de Coordinador |
| `DA-010` | Acceso de colaboradores externos | Entregan por fuera del Portal; un interno carga en su nombre |
| `DA-011` | Instancias recopiladas cuando cambia el requisito | Nunca se destruye información; se marca fuera de alcance |
| `DA-012` | Tratamiento de correos electrónicos | Correo íntegro en formato nativo + metadatos extraídos; adjuntos no se separan por defecto |

---

## `DA-001` — Denominador para periodicidades no enumerables

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** [Glosario §1.3](00_GLOSARIO.md), `FR-112`–`FR-116`, `FR-208`, `FR-704`

### Contexto

El Plan Macro lista periodicidades que el sistema **no puede** enumerar: por evento, por empleado, por proveedor, por proyecto, por transacción. Para "estado de cuenta mensual, 2020-2026" el sistema calcula 84 instancias esperadas sin ayuda. Para "expediente laboral por empleado" no existe forma de saber cuántos empleados hubo históricamente sin que alguien lo diga o cargue el padrón.

Sin denominador no hay porcentaje de cobertura. Y un denominador inventado produce un porcentaje que se ve bien y no significa nada.

### Opciones consideradas

**A — Conteo declarado obligatorio.** El responsable declara un número esperado al crear el requisito. Riesgo: números al azar para poder avanzar.

**B — Padrón cargado obligatorio.** Se exige cargar la lista real de drivers antes de activar. El más confiable, pero puede bloquear semanas el arranque de la recopilación.

**C — Sin denominador permitido, estático.** El requisito opera sin número esperado desde el inicio y para siempre; se reporta aparte, nunca entra al %.

**✅ E — Marcado manual progresivo con enumeración abierta/cerrada.** *(Elegida — no estaba entre las opciones originales A–D; el Dueño del Proyecto propuso una quinta mecánica más simple que las anteriores.)* No se declara ningún número al crear el requisito. Conforme llegan documentos, cada instancia se marca manualmente como recopilada (1) o no (0) — no se deriva automáticamente de los componentes obligatorios como en el resto del sistema. El requisito lleva una bandera **"Enumeración abierta" / "Enumeración cerrada"**:
- Mientras está **abierta**, el requisito se excluye del % de cobertura y se reporta como indicador de volumen ("14 instancias marcadas, enumeración en progreso").
- Cuando el responsable decide que ya no van a aparecer más periodos y **cierra la enumeración**, el conteo marcado hasta ese momento se congela como el denominador final del requisito. A partir de ahí, el requisito participa en el % de cobertura como cualquier otro.
- Reabrir la enumeración es una acción explícita y auditable, por si aparece un periodo adicional después del cierre.

### Decisión

Se adopta la opción **E**. Reemplaza el modelo original de tres bases de cálculo (`declared_count` / `driver_list` / `open_ended`) por un mecanismo único y más simple: **marcado manual + enumeración abierta/cerrada**. `driver_list` se conserva como opción avanzada para los casos donde ya existe un padrón real (nómina, catálogo de proveedores) y se quiere generar instancias automáticamente desde él — pero deja de ser la ruta por defecto. `declared_count` se elimina del modelo: declarar un número de antemano dejó de ser el mecanismo; ahora se determina al cerrar la enumeración, con base en lo efectivamente encontrado.

### Efecto en la documentación

- **Modelo de datos:** `requirement.denominator_basis` pasa a tener dos valores (`progressive` por defecto, `driver_list` como alternativa); se agrega `requirement.enumeration_status` (`open`/`closed`) y `requirement.enumeration_closed_at` / `enumeration_closed_by_user_id`. `evidence_instance` gana un campo de marcado manual explícito para este modo.
- **PRD:** `FR-112`–`FR-116` se reescriben; `FR-704` (exclusión del % de cobertura) ahora aplica a requisitos con `enumeration_status = 'open'` en vez de a `denominator_basis = 'open_ended'`.
- **UX:** la ficha del requisito (`SC-021`) necesita la acción "Cerrar enumeración" y el indicador de "en progreso".
- **Pruebas:** `TC-009`–`TC-013`, `TC-039`, `TC-155` se ajustan al nuevo mecanismo.

---

## `DA-002` — Documentos ya existentes en SharePoint en ubicaciones distintas

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** [Glosario §1.4](00_GLOSARIO.md), `FR-315`, `FR-330`–`FR-337`

### Contexto

El Portal no es la única puerta de entrada a SharePoint. Cuando un usuario registra o carga un archivo cuyo contenido ya existe en otra ubicación del repositorio, había que decidir si se fuerza una sola copia "maestra" o se acepta que el mismo contenido viva en más de un lugar.

### Opciones consideradas

**A — Registrar donde están, sin mover, pero forzando una sola copia maestra.** *(Supuesto original)* Al detectar contenido duplicado, el sistema obligaba a elegir: vincular la copia existente o cargar una nueva con justificación.

**B — Mover siempre a la ruta canónica.** Descartada: rompe enlaces compartidos y es riesgosa en volumen.

**C — Proponer el movimiento caso por caso.** Descartada: fricción alta para poco beneficio.

**✅ D — Aceptar copias múltiples válidas, con marca de duplicado.** *(Elegida.)* El Portal ya no obliga a elegir una sola copia cuando detecta contenido idéntico en más de una ubicación. Cada copia se registra como documento válido, con su propio conjunto de vínculos a instancias. Se agrega una marca visible **"contenido duplicado — también existe en: [rutas]"** en ambas, útil para quien quiera limpiar más adelante, pero sin bloquear ni exigir una decisión en el momento.

### Decisión

Se adopta la opción **D**. No se fuerza consolidación de duplicados en ningún camino de ingesta (carga nueva, registro de existente, o reconciliación). El sistema **detecta y marca**, nunca **decide por el usuario**. Esto no cambia el modelo de "un documento, N instancias" (`FR-320`) — ese sigue siendo el comportamiento preferido cuando el usuario elige vincular en vez de duplicar. Lo que cambia es que duplicar deja de tratarse como una desviación que hay que justificar: es un estado válido y permanente si nadie decide limpiarlo.

### Efecto en la documentación

- **PRD:** `FR-315` se reescribe — dos opciones en vez de tres ("vincular el existente" o "cargar como copia adicional", ambas sin motivo obligatorio); se agrega un requisito para la marca de duplicado visible en ambos documentos.
- **Modelo de datos:** se agrega `document.duplicate_of_content_hash` o una tabla de agrupación por hash para listar todas las copias que comparten contenido; `sharepoint_location` ya no necesita resolver a un único documento "maestro".
- **Analítica:** el indicador de volumen debe poder mostrar "documentos únicos por contenido" además de "documentos totales", para no inflar el volumen real cuando hay copias.
- **Pruebas:** `TC-126`–`TC-132` se ajustan: ya no se prueba el bloqueo de elección, se prueba que ambas copias queden marcadas.

---

## `DA-003` — Modelo de validación: central, por área, y auto-validación

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** `FR-500`–`FR-504`, [Glosario §4.6](00_GLOSARIO.md)

### Contexto

El Plan Macro define qué se valida pero no quién. Tres preguntas: ¿validación central o por área?, ¿se permite auto-validación?, ¿cuántas firmas?

### Opciones consideradas

**A — Validación central para todo.** Descartada: cuello de botella con decenas de miles de instancias.

**B — Validación por área, sin revisión central.** Descartada: criterio no uniforme entre áreas.

**✅ C — Híbrido: por área + rol central acotado.** *(Elegida, precisada.)* Cada área valida su propia documentación del día a día con su validador designado. Los dos validadores finales (el Dueño del Proyecto y una segunda persona) **no revisan documentos individuales de forma rutinaria** — su rol se limita a tres cosas: (1) dar el visto bueno de cierre de requisitos, áreas y del proyecto completo; (2) aprobar o rechazar toda excepción, sin importar su impacto (ver `DA-009`); (3) revisar casos críticos puntuales cuando algo les preocupe, fuera del flujo normal.

**D — Auto-validación permitida para bajo riesgo.** Descartada — ver más abajo.

### Decisión

Se adopta la opción **C**, con el alcance de los dos validadores finales acotado a cierre + excepciones + casos críticos (no validación rutinaria). **La auto-validación permanece prohibida por regla dura del sistema**: quien registró un documento no puede validar la instancia que ese documento satisface, aplicado también a nivel de base de datos (trigger), no solo de interfaz.

### Efecto en la documentación

- **PRD:** la sección de roles (§5.2) se precisa: el Coordinador de Área asigna y da seguimiento pero **no aprueba excepciones** (ver `DA-009`); se agrega el concepto de "validador final" como ámbito de proyecto completo, reservado a las dos personas designadas.
- **Modelo de datos:** `user_role` con `scope_type = 'project'` y `role_code = 'validator'` identifica a los validadores finales; la matriz de aprobación de excepciones (`approval_matrix`) se simplifica — ver `DA-009`.
- Sin cambio en la regla `FR-504` (segregación validador/cargador) ni en el trigger `trg_validator_segregation`.

---

## `DA-004` — Alcance temporal por área del Expediente MSS

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** `FR-010`, `FR-111`, [Glosario §5.1](00_GLOSARIO.md)

### Contexto

Para Materialidad el rango es explícito (2020 en adelante). Para Expediente MSS el Plan Macro solo dice "todo el periodo histórico aplicable", que no es una fecha, y probablemente no es uniforme por área.

### Opciones consideradas

**A — Fecha única para todo el Expediente.** Descartada: sobre-recopila en unas áreas y sub-recopila en otras.

**✅ B — Periodo por área, según obligación legal de conservación.** *(Elegida.)* Cada área tiene su propio rango predeterminado (fiscal ≠ laboral ≠ corporativa ≠ contable), heredable por los requisitos y sobrescribible.

**C — Periodo por requisito, sin default de área.** Ya soportado técnicamente; se usa como mecanismo, no como política.

### Decisión

Se adopta la opción **B**, con una precisión importante que aporta el Dueño del Proyecto: **la documentación fundacional y sus modificaciones no llevan requerimiento de fecha**. El acta constitutiva de MSS y cualquier acta posterior que la modifique (cambios de razón social, de objeto social, de capital, de administradores, etc.) se tratan con periodicidad `permanent`: deben existir y estar completas, pero no se enumeran por periodo ni tienen fecha de inicio — se recopilan "desde siempre hasta que dejen de generarse", sin necesidad de declarar un rango.

### Efecto en la documentación

- **PRD:** `FR-010` (rango predeterminado por área) se mantiene; se agrega una nota explícita de que el área Corporativo y Legal debe declarar sus requisitos fundacionales con periodicidad `permanent`, no con rango.
- **Glosario §4.2:** se anota junto al área "Corporativo y Legal" que su documentación fundacional no lleva rango.
- Sin fecha concreta comprometida para el resto de las áreas — cada Coordinador la define al detallar el inventario del Paso 1, con Legal y Fiscal como referencia de la obligación de conservación aplicable.

---

## `DA-005` — Dónde se aplica la restricción de información sensible

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** [Glosario §4.5](00_GLOSARIO.md), `FR-933`, `FR-935`

### Contexto

El Plan Macro pide restringir sin impedir la localización. El Portal y SharePoint tienen sistemas de permisos independientes que pueden divergir.

### Opciones consideradas

**A — Solo SharePoint.** Descartada: deja metadatos del Portal sin protección propia.

**B — Solo el Portal.** Descartada: inútil si alguien navega SharePoint directo.

**C — El Portal sincroniza permisos hacia SharePoint.** Descartada: la sincronización de permisos vía Graph es frágil y difícil de auditar.

**✅ D — Ambos, gestionados por separado, con reporte de conciliación.** *(Elegida, tal como estaba propuesta.)* SharePoint mantiene sus permisos nativos sobre el contenido; el Portal aplica su propia clasificación sobre metadatos y visibilidad de enlaces; un reporte semanal señala divergencias para corrección manual.

### Decisión

Se confirma la opción **D** sin cambios respecto de la propuesta original. El Portal nunca oculta la existencia de un registro por sensibilidad — oculta metadatos sensibles y el acceso al contenido.

### Efecto en la documentación

Ninguno — el PRD (`FR-933`, `FR-935`), la arquitectura (§16.3) y el modelo de datos ya reflejaban esta opción como comportamiento por defecto. Queda confirmada como decisión firme, no como supuesto.

---

## `DA-006` — Destino del Portal después del cierre de MSS

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** `FR-910`, `FR-911`, [Arquitectura §23](03_ARQUITECTURA_TECNICA.md)

### Contexto

MSS cierra como entidad. ¿Qué pasa con el Portal el día después?

### Opciones consideradas

**✅ A — Se apaga y se exporta.** *(Elegida.)* El Inventario Maestro final, el registro de excepciones y el mapa de ubicaciones se exportan a Excel/PDF; SharePoint sigue siendo navegable directamente como repositorio.

**B — Se congela como índice de solo lectura.** Descartada: requiere hosting y mantenimiento de seguridad por años sin que el proyecto lo necesite.

**C — Se migra a una entidad sucesora.** Descartada por ahora — no hay entidad sucesora identificada.

### Decisión

Se adopta la opción **A**. El Portal termina su vida útil cuando el proyecto de cierre concluye. SharePoint continúa como el repositorio vivo y navegable; el Inventario Maestro final, el registro de excepciones y el mapa de ubicaciones quedan exportados en `00_Control_Proyecto` como el índice de consulta permanente, sin depender de que el Portal siga en línea.

### Efecto en la documentación

- **PRD:** `FR-911` (exportación completa) se mantiene como requisito central, ya no como red de seguridad para un escenario incierto sino como el mecanismo de cierre planeado del propio Portal.
- El requisito de "modo archivo" (`FR-910`) se conserva como opción operativa útil durante una transición corta, pero deja de ser la estrategia de largo plazo.
- **Arquitectura:** el riesgo R-13 (extinción del tenant) se reclasifica: ya no es una amenaza a mitigar, es el desenlace esperado y planeado.

---

## `DA-007` — Retención y respaldo del repositorio

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** `NFR-010`, [Arquitectura §25](03_ARQUITECTURA_TECNICA.md)

### Contexto

El Plan Macro exige un esquema de respaldo independiente de la copia de trabajo. Había dos activos distintos que respaldar: el repositorio de SharePoint (los archivos) y la base de datos del Portal (el control: asignaciones, estatus, validaciones, auditoría).

### Opciones consideradas — respaldo de SharePoint

**A — Respaldo nativo de M365.** No cubre pérdida del tenant.
**B — Herramienta de terceros con copia fuera del tenant.** Tiene costo y administración.
**✅ C — Fuera del alcance de la aplicación.** *(Elegida.)* El Dueño del Proyecto asume personalmente la responsabilidad de respaldar el repositorio por fuera del Portal (copia periódica a medio externo — USB o equivalente). La aplicación no construye ni opera infraestructura de respaldo para SharePoint.

### Opciones consideradas — respaldo de la base de datos del Portal

**✅ Sí, respaldo automático estándar.** *(Elegida.)* A diferencia de SharePoint, la base de datos del Portal es infraestructura de la propia aplicación: sin ella se pierde el rastreo completo del proyecto (quién entregó qué, estatus, validaciones, excepciones, auditoría) aunque los archivos sobrevivan en SharePoint. Se mantiene el respaldo automático de la nube (recuperación a un punto en el tiempo) como parte estándar de desplegar la base de datos, sin que esto implique un proceso manual adicional para el usuario.

### Decisión

Respaldo de **SharePoint: fuera del alcance de la aplicación** — gestión personal del Dueño del Proyecto. Respaldo de la **base de datos del Portal: sí**, con el mecanismo estándar de la nube (PITR automático de 35 días), por ser infraestructura básica y no un proceso operativo separado.

### Efecto en la documentación

- **Arquitectura §25:** se elimina la fila de "copia independiente de SharePoint" como responsabilidad del proyecto de desarrollo; se anota que es responsabilidad personal del Dueño del Proyecto, fuera del alcance del Portal. La fila de respaldo de base de datos se mantiene sin cambios (ya estaba resuelta como PITR + `pg_dump` semanal).
- **Riesgo R-8** ("pérdida de SharePoint sin copia independiente") se reclasifica de riesgo del proyecto a riesgo aceptado explícitamente por el Dueño del Proyecto, fuera del control de la aplicación.
- **Lista de verificación de producción:** el punto "`DA-007` resuelto o con fecha comprometida" se marca cumplido; se mantiene únicamente la verificación del respaldo de base de datos.

---

## `DA-008` — ¿El Portal impone o propone el estándar de nombres?

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** [Glosario §5.3](00_GLOSARIO.md), `FR-312`, `FR-334`

### Contexto

El Plan Macro propone una convención de nombres. La pregunta era qué grado de libertad tiene el usuario frente al nombre generado automáticamente.

### Opciones consideradas

**A — Impuesto, sin edición.** Descartada: fricción alta.
**✅ C — Propuesto y editable con validación de patrón.** *(Elegida, tal como estaba propuesta.)* El Portal genera el nombre; el usuario puede ajustarlo pero el resultado debe seguir cumpliendo el patrón. En el camino de registro de existentes, se conserva el nombre real y solo se marca la desviación.
**B / D** — descartadas por menor rigor o mayor complejidad innecesaria frente a C.

### Decisión

Se confirma la opción **C** sin cambios respecto de la propuesta original.

### Efecto en la documentación

Ninguno — `FR-312`, `FR-334` y el resto del modelo ya reflejaban este comportamiento. Queda confirmada como decisión firme.

---

## `DA-009` — Aprobación formal de una Excepción/Riesgo

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** `FR-520`–`FR-529`, [Glosario §1.5](00_GLOSARIO.md)

### Contexto

El Plan Macro exige que toda excepción se someta a "cierre formal", sin definir quién lo otorga.

### Opciones consideradas

**A — El Validador cierra la excepción.** Descartada: débil, quien no consiguió el documento se autoaprueba.
**B — El Dueño del Proyecto aprueba todas.** Cercana a la elegida, pero sin la segunda persona.
**C — Escalonado por impacto (Coordinador de Área para impacto bajo).** *(Supuesto original — descartada en la resolución final.)*
**D — Aprobación por lote periódica.** Descartada: introduce demora innecesaria.

**✅ Resolución final — sin escalonamiento, siempre los dos validadores finales.** El Coordinador de Área puede **proponer** una excepción (marcar que un documento parece no poder obtenerse), pero no puede aprobarla él mismo, sin importar qué tan menor parezca. Toda excepción, de cualquier impacto, la resuelve el Dueño del Proyecto o la segunda persona designada como validador final.

### Decisión

Se simplifica el modelo: se elimina el nivel de aprobación por Coordinador de Área que contemplaba la opción C original. La matriz de aprobación por impacto (`approval_matrix`) deja de tener múltiples niveles — se reduce a un único nivel fijo: **validador final**. Esto es consistente con la resolución de `DA-003`, donde el rol de los dos validadores finales incluye explícitamente la aprobación de excepciones.

### Efecto en la documentación

- **PRD:** `FR-523` se reescribe — ya no deriva un nivel de aprobación (`coordinator`/`owner`/`direction`) según impacto; toda excepción va directo a los validadores finales. `FR-905` (configurar la matriz) se simplifica o se elimina si ya no hay niveles que configurar más allá de quién ocupa el rol de validador final.
- **Modelo de datos:** `exception.required_approval_level` puede eliminarse o colapsar a un único valor constante; `approval_matrix` se simplifica a la lista de usuarios con rol `validator` de ámbito `project`.
- **UX:** `SC-052` (pendientes de aprobación) ya no se segmenta por nivel — es una sola cola para los dos validadores finales.
- **Pruebas:** `TC-192`–`TC-193` (matriz por impacto) se ajustan para reflejar el nivel único.

---

## `DA-010` — Acceso de colaboradores externos

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** `FR-900`–`FR-901`

### Contexto

Buena parte de la documentación está con terceros: el despacho contable, abogados, agencias. Había que decidir cómo entregan al proyecto.

### Opciones consideradas

**✅ A — No acceden al Portal.** *(Elegida, tal como estaba propuesta.)* Entregan por correo o transferencia a un contacto interno, que carga la información al Portal. Cero superficie externa, cero licencias adicionales.
**B — Invitados de Entra ID (B2B).** Descartada por ahora: requiere aprobación de seguridad y gobierno de accesos externos que el proyecto no necesita en su primera versión.
**C — Enlaces de carga sin cuenta.** Se documenta como posible extensión futura, no descartada de forma permanente.
**D — Buzón de recepción por correo.** Parcialmente cubierta por la reconciliación (si un despacho deposita en una carpeta compartida, el barrido lo detecta como huérfano).

### Decisión

Se confirma la opción **A** sin cambios. Los terceros externos no tienen acceso directo al Portal en esta versión.

### Efecto en la documentación

Ninguno — el PRD ya reflejaba este comportamiento como alcance de la versión 1, con la opción C documentada como fase posterior. Queda confirmada como decisión firme, no como supuesto.

---

## `DA-011` — Qué pasa con las instancias ya recopiladas si cambia el requisito

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** `FR-204`, `FR-205`

### Contexto

El inventario del Paso 1 va a evolucionar. Un requisito con documentación ya recopilada puede cambiar de rango, periodicidad o área.

### Opciones consideradas

**✅ A — Nunca destruir.** *(Elegida, tal como estaba propuesta.)* Ampliar genera instancias nuevas; reducir marca las sobrantes como fuera de alcance, conservando documentos, validaciones e historial.
**B — Regenerar limpio.** Descartada: destruye trabajo validado.
**C — Versionar el requisito.** Descartada: complejidad no justificada frente al beneficio.

### Decisión

Se confirma la opción **A** sin cambios. Ninguna instancia con documentos, validaciones o historial puede eliminarse jamás, sin excepción.

### Efecto en la documentación

Ninguno — ya implementado como restricción de base de datos (`FR-204`, trigger de integridad) y como comportamiento verificado en `TC-045`–`TC-047`, `TC-116`. Queda confirmada como decisión firme, no como supuesto.

---

## `DA-012` — Tratamiento de correos electrónicos como documentos

**Estado:** ✅ Resuelta — 17 de agosto de 2026, por el Dueño del Proyecto.
**Referencias:** `FR-322`

### Contexto

El Plan Macro pide conservar correos con fecha, remitente, destinatarios y asunto. Había que decidir la granularidad: correo atómico, correo con metadatos extraídos, o correo con adjuntos separados como documentos propios.

### Opciones consideradas

**A — Correo atómico sin extracción.** Descartada: no buscable por remitente ni asunto.
**✅ B — Correo íntegro + metadatos extraídos.** *(Elegida, tal como estaba propuesta.)* Se conserva el `.msg`/`.eml` completo en formato nativo; se extraen remitente, destinatarios, fecha, asunto y nombres de adjuntos como metadatos buscables. Los adjuntos no se separan en documentos propios por defecto.
**C — Adjuntos como documentos separados.** Descartada como comportamiento por defecto: duplica contenido y multiplica volumen: se conserva como acción manual para casos donde un adjunto sea la evidencia principal.

### Decisión

Se confirma la opción **B** sin cambios.

### Efecto en la documentación

Ninguno — `FR-322` ya reflejaba este comportamiento. Queda confirmada como decisión firme, no como supuesto.

---

## Cómo mantener este documento

1. Las doce decisiones originales están resueltas. Si el proyecto cambia de condiciones y una debe reabrirse, se agrega una sección **"Revisión — [fecha]"** dentro de la misma ficha, sin borrar la resolución anterior.
2. Toda decisión nueva que surja durante el desarrollo se agrega con el siguiente `DA-013`, `DA-014`… en adelante. No se reutilizan identificadores.
3. Cada resolución que cambió un `FR-`, una entidad o un `TC-` respecto de lo originalmente documentado queda anotada en su ficha bajo "Efecto en la documentación" — esa lista es el pendiente de propagación hacia [01_PRD.md](01_PRD.md), [02_UX_UI_FLUJOS.md](02_UX_UI_FLUJOS.md), [03_ARQUITECTURA_TECNICA.md](03_ARQUITECTURA_TECNICA.md), [04_MODELO_DATOS_API.md](04_MODELO_DATOS_API.md) y [05_PLAN_PRUEBAS_UAT.md](05_PLAN_PRUEBAS_UAT.md).
