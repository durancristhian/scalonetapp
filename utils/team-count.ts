export const TEAMS_PER_MATCH = 2;

export function getTeamCountError(count: number): string | null {
  if (count > TEAMS_PER_MATCH) {
    return "Este partido tiene más de dos equipos. Dejá solo dos para poder guardarlo y exportar la imagen.";
  }
  return count === TEAMS_PER_MATCH ? null : "El partido necesita dos equipos para poder guardarlo y exportar la imagen.";
}
