# scalonetapp

Build two football teams, save lineups and export a shareable image.

## Development guidance

- [AGENTS.md](AGENTS.md): working rules, product contracts and verification.
- [DESIGN.md](DESIGN.md): the current visual system.

Development documentation lives here and is updated alongside relevant changes.

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

## Frontend behavior tests

Requires Node.js 24. No environment file, database, Clerk session, or backend is
needed. Install dependencies with `npm ci`, then run:

```bash
npm test                  # isolated components and frontend state
npm run test:watch        # rerun affected Vitest tests during development
npm run lint             # also prepares Next type declarations on a fresh checkout
npm run typecheck
npx playwright install chromium  # once per machine
npm run test:browser      # real-browser menu/dialog regressions
npm run test:frontend     # both suites
```

Tests live in `tests/frontend/`. They render actual forms, validation, dialogs,
notifications and child components with React Testing Library. State hooks use
small typed rosters or a minimal consumer. No application-wide wrapper is needed.
Server Actions are replaced at their imported boundary; HTTP responses and browser
APIs are controlled only in the tests that exercise them. These are frontend
behavior tests, not proof of server authorization, persistence or real PNG output.

Coverage includes match/player/bulk forms, creation and deletion feedback, retry
and pending states, clipboard failures, team assignment and roster refresh,
optimistic save conflicts, save-before-export and image retry, export content and
preferences, match-list capacity, and photo request outcomes. Rendering assertions
check user content and behavior, not CSS, screenshots or exact render counts.
Strict Mode and prop refresh cases exercise state reconciliation without loops.

The Playwright fixture in `tests/browser/fixture/` mounts the real player menu,
forms and Radix dialogs with production CSS. A local Vite server serves only that
fixture, never the Next app. It supplies the route parameter context and replaces
only player Server Actions with a test HTTP adapter. Playwright controls those
responses; requests to external hosts fail. Tests verify physical clicks after
rapid edits, error/retry and delete cancellation. No visual baselines are used.

Both suites run on pull requests and pushes to `main` in the `Frontend tests`
workflow, without secrets. Failed browser runs retain diagnostic artifacts.
Authentication/provider flows, server-rendered pages, database behavior, actual
photo conversion/cropping, hosted uploads and generated PNG validation remain
outside this suite. Use the existing operational audit as a reference for those
separate integration checks.

When adding tests, prefer an observable result over implementation details, keep
real hooks/components together, use accessible labels, and substitute the narrowest
external boundary. Extract production logic only when that improves its design.
Do not introduce sleeps, broad global providers, snapshots, or a mock per child.
