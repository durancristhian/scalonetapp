# scalonetapp

## Run locally

Requires Node.js 24, a PostgreSQL database, and a [Clerk](https://clerk.com) development application.

```bash
nvm install
nvm use
npm ci
cp -n .env.template .env.local
```

In `.env.local`, set:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from Clerk Development.
- `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` to your development database URL.
- Optionally, `TELEGRAM_BOTID` and `TELEGRAM_CHATID` to enable feedback.

Keep the other template defaults, then initialize the database and start the app:

```bash
node --env-file=.env.local node_modules/prisma/build/index.js migrate deploy
node --env-file=.env.local node_modules/prisma/build/index.js generate
npm run dev
```

Open [localhost:3000](http://localhost:3000). Keep this port for local image exports.
Environment files are ignored by Git; use development credentials only.

## Match consistency regression checks

See [the reproduction and verification guide](docs/match-consistency-verification.md)
for manual scenarios, expected results, and the historical cleanup's scope.
`npm run test:consistency` covers safe mutations and export snapshot checks;
`npm run test:consistency:db` covers stale saves, duplicate names, and account limits.

Run `npm run test:duplicate` for action and dialog regressions, including the
production Server Components error transport. The tests use synthetic data.

The PostgreSQL integration suite also checks real rollback and concurrent copies.
Initialize `prisma/schema.prisma` in a dedicated local database named
`scalonet_duplication_test`, then run:

```bash
DUPLICATION_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/scalonet_duplication_test npm run test:duplicate:db
```

The integration suite rejects remote databases. GitHub Actions runs both suites
against its own PostgreSQL service; it needs no application credentials.

`npm run test:player-teams:state` checks the refreshed builder and saved state.
With the same dedicated local database, `npm run test:player-teams:db` checks
atomic player deletion, concurrent team saves, and the stale-reference migration.
CI applies the full migration history to a fresh database before these checks.

Migration `20261021220000_remove_stale_team_players` removes saved team IDs that
do not belong to that match. It preserves valid assignments, team order and
metadata, player records, and historical match timestamps. Already-correct rows
are not rewritten. Unparseable JSON and unknown team shapes are left intact.
