/**
 * FR-213: "El estatus de recopilación de una instancia debe derivarse de los
 * documentos vinculados y de la composición declarada en FR-104: recopilada
 * solo cuando todos los documentos obligatorios están presentes."
 *
 * Función pura — sin acceso a base de datos — para poder probarla aislada y
 * para que el caller (upload-service) decida qué hacer con el resultado
 * (actualizar evidence_instance, escribir status_history, etc.).
 */

export type RequirementComponentLike = {
  role: string;
  isMandatory: boolean;
};

/** Un vínculo activo document_instance_link, solo el campo que importa aquí. */
export type ActiveLinkLike = {
  role: string;
};

export type CollectionStatus = "pending_collection" | "in_collection" | "collected";

/**
 * Si el requisito no declaró ningún componente (`requirement_component`), un
 * solo documento vinculado ya cuenta como recopilado — no hay composición que
 * exigir. Si declaró componentes, se exige que TODOS los marcados
 * `is_mandatory` tengan al menos un vínculo activo con ese `role`.
 */
export function deriveCollectionStatus(
  components: RequirementComponentLike[],
  activeLinks: ActiveLinkLike[],
  currentStatus: CollectionStatus
): CollectionStatus {
  if (components.length === 0) {
    return activeLinks.length > 0 ? "collected" : currentStatus;
  }

  const mandatoryRoles = components.filter((c) => c.isMandatory).map((c) => c.role);
  const linkedRoles = new Set(activeLinks.map((l) => l.role));
  const allMandatoryPresent = mandatoryRoles.every((role) => linkedRoles.has(role));

  if (allMandatoryPresent && mandatoryRoles.length > 0) return "collected";
  if (activeLinks.length > 0) return "in_collection";
  return currentStatus === "collected" ? "in_collection" : currentStatus;
}
