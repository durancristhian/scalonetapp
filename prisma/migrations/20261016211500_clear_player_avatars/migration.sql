-- One-time reset of existing photo URLs after retirement of the previous host.
-- An empty avatar uses the generated SVG. Later photo uploads remain supported.
UPDATE "Player"
SET "avatar" = ''
WHERE "avatar" <> '';
