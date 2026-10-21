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

## Duplication regression checks

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
