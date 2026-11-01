# scalonetapp

Build two football teams, save lineups and export a shareable image.

## Development guidance

- [AGENTS.md](AGENTS.md): working rules, product contracts and verification.
- [DESIGN.md](DESIGN.md): the current visual system.

Development documentation lives here and is updated alongside relevant changes.

## Run locally

Requires Node.js 26, a PostgreSQL database, and a [Clerk](https://clerk.com) development application.

```bash
nvm install
nvm use
npm ci
```

The main checkout holds the private, Git-ignored `.env.local` and `.env.prod` files. When creating a worktree, locate the main checkout with `git worktree list --porcelain` and copy both files into the new worktree without overwriting existing files. Keep the copies Git-ignored and readable only by their owner. If either source file is missing, report it rather than replacing credentials with template values. For a first-time setup without an existing configuration, start with `cp -n .env.template .env.local`.

Use `.env.local` for Development. Before starting services or environment-dependent checks, verify Clerk test keys and an owned, isolated PostgreSQL database; replace any Production connections in that file. Keep secrets out of logs and Git. Use `.env.prod` only for explicitly authorized Production work; copying it does not grant that authorization.

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
Prisma CLI reads `POSTGRES_URL_NON_POOLING` through [prisma.config.ts](prisma.config.ts);
the application uses pooled `POSTGRES_PRISMA_URL`. Keep the explicit `--env-file`
for local Prisma commands. `prisma generate` needs neither URL; migration commands
require the nonpooling URL. Vercel supplies these variables directly.

## Formatting

Run `npm run format` to format the repository and `npm run format:check` to check it.
Prettier runs independently of ESLint.

## Frontend behavior tests

Run without an environment file, database or Clerk session:

```bash
npm ci
npx playwright install chromium  # once per machine
npm run test:frontend
```

`npm run typecheck` generates Next.js route types before checking TypeScript, without starting a server.

`npm test` runs Vitest; `npm run test:watch` enables watch mode.
`npm run test:browser` runs the isolated Playwright fixture.

Visual comparisons, authentication and backend verification are outside this suite.
[CI](.github/workflows/frontend-tests.yml) runs formatting checks, lint, typecheck and both suites on PRs
and pushes to `main`.
