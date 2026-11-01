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
cp -n .env.template .env.local
```

In a new worktree, copy the required ignored environment files from the main checkout into that worktree before starting services or environment-dependent checks. Copy only the variables needed for the task, keep secrets out of logs and Git, and verify Clerk test keys and an owned, isolated PostgreSQL database before any Development mutations. Existing environment files may point to Production; replace those connections rather than using them for local checks.

In `.env.local`, set:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from Clerk Development.
- `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` to your development database URL.
- Optionally, `TELEGRAM_BOTID` and `TELEGRAM_CHATID` to enable feedback.

Choose unused, separate app, browser-fixture and PostgreSQL ports for this worktree. Record the chosen ports and owned process IDs under ignored `.local/` space so retries can verify and reuse the same services. The following ports are examples, not reservations. Keep the other template defaults, then initialize the database and start the app:

```bash
node --env-file=.env.local node_modules/prisma/build/index.js migrate deploy
node --env-file=.env.local node_modules/prisma/build/index.js generate
PORT=3101 npm run dev -- --hostname localhost
```

Open the selected app URL, for example `http://localhost:3101`. Keep the hostname consistent with the local export origin and set `PORT` in the launch environment so local image exports reach the same app. Next.js reads this variable before loading `.env.local`; do not configure it only in that file. The default remains port 3000. If startup reports a collision or selects another port, stop only the process just started and relaunch with a free explicit `PORT`.
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

For parallel worktrees, choose an unused fixture port and run `PLAYWRIGHT_PORT=4418 npm run test:frontend`. This configures both the fixture server and browser base URL; the default remains 4317. The suite refuses to reuse an existing server. Keep browser contexts and test artifacts owned by this worktree, and stop only services it started.

`npm run typecheck` generates Next.js route types before checking TypeScript, without starting a server.

`npm test` runs Vitest; `npm run test:watch` enables watch mode.
`npm run test:browser` runs the isolated Playwright fixture.

Visual comparisons, authentication and backend verification are outside this suite.
[CI](.github/workflows/frontend-tests.yml) runs formatting checks, lint, typecheck and both suites on PRs
and pushes to `main`.
