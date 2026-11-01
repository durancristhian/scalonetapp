# Working in Scalonetapp

## Scope

- Keep development instructions, design guidance and reusable product tests in this repository.
- Write documentation in English. Preserve existing Spanish UI copy.
- Make the smallest coherent change. Preserve unrelated work.
- Keep application code free of explanatory comments; express intent and enforceable constraints through code and tests. Apply the same preference to scripts. Retain a comment only when its value cannot be preserved another way, such as required license notices or unavoidable tool directives.
- For UI work, read [DESIGN.md](DESIGN.md). For local setup, read [README.md](README.md).
- Update docs only for lasting contract or workflow changes. Keep README for setup and commands; AGENTS for development rules.
- Make the smallest sufficient doc edit in the existing section. Link to code/config instead of duplicating it; omit implementation walkthroughs, coverage inventories and run logs. Review the doc diff for redundancy before handoff.
- Keep temporary checks and evidence in ignored scratch space. Add permanent validation tooling only when the task requires it.
- Each agent must copy the required environment files into its own worktree before running environment-dependent checks or services. Follow [Run locally](README.md#run-locally) to verify and isolate the configuration.
- Merge and Production actions require explicit authorization.

## Product contracts

- Preserve exactly two teams, up to 100 players per match and 50 players per batch.
- Support uneven and empty teams. Free players remain in the match and are omitted from exports; saving and exporting partial teams remains valid.
- Roster writes and saved assignments stay consistent. Stale saves must not overwrite newer lineups; refreshes preserve unrelated drafts.
- Exports use the previewed snapshot or reject stale data. A failed export must not undo a successful save.
- Preview and image capture share `components/team-export/team-export.tsx`. Keep the 1280px canvas and server DPR 2 independent of preview scaling. Download encoding and optional post-capture resizing follow [prepareTeamExport](server/prepare-team-export.ts); keep MIME type and filename aligned with the returned image.

## Verify changes

- Reproduce a reported bug in the affected flow before choosing a fix.
- Run checks proportionate to the change using the current `package.json` scripts. Exercise the affected journey with synthetic data in Development or Preview.
- For frontend behavior changes, run the affected Vitest tests during development and `npm run test:frontend` before handoff. See [Frontend behavior tests](README.md#frontend-behavior-tests) for setup and scope.
- Test frontend behavior with real components and minimal external-boundary substitutes. Reserve browser tests for behaviors requiring a real browser; omit visual baselines and exact render counts.
- For roster or export changes, check save/reload, partial teams, stale tabs and preview/PNG agreement where affected. Use two teams of 16 players for export verification; 100-player exports are stress and size checks.
- For UI changes, check 320x568, 768x1024, 1024x768 and 1280x800 CSS-pixel viewports. Check immediately around relevant breakpoints.
- For broad responsive changes, add 390x844 and 1440x900; for height-sensitive changes, add 844x390 and keyboard/dialog reachability.
- Check long content, relevant empty/error/loading states, keyboard access, clipping and unintended horizontal scrolling. Check zoom separately when layout or viewport settings change.
- Report executed checks, revision, environment, browser/viewports and gaps. Distinguish source inspection, browser emulation and actual-device testing; a build alone does not prove a working flow.

## PR Preview handoff

- For every PR created or updated, prepare its Preview for the owner's quick test automatically, without waiting for a separate request. If deployment is pending, use the host's PR watch/resume mechanism and finish this handoff when it is ready.
- Verify that the successful Preview deployment belongs to the PR's latest head commit. Open its deployment URL in the shared browser and sign in with the designated Clerk agent account for that Development/Preview instance. Retrieve credentials through the configured private credential source; keep them out of repository files, PRs and logs. If credentials or browser access are unavailable, report the blocker instead of substituting the owner's account.
- Verify the signed-in agent identity and that the affected authenticated page loads. Leave that page open in the shared browser for the owner; include the Preview URL and tested head commit in the handoff. Reuse an existing matching agent session when available.
- Preview readiness and agent sign-in do not authorize merge or Production actions. Use the agent account only against the verified Development/Preview instance.
