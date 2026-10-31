# Working in Scalonetapp

## Scope

- Keep development instructions, design guidance and reusable product tests in this repository.
- Write documentation in English. Preserve existing Spanish UI copy.
- Make the smallest coherent change. Preserve unrelated work.
- For UI work, read [DESIGN.md](DESIGN.md). For local setup, read [README.md](README.md).
- Update the relevant document when a change alters a lasting rule or workflow. Keep instructions short; add files only when needed.
- Keep temporary checks and evidence in ignored scratch space. Add permanent validation tooling only when the task requires it.
- Merge and Production actions require explicit authorization.

## Product contracts

- Preserve exactly two teams, up to 100 players per match and 50 players per batch.
- Support uneven and empty teams. Free players remain in the match and are omitted from exports; saving and exporting partial teams remains valid.
- Roster writes and saved assignments stay consistent. Stale saves must not overwrite newer lineups; refreshes preserve unrelated drafts.
- Exports use the previewed snapshot or reject stale data. A failed export must not undo a successful save.
- Preview and PNG share `components/team-export/team-export.tsx`. Keep the 1280px canvas and server DPR 2 independent of preview scaling.

## Verify changes

- Reproduce a reported bug in the affected flow before choosing a fix.
- Run checks proportionate to the change using the current `package.json` scripts. Exercise the affected journey with synthetic data in Development or Preview.
- For roster or export changes, check save/reload, partial teams, stale tabs and preview/PNG agreement where affected.
- For UI changes, check 320x568, 768x1024, 1024x768 and 1280x800 CSS-pixel viewports. Check immediately around relevant breakpoints.
- For broad responsive changes, add 390x844 and 1440x900; for height-sensitive changes, add 844x390 and keyboard/dialog reachability.
- Check long content, relevant empty/error/loading states, keyboard access, clipping and unintended horizontal scrolling. Check zoom separately when layout or viewport settings change.
- Report executed checks, revision, environment, browser/viewports and gaps. Distinguish source inspection, browser emulation and actual-device testing; a build alone does not prove a working flow.
