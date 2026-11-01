# Scalonetapp

Build two football teams, save lineups and export a shareable image.

## Run locally

Use Node.js 26, PostgreSQL tools and Clerk Development credentials. Keep the project's private `.env.local` and `.env.prod` files in the main checkout; [.env.template](.env.template) lists the configuration. Local startup uses `.env.local`.

```bash
bash scripts/setup-worktree.sh
npm run dev
```

Open the URL printed by the server. Setup prepares a local database and an initial Argentina Celeste vs. Argentina Blanca match for the configured agent, with 10 players per side. Repeating setup preserves existing matches. Stop the local database with `npm run stop:database`; its data is retained.

## Checks

```bash
npm run test:frontend
npm run test:setup
npm run lint
npm run typecheck
npm run format:check
```

Use `npm run format` to apply formatting. Setup tests need PostgreSQL tools; frontend tests run without a database or sign-in.

## Project guidance

- [AGENTS.md](AGENTS.md): instructions for coding agents.
- [DESIGN.md](DESIGN.md): product design guidance.
