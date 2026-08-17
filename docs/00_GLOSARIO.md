# 00 — Glosario y conceptos canónicos

**Portal de Materialidad y Expediente MSS**
Versión 1.0 · 17 de agosto de 2026 · Estado: base de trabajo

---

## Propósito de este documento

Este es el documento léxico del proyecto. Los cinco documentos de desarrollo (PRD, UX/UI, Arquitectura, Modelo de Datos/API, Plan de Pruebas) usan **exactamente** los términos y definiciones de aquí. Si un concepto no está definido en este glosario, no debe aparecer en los demás documentos con un significado propio.

Regla operativa: **la prosa va en español, los identificadores técnicos en inglés.** Cuando un documento hable de la entidad de base de datos o del recurso de API, usa el identificador inglés; cuando hable del concepto de negocio, usa el término español. La tabla de la sección 3 es el puente entre ambos.

---

## 1. Los siete conceptos transversales

Estos siete conceptos son la columna vertebral del producto. Están numerados porque los demás documentos los citan como `Glosario §1.1`, `Glosario §1.3`, etc.

### 1.1 La jerarquía documental

Todo el universo documental del proyecto se organiza en una cadena de siete niveles:

```
Frente
  └── Área / Servicio
        └── Proceso / Subservicio
              └── Actividad / Transacción
                    └── Requisito documental
                          └── Instancia de Evidencia Esperada
                                └── Documento
```

Los primeros cuatro niveles son **taxonomía**: describen cómo está organizado el negocio. Los últimos tres son **control**: describen qué debe recopilarse, cuántas veces, y qué se recibió.

> **Regla de diseño de primer orden:** los cuatro niveles de taxonomía son **datos configurables**, no enumeraciones en código. El inventario detallado (Paso 1 del proyecto) todavía no existe y va a cambiar durante la ejecución. Ningún documento de este conjunto debe proponer un `enum` de áreas, servicios, procesos o actividades.

### 1.2 La distinción central: Requisito ≠ Instancia ≠ Documento

Este es el concepto que más frecuentemente se simplifica mal y el que más impacto tiene en el modelo de datos, en la analítica y en las pruebas. Los tres son entidades distintas.

| | **Requisito** | **Instancia de Evidencia Esperada** | **Documento** |
|---|---|---|---|
| Qué es | La *definición* de lo que debe recopilarse | Cada *ocurrencia* que el requisito exige | El *archivo* que efectivamente existe |
| Ejemplo | "Estado de cuenta bancario mensual, Banorte cuenta 1234, de ene-2020 a dic-2026" | "Estado de cuenta Banorte 1234, marzo 2021" (y otras 83 hermanas) | `2021-03_Tesoreria_EstadoCuenta_Banorte1234.pdf` |
| Cuántos hay | 1 renglón del Inventario Maestro | 84 en el ejemplo | 0, 1 o varios por instancia |
| Dónde vive | Base de datos de la app | Base de datos de la app | SharePoint (el archivo) + registro en la app |
| Qué estatus lleva | Ninguno propio — se **deriva** de sus instancias | Estatus de recopilación y estatus de validación | Ninguno de cobertura; lleva versión y ubicación |
| Papel en la analítica | Unidad de planeación | **Denominador de toda cobertura** | Indicador de volumen (complementario) |

Consecuencias que se repiten en todos los documentos:

- **Un renglón del Inventario Maestro no equivale a un archivo.** Un requisito mensual de siete años son 84 instancias.
- **El avance se mide sobre instancias, no sobre requisitos ni sobre archivos.** Un requisito con 40 de 84 instancias recopiladas está al 47.6 %, no al 0 % ni al 100 %.
- **Un documento puede satisfacer varias instancias**, incluso de requisitos distintos y de frentes distintos. La relación Documento ↔ Instancia es **N:M** y no implica copiar el archivo.
- **Una instancia puede requerir varios documentos.** "Pago a proveedor" puede exigir contrato + factura + autorización + entregable + comprobante. La instancia se considera recopilada cuando su conjunto de documentos está completo según el criterio declarado en el requisito.

### 1.3 Periodicidad y el problema del denominador

