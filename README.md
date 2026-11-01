# scalonetapp

Build two football teams, save lineups and export a shareable image.

## Development guidance

- [AGENTS.md](AGENTS.md): working rules, product contracts and verification.
- [DESIGN.md](DESIGN.md): the current visual system.

Development documentation lives here and is updated alongside relevant changes.

## Run locally

Use Node.js 26, a local PostgreSQL instance you own, and a [Clerk](https://clerk.com) Development application.

```bash
bash scripts/setup-worktree.sh
```

The [bootstrap](scripts/setup-worktree.sh) selects Node 26 through nvm when needed. It copies the main checkout's Git-ignored `.env.local` and `.env.prod` only when absent and sets owner-only permissions. The main checkout must already hold these private files; missing files fail setup. `.env.prod` is copied but never loaded by local startup. Using it requires explicit Production authorization.

Dependencies are reused in place, or copied independently from the main checkout, only when a previous successful bootstrap recorded matching manifests, npm configuration, Node version, platform and architecture. Otherwise setup runs `npm ci`. It always generates Prisma and prepares worktree-local browsers. Unmarked installations require one bootstrap before they can be reused.

A successful setup prepares tools for source work and frontend tests. It reports invalid Development configuration without failing the bootstrap. Before starting services or migrating, configure `.env.local` and run the blocking check:

```bash
npm run check:development
```

- Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to Clerk Development test keys.
- Point `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` to the same isolated loopback database. The validation error gives the required database name, derived from the worktree path. Create that database on your local instance.
- Remove Blob and Telegram credentials, additional Next.js env files, and Production configuration reported by the guard. Keep secrets out of logs and Git.

Setup does not create a database or apply migrations. Once the check succeeds, initialize the isolated database and start the app:

```bash
node --env-file=.env.local node_modules/prisma/build/index.js migrate deploy
npm run dev
```

Local Prisma commands need `--env-file=.env.local` for the connection configured in [prisma.config.ts](prisma.config.ts). Client generation does not require a database.

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

`npm test` runs Vitest; `npm run test:watch` enables watch mode.
`npm run test:browser` runs the isolated Playwright fixture on an available port and refuses to reuse an existing server.

Visual comparisons, authentication and backend verification are outside this suite.
[CI](.github/workflows/frontend-tests.yml) runs formatting checks, lint, typecheck and both suites on PRs
and pushes to `main`.
