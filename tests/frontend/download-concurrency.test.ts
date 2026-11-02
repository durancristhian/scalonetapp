import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deferred, match, player, teams } from "../fixtures";

const boundary = vi.hoisted(() => ({
  query: vi.fn(),
  prepare: vi.fn(),
  launch: vi.fn(),
}));
vi.mock("@/server/queries/match", () => ({
  getMatchByIdQuery: boundary.query,
}));
vi.mock("@/server/prepare-team-export", () => ({
  prepareTeamExport: boundary.prepare,
}));
vi.mock("puppeteer", () => ({ default: { launch: boundary.launch } }));
vi.mock("@/utils/wait-for-image-export", () => ({
  waitForImageExport: vi.fn(),
}));

import { GET } from "@/app/(not-authenticated)/download/[match-id]/route";

function request() {
  return new NextRequest("http://localhost:3000/download/1");
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("IMAGE_EXPORT_ORIGIN", "http://localhost:3000");
  const players = Array.from({ length: 32 }, (_, i) => player(i + 1));
  boundary.query.mockResolvedValue(
    match(
      players,
      JSON.stringify(
        teams(players.slice(0, 16), players.slice(16)).map((team) => ({
          ...team,
          players: team.players.map((player) => player.id),
        })),
      ),
    ),
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.unstubAllEnvs());

function browserFixture() {
  const closing = deferred<void>();
  const encoding = deferred<{
    data: Buffer;
    contentType: string;
    filename: string;
  }>();
  const page = {
    setViewport: vi.fn(),
    evaluateOnNewDocument: vi.fn(),
    goto: vi.fn(),
    waitForSelector: vi.fn().mockResolvedValue({
      screenshot: vi.fn().mockResolvedValue(Buffer.from("capture")),
    }),
    close: vi.fn().mockResolvedValue(undefined),
  };
  const browser = {
    newPage: vi.fn().mockResolvedValue(page),
    pages: vi.fn().mockResolvedValue([page]),
    close: vi
      .fn()
      .mockImplementationOnce(() => closing.promise)
      .mockResolvedValue(undefined),
  };
  boundary.launch.mockResolvedValue(browser);
  boundary.prepare.mockReturnValue(encoding.promise);
  return { closing, encoding, browser };
}

const image = {
  data: Buffer.from("encoded"),
  contentType: "image/jpeg",
  filename: "equipos.jpg",
};

describe("download post-capture work", () => {
  it("encodes while browser cleanup is pending and waits for both before returning", async () => {
    const { closing, encoding, browser } = browserFixture();
    let finished = false;
    const response = GET(request()).then((result) => {
      finished = true;
      return result;
    });
    await vi.waitFor(() => expect(browser.close).toHaveBeenCalled());
    expect(boundary.prepare).toHaveBeenCalledWith(Buffer.from("capture"));
    encoding.resolve(image);
    await new Promise((resolve) => setImmediate(resolve));
    expect(finished).toBe(false);
    closing.resolve();
    const result = await response;
    expect(result.status).toBe(200);
    expect(result.headers.get("content-type")).toBe("image/jpeg");
    expect(result.headers.get("content-disposition")).toBe(
      "attachment; filename=equipos.jpg",
    );
    expect(Buffer.from(await result.arrayBuffer())).toEqual(image.data);
  });

  it("waits for cleanup when encoding fails", async () => {
    const { closing, encoding, browser } = browserFixture();
    let finished = false;
    const response = GET(request()).then((result) => {
      finished = true;
      return result;
    });
    await vi.waitFor(() => expect(browser.close).toHaveBeenCalled());
    encoding.reject(new Error("encoding failed"));
    await new Promise((resolve) => setImmediate(resolve));
    expect(finished).toBe(false);
    closing.resolve();
    expect((await response).status).toBe(404);
  });

  it("does not return an image when cleanup fails", async () => {
    const { closing, encoding, browser } = browserFixture();
    const response = GET(request());
    await vi.waitFor(() => expect(browser.close).toHaveBeenCalled());
    closing.reject(new Error("cleanup failed"));
    encoding.resolve(image);
    expect((await response).status).toBe(404);
  });
});