El Plan Macro define nueve periodicidades. Se dividen en dos familias según si el sistema puede calcular cuántas instancias esperar.

**Periodicidades enumerables** — el sistema genera las instancias automáticamente a partir del rango de periodo del requisito:

| Periodicidad | Identificador | Instancias generadas |
|---|---|---|
| Mensual | `monthly` | Una por mes del rango |
| Trimestral | `quarterly` | Una por trimestre del rango |
| Anual | `annual` | Una por ejercicio del rango |
| Rango de fechas | `date_range` | Una sola, cubriendo todo el rango |
| Permanente / única vez | `permanent` | Una sola, sin periodo |

**Periodicidades no enumerables** — el sistema **no puede** derivar cuántas instancias esperar:

| Periodicidad | Identificador | Por qué no es enumerable |
|---|---|---|
| Por evento | `per_event` | No hay lista de eventos históricos |
| Por empleado | `per_employee` | Depende de un padrón de empleados que la app no posee |
| Por proveedor | `per_supplier` | Depende de un padrón de proveedores |
| Por proyecto | `per_project` | Depende de un catálogo de proyectos |
| Por transacción | `per_transaction` | Depende de un listado de operaciones (facturas, pagos) |

Para estas, el Portal usa por defecto un mecanismo de **marcado manual con enumeración abierta/cerrada** (`denominator_basis = 'progressive'`), resuelto en [`DA-001`](DECISIONES_ABIERTAS.md):

1. **No se declara ningún número al crear el requisito.** No hace falta saber de antemano "cuántos empleados hubo" ni cargar un padrón para empezar a recopilar.
2. Conforme llegan documentos, cada instancia se agrega y se **marca manualmente** como recopilada — a diferencia del resto del sistema, aquí no se deriva automáticamente de los componentes obligatorios (§1.2), porque no hay un universo predefinido contra el cual comparar.
3. El requisito lleva una bandera de **enumeración** (`enumeration_status`): `open` (abierta) o `closed` (cerrada).
   - Mientras está **abierta**, el requisito queda excluido del % de cobertura del proyecto y se reporta como indicador de volumen: *"14 instancias marcadas, enumeración en progreso"*.
   - Cuando el responsable decide que ya no van a aparecer más periodos y **cierra la enumeración**, el conteo marcado hasta ese momento se congela como el denominador final. A partir de ahí, el requisito participa en el % de cobertura como cualquier otro.
   - Reabrir la enumeración (si aparece un periodo adicional después de cerrada) es una acción explícita y auditable.

Existe una variante para cuando ya se dispone de un padrón real y se quiere generar el universo automáticamente:

| Base de cálculo | Identificador | Cómo funciona | Efecto en la analítica |
|---|---|---|---|
| Marcado manual progresivo | `progressive` | **Predeterminada.** Sin número declarado; instancias marcadas 1/0 conforme llegan; enumeración abierta/cerrada por el responsable | Excluido del % mientras está abierta; al cerrarla, el conteo marcado es el denominador |
| Padrón cargado | `driver_list` | Se carga una lista real de drivers (empleados, proveedores, facturas) y se genera una instancia por renglón | Denominador = renglones del padrón, desde el inicio |

> **Por qué se prefiere el marcado progresivo sobre declarar un número de antemano:** forzar un denominador inventado corrompe el indicador de avance del proyecto entero. Es más honesto reportar "14 instancias marcadas, enumeración en progreso" que fijar de entrada un número que nadie puede sostener. El denominador se determina por lo efectivamente encontrado, no por una estimación al aire.

### 1.4 Los tres caminos de ingesta

La aplicación **no es la única puerta de entrada a SharePoint**. SharePoint es el repositorio oficial y va a recibir archivos por otras vías (carga directa, sincronización de OneDrive, migraciones masivas desde despachos). El modelo debe contemplar tres caminos, los tres de primer nivel:

**Camino A — Carga a través de la aplicación (`app_upload`)**
El usuario sube un archivo contra una instancia concreta. La app resuelve la carpeta destino y el nombre según las plantillas configuradas, coloca el archivo en SharePoint vía Microsoft Graph, y registra los identificadores devueltos. Es el camino recomendado porque garantiza nomenclatura, ubicación y trazabilidad deterministas.

