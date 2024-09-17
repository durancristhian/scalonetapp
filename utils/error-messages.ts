export const ERROR_MESSAGES = {
  /* feedback */
  feedback_submit_error:
    "Ocurrió un error al enviar su feedback. Por favor, intente nuevamente.",

  /* general */
  export_failed: "Ocurrió un error al exportar la imágen.",
  not_found: "No encontrado.",
  required: "Campo requerido.",
  server_error: "Ocurrió un error.",
  too_large: "40 caracteres máximo.",
  unauthorized: "No autorizado.",

  /* match */
  match_add_error:
    "Ocurrió un error al crear el partido. Por favor, intente nuevamente.",
  match_delete_error:
    "Ocurrió un error al eliminar el partido. Por favor, intente nuevamente.",
  match_edit_error:
    "Ocurrió un error al editar el partido. Por favor, intente nuevamente.",
  match_limit_reached:
    "Se alcanzó el límite máximo de partidos que puedes crear. Elimina alguno para continuar.",
  match_max_players_per_batch: `Solo se permiten hasta ${process.env.NEXT_PUBLIC_MAX_PLAYERS_BATCH} nombres por lote.`,
  match_name_repeated: "Ya existe un partido con ese nombre.",
  match_player_repeated: "Ya existe un jugador con ese nombre en este partido.",
  match_players_per_match_limit_reached: `Se alcanzó el límite máximo de jugadores que puedes agregar (${process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH}).`,
  match_players_repeated:
    "Ya existe un jugador con alguno de estos nombres en este partido.",

  /* player */
  player_add_error:
    "Ocurrió un error al crear el jugador. Por favor, intente nuevamente.",
  player_delete_error:
    "Ocurrió un error al eliminar el jugador. Por favor, intente nuevamente.",
  player_edit_error:
    "Ocurrió un error al editar el jugador. Por favor, intente nuevamente.",
  player_multiple_add_error:
    "Ocurrió un error al crear los jugadores. Por favor, intente nuevamente.",
};
