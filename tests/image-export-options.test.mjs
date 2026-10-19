import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  IMAGE_EXPORT_FONTS,
  IMAGE_EXPORT_BACKGROUNDS,
  IMAGE_EXPORT_STORAGE_KEY,
  parseImageExportOptions,
  imageExportSearchParams,
  readImageExportOptions,
  storeImageExportOptions,
} from "../utils/image-export-options.ts";
import { fetchTeamExport } from "../utils/fetch-team-export.ts";
import { COLOR_PALETTES, DEFAULT_COLOR_PALETTE } from "../utils/color-palettes.ts";
import { getPlayerAvatarUrl } from "../utils/player-avatar.ts";

test("defaults and all 480 combinations survive the download request boundary", () => {
  assert.equal(DEFAULT_IMAGE_EXPORT_OPTIONS.background, "germany");
  assert.deepEqual(IMAGE_EXPORT_BACKGROUNDS.map(({ id }) => id), ["germany", "portugal", "croatia", "belgium"]);
  assert.deepEqual(
    parseImageExportOptions(new URLSearchParams()),
    DEFAULT_IMAGE_EXPORT_OPTIONS,
  );
  for (const { id: font } of IMAGE_EXPORT_FONTS)
    for (const { id: background } of IMAGE_EXPORT_BACKGROUNDS)
      for (const { id: palette } of COLOR_PALETTES)
      for (const avatarShape of ["circle", "square"])
        for (const columns of [1, 2]) {
          const options = { font, background, palette, avatarShape, columns };
          assert.deepEqual(
            parseImageExportOptions(imageExportSearchParams(options)),
            options,
          );
        }
});

test("invalid and repeated options are rejected instead of changing the requested image", () => {
  for (const query of [
    "font=unknown",
    "palette=unknown",
    "palette=clasico-rojo&palette=fuego-de-estadio",
    "palette=",
    "font=teko",
    "font=barlow-condensed",
    "font=exo-2&font=work-sans",
    "background=https://evil.test/a.svg",
    "background=dots",
    "background=germany&background=germany",
    "avatarShape=rounded",
    "columns=3",
    "columns=1&columns=2",
    "__proto__=x",
    "constructor=x",
  ]) {
    assert.equal(
      parseImageExportOptions(new URLSearchParams(query)),
      null,
      query,
    );
  }
});

test("preferences tolerate missing, corrupted and unavailable storage; reset persists defaults", () => {
  const storage = new Map();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  });
  try {
    for (const value of [null, "{", "null", "[]", '{"font":"retired"}']) {
      if (value === null) storage.clear();
      else storage.set(IMAGE_EXPORT_STORAGE_KEY, value);
      assert.deepEqual(readImageExportOptions(), DEFAULT_IMAGE_EXPORT_OPTIONS);
    }
    const custom = {
      palette: "fuego-de-estadio",
      font: "exo-2",
      background: "belgium",
      avatarShape: "square",
      columns: 2,
    };
    storeImageExportOptions(custom);
    assert.deepEqual(readImageExportOptions(), custom);
    for (const [retired, replacement] of [["teko", "exo-2"], ["barlow-condensed", "saira"]]) {
      storage.set(IMAGE_EXPORT_STORAGE_KEY, JSON.stringify({ ...custom, font: retired }));
      assert.deepEqual(readImageExportOptions(), { ...custom, font: replacement });
    }
    // Old preferences retain the user's settings and acquire the new default.
    const { palette, ...legacy } = custom;
    storage.set(IMAGE_EXPORT_STORAGE_KEY, JSON.stringify(legacy));
    assert.deepEqual(readImageExportOptions(), { ...legacy, palette: DEFAULT_COLOR_PALETTE });
    // Retired dots migrate without losing other choices, including older palettes.
    for (const preferences of [custom, legacy]) {
      storage.set(IMAGE_EXPORT_STORAGE_KEY, JSON.stringify({ ...preferences, background: "dots" }));
      assert.deepEqual(readImageExportOptions(), {
        ...preferences,
        palette: preferences.palette ?? DEFAULT_COLOR_PALETTE,
        background: "germany",
      });
    }
    // Export preferences never change avatars in the rest of the application.
    storeImageExportOptions(custom);
    assert.equal(new URL(getPlayerAvatarUrl("Alex"), "https://example.test").searchParams.get("palette"), DEFAULT_COLOR_PALETTE);
    storeImageExportOptions(DEFAULT_IMAGE_EXPORT_OPTIONS);
    assert.deepEqual(readImageExportOptions(), DEFAULT_IMAGE_EXPORT_OPTIONS);
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("Storage blocked");
      },
    });
    assert.deepEqual(readImageExportOptions(), DEFAULT_IMAGE_EXPORT_OPTIONS);
    assert.doesNotThrow(() => storeImageExportOptions(custom));
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  }
});

test("download validates status, content type and nonempty PNG data", async () => {
  const original = globalThis.fetch;
  try {
    for (const response of [
      new Response("error", { status: 500 }),
      new Response("{}", { headers: { "content-type": "application/json" } }),
      new Response(null, { headers: { "content-type": "image/png" } }),
    ]) {
      globalThis.fetch = async () => response;
      await assert.rejects(fetchTeamExport(1));
    }
    globalThis.fetch = async (url) => {
      const params = new URL(url, "https://example.test").searchParams;
      assert.deepEqual(
        parseImageExportOptions(params),
        DEFAULT_IMAGE_EXPORT_OPTIONS,
      );
      return new Response(new Uint8Array([137, 80, 78, 71]), {
        headers: { "content-type": "image/png" },
      });
    };
    assert.equal((await fetchTeamExport(1)).size, 4);
    const selected = { ...DEFAULT_IMAGE_EXPORT_OPTIONS, palette: "pista-violeta", background: "croatia" };
    globalThis.fetch = async (url) => {
      assert.deepEqual(parseImageExportOptions(new URL(url, "https://example.test").searchParams), selected);
      return new Response(new Uint8Array([137, 80, 78, 71]), {
        headers: { "content-type": "image/png" },
      });
    };
    assert.equal((await fetchTeamExport(1, selected)).size, 4);
  } finally {
    globalThis.fetch = original;
  }
});
