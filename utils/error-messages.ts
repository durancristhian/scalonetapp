export const ERROR_MESSAGES = {
  feedback_submit_error:
    "Ocurrió un error al enviar tu feedback. Por favor, intentá nuevamente.",

  export_failed: "Ocurrió un error al exportar la imagen.",
  not_found: "No encontrado.",
  required: "Campo requerido.",
  server_error: "Ocurrió un error.",
  unauthorized: "No autorizado.",

  match_add_error:
    "Ocurrió un error al crear el partido. Por favor, intentá nuevamente.",
  match_delete_error:
    "Ocurrió un error al eliminar el partido. Por favor, intentá nuevamente.",
  match_duplicate_error:
    "Ocurrió un error al duplicar el partido. Por favor, intentá nuevamente.",
  match_duplicate_player_limit:
    "Este partido supera el máximo de 100 jugadores. Eliminá los que sobran antes de duplicarlo.",
  match_teams_changed:
    "El partido cambió en otra pestaña. Actualizá la página antes de guardar.",
  match_export_changed:
    "El partido cambió. Actualizá la página antes de exportar.",
  match_teams_invalid:
    "La información de los equipos no es válida. Volvé a armar los equipos.",
  match_edit_error:
    "Ocurrió un error al editar el partido. Por favor, intentá nuevamente.",
  match_limit_reached:
    "Se alcanzó el límite máximo de partidos que podés crear. Eliminá alguno para continuar.",
  match_name_repeated: "Ya existe un partido con ese nombre.",
  match_player_repeated: "Ya existe un jugador con ese nombre en este partido.",

  player_add_error:
    "Ocurrió un error al crear el jugador. Por favor, intentá nuevamente.",
  player_delete_error:
    "Ocurrió un error al eliminar el jugador. Por favor, intentá nuevamente.",
  player_edit_error:
    "Ocurrió un error al editar el jugador. Por favor, intentá nuevamente.",
  player_multiple_add_error:
    "Ocurrió un error al crear los jugadores. Por favor, intentá nuevamente.",
};

export const getTooLargeMessage = (max: number): string =>
  `${max} caracteres máximo.`;

const LISTED_REPEATED_NAMES = 5;

export function getRepeatedPlayersMessage(names: readonly string[]): string {
  if (names.length === 1)
    return `El nombre "${names[0]}" ya existe en este partido o se repite en la lista.`;
  const listed = names
    .slice(0, LISTED_REPEATED_NAMES)
    .map((name) => `"${name}"`)
    .join(", ");
  const rest = names.length - LISTED_REPEATED_NAMES;
  return `Estos nombres ya existen en este partido o se repiten en la lista: ${listed}${rest > 0 ? ` y ${rest} más` : ""}.`;
}
