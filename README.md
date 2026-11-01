# scalonetapp

Build two football teams, save lineups and export a shareable image.

## Development guidance

- [AGENTS.md](AGENTS.md): working rules, product contracts and verification.
- [DESIGN.md](DESIGN.md): the current visual system.

Development documentation lives here and is updated alongside relevant changes.

## Run locally

Use Node.js 26, installed PostgreSQL tools (`pg_config`, `initdb`, `pg_ctl`, `psql`, `createdb`), and a [Clerk](https://clerk.com) Development application.

```bash
bash scripts/setup-worktree.sh
```

The [bootstrap](scripts/setup-worktree.sh) selects Node 26 through nvm when needed. It copies the main checkout's Git-ignored `.env.local` and `.env.prod` only when absent and sets owner-only permissions. The main checkout must already hold these private files; missing files fail setup. `.env.prod` is copied but never loaded by local startup. Using it requires explicit Production authorization.

Dependencies are reused in place or copied independently from a repository cache in the shared Git directory. The cache is keyed by manifests, project npm configuration, Node version, platform and architecture, and checked for missing packages before use. A cache miss runs `npm ci` and publishes a complete snapshot atomically. Older combinations remain available for older branches; the main checkout does not need installed dependencies or synchronization. Setup always generates Prisma and prepares worktree-local browsers. Unmarked installations require one bootstrap before reuse.

Setup creates a password-protected PostgreSQL cluster under ignored `.local/postgres`, starts it on a free loopback port, sets both database URLs in `.env.local`, and applies migrations only to that owned database. It preserves existing data on subsequent runs and never connects to the copied remote URLs. `npm run dev` restarts the owned database when needed and reapplies pending migrations before starting the app.

The copied `.env.local` must contain Clerk Development test keys. Production settings, Blob credentials, Telegram credentials and additional Next.js env files reported by the guard must be removed before setup can complete. These external services are not provisioned by setup; photo uploads require separate test storage.

Check configuration and the live database with `npm run check:development`. Stop only this worktree's PostgreSQL with `npm run stop:database`; its data remains available for the next startup. Manual local Prisma commands must use `node --env-file=.env.local node_modules/prisma/build/index.js ...` for [prisma.config.ts](prisma.config.ts).

`npm run dev` prints an available loopback URL and uses it for internal image exports through `IMAGE_EXPORT_ORIGIN`. Open that URL. If another process takes the selected port before startup, the command fails; rerun it. Vercel Preview and Production export targets remain unchanged.

For automatic T3 setup, save `bash scripts/setup-worktree.sh` as a project action with **Run automatically on worktree creation** and **Wait for it to finish before the agent starts** enabled. This setting lives in T3, outside Git. The checked-out revision must contain the script, and worktree creation must have setup enabled. For existing or unprepared checkouts, run the bootstrap explicitly; with Node 26 active, `npm run setup:worktree` is equivalent.

## Formatting

Run `npm run format` to format the repository and `npm run format:check` to check it.
Prettier runs independently of ESLint.

## Frontend behavior tests

After a successful worktree bootstrap, run `npm run test:frontend`. To prepare only the frontend suites without environment files, a database or a Clerk session:

```bash
npm ci
npx playwright install chromium
npm run test:frontend
```

`npm run typecheck` generates Next.js route types before checking TypeScript, without starting a server.

`npm run test:setup` checks dependency caching and owned PostgreSQL lifecycle. Database cases require PostgreSQL tools; CI installs them.

`npm test` runs Vitest; `npm run test:watch` enables watch mode.
`npm run test:browser` runs the isolated Playwright fixture on an available port and refuses to reuse an existing server.

Visual comparisons, authentication and backend verification are outside this suite.
[CI](.github/workflows/frontend-tests.yml) runs formatting checks, lint, typecheck and both suites on PRs
and pushes to `main`.
