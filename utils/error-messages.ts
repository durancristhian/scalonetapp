export const ERROR_MESSAGES = {
  at_least_one_player_repeated:
    "Ya existe un jugador con alguno de estos nombres en este partido.",
  matches_limit_reached:
    "Se alcanzó el límite máximo de partidos que puedes crear. Elimina alguno para continuar.",
  max_players_per_save: `Solo se permiten hasta ${process.env.NEXT_PUBLIC_MAX_PLAYERS_BATCH} nombres por lote.`,
  not_found: "No encontrado.",
  player_repeated: "Ya existe un jugador con ese nombre en este partido.",
  players_per_match_limit_reached: `Se alcanzó el límite máximo de jugadores que puedes agregar (${process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH}).`,
  required: "Campo requerido.",
  server_error: "Ocurrió un error.",
  submit_feedback_error:
    "Ocurrió un error al enviar su feedback. Por favor, intente nuevamente.",
  too_large: "40 caracteres máximo.",
  unauthorized: "No autorizado.",
};
