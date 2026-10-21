# Match consistency verification

PR #44 addresses stale saved teams, concurrent edits, mismatched exports, and mutation failures. It keeps the existing builder, forms, dialogs, and validation notices. Ordinary player deletion repairs the saved assignments on the server; it does not ask the user to save again.

## Manual checks

Use a disposable match in Development or Preview with four players, two per team, and save it first. Use two tabs signed into the same account for concurrency checks.

| Case | Reproduce | Expected result |
| --- | --- | --- |
| Deleted player remains saved | Delete an assigned player, then reload without pressing Guardar. | Player is absent from the roster and saved teams. Other assignments and team names remain. |
| Draft preservation | Save a team rename. Edit the other team's name without saving, delete an assigned player, then press Guardar. | Deletion is already persisted. The unrelated draft stays visible and saves successfully. The acknowledged first save does not cause a false conflict. |
| Last player on a team | Delete every member of one team. | Empty team and its name remain. Existing validation prevents saving/exporting until both teams have players; the app does not invent an assignment. |
| Two stale tabs | Open the same saved lineup in A and B. In A rename a team and save. In B change its old lineup and save. | B cannot overwrite A. Its draft remains visible and the existing alert asks for a refresh. Reloading explicitly discards that draft and loads A's saved lineup. |
| Pristine refreshed builder | Leave a tab with no local changes. Refresh its server data after a save in another tab. | The builder follows saved teams automatically. There is no cross-tab live subscription; a page reload also loads the saved lineup. |
| Stale export preview | Open Exportar in A. In B change a team or player and save. Download from A's unchanged preview. | No image is returned for the changed lineup. The existing export error area asks for a refresh. Reload A, reopen Exportar, and download successfully. |
| Duplicate player name | Edit a player's name to another player's name in the same match. | Server rejects the edit with the existing duplicate-name alert, leaves the editor open, and changes neither player. |
| Rapid deletion clicks | Click the delete confirmation repeatedly or press Escape while deletion is pending. | One request is sent. Cancel/Escape cannot dismiss the pending operation. On failure the dialog remains retryable. |
| Edits during a save | Save/export with browser network throttling enabled, then try editing teams or the roster while pending. | Existing match controls are disabled until the request finishes; edits cannot race an acknowledged save. |

The export fingerprint covers match name, ordered teams, ordered players, player names, levels, positions, and avatars. The renderer uses the same captured server snapshot after validation, so changes during image generation cannot switch it to another lineup.

## Local fixtures and automated checks

Malformed data and injected service failures should be reproduced only with local fixtures. To check recovery, set a disposable local match's `teams` field to `not-json`, `null`, or a structurally invalid team array. Reopen the match: the builder retains usable assignments where possible, otherwise opens empty teams with the existing controls. Armar equipos followed by Guardar replaces the unusable saved value. Deleting a player also repairs unusable saved JSON in the same transaction.

All database suites refuse remote hosts and require the dedicated `scalonet_duplication_test` database. Apply migrations first, then run:

```sh
npm run test:duplicate
npm run test:consistency
npm run test:player-teams:state
DUPLICATION_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/scalonet_duplication_test npm run test:duplicate:db
DUPLICATION_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/scalonet_duplication_test npm run test:player-teams:db
DUPLICATION_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/scalonet_duplication_test npm run test:consistency:db
```

The suites also cover rollback after partial duplication/deletion, foreign ownership, signed-out callers, invalid input, concurrent deletion/save ordering, stale versions, idempotent save retries, and concurrent match creation/duplication/renaming. Account locks cover the zero-existing-matches case. Player rename and additions share the parent match lock.

Production Flight tests exercise all seven player/match mutations with injected failures. Expected failures return safe results; unexpected failures keep their original cause and operation context in server logs. A failure during cache refresh after commit still returns success. Client transport exceptions use the existing generic action copy, never the framework's technical message.

## Historical cleanup

`20261021220000_remove_stale_team_players` removes IDs that do not belong to the containing match while preserving team order, names, metadata, empty teams, player rows, and other match fields. It is idempotent. Unparseable JSON and unknown historical shapes are intentionally left untouched by the migration; runtime recovery handles those without crashing.

The read-only pre-release audit found 24 invalid references in three matches across two accounts. A local replay of all 46 audited matches preserved all 671 player rows and changed only those three saved-team values. This is evidence from that audit, not a live adoption count. No Production migration was manually executed. The deployment's normal `prisma migrate deploy` step applies it after merge.

Code changes are reversible. Historical cleanup is one-way: reverting code does not restore the invalid references removed by the migration.
