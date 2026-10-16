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

## Tests

With Node.js 24 and dependencies installed, run `npm test`. The ownership tests execute the actual server actions, validation schema and queries with synthetic authentication and an in-memory database. Browser export tests use Puppeteer's installed browser.

To repeat ownership checks against PostgreSQL, create a dedicated local database named `ownership_test`, apply the existing migrations to that database, and generate Prisma Client. Then run:

```bash
SCALONETA_TEST_DATABASE_URL=postgresql://YOUR_LOCAL_USER@127.0.0.1:5432/ownership_test \
  node --experimental-vm-modules --test tests/player-ownership.test.mjs
```

The integration tests reject non-local hosts and other database names. They create two synthetic owners' matches and players, then remove only their own fixtures. They never load application environment files or use the application's configured database.
