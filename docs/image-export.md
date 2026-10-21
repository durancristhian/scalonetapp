# Image export

The editor and downloaded PNG share `TeamExport`, a 1280 CSS-pixel canvas rendered at 2× resolution. Match data remains in the database; presentation preferences and selected player roles stay in the browser.

## Behavior

- Exactly two teams, with 1–20 players in each, at most 40 called-up players per match and all called-up players assigned. New teams cannot exceed two. Older matches with extra teams can be repaired by removing teams and reassigning their players. Matches above the player limits require removing excess players or redistributing them before saving/exporting.
- Player limits are shared constants in `utils/player-limits.ts`. Individual and bulk additions enforce the 40-player total on the server. Bulk entry accepts at most the remaining places (up to 40 in an empty match), reports that count in the form, and rejects oversized batches without partially inserting them. Assignment cannot overflow a 20-player team.
- Invalid team counts disable Exportar. Hover or keyboard focus explains how to repair the match. The save query and download endpoint enforce the same team-count, name and complete-membership validation as the builder.
- Fixed two player columns per team. Global left/center alignment, square/circle/no-image presentation. Player names, team signs and the match banner truncate to one line with ellipsis.
- Synthetic, natural and dirt surfaces each own a palette, stand, banner and team signs. Generated faces retain their name seed; uploaded imagery remains unchanged. Appearance defaults to synthetic grass, clear weather, square images and left alignment.
- Rain and snow apply behind the content. The stand uses falling snow without ground accumulation. Header artwork replaces the previous header/footer treatment; no export footer remains.
- The playable field grows with the teams and has a minimum height of one third of its width. The central ring stays round, at most 25% of field width and 75% of field height. The joint team block centers vertically without stretching player gaps.
- A single role badge is above the image on the right. For two roles, captain is on the left and goalkeeper on the right. Without an image, both precede the name, captain first.

## Persistence and invalidation

`scaloneta:image-export:v1` stores surface, weather, image presentation and alignment globally. Each update replaces the previous preferences. Unsupported stored preferences fall back to defaults; there is no legacy palette/font migration.

`scaloneta:export-player-roles:v1:<matchId>` stores each team's sorted player IDs and selected captain/goalkeeper. Roles are scoped to the match and the team's exact membership. Roster changes clear both roles in every affected team, even while the editor is closed and even if the original roster is later restored; renaming or reordering does not. The same player can hold both roles. A unique goalkeeper position can be selected on initial configuration; captain starts unassigned. Explicit “No indicado” persists.

Guardar remains independent. Descargar first saves dirty teams, then requests the PNG. Save failure stops generation. Image failure preserves the successful save and retries only the image. Processing blocks repeat actions and closing the editor; success and failures have separate feedback.

## Before merging: Vercel environment

No environment-variable additions or value changes are required for this PR. Player limits are now shared code constants: 20 per team, 40 per match, and bulk entry limited to the remaining places.

- Keep the existing `NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH` and `NEXT_PUBLIC_MAX_PLAYERS_BATCH` variables until the new version is deployed. The current main branch still reads them; this PR ignores them.
- After deployment, those two variables can be removed from Vercel environments where present as optional cleanup. They do not need to be changed to 40 before merging. Retain their former values if rebuilding an older revision for rollback.
- Keep `NEXT_PUBLIC_MAX_MATCHES_PER_USER` and `NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL`; they are still used. No Clerk, database, Blob or export-target environment changes are introduced here, and no schema migration is required.