**Camino B — Registro de documento existente (`existing_registration`)**
El archivo ya está en SharePoint. El usuario lo vincula desde la app (mediante selector o pegando la ruta/URL). La app captura los identificadores del ítem y lo asocia a una o varias instancias. **Por defecto no mueve, copia ni renombra el archivo.** La app registra si la ubicación coincide con la ruta canónica y, si no coincide, lo señala como desviación de ubicación sin bloquear el registro.

**Contenido duplicado en ubicaciones distintas ([`DA-002`](DECISIONES_ABIERTAS.md)):** cuando el hash de un archivo coincide con el de un documento ya registrado en otra ruta, el Portal **no obliga a elegir una sola copia maestra**. Ambas — o las N — copias se registran como documentos válidos, cada una con sus propios vínculos a instancias, y quedan marcadas entre sí con **"contenido duplicado — también existe en: [rutas]"**. La consolidación, si alguien decide hacerla, es una acción manual posterior, nunca una condición para registrar.

**Camino C — Reconciliación (`reconciliation`)**
Un proceso programado recorre el sitio de SharePoint y compara su contenido contra el registro de la app. Produce dos colas de trabajo:

- **Archivos huérfanos** — existen en SharePoint pero ningún registro de la app los referencia. Alguien los subió por fuera. Requieren que un humano los vincule a una instancia, los marque como no relevantes, o los escale.
- **Enlaces rotos** — la app tiene un registro que apunta a un ítem que ya no existe, fue movido, o cambió de identidad.

### 1.5 Modelos de estatus

Idénticos a los del Plan Macro. Ambos viven **en la instancia**, nunca en el requisito ni en el documento.

**Estatus de recopilación** (`collection_status`):

```
Pendiente de recopilar  →  En recopilación  →  Recopilado
   pending_collection       in_collection       collected
```

**Estatus de validación** (`validation_status`):

```
Pendiente de validar  →  ┬→ Validado       (validated)
   pending_validation     ├→ Parcial        (partial)
                          └→ No obtenido    (not_obtained)
```

Reglas invariantes que todos los documentos respetan:

1. Una instancia solo entra a `pending_validation` cuando su recopilación es `collected`.
2. `partial` y `not_obtained` **exigen** una Excepción/Riesgo asociada, con causa, impacto y tratamiento acordado. Sin excepción, el estatus no puede fijarse.
3. Un rechazo devuelve la instancia a `in_collection` con `pending_validation`, no la deja en un estado intermedio propio.
4. El estatus de un Requisito, de una Actividad, de un Proceso, de un Área/Servicio y de un Frente es **derivado por rollup** desde las instancias. Nunca se captura a mano.
5. **Cerrado** es un estado del Requisito (y por agregación del Área y del Frente), no de la instancia: un requisito está *cerrado* cuando todas sus instancias están en `validated`, o en `partial`/`not_obtained` con excepción formalmente aprobada.

### 1.6 La frontera aplicación / SharePoint

Es la regla que evita que el sistema se convierta en un gestor documental genérico.

| | **Base de datos de la aplicación** | **SharePoint** |
|---|---|---|
| Contiene | Taxonomía, requisitos, instancias, relaciones, asignaciones, workflow, estatus, metadatos, excepciones, auditoría, agregados analíticos, referencias transaccionales | El archivo oficial en formato nativo, y su historial de versiones nativo |
| No contiene | Bytes de archivos | Datos de control que no existan también en la base de datos |
| Es fuente de verdad de | El universo documental, el avance, quién hizo qué y cuándo | El contenido binario del documento |

La aplicación guarda de cada documento los identificadores suficientes para resolverlo aunque lo muevan o renombren en SharePoint: `site_id`, `drive_id`, `item_id`, `etag`, `ctag`, la ruta relativa, la URL web y un hash del contenido. El `item_id` es el ancla; la ruta es informativa y puede quedar obsoleta.

> **Corolario para todos los documentos:** ninguna sección puede proponer almacenar archivos en la base de datos, ni almacenar el estatus de una instancia únicamente como columna de una lista de SharePoint.

