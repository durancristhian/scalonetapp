import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { acceptRepresentation } from "@/utils/accept-representation";
import { publicResponse } from "@/server/public-response";
import { GET as llms } from "@/app/llms.txt/route";
import { GET as missing } from "@/app/agent-not-found/route";
import {
  PublicInformation,
  informationMetadata,
} from "@/components/public-information";
import {
  publicPages,
  softwareSchema,
  type PublicPath,
} from "@/utils/public-content";

const request = (path: string, accept = "text/markdown", method = "GET") =>
  new Request(`https://www.scalonet.app${path}`, {
    method,
    headers: { Accept: accept },
  });

describe("public representations", () => {
  it.each([
    [null, "html"],
    ["*/*", "html"],
    ["text/*", "html"],
    ["text/markdown", "markdown"],
    ["text/html", "html"],
    ["TEXT/MARKDOWN;Q=1, text/html;q=0.2", "markdown"],
    ["text/markdown;q=0, text/html", "html"],
    ["text/html;q=0, text/*;q=0.8", "markdown"],
    ["text/markdown;q=0, */*;q=0.5", "html"],
    ["text/markdown;q=0.3, text/html;q=0.8", "html"],
    ["text/markdown; charset=utf-8", "markdown"],
    ["application/json", null],
    ["text/markdown;q=0", null],
    ["text/markdown;variant=unknown", null],
    ["text/markdown, text/*", "markdown"],
    ["text/html;q=0.5, text/markdown;q=0.5", "html"],
  ])("negotiates %s as %s", (accept, expected) => {
    expect(acceptRepresentation(accept)).toBe(expected);
  });

  it.each(["/", ...Object.keys(publicPages)])(
    "serves Markdown and preserves HTML for %s",
    async (path) => {
      const response = publicResponse(request(path))!;
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe(
        "text/markdown; charset=utf-8",
      );
      expect(response.headers.get("vary")).toBe("Accept");
      expect(response.headers.get("cache-control")).toContain("no-store");
      const markdown = await response.text();
      expect(markdown.length).toBeGreaterThan(500);
      expect(markdown).not.toContain("](https://www.scalonet.app");
      expect(markdown).toContain("](/contact)");
      expect(publicResponse(request(path, "text/html"))).toBeNull();
      expect(publicResponse(request(path, "application/json"))!.status).toBe(
        406,
      );
      expect(
        await publicResponse(request(path, "text/markdown", "HEAD"))!.text(),
      ).toBe("");
    },
  );

  it.each(["/index.md", "/about.md", "/contact.md", "/privacy.md"])(
    "provides the linked Markdown alias %s",
    async (path) => {
      const response = publicResponse(request(path, "*/*"))!;
      expect(response.status).toBe(200);
      expect(await response.text()).toMatch(/^# /);
    },
  );

  it.each([
    "/dashboard",
    "/partidos/123",
    "/api/players/1/avatar",
    "/download/123",
    "/stats/script.js",
    "/unknown",
  ])("leaves application routing intact for %s", (path) => {
    expect(publicResponse(request(path))).toBeNull();
  });

  it("preserves RSC, actions, and non-read requests", () => {
    for (const header of ["rsc", "next-action"]) {
      const req = request("/");
      req.headers.set(header, "1");
      expect(publicResponse(req)).toBeNull();
    }
    expect(publicResponse(request("/", "text/markdown", "POST"))).toBeNull();
  });

  it("returns a real Markdown 404 with a discovery link", async () => {
    const response = missing();
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    const body = await response.text();
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain("(/llms.txt)");
  });

  it("publishes llms.txt in the specified heading and file-list format", async () => {
    const body = await llms().text();
    expect(body).toMatch(/^# Scalonet.app\n\n> /);
    expect(body).toContain("## When to use this");
    expect(body).toContain(
      "There is no public match-management API or MCP endpoint",
    );
    for (const section of body.split(/^## .+$/m).slice(1)) {
      expect(section.trim()).toMatch(/^- \[.+\]\(\//);
    }
  });

  it.each(Object.keys(publicPages))(
    "renders meaningful HTML and its own canonical for %s",
    async (path) => {
      const html = renderToString(
        <PublicInformation path={path as PublicPath} />,
      );
      const container = document.createElement("div");
      container.innerHTML = html;
      expect(container.querySelectorAll("h1")).toHaveLength(1);
      expect(container.textContent!.length).toBeGreaterThan(500);
      expect(
        informationMetadata(path as PublicPath).alternates?.canonical,
      ).toBe(`https://www.scalonet.app${path}`);
      if (path === "/contact")
        expect(html).toContain("mailto:durancristhiandev@gmail.com");
    },
  );

  it("lists all public pages in the sitemap", () => {
    const xml = readFileSync("app/sitemap.xml", "utf8");
    const document = new DOMParser().parseFromString(xml, "application/xml");
    expect(document.querySelector("parsererror")).toBeNull();
    expect(
      [...document.querySelectorAll("loc")].map((node) => node.textContent),
    ).toEqual([
      "https://www.scalonet.app/",
      ...Object.keys(publicPages).map(
        (path) => `https://www.scalonet.app${path}`,
      ),
    ]);
  });

  it("describes the actual software without invented business credentials", () => {
    expect(softwareSchema["@type"]).toBe("SoftwareApplication");
    expect(softwareSchema.url).toBe("https://www.scalonet.app/");
    expect(softwareSchema.author.name).toBe("Cristhian Duran");
    expect(softwareSchema.author.email).toBe("durancristhiandev@gmail.com");
    expect(softwareSchema.author.contactPoint).toMatchObject({
      "@type": "ContactPoint",
      contactType: "support",
      email: "durancristhiandev@gmail.com",
      url: "https://www.scalonet.app/contact",
    });
    expect(softwareSchema.author).not.toHaveProperty("address");
    expect(softwareSchema.author).not.toHaveProperty("telephone");
    expect(softwareSchema).not.toHaveProperty("offers");
    expect(softwareSchema).not.toHaveProperty("address");
  });
});
