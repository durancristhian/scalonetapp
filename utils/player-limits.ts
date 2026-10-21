export const MAX_PLAYERS_PER_MATCH = 100;
export const MAX_PLAYERS_BATCH = 50;

export function getRemainingPlayerSlots(currentCount: number): number {
  return Math.max(0, MAX_PLAYERS_PER_MATCH - currentCount);
}

export function getPlayerAdditionError(currentCount: number, addedCount: number): string | null {
  if (addedCount < 1) return "Agregá al menos un jugador.";
  if (addedCount > MAX_PLAYERS_BATCH) return `Podés agregar hasta ${MAX_PLAYERS_BATCH} jugadores por carga.`;
  const remaining = getRemainingPlayerSlots(currentCount);
  if (addedCount > remaining) {
    if (!remaining) return `El partido admite hasta ${MAX_PLAYERS_PER_MATCH} jugadores. Eliminá alguno para agregar más.`;
    return `Podés agregar ${remaining} ${remaining === 1 ? "jugador más" : "jugadores más"}. El máximo por partido es ${MAX_PLAYERS_PER_MATCH}.`;
  }
  return null;
}