### 1.7 Cobertura frente a volumen

El Plan Macro es explícito: *"El avance debe medirse por cobertura del universo definido y no solamente por volumen de archivos."*

- **Indicadores primarios** (miden el proyecto): % de recopilación, % de validación, % de cobertura por periodo, requisitos cerrados, áreas/servicios cerrados, excepciones abiertas. Todos se calculan sobre **instancias**.
- **Indicadores complementarios** (dimensionan el trabajo): número de archivos recibidos, archivos por tipo, por periodo, por área, volumen de almacenamiento. Todos se calculan sobre **documentos**.

Ningún tablero puede presentar un indicador de volumen como si fuera de avance. Todo indicador primario debe ser **reconciliable**: el usuario debe poder hacer clic y llegar a la lista de instancias que lo componen.

---

## 2. Términos del proyecto

### Términos de negocio

**MSS** — Monterrey Shared Services. La entidad cuya documentación histórica se está resguardando antes de su cierre.

**Proyecto de cierre** — El esfuerzo global de recopilación, validación, organización y resguardo. Ejecutado en cuatro pasos: Paso 0 (definir el macro, ya aprobado), Paso 1 (detallar el inventario), Paso 2 (recuperar y estructurar), Paso 3 (validar y cerrar).

**Plan Macro** — El documento `Plan_Macro_Integracion_Expediente_MSS.docx`, entregable del Paso 0. Es la fuente de la taxonomía, los campos del Inventario Maestro, la estructura de folders, el estándar de nombres, los criterios de cierre y los indicadores. Este portal lo operacionaliza; no lo reemplaza ni lo contradice.

**Portal** — La aplicación web descrita por estos documentos. Capa de control, workflow, metadatos y analítica. No es el repositorio.

**Frente** — Una de las dos grandes divisiones del universo documental. Son dos, y solo dos:
- **Expediente MSS** — documentación de MSS como compañía. Pregunta que debe poder responder: *¿podemos reconstruir y demostrar la operación histórica de MSS?*
- **Materialidad de Servicios** — evidencia de los servicios que MSS prestó a GM y partes relacionadas. Pregunta que debe poder responder: *¿podemos demostrar de forma ordenada la realidad de los servicios y operaciones soportadas por la facturación?*

**Inventario Maestro** — El índice de control central del proyecto. Define qué información debe recopilarse, a qué frente/área/proceso/actividad y periodo corresponde, quién la entrega, su estatus y su ubicación final. En el Portal, el Inventario Maestro **es** el conjunto de Requisitos con sus Instancias; no es una hoja de cálculo separada.

**Materialidad** — La cualidad de una evidencia de demostrar que un servicio se prestó realmente. No basta con contrato, factura y contabilidad: se requieren entregables, comunicaciones, papeles de trabajo e información del personal participante.

**Archivo fuente / formato nativo** — El archivo en su formato original cuando ese formato aporta información que se perdería al convertir: Excel con fórmulas, CSV, exportaciones de sistemas, correos en MSG/EML, PDFs originales. Conservarlo es un requisito del proyecto, no una preferencia.

**Excepción / Riesgo documental** — Registro formal de que un elemento del inventario solo pudo recuperarse parcialmente o no pudo obtenerse. Debe explicar qué falta, por qué, cuál es el impacto y qué tratamiento se acordó. **No es una condición normal del proyecto**: cada excepción es una desviación del principio rector y requiere cierre formal.

**Cierre** — Ver §1.5, regla 5. Existe a nivel de requisito, de área/servicio y de proyecto, con criterios distintos en cada nivel.

### Términos del sistema

**Requisito** (`requirement`) — Ver §1.2.

**Instancia de Evidencia Esperada**, abreviada **Instancia** (`evidence_instance`) — Ver §1.2. Nunca abreviar como "evidencia" a secas ni como "renglón del inventario".

**Documento** (`document`) — El registro en la app que representa un archivo único en SharePoint. Un documento tiene una identidad, una ubicación, versiones, y N vínculos a instancias.

**Versión de Documento** (`document_version`) — Una revisión concreta del archivo. La versión 2 sustituye a la 1 sin borrarla ni romper los vínculos existentes.

