import { NextRequest, type NextFetchEvent } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import proxy from "@/proxy";

const boundary = vi.hoisted(() => ({
  protect: vi.fn(),
  userId: null as string | null,
}));
vi.mock("@clerk/nextjs/server", () => ({
  createRouteMatcher: () => (request: NextRequest) =>
    /^\/(dashboard|partidos)/.test(request.nextUrl.pathname),
  clerkMiddleware:
    (
      callback: (
        auth: (() => Promise<{ userId: string | null }>) & {
          protect: typeof boundary.protect;
        },
        request: NextRequest,
      ) => Promise<Response>,
    ) =>
    (request: NextRequest) =>
      callback(
        Object.assign(async () => ({ userId: boundary.userId }), {
          protect: boundary.protect,
        }),
        request,
      ),
}));

beforeEach(() => {
  boundary.protect.mockResolvedValue(undefined);
  boundary.userId = null;
});

const send = (
  path: string,
  headers: Record<string, string> = { Accept: "text/markdown" },
) =>
  proxy(
    new NextRequest(`https://www.scalonet.app${path}`, { headers }),
    {} as NextFetchEvent,
  );

describe("public proxy boundaries", () => {
  it("returns public Markdown without needing authentication", async () => {
    const response = await send("/");
    expect(response!.status).toBe(200);
    expect(await response!.text()).toContain("# Scalonet.app");
    expect(boundary.protect).not.toHaveBeenCalled();
  });
  it.each(["/dashboard", "/partidos/123"])(
    "protects %s before negotiating a fallback",
    async (path) => {
      boundary.protect.mockRejectedValue(new Error("AUTH_REQUIRED"));
      await expect(send(path)).rejects.toThrow("AUTH_REQUIRED");
    },
  );
  it("sends a signed-in visitor from the landing page to the dashboard", async () => {
    boundary.userId = "agent";
    const response = await send("/", { Accept: "text/html" });
    expect(response!.status).toBe(307);
    expect(response!.headers.get("location")).toBe(
      "https://www.scalonet.app/dashboard",
    );
  });
  it("serves the landing page to an anonymous visitor", async () => {
    const response = await send("/", { Accept: "text/html" });
    expect(response!.headers.get("location")).toBeNull();
  });
  it("marks only Markdown reads for the fallback rewrite", async () => {
    const response = await send("/missing");
    expect(
      response!.headers.get("x-middleware-request-x-scalonet-markdown"),
    ).toBe("1");
  });
  it("does not let a supplied fallback header change HTML routing", async () => {
    const response = await send("/missing", {
      Accept: "text/html",
      "x-scalonet-markdown": "1",
    });
    expect(
      response!.headers.get("x-middleware-request-x-scalonet-markdown"),
    ).toBeNull();
  });
  it("does not rewrite React navigation as a Markdown error", async () => {
    const response = await send("/missing", {
      Accept: "text/markdown",
      rsc: "1",
    });
    expect(
      response!.headers.get("x-middleware-request-x-scalonet-markdown"),
    ).toBeNull();
  });
});
