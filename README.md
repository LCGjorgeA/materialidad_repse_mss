# Portal de Materialidad y Expediente MSS

Aplicación web interna para operar el proyecto de integración y resguardo del expediente histórico de **Monterrey Shared Services (MSS)** antes del cierre de la compañía.

El Portal **no es un gestor documental**. SharePoint sigue siendo el repositorio oficial de archivos; el Portal es la capa de control, workflow, metadatos y analítica que se coloca encima: sabe qué documentación debe existir, qué se recibió, quién la entregó, si fue validada, dónde quedó, y cuánto falta.

> **Estado: desarrollo en curso.** El Portal se está construyendo — ver [DEVELOPMENT.md](DEVELOPMENT.md) para el estado, la estructura del código y cómo correrlo localmente. Sitio en vivo (skeleton): https://materialidad-repse-mss.vercel.app

---

## Los dos frentes

| Frente | Qué concentra | Pregunta que debe poder responder |
|---|---|---|
| **Expediente MSS** | Documentación de MSS como compañía: corporativa, contable, fiscal, legal, laboral, financiera, operativa y tecnológica. 11 áreas. | *¿Podemos reconstruir y demostrar la operación histórica de MSS?* |
| **Materialidad de Servicios** | Evidencia de los servicios que MSS prestó a GM y partes relacionadas: actividades, entregables, comunicaciones y transaccionales. 9 servicios. | *¿Podemos demostrar de forma ordenada la realidad de los servicios y operaciones soportadas por la facturación?* |

Ambos se administran bajo un solo **Inventario Maestro** y un solo repositorio.

---

## Lo que el Portal resuelve

1. **Convierte el Inventario Maestro en un sistema operable.** Deja de ser una hoja de cálculo compartida y se vuelve un universo documental estructurado, con responsables, estados y cobertura medible por periodo. Un requisito mensual de siete años no es un renglón: son 84 documentos esperados, y el Portal los sabe contar.

2. **Coloca cada documento en su lugar correcto de SharePoint sin que nadie navegue carpetas.** El usuario responde "¿qué requisito estás cubriendo?" y el Portal deriva ruta, nombre y metadatos.

3. **Absorbe lo que llega por fuera.** La ingesta a través del Portal es opcional: SharePoint también recibe archivos por carga directa, sincronización y migraciones de despachos. El Portal registra documentos existentes y reconcilia periódicamente para que nada quede invisible al control del proyecto.

4. **Mide el avance por cobertura del universo definido**, no por cantidad de archivos subidos, y permite rastrear cualquier cifra del tablero hasta los registros que la componen.

---

## Los documentos

Están en [`docs/`](docs/). Se leen en este orden.

| # | Documento | Qué pregunta responde |
|---|---|---|
| 00 | [Glosario y conceptos canónicos](docs/00_GLOSARIO.md) | ¿Qué significa cada término, y cuáles son los siete conceptos que estructuran todo el sistema? |
| 01 | [PRD](docs/01_PRD.md) | ¿Qué debe hacer el producto? Alcance, roles, ~160 requisitos funcionales con identificador. |
| 02 | [UX/UI y flujos](docs/02_UX_UI_FLUJOS.md) | ¿Cómo se ve y cómo se usa? Pantallas, wireframes en texto, 14 flujos end-to-end. |
| 03 | [Arquitectura técnica](docs/03_ARQUITECTURA_TECNICA.md) | ¿Cómo se construye, y por qué así? Stack justificado, integración con Graph, riesgos. |
| 04 | [Modelo de datos y API](docs/04_MODELO_DATOS_API.md) | ¿Cómo se representa y se expone? 22 entidades, DDL, algoritmos, 141 endpoints. |
| 05 | [Plan de pruebas y UAT](docs/05_PLAN_PRUEBAS_UAT.md) | ¿Cómo se demuestra que funciona? ~245 casos, escenarios E2E, matriz de trazabilidad. |
| — | [Decisiones abiertas](docs/DECISIONES_ABIERTAS.md) | ¿Qué falta decidir del lado del negocio? 12 decisiones con contexto, opciones e impacto. |

---