**Vínculo Documento–Instancia** (`document_instance_link`) — La relación N:M. Es donde vive el papel que juega ese documento para esa instancia (p. ej. "factura", "comprobante de pago", "entregable").

**Referencia Relacionada** (`related_reference`) — Un apuntador tipado a una entidad externa: factura, pago, proveedor, empleado, cliente, proyecto u otro. Sirve para la trazabilidad transaccional que el Plan Macro exige en Materialidad.

**Asignación** (`assignment`) — La designación de un responsable de entrega sobre un requisito o sobre un conjunto de instancias.

**Validación** (`validation`) — El acto registrado de revisar una instancia y dictaminar su estatus de validación, con checklist, comentarios y resultado.

**Plantilla de Ruta** (`path_template`) — Regla configurable que traduce metadatos en una ruta de carpeta de SharePoint. Ver §5.

**Regla de Nombrado** (`naming_rule`) — Regla configurable que traduce metadatos en un nombre de archivo propuesto. Ver §5.

**Archivo huérfano** (`orphan_file`) — Ver §1.4, camino C.

**Enlace roto** (`broken_link`) — Ver §1.4, camino C.

**Rollup** — El cálculo ascendente de estatus y cobertura desde las instancias hacia requisito, actividad, proceso, área/servicio y frente.

**Padrón / lista de drivers** (`driver_list`) — Ver §1.3.

---

## 3. Puente español ↔ identificador técnico

Cuando un documento se refiera a la entidad, tabla, campo o recurso de API, usa la columna derecha. Cuando se refiera al concepto, usa la izquierda.

| Término de negocio (ES) | Identificador técnico (EN) |
|---|---|
| Proyecto | `project` |
| Frente | `front` |
| Área / Servicio | `area` |
| Proceso / Subservicio | `process` |
| Actividad / Transacción | `activity` |
| Requisito | `requirement` |
| Instancia de Evidencia Esperada | `evidence_instance` |
| Documento | `document` |
| Versión de Documento | `document_version` |
| Vínculo Documento–Instancia | `document_instance_link` |
| Ubicación en SharePoint | `sharepoint_location` |
| Referencia Relacionada | `related_reference` |
| Usuario | `user` |
| Rol | `role` |
| Asignación | `assignment` |
| Validación | `validation` |
| Excepción / Riesgo | `exception` |
| Historial de Estatus | `status_history` |
| Evento de Auditoría | `audit_event` |
| Notificación | `notification` |
| Plantilla de Ruta | `path_template` |
| Regla de Nombrado | `naming_rule` |
| Tipo de Información | `information_type` |
| Periodicidad | `periodicity` |
| Base de cálculo | `denominator_basis` |
| Padrón / lista de drivers | `driver_list` |
| Estatus de recopilación | `collection_status` |
| Estatus de validación | `validation_status` |
| Archivo huérfano | `orphan_file` |
| Trabajo de reconciliación | `reconciliation_run` |
| Clasificación de sensibilidad | `sensitivity_class` |

---

## 4. Catálogos semilla

> **Todos los catálogos de esta sección son SEMILLA CONFIGURABLE.** Se cargan como datos iniciales y el administrador puede agregar, renombrar, reordenar o desactivar renglones sin tocar código. Ningún documento debe tratarlos como enumeraciones cerradas, con la única excepción de los frentes (§4.1), las periodicidades (§1.3) y los estatus (§1.5), que sí son cerrados.

### 4.1 Frentes (cerrado — exactamente dos)

| Código | Nombre | Carpeta raíz |
|---|---|---|
| `EXPEDIENTE_MSS` | Expediente MSS | `01_Expediente_MSS` |
| `MATERIALIDAD` | Materialidad de Servicios | `02_Materialidad_Servicios` |

### 4.2 Áreas del Frente 1 — Expediente MSS (semilla, 11)

