// Local, opt-in fixtures. Never changes an existing match or another account.
import { PrismaClient } from '@prisma/client';
import { mkdir, writeFile } from 'node:fs/promises';
import { MAX_PLAYERS_PER_MATCH as max, MAX_PLAYERS_PER_TEAM } from '../utils/player-limits.ts';

for (const key of ['POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING']) {
  const url = new URL(process.env[key] ?? '');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Fixtures require a local database.');
}
if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') || !process.env.CLERK_SECRET_KEY?.startsWith('sk_test_')) throw new Error('Fixtures require Clerk test mode.');
const userId = process.argv.find(arg => arg.startsWith('--user-id='))?.slice(10);
if (!userId) throw new Error('Pass --user-id=<local Clerk user ID>.');
const write = process.argv.includes('--write');
const cases = [
  { key: 'one-each', name: '[QA] Uno contra uno', sizes: [1, 1] },
  { key: 'long-names', name: '[QA] La final de nombres extraordinarios', sizes: [8, 8], long: true, photo: true },
  { key: 'maximum', name: `[QA] Máximo ${max} jugadores`, sizes: [Math.ceil(max / 2), Math.floor(max / 2)] },
  { key: 'unbalanced', name: `[QA] Desbalanceados 1 y ${MAX_PLAYERS_PER_TEAM}`, sizes: [1, MAX_PLAYERS_PER_TEAM] },
  { key: 'near-limit', name: `[QA] Carga masiva con ${max-2} jugadores`, sizes: [MAX_PLAYERS_PER_TEAM-1, MAX_PLAYERS_PER_TEAM-1] },
  { key: 'oversized-team', name: `[QA] Equipo inválido con ${MAX_PLAYERS_PER_TEAM+1}`, sizes: [MAX_PLAYERS_PER_TEAM+1, 1] },
  { key: 'oversized-match', name: `[QA] Partido inválido con ${max+1}`, sizes: [MAX_PLAYERS_PER_TEAM+1, MAX_PLAYERS_PER_TEAM] },
  { key: 'roles', name: '[QA] Cambios de capitán y arquero', sizes: [3, 3] },
  { key: 'legacy-three', name: '[QA] Antiguo partido con tres equipos', sizes: [2, 2, 2] },
  { key: 'empty-team', name: '[QA] Equipo vacío', sizes: [2, 0] },
  { key: 'unassigned', name: '[QA] Jugador sin equipo', sizes: [1, 1], unassigned: 1 },
];
const portrait = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><path fill="#78a9ca" d="M0 0h96v96H0z"/><circle fill="#eccba5" cx="48" cy="43" r="25"/><path fill="#24486b" d="M12 96q0-35 36-35t36 35"/><circle cx="39" cy="40" r="3"/><circle cx="57" cy="40" r="3"/><path d="M39 53q9 8 18 0" fill="none" stroke="#392d26" stroke-width="3"/></svg>');
const prisma = new PrismaClient();
const manifest = [];
try {
  for (const fixture of cases) {
    let match = await prisma.match.findFirst({ where: { userId, name: fixture.name }, include: { players: true } });
    if (!match && write) {
      match = await prisma.$transaction(async db => {
        const created = await db.match.create({ data: { userId, name: fixture.name } });
        const count = fixture.sizes.reduce((a, b) => a + b, 0) + (fixture.unassigned ?? 0);
        const players = [];
        for (let i = 0; i < count; i++) {
          const name = fixture.long && i % 3 === 0 ? `Lionel Andrés del Potrero Inolvidable ${i}` : `Jugador ${String(i + 1).padStart(3, '0')}`;
          players.push(await db.player.create({ data: { matchId: created.id, name, level: i % 10 + 1, position: i === 0 || i === fixture.sizes[0] ? 'goa' : 'mid', avatar: fixture.photo && i === 1 ? portrait : '' } }));
        }
        let offset = 0;
        const teams = fixture.sizes.map((size, i) => {
          const team = { id: `${fixture.key}-${i}`, name: fixture.long ? (i ? 'La banda de los nombres interminables' : 'Los campeones legendarios del potrero') : `Equipo ${i + 1}`, players: players.slice(offset, offset + size).map(p => p.id) };
          offset += size;
          return team;
        });
        return db.match.update({ where: { id: created.id }, data: { teams: JSON.stringify(teams) }, include: { players: true } });
      });
    }
    const teams = match ? JSON.parse(match.teams) : [];
    const roles = Object.fromEntries(teams.map(team => [team.id, { playerIds: [...team.players].sort((a,b) => a-b), assignments: { captain: team.players[0] ?? null, goalkeeper: team.players.at(-1) ?? null } }]));
    manifest.push({ key: fixture.key, name: fixture.name, matchId: match?.id ?? null, playerCount: fixture.sizes.reduce((a,b) => a+b, 0) + (fixture.unassigned ?? 0), sizes: fixture.sizes, roles });
  }
  await mkdir('.local', { recursive: true });
  await writeFile('.local/export-fixtures.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ write, fixtures: manifest.map(({ key, matchId, sizes }) => ({ key, matchId, sizes })) }, null, 2));
} finally { await prisma.$disconnect(); }
