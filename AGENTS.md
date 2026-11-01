# Working in Scalonetapp

## Scope

- Keep development instructions, design guidance and reusable product tests in this repository.
- Write documentation in English. Preserve existing Spanish UI copy.
- Make the smallest coherent change. Preserve unrelated work.
- Keep application code free of explanatory comments; express intent and enforceable constraints through code and tests. Apply the same preference to scripts. Retain a comment only when its value cannot be preserved another way, such as required license notices or unavoidable tool directives.
- For UI work, read [DESIGN.md](DESIGN.md). [README.md](README.md) is the human-facing entry point.
- Update docs only for lasting contract or workflow changes. Keep README concise for people; put agent workflows and verification rules here.
- Make the smallest sufficient doc edit in the existing section. Link to code/config instead of duplicating it; omit implementation walkthroughs, coverage inventories and run logs. Review the doc diff for redundancy before handoff.
- Keep public documentation free of credentials, account identifiers, personal machine paths and private project URLs. Use generic examples and retrieve access details from the configured private source.
- Keep temporary checks and evidence in ignored scratch space. Add permanent validation tooling only when the task requires it.
- Merge and Production actions require explicit authorization.

## Local environment

- Before using an unprepared worktree, run `bash scripts/setup-worktree.sh`; with Node 26 active, `npm run setup:worktree` is equivalent. A successful automatic T3 setup satisfies this step. Verify whether it actually ran; an explicit retry does not prove automatic preparation.
- T3's project action must run the bootstrap automatically on worktree creation and wait before starting the agent. These host settings are outside Git; the selected revision must contain the scripts.
- Bootstrap copies ignored `.env.local` and `.env.prod` from the main checkout only when absent, with owner-only permissions. Use Clerk Development test keys. Copying `.env.prod` does not authorize loading it or connecting to Production.
- The shared Git dependency cache is keyed by manifests and runtime; each worktree gets an independent copy. Preserve shared cache entries used by other branches. Browsers and build/test artifacts stay worktree-local.
- PostgreSQL is owned by the worktree under ignored `.local/postgres`. Setup applies migrations only after verifying the live server's data directory. `npm run dev` restarts this cluster when needed. Use `npm run check:development` before other environment-dependent commands; manual Prisma commands need `node --env-file=.env.local node_modules/prisma/build/index.js ...`.
- Setup seeds only an empty match database, using the verified `CLERK_AGENT_USER_ID` from the private env source. It creates one 10-vs-10 Argentina match with stable, randomly selected captain defaults. Preserve edits to existing matches; create additional synthetic cases only as needed for a task.
- Development and Preview share the approved Blob store declared by `DEVELOPMENT_PHOTO_ORIGIN`. Setup derives `DEVELOPMENT_PHOTO_NAMESPACE` per worktree. Upload and cleanup must remain within that namespace; do not remove Preview, Production or other-worktree files.
- Telegram uses the shared private bot/chat settings. Send feedback only when explicitly authorized by the task; bootstrap and routine checks must not send messages.
- Use free app/fixture ports and the printed Development URL for internal exports. Stop only owned processes; `npm run stop:database` preserves data. CPU, memory and external account quotas remain shared.

## Product contracts

- Preserve exactly two teams, up to 100 players per match and 50 players per batch.
- Support uneven and empty teams. Free players remain in the match and are omitted from exports; saving and exporting partial teams remains valid.
- Roster writes and saved assignments stay consistent. Stale saves must not overwrite newer lineups; refreshes preserve unrelated drafts.
- Seed captain IDs are initial export defaults; saved browser choices take precedence, and stale roster assignments must not reappear.
- Exports use the previewed snapshot or reject stale data. A failed export must not undo a successful save.
- Preview and image capture share `components/team-export/team-export.tsx`. Keep the 1280px canvas and server DPR 2 independent of preview scaling. Download encoding and optional post-capture resizing follow [prepareTeamExport](server/prepare-team-export.ts); keep MIME type and filename aligned with the returned image.

## Verify changes

- Reproduce a reported bug in the affected flow before choosing a fix.
- Run checks proportionate to the change using the current `package.json` scripts. Exercise the affected journey with synthetic data in Development or Preview.
- For frontend behavior changes, run the affected Vitest tests during development and `npm run test:frontend` before handoff. Frontend-only preparation is `npm ci` followed by `npx playwright install chromium`; no env file, database or Clerk session is needed.
- `npm run test:setup` covers cache and owned PostgreSQL lifecycle, including seeding; CI installs PostgreSQL. `npm run typecheck` generates route types without a server. [CI](.github/workflows/frontend-tests.yml) runs the repository checks; authentication, real uploads and backend journeys need separate verification.
- Test frontend behavior with real components and minimal external-boundary substitutes. Reserve browser tests for behaviors requiring a real browser; omit visual baselines and exact render counts.
- For roster or export changes, check save/reload, partial teams, stale tabs and preview/PNG agreement where affected. Use two teams of 16 players for export verification; 100-player exports are stress and size checks.
- For UI changes, check 320x568, 768x1024, 1024x768 and 1280x800 CSS-pixel viewports. Check immediately around relevant breakpoints.
- For broad responsive changes, add 390x844 and 1440x900; for height-sensitive changes, add 844x390 and keyboard/dialog reachability.
- Check long content, relevant empty/error/loading states, keyboard access, clipping and unintended horizontal scrolling. Check zoom separately when layout or viewport settings change.
- Report executed checks, revision, environment, browser/viewports and gaps. Distinguish source inspection, browser emulation and actual-device testing; a build alone does not prove a working flow.

## PR Preview handoff

- For every PR created or updated, prepare its Preview for the owner's quick test automatically, without waiting for a separate request. If deployment is pending, use the host's PR watch/resume mechanism and finish this handoff when it is ready.
- Verify that the successful Preview deployment belongs to the PR's latest head commit. Use Chrome for Vercel access and deployment protection; authenticate the application with the designated Clerk agent account for that Development/Preview instance. An existing owner Clerk session does not replace the agent account: preserve it and use a separate browser session for the agent. Retrieve credentials through the configured private credential source; keep them out of repository files, PRs and logs. If credentials or browser access are unavailable, report the blocker instead of substituting the owner's account.
- Verify the signed-in agent identity and that the affected authenticated page loads. Leave that page open in the shared browser for the owner; include the Preview URL and tested head commit in the handoff. Reuse an existing matching agent session when available.
- Preview readiness and agent sign-in do not authorize merge or Production actions. Use the agent account only against the verified Development/Preview instance.