| # | Área | Carpeta | Sensibilidad predeterminada |
|---|---|---|---|
| 01 | Corporativo y Legal | `01_Corporativo_y_Legal` | Restringida |
| 02 | Contabilidad y EEFF | `02_Contabilidad_y_EEFF` | Interna |
| 03 | Fiscal y Cumplimiento | `03_Fiscal_y_Cumplimiento` | Restringida |
| 04 | Tesorería y Bancos | `04_Tesoreria_y_Bancos` | Restringida |
| 05 | Proveedores y Pagos | `05_Proveedores_y_Pagos` | Interna |
| 06 | Nómina y Laboral | `06_Nomina_y_Laboral` | Confidencial |
| 07 | Facturación y Cobranza | `07_Facturacion_y_Cobranza` | Interna |
| 08 | Seguros y Activos | `08_Seguros_y_Activos` | Interna |
| 09 | Sistemas y Respaldos | `09_Sistemas_y_Respaldos` | Restringida |
| 10 | Estudios y Asesores | `10_Estudios_y_Asesores` | Restringida |
| 11 | Cierre de MSS | `11_Cierre_de_MSS` | Restringida |

### 4.3 Servicios del Frente 2 — Materialidad de Servicios (semilla, 9)

| # | Servicio | Carpeta | Subservicios semilla |
|---|---|---|---|
| 01 | Branding / Publicidad | `01_Branding_Publicidad` | Website y portal; redes sociales; creación interna de contenido; servicios de diseño |
| 02 | Asesoría Legal Laboral | `02_Asesoria_Legal_Laboral` | Consultoría y defensa laboral; asesoría/documentación corporativa; propiedad intelectual |
| 03 | Atracción de Talento | `03_Atraccion_de_Talento` | Atracción; selección y reclutamiento; cálculo de percepciones; medios sociales; seguros; cartas; onboarding y trainee |
| 04 | Soporte Técnico IT | `04_Soporte_Tecnico_IT` | Sitio web; soporte a usuarios; dominios; correo; repositorios; computadoras; aplicaciones internas |
| 05 | Knowledge Management | `05_Knowledge_Management` | Casos de éxito/experiencia; cartas de recomendación; administración de KEEP |
| 06 | Recursos Humanos | `06_Recursos_Humanos` | Evaluaciones y PID; capacitación; plan de carrera; vacaciones; comunicación interna |
| 07 | Asignación y Logística | `07_Asignacion_y_Logistica` | Coordinación de viajes; tarifas aéreas; visas; planeación de recursos |
| 08 | Backoffice | `08_Backoffice` | Fondos/pagos; fees; facturación clientes; SGMM; fiscal; tesorería; comisiones; viáticos; nómina |
| 09 | Estandarización e Innovación | `09_Estandarizacion_e_Innovacion` | Estandarización operativa; innovación operativa |

### 4.4 Tipos de información (semilla)

`contrato` · `factura` · `comprobante_pago` · `estado_cuenta` · `declaracion` · `acuse` · `poliza_contable` · `poliza_seguro` · `estado_financiero` · `papel_de_trabajo` · `base_calculo_excel` · `reporte_sistema` · `exportacion_datos` · `correo` · `entregable` · `presentacion` · `acta` · `poder` · `expediente_laboral` · `recibo_nomina` · `inventario` · `backup` · `evaluacion` · `comunicacion` · `otro`

Cada tipo declara: extensiones esperadas, si exige conservación de formato nativo, y su clasificación de sensibilidad predeterminada.

### 4.5 Clasificaciones de sensibilidad (semilla, 4)

| Clase | Identificador | Aplica típicamente a | Efecto |
|---|---|---|---|
| Pública | `public` | Material de marca ya publicado | Sin restricción adicional |
| Interna | `internal` | Mayor parte del expediente | Visible a todo usuario autenticado del proyecto |
| Restringida | `restricted` | Fiscal, bancario, legal, sistemas | Solo roles con permiso explícito sobre esa área |
| Confidencial | `confidential` | Nómina, expedientes laborales, datos personales | Lista de acceso nominal; metadatos visibles, contenido no |

> El detalle de cómo se aplica cada clase (a nivel Portal, a nivel SharePoint, o ambos) es decisión abierta `DA-005`.

### 4.6 Roles (semilla, 5)