## Empezar por aquí, según lo que necesites

| Si eres… | Lee |
|---|---|
| Dueño del proyecto o dirección | Este README, luego [PRD §1–7](docs/01_PRD.md) y [Decisiones abiertas](docs/DECISIONES_ABIERTAS.md) |
| Responsable de un área | [Glosario §1](docs/00_GLOSARIO.md) y [UX §22](docs/02_UX_UI_FLUJOS.md) (flujos) |
| Desarrollador que se incorpora | [Glosario](docs/00_GLOSARIO.md) completo → [PRD §8–9](docs/01_PRD.md) → [Arquitectura](docs/03_ARQUITECTURA_TECNICA.md) → [Modelo de datos](docs/04_MODELO_DATOS_API.md) |
| Responsable de estimar el trabajo | [PRD §9](docs/01_PRD.md) (requisitos) y [Modelo de datos §13–25](docs/04_MODELO_DATOS_API.md) (endpoints) |
| Responsable de pruebas | [Plan de pruebas](docs/05_PLAN_PRUEBAS_UAT.md), empezando por §1 y §24 |

---

## Los tres conceptos que hay que entender antes de nada

Están desarrollados en el [Glosario §1](docs/00_GLOSARIO.md). Si solo se leen tres cosas de toda la documentación, que sean estas.

### 1. Requisito ≠ Instancia ≠ Documento

| | Qué es | Ejemplo |
|---|---|---|
| **Requisito** | La *definición* de lo que debe recopilarse | "Estado de cuenta Banorte 1234, mensual, 2020-2026" |
| **Instancia** | Cada *ocurrencia* que el requisito exige | "Banorte 1234, marzo 2021" — y otras 83 |
| **Documento** | El *archivo* que efectivamente existe | `2021-03_Tesoreria_EdoCuenta_Banorte1234.pdf` |

El avance del proyecto se mide sobre **instancias**. Un documento puede satisfacer varias instancias sin duplicarse: la relación es N:M, y un solo archivo vive en SharePoint.

### 2. La frontera Portal / SharePoint

- **Base de datos del Portal** = control, taxonomía, requisitos, instancias, relaciones, workflow, metadatos, analítica, auditoría.
- **SharePoint** = el archivo oficial, en formato nativo, y su historial de versiones.

El Portal nunca almacena archivos. SharePoint nunca almacena estatus de control.

### 3. Cobertura, no volumen

*"3,400 archivos cargados"* no dice nada sobre si el universo documental está cubierto. Los indicadores primarios (recopilación, validación, cobertura por periodo) se calculan sobre instancias; los de volumen son complementarios y se presentan por separado. Toda cifra del tablero debe poder rastrearse hasta los registros que la componen.

---

## Cómo mantener estos documentos

**El PRD es la fuente de verdad del alcance.** Un cambio entra primero como requisito `FR-###` y desde ahí se propaga a los demás documentos.

Identificadores y quién los asigna:

| Prefijo | Significa | Documento |
|---|---|---|
| `FR-###` / `NFR-###` | Requisito funcional / no funcional | 01 |
| `US-###` | Historia de usuario | 01 |
| `SC-###` / `UF-###` | Pantalla / flujo de usuario | 02 |
| `TC-###` | Caso de prueba | 05 |
| `DA-###` | Decisión de negocio abierta | Decisiones abiertas |

Cadena de trazabilidad que los documentos mantienen:

```
Objetivo de negocio → FR-### → UF-###/SC-### → Componente técnico → Entidad/Endpoint → TC-###
```

