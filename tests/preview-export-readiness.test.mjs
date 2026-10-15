import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import test from "node:test";
import puppeteer from "puppeteer";
import { waitForPreviewExport } from "../utils/wait-for-preview-export.ts";

test("Preview waits for rendered content and assets despite ongoing background requests", async () => {
  const requests = [];
  const server = createServer((request, response) => {
    requests.push(request.url);
    if (request.url === "/background" || request.url === "/stalled.svg") {
      return;
    }
    if (request.url === "/slow.svg") {
      setTimeout(() => {
        response.setHeader("Content-Type", "image/svg+xml");
        response.end('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>');
      }, 600);
      return;
    }
    if (request.url === "/missing.svg") {
      response.writeHead(404);
      response.end();
      return;
    }
    response.setHeader("Content-Type", "text/html");
    response.end(`<!doctype html><body><script>
      fetch('/background');
      window.fontsReady = false;
      Object.defineProperty(document.fonts, 'ready', {
        get: () => new Promise(resolve => setTimeout(() => {
          window.fontsReady = true;
          resolve(document.fonts);
        }, 900))
      });
      setTimeout(() => {
        const heading = document.createElement('h1');
        heading.textContent = 'Preview fixture';
        document.body.append(heading);
        const avatar = new Image();
        avatar.id = 'avatar';
        avatar.onload = () => document.body.append(avatar);
        avatar.src = '/slow.svg';
      }, 50);
    </script></body>`);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.goto(origin, { waitUntil: "domcontentloaded" });
    const started = Date.now();
    await waitForPreviewExport(page, "Preview fixture", [
      `${origin}/slow.svg`,
      `${origin}/missing.svg`,
      `${origin}/stalled.svg`,
      "",
    ]);
    const elapsed = Date.now() - started;
    assert.ok(elapsed >= 5_000, "stalled avatar gets its bounded loading window");
    assert.ok(elapsed < 15_000, "background traffic must not block export");
    assert.ok(requests.includes("/background"));
    assert.ok(requests.includes("/missing.svg"));
    assert.deepEqual(
      await page.evaluate(() => ({
        heading: document.querySelector("h1")?.textContent,
        fontsReady: window.fontsReady,
        avatarReady: document.querySelector("#avatar")?.complete,
      })),
      { heading: "Preview fixture", fontsReady: true, avatarReady: true }
    );
  } finally {
    await browser?.close();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
