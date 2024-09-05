import { MAX_PLAYERS_BATCH } from "@/utils/constants";

export const ERROR_MESSAGES = {
  not_found: "No encontrado",
  unauthorized: "No autorizado",
  server_error: "Ocurrió un error",
};

export const VALIDATION_MESSAGES = {
  at_least_one_player_repeated:
    "Ya existe al menos un jugador con ese nombre en este partido",
  max_players_per_save: `Solo se permiten hasta ${MAX_PLAYERS_BATCH} nombres por lote`,
  player_repeated: "Ya existe un jugador con ese nombre en este partido",
  required: "Campo requerido",
  too_large: "40 caracteres máximo",
};