La matriz completa está al final del [plan de pruebas](docs/05_PLAN_PRUEBAS_UAT.md#25-matriz-de-trazabilidad).

**Reglas de mantenimiento**

1. Todo término nuevo se define primero en el [Glosario](docs/00_GLOSARIO.md). Si no está ahí, no debe usarse con significado propio en otro documento.
2. Todo supuesto de negocio no resuelto va a [Decisiones abiertas](docs/DECISIONES_ABIERTAS.md) con un `DA-###`, nunca enterrado como afirmación en el cuerpo de un documento.
3. Cuando un `DA-` se resuelve, se actualiza su ficha **sin borrar las opciones descartadas**, y se propaga a los `FR-` y `TC-` afectados.
4. Ningún `FR-` puede quedar sin al menos un `TC-` que lo verifique.
5. Los identificadores no se reutilizan. Un requisito eliminado deja su número vacío.

---

## Relación con el proyecto de cierre

El proyecto se ejecuta en cuatro pasos. El Portal se construye durante el Paso 1 y opera durante los Pasos 2 y 3.

| Paso | Trabajo | Estado | Relación con el Portal |
|---|---|---|---|
| **0** — Definir el macro | Alcance, frentes, taxonomía, campos del Inventario, estructura de folders, estándares, criterios de cierre | ✅ Concluido | Es la fuente de la configuración semilla |
| **1** — Detallar el inventario | Convertir procesos y actividades en una lista exhaustiva de documentos por periodo | 🔄 En curso | El Portal lo **recibe** por importación y permite que siga evolucionando |
| **2** — Recuperar y estructurar | Recopilar desde despachos, correos, sistemas, repositorios y proveedores; nombrar y colocar | ⏳ Pendiente | **Uso principal del Portal** |
| **3** — Validar y cerrar | Validar cobertura, legibilidad, organización, trazabilidad y respaldo; documentar excepciones | ⏳ Pendiente | Cola de validación, excepciones, cierre, exportación final |

Consecuencia de diseño: **el Portal debe ser útil antes de que el Paso 1 esté completo.** La taxonomía y el inventario se cargan de forma incremental, área por área, y la recopilación de un área puede arrancar mientras otra sigue definiéndose.

El marco conceptual completo está en `Plan_Macro_Integracion_Expediente_MSS.docx` (entregable del Paso 0). Este Portal lo operacionaliza; no lo reemplaza ni lo contradice.

---

## Decisiones de negocio — todas resueltas

Las doce decisiones que quedaban abiertas fueron resueltas por el Dueño del Proyecto el 17 de agosto de 2026. Viven completas, con su contexto y las opciones descartadas, en [DECISIONES_ABIERTAS.md](docs/DECISIONES_ABIERTAS.md). Las tres que más cambiaron el diseño respecto de la propuesta original:

| ID | Decisión tomada | Efecto |
|---|---|---|
| [`DA-001`](docs/DECISIONES_ABIERTAS.md) | Sin denominador declarado. Las instancias de requisitos no enumerables se marcan manualmente conforme llegan; cada requisito lleva una bandera de "enumeración abierta/cerrada" que congela el denominador al cerrarse | Reemplaza el modelo original de tres bases de cálculo por un mecanismo más simple |
| [`DA-002`](docs/DECISIONES_ABIERTAS.md) | El mismo contenido puede vivir en varias ubicaciones de SharePoint sin forzar una copia "maestra" — se marca como duplicado, no se bloquea | Los caminos de carga y registro ya no exigen elegir una sola copia |
| [`DA-009`](docs/DECISIONES_ABIERTAS.md) | Toda excepción, sin importar su impacto, la resuelve un validador final (el Dueño del Proyecto + una segunda persona) — sin nivel intermedio de Coordinador de Área | Simplifica la matriz de aprobación a un único nivel fijo |

El resto (`DA-003` a `DA-012`) confirmó en su mayoría el comportamiento ya propuesto en los documentos, con precisiones puntuales — por ejemplo, la documentación fundacional del área Corporativo y Legal (acta constitutiva y modificaciones posteriores) no lleva requerimiento de fecha, y el respaldo de SharePoint queda fuera del alcance de la aplicación mientras que el de la base de datos del Portal sí es responsabilidad del desarrollo.

---

## Siguiente paso

Con las doce decisiones resueltas y propagadas a los cinco documentos, el trabajo continúa en dos vías paralelas:

- **Negocio:** avanzar el inventario detallado del Paso 1, área por área, ya sin bloqueos de diseño pendientes.
- **Desarrollo:** convertir los `FR-` del PRD en backlog, estimar, y arrancar por el núcleo — taxonomía, requisitos, instancias y el ciclo de carga con colocación en SharePoint.
