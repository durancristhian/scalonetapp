# scalonetapp

## How to run this project locally

```bash
# Install/use Node 20 from .nvmrc and install the locked dependencies
nvm install
nvm use
npm ci
```

Complete the environment and database setup below before running `npm run dev`.

### Environment

For a fresh checkout, create `.env.local` from `.env.template` without
overwriting an existing file:

```bash
cp -n .env.template .env.local
chmod 600 .env.local
```

Use `.env.local` for development settings. It is ignored by Git. Set the Clerk
development keys (`pk_test_` and `sk_test_`), the `NEXT_PUBLIC_*` defaults from
`.env.template`, and both database URLs: `POSTGRES_PRISMA_URL` and
`POSTGRES_URL_NON_POOLING`. Keep Clerk and database credentials development-only.

### PostgreSQL

The macOS setup uses PostgreSQL 17 on `127.0.0.1:5433`, database
`scalonetapp_dev`, with its data in the ignored `.local/postgres` directory.
Run these initialization commands only for a fresh checkout with no existing
`.local/postgres` directory. `initdb` prompts for a new local database password:

```bash
brew install postgresql@17
mkdir -p .local
"$(brew --prefix postgresql@17)/bin/initdb" -D "$PWD/.local/postgres" -U scalonetapp --auth=scram-sha-256 --pwprompt --locale=en_US.UTF-8 -E UTF8
cat >> .local/postgres/postgresql.conf <<'EOF'
listen_addresses = '127.0.0.1'
port = 5433
unix_socket_directories = ''
EOF
```

Start the database from the repo root. Use this command again after restarting
your computer; it does not need a system-wide background service:

```bash
"$(brew --prefix postgresql@17)/bin/pg_ctl" -D "$PWD/.local/postgres" -l "$PWD/.local/postgres.log" start
```

For a fresh cluster, create the database using the password chosen above:

```bash
"$(brew --prefix postgresql@17)/bin/createdb" -h 127.0.0.1 -p 5433 -U scalonetapp --password scalonetapp_dev
```

Set both `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` in `.env.local`
to the following URL, replacing `<URL_ENCODED_PASSWORD>` with your password,
URL-encoded if it contains special characters:

```text
postgresql://scalonetapp:<URL_ENCODED_PASSWORD>@127.0.0.1:5433/scalonetapp_dev?schema=public
```

Other operating systems can use their own PostgreSQL installation with the same
database schema and development-only connection variables. Each concurrent
checkout needs its own available database and app ports. Local image exports
currently expect the app on port 3000.

Apply checked-in migrations to the configured development database and generate
the Prisma client with Node 20. Prisma's CLI needs `.env.local` loaded explicitly:

```bash
node --env-file=.env.local node_modules/prisma/build/index.js migrate deploy
node --env-file=.env.local node_modules/prisma/build/index.js generate
```

To stop the local database:

```bash
"$(brew --prefix postgresql@17)/bin/pg_ctl" -D "$PWD/.local/postgres" stop
```

### Run and sign in

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Google sign-in uses the Clerk development instance. Agents can also sign in
through the existing modal using the dedicated Development test user:

1. Open the running checkout at `http://localhost:3000` and select
   **Ingresar con Google**. The development modal also offers email sign-in.
2. Enter `scalonetapp-agent+clerk_test@example.com` and continue.
3. Enter verification code `424242`. Clerk redirects to `/dashboard`.

This uses [Clerk's test-email support](https://clerk.com/docs/guides/development/testing/test-emails-and-phones),
which creates a real authenticated development session without sending an email.
Email sign-up remains disabled; reuse the existing test user. Use a separate
browser context for concurrent agents, and coordinate changes to shared test
data. Do not save session cookies or tokens in the repository.

The test login is for the Clerk **Development** instance only. Production remains
Google-only. Never enable test mode, email-code login, or an auth bypass in
Production for agent testing.

Telegram feedback uses the owner's shared personal bot, explicitly approved for
both local and production use. Only `TELEGRAM_BOTID` and `TELEGRAM_CHATID` were
retrieved from the `scalonetapp` Vercel project and added to `.env.local`. Do not
pull the whole production environment or commit these values. Local feedback
sends real messages to that bot's configured chat.

Local image exports use the browser installed by Puppeteer during `npm ci`.
Avatar uploads still use the existing hardcoded Cloudinary account; separating
that configuration is deferred.
