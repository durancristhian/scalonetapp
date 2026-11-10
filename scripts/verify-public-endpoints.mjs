import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const base = new URL(process.argv[2]);
assert(["http:", "https:"].includes(base.protocol));

async function get(path, accept) {
  const response = await fetch(new URL(path, base), {
    headers: { Accept: accept, "Sec-Fetch-Dest": "empty" },
  });
  const body = await response.text();
  return { response, body };
}

const pages = ["/", "/about", "/contact", "/privacy"];
for (const path of pages) {
  const { response, body } = await get(path, "text/html");
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("content-type"), /^text\/html/);
  assert.match(response.headers.get("cache-control"), /no-store/);
  const document = new JSDOM(body).window.document;
  assert.equal(document.querySelectorAll("h1").length, 1, path);
  const main = document.querySelector("main");
  assert(main, path);
  assert(
    main.textContent.length >= 500,
    `${path}: insufficient raw HTML content`,
  );
  if (path === "/") {
    const schema = JSON.parse(
      document.querySelector('script[type="application/ld+json"]').textContent,
    );
    assert.equal(schema["@type"], "SoftwareApplication");
    assert.equal(schema.author["@type"], "Person");
    assert.equal(schema.author.email, "durancristhiandev@gmail.com");
    assert.equal(schema.author.contactPoint.contactType, "support");
    assert(!("address" in schema.author));
    for (const element of document.querySelectorAll("script, style, svg"))
      element.remove();
    const text = document.body.textContent.replace(/\s+/g, " ").trim();
    const ratio = text.length / body.length;
    assert(ratio >= 0.05, `Homepage text ratio: ${ratio}`);
    console.log(
      `Homepage: ${text.length} text characters, ${(ratio * 100).toFixed(2)}% of raw HTML`,
    );
  }
  for (const markdownPath of [
    path,
    path === "/" ? "/index.md" : `${path}.md`,
  ]) {
    const { response, body } = await get(markdownPath, "text/markdown");
    assert.equal(response.status, 200, markdownPath);
    assert.match(response.headers.get("content-type"), /^text\/markdown/);
    assert.match(response.headers.get("vary"), /\bAccept\b/i);
    assert.match(body, /^# /);
    assert(!body.includes("](https://www.scalonet.app"));
    assert(body.length >= 500);
    const head = await fetch(new URL(markdownPath, base), {
      method: "HEAD",
      headers: { Accept: "text/markdown" },
    });
    assert.equal(head.status, 200, markdownPath);
    assert.equal(await head.text(), "");
  }
  const rejected = await get(path, "application/json");
  assert.equal(rejected.response.status, 406, path);
  const preferred = await get(path, "text/markdown;q=0.8, text/html;q=0.2");
  assert.match(
    preferred.response.headers.get("content-type"),
    /^text\/markdown/,
  );
  console.log(`${path}: HTML, Markdown, .md, HEAD, quality values, 406 OK`);
}

for (const path of [
  "/__agent-readiness-missing",
  "/missing/nested/page",
  "/missing.md",
  "/missing.html",
  "/missing.css",
]) {
  const { response, body } = await get(path, "text/markdown");
  assert.equal(response.status, 404, path);
  assert.match(response.headers.get("content-type"), /^text\/markdown/);
  assert.match(response.headers.get("vary"), /\bAccept\b/i);
  assert(body.length > 20 && body.includes("/llms.txt"));
  const html = await get(path, "text/html");
  assert.equal(html.response.status, 404, path);
  assert.match(html.body, /¡Offside de búsqueda!/);
}
const llms = await get("/llms.txt", "*/*");
assert.equal(llms.response.status, 200);
assert.match(llms.response.headers.get("content-type"), /^text\/plain/);
assert.match(llms.body, /^# Scalonet.app\n\n> /);
assert.match(llms.body, /## When to use this/);
for (const [, target] of llms.body.matchAll(/\]\((\/[^)]+)\)/g)) {
  const result = await get(new URL(target, base).pathname, "*/*");
  assert.equal(result.response.status, 200, target);
}
const sitemap = await get("/sitemap.xml", "*/*");
assert.equal(sitemap.response.status, 200);
const xml = new JSDOM(sitemap.body, { contentType: "application/xml" }).window
  .document;
for (const path of pages)
  assert(
    [...xml.querySelectorAll("loc")].some(
      (node) => new URL(node.textContent).pathname === path,
    ),
  );
const robots = await get("/robots.txt", "*/*");
assert.equal(robots.response.status, 200);
assert.match(robots.body, /Sitemap: https:\/\/www.scalonet.app\/sitemap.xml/);
console.log(
  "Markdown and visual HTML 404s, llms.txt and every linked resource, sitemap.xml, robots.txt OK",
);
