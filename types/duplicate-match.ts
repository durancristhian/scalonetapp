export type DuplicateMatchResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "unauthorized"
        | "not_found"
        | "match_limit"
        | "player_limit"
        | "unexpected";
      reference?: string;
    };
