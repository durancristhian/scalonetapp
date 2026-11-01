# scalonetapp

Build two football teams, save lineups and export a shareable image.

## Development guidance

- [AGENTS.md](AGENTS.md): working rules, product contracts and verification.
- [DESIGN.md](DESIGN.md): the current visual system.

Development documentation lives here and is updated alongside relevant changes.

## Run locally

Requires Node.js 26, a PostgreSQL database, and a [Clerk](https://clerk.com) development application.

```bash
npm run setup:worktree
npm run dev
```

[setup:worktree](scripts/setup-worktree.sh) selects Node.js 26 through nvm when needed, copies the main checkout's Git-ignored `.env.local` and `.env.prod` without overwriting existing files, enforces owner-only permissions, runs `npm ci`, generates Prisma, and installs worktree-local browsers for exports and Playwright. Missing source files or unsafe Development configuration fail setup without printing secrets. Copying `.env.prod` does not authorize loading it.

In T3, register `bash scripts/setup-worktree.sh` as a project script with **Run automatically on worktree creation** and **Wait for it to finish before the agent starts** enabled. This host setting is not stored in Git and applies only when setup is enabled during worktree creation. The checked-out revision must contain the script. Existing worktrees and threads reusing a checkout run `npm run setup:worktree` explicitly.

Local startup loads `.env.local` and requires Clerk Development keys plus loopback PostgreSQL URLs in `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`. The guard prints the required database name, derived from the worktree path. Create that database on a PostgreSQL instance you own, then set both URLs to it. Remote/shared databases, Blob and Telegram credentials, additional Next.js env files, and non-Development Vercel configuration are blocked. No database or paid service is provisioned automatically.

After configuring the isolated database, initialize it explicitly:

```bash
node --env-file=.env.local node_modules/prisma/build/index.js migrate deploy
```

`npm run dev` prints an available loopback URL and pins internal image exports to that same port through `IMAGE_EXPORT_ORIGIN`. It never reuses another server. If another process takes the selected port before startup, startup fails; rerun the command. Production and Vercel Preview export targets remain unchanged.

Prisma CLI reads `POSTGRES_URL_NON_POOLING` through [prisma.config.ts](prisma.config.ts); the application uses `POSTGRES_PRISMA_URL`. Migration commands require the explicit `--env-file=.env.local`; client generation does not require a database.

## Formatting

Run `npm run format` to format the repository and `npm run format:check` to check it.
Prettier runs independently of ESLint.

## Frontend behavior tests

Run without an environment file, database or Clerk session:

```bash
npm ci
npx playwright install chromium  # once per machine without worktree setup
npm run test:frontend
```

`npm run typecheck` generates Next.js route types before checking TypeScript, without starting a server.

`npm test` runs Vitest; `npm run test:watch` enables watch mode.
`npm run test:browser` runs the isolated Playwright fixture on an available port and refuses to reuse an existing server.

Visual comparisons, authentication and backend verification are outside this suite.
[CI](.github/workflows/frontend-tests.yml) runs formatting checks, lint, typecheck and both suites on PRs
and pushes to `main`.
