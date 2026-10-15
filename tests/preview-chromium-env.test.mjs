import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { getPreviewChromiumEnv } from "../utils/preview-chromium-env.ts";

test("only Preview prepares libraries or overrides launch environment", async () => {
  for (const VERCEL_ENV of [undefined, "development", "production"]) {
    const result = await getPreviewChromiumEnv({ VERCEL_ENV }, () => {
      assert.fail("must not extract libraries outside Preview");
    });
    assert.equal(result, undefined);
  }
});

test("Preview extracts the original AL2023 archive and configures only its child process", async () => {
  const before = { ...process.env };
  const environment = Object.freeze({
    VERCEL_ENV: "preview",
    LD_LIBRARY_PATH: "/existing/lib",
    OTHER_SETTING: "unchanged",
  });
  const result = await getPreviewChromiumEnv(environment, async (archive) => {
    assert.equal(archive, join(tmpdir(), "chromium-pack", "al2023.tar.br"));
    return join(tmpdir(), "al2023");
  });
  assert.deepEqual(result, {
    ...environment,
    LD_LIBRARY_PATH: `${join(tmpdir(), "al2023", "lib")}:/existing/lib`,
    FONTCONFIG_PATH: join(tmpdir(), "fonts"),
  });
  assert.notEqual(result, environment);
  assert.deepEqual({ ...process.env }, before);
});

test("Preview preserves custom fonts and handles an absent library path", async () => {
  const result = await getPreviewChromiumEnv(
    { VERCEL_ENV: "preview", FONTCONFIG_PATH: "/custom/fonts" },
    async () => join(tmpdir(), "al2023")
  );
  assert.equal(result.FONTCONFIG_PATH, "/custom/fonts");
  assert.equal(result.LD_LIBRARY_PATH, join(tmpdir(), "al2023", "lib"));
});

test("failed library extraction stops Preview launch", async () => {
  await assert.rejects(
    getPreviewChromiumEnv({ VERCEL_ENV: "preview" }, async () => {
      throw new Error("missing archive");
    }),
    /missing archive/
  );
});
