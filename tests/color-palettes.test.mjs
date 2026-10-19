import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { COLOR_PALETTES, DEFAULT_COLOR_PALETTE, getArtworkStyle, getColorPalette, parseColorPalette } from "../utils/color-palettes.ts";
import { colorizeExportBackground, getImageExportBackgroundUrl } from "../utils/image-export-background.ts";
import { IMAGE_EXPORT_BACKGROUNDS } from "../utils/image-export-options.ts";
import { getPlayerAvatarUrl } from "../utils/player-avatar.ts";

test("the ten approved palettes retain their original colors and detail links", () => {
  assert.equal(COLOR_PALETTES.length, 10);
  assert.equal(new Set(COLOR_PALETTES.map(p => p.id)).size, 10);
  assert.equal(DEFAULT_COLOR_PALETTE, "clasico-rojo");
  assert.deepEqual(getColorPalette().roles.slice(0, 3), ["#D62828", "#003049", "#FCBF49"]);
  for (const palette of COLOR_PALETTES) {
    assert.ok(palette.colors.length >= 5);
    assert.equal(palette.sourceUrl, "https://coolors.co/palette/" + palette.colors.map(c => c.slice(1).toLowerCase()).join("-"));
    assert.deepEqual(new Set(palette.roles), new Set(palette.colors));
    for (const color of palette.colors) assert.match(color, /^#[A-F0-9]{6}$/);
  }
});

test("all SVG palettes use white and exact role colors without changing geometry", async () => {
  for (const background of IMAGE_EXPORT_BACKGROUNDS) {
    const source = await readFile(new URL("../public" + background.src, import.meta.url), "utf8");
    assert.equal(colorizeExportBackground(source, DEFAULT_COLOR_PALETTE), source, "public SVG defaults to Clásico rojo");
    const paths = source.match(/\bd="[^"]+"/g);
    for (const palette of COLOR_PALETTES) {
      const svg = colorizeExportBackground(source, palette.id);
      assert.deepEqual(svg.match(/\bd="[^"]+"/g), paths);
      const roles = { background: "#FFFFFF", primary: palette.roles[0], secondary: palette.roles[1] };
      if (source.includes("--tertiary")) roles.tertiary = palette.roles[2];
      for (const [role, color] of Object.entries(roles)) {
        assert.ok(svg.includes(`--${role}:${color}`));
        assert.ok(svg.includes(`fill="${color}" style="fill:var(--${role})"`));
      }
      const url = new URL(getImageExportBackgroundUrl(background.id, palette.id), "https://example.test");
      assert.equal(url.searchParams.get("palette"), palette.id);
      assert.equal(url.searchParams.get("background"), background.id);
    }
  }
});

test("artwork requests default safely and isolate the export palette", () => {
  assert.equal(parseColorPalette(new URLSearchParams()), DEFAULT_COLOR_PALETTE);
  for (const query of ["palette=unknown", "palette=clasico-rojo&palette=clasico-rojo", "palette=%23FF0000"]) {
    assert.equal(parseColorPalette(new URLSearchParams(query)), null);
  }
  const normal = getPlayerAvatarUrl(" Alex ");
  const exportAvatar = getPlayerAvatarUrl(" Alex ", "azul-electrico");
  assert.notEqual(normal, exportAvatar);
  assert.match(normal, /\/v3\?/);
  assert.equal(new URL(normal, "https://example.test").searchParams.get("name"), "Alex");
  assert.equal(new URL(exportAvatar, "https://example.test").searchParams.get("palette"), "azul-electrico");
  assert.equal(getPlayerAvatarUrl(" Alex "), normal);
  const app = getArtworkStyle();
  assert.notDeepEqual(getArtworkStyle("azul-electrico"), app);
  assert.deepEqual(getArtworkStyle(), app);
  assert.equal(app.backgroundColor, "#FFFFFF");
});
