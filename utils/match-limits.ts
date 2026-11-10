export function getMaxMatchesPerUser(): number {
  return Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER ?? 100);
}
