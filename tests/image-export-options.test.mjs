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

test("defaults and all 60 combinations survive the download request boundary", () => {
  assert.deepEqual(
    parseImageExportOptions(new URLSearchParams()),
    DEFAULT_IMAGE_EXPORT_OPTIONS,
  );
  for (const { id: font } of IMAGE_EXPORT_FONTS)
    for (const { id: background } of IMAGE_EXPORT_BACKGROUNDS)
      for (const avatarShape of ["circle", "square"])
        for (const columns of [1, 2]) {
          const options = { font, background, avatarShape, columns };
          assert.deepEqual(
            parseImageExportOptions(imageExportSearchParams(options)),
            options,
          );
        }
});

test("invalid and repeated options are rejected instead of changing the requested image", () => {
  for (const query of [
    "font=unknown",
    "font=teko&font=work-sans",
    "background=https://evil.test/a.svg",
    "background=dots&background=dots",
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
      font: "teko",
      background: "belgium",
      avatarShape: "square",
      columns: 2,
    };
    storeImageExportOptions(custom);
    assert.deepEqual(readImageExportOptions(), custom);
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
  } finally {
    globalThis.fetch = original;
  }
});
