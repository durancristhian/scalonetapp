export const VALIDATION_MESSAGES = {
  at_least_one_player_repeated:
    "Ya existe al menos un jugador con ese nombre en este partido.",
  max_players_per_save: `Solo se permiten hasta ${process.env.MAX_PLAYERS_BATCH} nombres por lote.`,
  player_repeated: "Ya existe un jugador con ese nombre en este partido.",
  required: "Campo requerido.",
  too_large: "40 caracteres máximo.",
};
