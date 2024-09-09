import { MAX_PLAYERS_BATCH, MAX_PLAYERS_PER_MATCH } from "@/utils/constants";

export const ERROR_MESSAGES = {
  matches_limit_reached:
    "Se alcanzó el límite máximo de partidos que puedes crear. Elimina alguno para continuar.",
  not_found: "No encontrado.",
  players_per_match_limit_reached: `Se alcanzó el límite máximo de jugadores que puedes agregar (${MAX_PLAYERS_PER_MATCH}).`,
  server_error: "Ocurrió un error.",
  unauthorized: "No autorizado.",
};

export const VALIDATION_MESSAGES = {
  at_least_one_player_repeated:
    "Ya existe al menos un jugador con ese nombre en este partido.",
  max_players_per_save: `Solo se permiten hasta ${MAX_PLAYERS_BATCH} nombres por lote.`,
  player_repeated: "Ya existe un jugador con ese nombre en este partido.",
  required: "Campo requerido.",
  too_large: "40 caracteres máximo.",
};
