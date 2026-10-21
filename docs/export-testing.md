# Local export verification

Run with Node 24, `npm ci`, the local PostgreSQL/Clerk Development environment described in README, and `npm run dev` on port 3000.

```sh
npm run fixtures:export -- --user-id=<local-clerk-user-id> --write
npm run test:export
npm run test:export:local -- --user-id=<local-clerk-user-id>
```

The fixture script defaults to a dry run without `--write`. Both scripts reject non-local databases and non-test Clerk keys. Seeding is idempotent by account and fixture name and never replaces existing matches. To create the same cases in another local account, explicitly pass that account's user ID. The browser runner verifies ownership, signs into that test account with a short-lived ticket, and restores the original fixture team data after its temporary UI edits. It does not change Production.

## Fixtures

| Case | Players per team | Purpose |
| --- | --- | --- |
| One each | 1 / 1 | Minimum field, shared roles, empty grid slots |
| Long names + uploaded-image sample | 8 / 8 | Ellipsis, wrapping, palette-independent image |
| Match maximum | 50 / 50 at current limit 100 | Large PNG and roster scrolling |
| Uneven maximum | 1 / 99 at current limit 100 | Highly asymmetric rosters |
| Roles | 3 / 3 | Captain/goalkeeper persistence and roster changes |
| Legacy three-team match | 2 / 2 / 2 | Disabled export, tooltip, HTTP 422 and repair |
| Empty team | 2 / 0 | Incomplete-team state |
| Unassigned player | 1 / 1 + 1 waiting | Assignment validation |

The maximum is read from `NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH` rather than hardcoded in fixture generation. Selected role suggestions and match IDs are written to ignored `.local/export-fixtures.json`. Captains are deliberately not auto-selected in product behavior.

## Coverage

- 54 real PNG requests: 3 surfaces × 3 weather options × 3 image presentations × 2 alignments. Validate PNG content type, nonempty decoded image, width 2560 and bounded dynamic height.
- Eight additional real PNGs: minimum, maximum, asymmetric and role fixtures, with and without images.
- Actual editor interactions: remembered appearance, match-scoped roles, changing team membership, role invalidation and repair of legacy data.
- Fault injection confined to the disposable test page: save failure, image failure after save, retry without repeat save, independent save, repeated downloads and processing/success controls.
- Page and modal checks at 320, 390, 639, 640, 767, 768, 1023, 1024, 1279, 1280 and 1440 CSS pixels. No document, dialog or control-panel horizontal overflow; preview appears from 1024 px.
- Unit coverage for request validation, all option combinations, global preference replacement, unavailable browser storage, role deletion/swaps, explicit unassigned roles and per-match isolation.

Artifacts are written to ignored `.local/export-qa/`: retained PNGs, screenshots, logs and `report.json`. `--skip-matrix` reruns UI/state/responsive checks without repeating the 62 PNG requests. Reports should be read together when using that option.

## Visual review

![Three surfaces and weather treatments](images/export-themes.webp)

The three palettes remain distinct and coherent across stand, signs, ground and generated faces. White labels remain readable; uploaded imagery stays unchanged. No color changes are required for this PR.

Two optional follow-ups for owner review, not applied here:

- Reduce accumulated snow opacity slightly if its soft white patches feel like fog rather than snow.
- Consider spanning a single player across both team columns, or centering the smaller team's roster independently in extremely uneven matches. Current behavior preserves the approved fixed grid and joint vertical alignment.

## Verified run

Local verification on 2026-10-21 completed 62 decoded PNG exports, 35 browser behavior checks, 12 unit tests and the 11 viewport checks above. PNGs were 2560 pixels wide and ranged from 1470 to 16008 pixels high. The initial pass found page overflow at 320 and 768 pixels in existing roster/team rows; the final pass with 40-character unbroken player/match names had no page, modal or options-panel overflow.
