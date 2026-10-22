-- Remove stale player references from saved teams, without deleting players,
-- changing team names/order, or changing the match's historical updatedAt.
-- Unparseable JSON and unknown team shapes are preserved for separate review.
DO $$
DECLARE
  saved RECORD;
  parsed JSONB;
  cleaned JSONB;
BEGIN
  FOR saved IN SELECT "id", "teams" FROM "Match" ORDER BY "id" FOR UPDATE LOOP
    BEGIN
      parsed := saved."teams"::jsonb;
    EXCEPTION WHEN data_exception THEN
      CONTINUE;
    END;
    IF jsonb_typeof(parsed) IS DISTINCT FROM 'array' THEN
      CONTINUE;
    END IF;

    SELECT COALESCE(jsonb_agg(
      CASE WHEN jsonb_typeof(team.value) = 'object'
             AND jsonb_typeof(team.value->'players') = 'array'
        THEN jsonb_set(team.value, '{players}', (
          SELECT COALESCE(jsonb_agg(member.value ORDER BY member.ordinality), '[]'::jsonb)
          FROM jsonb_array_elements(team.value->'players') WITH ORDINALITY AS member(value, ordinality)
          WHERE EXISTS (
            SELECT 1 FROM "Player" player
            WHERE player."matchId" = saved."id"
              AND player."id" = CASE WHEN jsonb_typeof(member.value) = 'number'
                THEN (member.value #>> '{}')::numeric END
          )
        ))
        ELSE team.value
      END ORDER BY team.ordinality
    ), '[]'::jsonb)
    INTO cleaned
    FROM jsonb_array_elements(parsed) WITH ORDINALITY AS team(value, ordinality);

    -- Keep already-correct rows byte for byte, including their timestamps.
    IF cleaned IS DISTINCT FROM parsed THEN
      UPDATE "Match" SET "teams" = cleaned::text WHERE "id" = saved."id";
    END IF;
  END LOOP;
END $$;
