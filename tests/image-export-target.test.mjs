import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import test from "node:test";
import {
  getImageExportRequestHeaders,
  getImageExportTarget,
  ImageExportConfigurationError,
} from "../utils/image-export-target.ts";

const previewEnvironment = {
  NODE_ENV: "production",
  VERCEL_ENV: "preview",
  VERCEL_URL: "scalonetapp-commit-team.vercel.app",
  VERCEL_AUTOMATION_BYPASS_SECRET: "test-only-bypass-secret",
};

test("production keeps its public origin and never uses the bypass secret", () => {
  assert.deepEqual(
    getImageExportTarget({ ...previewEnvironment, VERCEL_ENV: "production" }),
    { origin: "https://www.scalonet.app" }
  );
});

test("local development keeps port 3000", () => {
  assert.deepEqual(getImageExportTarget({ NODE_ENV: "development" }), {
    origin: "http://localhost:3000",
  });
});

test("Preview uses its deployment even though NODE_ENV is production", () => {
  assert.deepEqual(getImageExportTarget(previewEnvironment), {
    origin: "https://scalonetapp-commit-team.vercel.app",
    bypassSecret: "test-only-bypass-secret",
  });
});

test("Preview accepts an unprotected deployment without a bypass secret", () => {
  const target = getImageExportTarget({
    ...previewEnvironment,
    VERCEL_AUTOMATION_BYPASS_SECRET: undefined,
  });
  assert.equal(target.bypassSecret, undefined);
  assert.equal(target.origin, "https://scalonetapp-commit-team.vercel.app");
});

test("Preview never falls back to production for missing or invalid deployment URLs", () => {
  for (const hostname of [
    undefined,
    "",
    "www.scalonet.app",
    "localhost:3000",
    "https://preview.vercel.app",
    "preview.vercel.app/other",
    "preview.vercel.app@evil.example",
  ]) {
    assert.throws(
      () => getImageExportTarget({ ...previewEnvironment, VERCEL_URL: hostname }),
      ImageExportConfigurationError
    );
  }
});

test("the bypass header is added only to the exact deployment origin", () => {
  const target = getImageExportTarget(previewEnvironment);
  const headers = { accept: "text/html" };
  assert.deepEqual(
    getImageExportRequestHeaders(`${target.origin}/download/1/ui`, headers, target),
    { ...headers, "x-vercel-protection-bypass": target.bypassSecret }
  );
  assert.deepEqual(headers, { accept: "text/html" });
});

test("third parties and redirected requests cannot inherit the bypass header", () => {
  const target = getImageExportTarget(previewEnvironment);
  const inheritedHeaders = {
    accept: "text/html",
    "X-Vercel-Protection-Bypass": target.bypassSecret,
  };
  for (const url of [
    "https://www.scalonet.app/download/1/ui",
    "https://api.cloudinary.com/image",
    "https://another-deployment.vercel.app/",
    `${target.origin}.evil.example/`,
    `${target.origin}:8443/`,
    target.origin.replace("https:", "http:"),
    "data:text/plain,example",
  ]) {
    assert.deepEqual(
      getImageExportRequestHeaders(url, inheritedHeaders, target),
      { accept: "text/html" }
    );
  }
});

test("Puppeteer strips the bypass header on an actual cross-origin redirect", async () => {
  const received = [];
  const destination = createServer((request, response) => {
    received.push({
      origin: "destination",
      secret: request.headers["x-vercel-protection-bypass"],
    });
    response.end("Export redirect fixture");
  });
  destination.listen(0, "127.0.0.1");
  await once(destination, "listening");
  const source = createServer((request, response) => {
    received.push({
      origin: "source",
      secret: request.headers["x-vercel-protection-bypass"],
    });
    response.writeHead(302, {
      location: `http://127.0.0.1:${destination.address().port}/`,
    });
    response.end();
  });
  source.listen(0, "127.0.0.1");
  await once(source, "listening");
  let browser;
  try {
    const puppeteer = await import("puppeteer");
    browser = await puppeteer.default.launch();
    const page = await browser.newPage();
    const target = {
      origin: `http://127.0.0.1:${source.address().port}`,
      bypassSecret: "test-only-bypass-secret",
    };
    await page.setRequestInterception(true);
    page.on("request", (request) =>
      request.continue({
        headers: getImageExportRequestHeaders(
          request.url(),
          request.headers(),
          target
        ),
      })
    );
    await page.goto(target.origin);
    assert.ok(
      received.some(
        ({ origin, secret }) =>
          origin === "source" && secret === target.bypassSecret
      )
    );
    assert.ok(received.some(({ origin }) => origin === "destination"));
    assert.ok(
      received
        .filter(({ origin }) => origin === "destination")
        .every(({ secret }) => secret === undefined)
    );
  } finally {
    await browser?.close();
    await Promise.all([
      new Promise((resolve) => source.close(resolve)),
      new Promise((resolve) => destination.close(resolve)),
    ]);
  }
});