| Rol | Identificador | Alcance |
|---|---|---|
| Administrador / Dueño del Proyecto | `admin` | Configura taxonomía, inventario, usuarios, plantillas de ruta y nombrado, integración con SharePoint, parámetros del proyecto |
| Coordinador de Área | `area_coordinator` | Sobre sus áreas/servicios asignados: crea y edita requisitos, asigna responsables, da seguimiento, levanta excepciones. Sin acceso a configuración global |
| Responsable / Colaborador | `contributor` | Ve sus asignaciones, carga documentos, registra documentos existentes, responde a rechazos |
| Validador / Revisor | `validator` | Revisa, valida, rechaza, marca Parcial o No obtenido, levanta excepciones, cierra requisitos |
| Consulta / Dirección | `viewer` | Solo lectura de tableros, avance y documentación permitida por sensibilidad |

**Por qué existe Coordinador de Área** (no está en el prompt original): el proyecto abarca 11 áreas y 9 servicios con equipos distintos. Concentrar toda la asignación y el mantenimiento del inventario en un `admin` único crea un cuello de botella operativo desde el primer mes. El Coordinador puede operar su área sin poder alterar la configuración global del proyecto.

Los roles no son excluyentes: un usuario puede ser `contributor` en un área y `validator` en otra. Los permisos se resuelven como la unión de sus asignaciones de rol por ámbito.

### 4.7 Papeles del documento dentro de una instancia (semilla)

`principal` · `soporte` · `anexo` · `comunicacion` · `base_de_calculo` · `comprobante` · `entregable` · `autorizacion`

---

## 5. Estructura del repositorio, rutas y nombres

### 5.1 Estructura raíz (del Plan Macro)

```
MSS_Cierre_2026/
├── 00_Control_Proyecto/
│   ├── 01_Inventario_Maestro/
│   ├── 02_Criterios_y_Estandares/
│   └── 03_Validaciones_y_Cierre/
├── 01_Expediente_MSS/
│   ├── 01_Corporativo_y_Legal/
│   ├── 02_Contabilidad_y_EEFF/
│   ├── 03_Fiscal_y_Cumplimiento/
│   ├── 04_Tesoreria_y_Bancos/
│   ├── 05_Proveedores_y_Pagos/
│   ├── 06_Nomina_y_Laboral/
│   ├── 07_Facturacion_y_Cobranza/
│   ├── 08_Seguros_y_Activos/
│   ├── 09_Sistemas_y_Respaldos/
│   ├── 10_Estudios_y_Asesores/
│   └── 11_Cierre_de_MSS/
└── 02_Materialidad_Servicios/
    ├── 01_Branding_Publicidad/
    ├── 02_Asesoria_Legal_Laboral/
    ├── 03_Atraccion_de_Talento/
    ├── 04_Soporte_Tecnico_IT/
    ├── 05_Knowledge_Management/
    ├── 06_Recursos_Humanos/
    ├── 07_Asignacion_y_Logistica/
    ├── 08_Backoffice/
    └── 09_Estandarizacion_e_Innovacion/
```

Las carpetas se crean **bajo demanda**, cuando el inventario las requiere. No se pre-crea el árbol completo vacío.

### 5.2 Plantillas de ruta

Una Plantilla de Ruta es una cadena con tokens que se resuelve contra los metadatos de la instancia. Ejemplo para Tesorería:

```
{frente}/{area}/{referencia:banco_cuenta}/{aaaa}/{mm}/{proceso}
```

Tokens disponibles: `{frente}` `{area}` `{proceso}` `{actividad}` `{aaaa}` `{mm}` `{trimestre}` `{tipo_documento}` `{referencia:<tipo>}` `{permanente}`.

Reglas:
- Cada nodo de la taxonomía puede declarar su propia plantilla; si no lo hace, hereda la del padre.
- Los tokens sin valor se omiten junto con su separador, no dejan carpetas vacías ni `//`.
- Los documentos permanentes o de vigencia amplia van a `00_Permanente` en lugar de `{aaaa}/{mm}`.
- La ruta resuelta se normaliza: sin acentos, sin caracteres inválidos de SharePoint (`" * : < > ? / \ |`), espacios a guion bajo.

### 5.3 Estándar de nombres

Convención del Plan Macro:

```
AAAA-MM_[Área-o-Servicio]_[Proceso-o-Actividad]_[TipoDocumento]_[Contraparte-o-Referencia]_[vXX].ext
```

Ejemplos:
- `2024-07_Tesoreria_PagoProveedor_BrandAndPeople_Comprobante.pdf`
- `2025-02_AtraccionTalento_Seleccion_PipelineCandidatos.xlsx`
- `2024-11_LogisticaViajes_ReporteAgencia_Vuelos.xlsx`

Reglas:
- El Portal **propone** el nombre; el usuario puede ajustarlo dentro de los límites de la regla.
- El **nombre original del archivo se conserva siempre como metadato** (`original_filename`), sin excepción.
- Para documentos permanentes se omite el mes y se usa la fecha efectiva o de firma.
- El sufijo `_vXX` solo aparece a partir de la versión 2.
- Si la regla no puede resolverse por metadatos faltantes, el Portal lo señala y permite guardar con nombre manual, dejando registro de la desviación.

> Si el Portal **impone** o solo **propone** el estándar es decisión abierta `DA-008`.

---

## 6. Esquema de identificadores para trazabilidad cruzada

| Prefijo | Significa | Documento que los asigna |
|---|---|---|
| `FR-###` | Requisito funcional | `01_PRD.md` |
| `NFR-###` | Requisito no funcional | `01_PRD.md` |
| `US-###` | Historia de usuario | `01_PRD.md` |
| `SC-###` | Pantalla | `02_UX_UI_FLUJOS.md` |
| `UF-###` | Flujo de usuario | `02_UX_UI_FLUJOS.md` |
| `TC-###` | Caso de prueba | `05_PLAN_PRUEBAS_UAT.md` |
| `DA-###` | Decisión abierta | `DECISIONES_ABIERTAS.md` |

Rangos de `FR-` por módulo:

| Rango | Módulo |
|---|---|
| `FR-0xx` | Fundamentos, proyecto y taxonomía |
| `FR-1xx` | Inventario Maestro y requisitos |
| `FR-2xx` | Instancias de evidencia y periodos |
| `FR-3xx` | Recopilación, asignación y carga |
| `FR-4xx` | Integración con SharePoint |
| `FR-5xx` | Validación y excepciones |
| `FR-6xx` | Búsqueda y trazabilidad |
| `FR-7xx` | Analítica y tableros |
| `FR-8xx` | Notificaciones |
| `FR-9xx` | Administración, auditoría y seguridad |

Cadena de trazabilidad que los documentos deben mantener:

```
Objetivo de negocio → FR-### → UF-###/SC-### → Componente técnico → Entidad/Endpoint → TC-###
```

La matriz completa vive al final de `05_PLAN_PRUEBAS_UAT.md`.

---

## 7. Términos que NO deben usarse

Para evitar sinónimos sueltos que rompan la consistencia entre documentos:

| No usar | Usar en su lugar | Por qué |
|---|---|---|
| "renglón del inventario" como sinónimo de instancia | Requisito (si es la definición) o Instancia (si es la ocurrencia) | Confunde exactamente la distinción de §1.2 |
| "evidencia" a secas | Instancia de Evidencia Esperada, o Documento | Ambiguo entre los dos |
| "expediente" para referirse a una carpeta cualquiera | Carpeta, o Expediente MSS (el frente) | "Expediente" es el nombre de un frente |
| "subir a la app" | Cargar a SharePoint a través del Portal | Los archivos nunca se quedan en el Portal |
| "aprobar" un documento | Validar una instancia | La validación es de instancias, no de archivos |
| "% de avance" sin calificar | % de recopilación, % de validación, o % de cobertura | Tres cosas distintas |
| "carpeta del proyecto" para la app | Repositorio (SharePoint) o Portal (la app) | Separa repositorio de capa de control |

---

## Referencias

- `Plan_Macro_Integracion_Expediente_MSS.docx` — Paso 0 del proyecto, fuente de la taxonomía y los criterios.
- [DECISIONES_ABIERTAS.md](DECISIONES_ABIERTAS.md) — decisiones de negocio pendientes.
- [01_PRD.md](01_PRD.md) — requisitos funcionales.
