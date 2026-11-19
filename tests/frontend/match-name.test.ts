import { expect, it } from "vitest";
import {
  getDuplicatedMatchName,
  MAX_MATCH_NAME_LENGTH,
} from "@/utils/match-name";

it("names a copy after the original and numbers later copies regardless of case", () => {
  expect(getDuplicatedMatchName("Fútbol miércoles", [])).toBe(
    "Copia de Fútbol miércoles",
  );
  expect(
    getDuplicatedMatchName("Fútbol miércoles", [
      "copia de fútbol miércoles",
      "Copia de Fútbol miércoles (2)",
    ]),
  ).toBe("Copia de Fútbol miércoles (3)");
});

it("shortens long originals with an ellipsis within the name limit", () => {
  const original = "QA test completo e2e con nombre bien largo";
  const first = getDuplicatedMatchName(original, []);
  const second = getDuplicatedMatchName(original, [first]);
  expect(first).toBe("Copia de QA test completo e2e con nombr…");
  expect(second).toBe("Copia de QA test completo e2e con n… (2)");
  expect(first).toHaveLength(MAX_MATCH_NAME_LENGTH);
  expect(second).toHaveLength(MAX_MATCH_NAME_LENGTH);
});
