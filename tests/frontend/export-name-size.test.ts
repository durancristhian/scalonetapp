import { expect, it } from "vitest";
import { getExportNameSize } from "@/components/team-export/export-name-size";

it("keeps short export names at full size and shrinks names that need more than two lines", () => {
  expect(getExportNameSize("Juan Román Riquelme", 0)).toBe(24);
  for (const name of [
    "Maximiliano Bartolomé Fernández Quiroga",
    "W".repeat(40),
  ])
    expect(getExportNameSize(name, 0)).toBeLessThan(24);
});

it("shrinks a name when inline role badges take its room", () => {
  expect(getExportNameSize("Lionel Andrés Messi", 0)).toBe(24);
  expect(getExportNameSize("Lionel Andrés Messi", 2)).toBeLessThan(24);
});
