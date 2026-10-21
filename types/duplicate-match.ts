export type DuplicateMatchResult =
  | { ok: true; teamsReset: boolean }
  | {
      ok: false;
      code: "unauthorized" | "not_found" | "match_limit" | "player_limit" | "unexpected";
      reference?: string;
    };
