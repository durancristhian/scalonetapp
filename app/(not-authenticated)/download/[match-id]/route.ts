import { getMatchByIdQuery } from "@/server/queries/match";
import { type ImageExportWindow } from "@/types/image-export";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { getPlayerAvatarUrl } from "@/utils/player-avatar";
import { waitForImageExport } from "@/utils/wait-for-image-export";
import {
  getImageExportRequestHeaders,
  getImageExportTarget,
  ImageExportConfigurationError,
} from "@/utils/image-export-target";
import { IMAGE_EXPORT_WIDTH } from "@/utils/image-export-options";
import { parseImageExportRequest } from "@/utils/image-export-request";
import {
  getImageExportBackground,
  getImageExportBackgroundUrls,
} from "@/utils/image-export-background";
import { type NextRequest, NextResponse } from "next/server";
import { type Browser } from "puppeteer-core";
import { getSavedTeamsError } from "@/utils/team-validation";
import { readSavedTeams } from "@/utils/read-saved-teams";
import { lineupFingerprint } from "@/utils/lineup-fingerprint";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v153.0.0/chromium-v153.0.0-pack.x64.tar";
let chromiumExecutablePath: Promise<string> | undefined;

const getBrowser: () => Promise<Browser> = async () => {
  if (process.env.NODE_ENV === "production") {
    const chromium = await import("@sparticuz/chromium-min").then(
      (mod) => mod.default,
    );

    chromium.setGraphicsMode = false;

    const puppeteerCore = await import("puppeteer-core").then(
      (mod) => mod.default,
    );

    chromiumExecutablePath ??= chromium
      .executablePath(CHROMIUM_PACK_URL)
      .catch((error) => {
        chromiumExecutablePath = undefined;
        throw error;
      });

    return puppeteerCore.launch({
      args: await puppeteerCore.defaultArgs({
        args: chromium.args,
        headless: "shell",
      }),
      executablePath: await chromiumExecutablePath,
      headless: "shell",
    });
  } else {
    const puppeteer = await import("puppeteer").then((mod) => mod.default);

    const browser = await puppeteer.launch();

    return browser as unknown as Browser;
  }
};

export async function GET(request: NextRequest) {
  const exportRequest = parseImageExportRequest(request.nextUrl.searchParams);
  if (!exportRequest) {
    return NextResponse.json(
      { error: "Opciones de imagen no válidas." },
      { status: 400 },
    );
  }
  const { options, selections } = exportRequest;
  let browser;

  try {
    const exportTarget = getImageExportTarget();
    const pathname = request.nextUrl.pathname;
    const [, , matchIdStr] = pathname.split("/");
    const matchId = Number(matchIdStr);

    const match = await getMatchByIdQuery(matchId);

    if (!match) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.not_found },
        { status: 404 },
      );
    }

    let teams: unknown;
    try {
      teams = JSON.parse(match.teams);
    } catch {
      teams = null;
    }
    const teamsError = getSavedTeamsError(
      teams,
      match.players.map((player) => player.id),
    );
    if (teamsError) {
      return NextResponse.json({ error: teamsError }, { status: 422 });
    }
    const savedTeams = readSavedTeams(match.teams);
    const assignedPlayerIds = new Set(
      savedTeams.flatMap((team) => team.players),
    );

    const expected = request.headers.get("X-Lineup-Fingerprint");
    if (expected) {
      const players = new Map(
        match.players.map((player) => [player.id, player]),
      );
      const hydrated = savedTeams.map((team) => ({
        ...team,
        players: team.players.flatMap((id) => {
          const player = players.get(id);
          return player ? [player] : [];
        }),
      }));
      if (expected !== (await lineupFingerprint(match.name, hydrated))) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.match_export_changed },
          { status: 409 },
        );
      }
    }

    browser = await getBrowser();

    const page = await browser.newPage();
    if (exportTarget.bypassSecret) {
      await page.setRequestInterception(true);
      page.on("request", (browserRequest) =>
        browserRequest.continue({
          headers: getImageExportRequestHeaders(
            browserRequest.url(),
            browserRequest.headers(),
            exportTarget,
          ),
        }),
      );
    }
    await page.setViewport({
      height: 300,
      width: IMAGE_EXPORT_WIDTH,
      deviceScaleFactor: 2,
    });
    const exportUrl = `${exportTarget.origin}/download/${matchId}/ui`;
    await page.evaluateOnNewDocument(
      (data, url, imageOptions, playerRoles) => {
        if (window === window.top && window.location.href === url) {
          (window as ImageExportWindow).__SCALONETA_EXPORT_MATCH__ = data;
          (window as ImageExportWindow).__SCALONETA_EXPORT_OPTIONS__ =
            imageOptions;
          (window as ImageExportWindow).__SCALONETA_EXPORT_PLAYER_ROLES__ =
            playerRoles;
        }
      },
      match,
      exportUrl,
      options,
      selections,
    );
    const navigateToExport = async () => {
      const response = await page.goto(exportUrl);
      if (
        process.env.VERCEL_ENV === "preview" &&
        (!response?.ok() || new URL(page.url()).origin !== exportTarget.origin)
      ) {
        throw new ImageExportConfigurationError(
          "Preview image export could not access its deployment. Check deployment protection and VERCEL_AUTOMATION_BYPASS_SECRET.",
        );
      }
    };
    await navigateToExport();
    await waitForImageExport(
      page,
      match.name,
      options.avatarShape === "none"
        ? []
        : match.players
            .filter((player) => assignedPlayerIds.has(player.id))
            .flatMap((player) => [
              player.avatar,
              getPlayerAvatarUrl(
                player.name,
                getImageExportBackground(options.background)!.palette,
              ),
            ]),
      getImageExportBackgroundUrls(options),
    );

    const canvas = await page.waitForSelector("[data-team-export]");
    if (!canvas) throw new Error("Image export canvas did not render.");
    const screenshot = await canvas.screenshot({ type: "png" });

    for (const page of await browser.pages()) {
      await page.close();
    }
    await browser.close();

    const response = new NextResponse(Buffer.from(screenshot));
    response.headers.set("content-type", "image/png");
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename=equipos.png`,
    );

    return response;
  } catch (error) {
    console.error(error);

    if (browser) {
      await Promise.race([browser.close(), browser.close(), browser.close()]);
    }

    if (error instanceof ImageExportConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: ERROR_MESSAGES.server_error },
      { status: 404 },
    );
  }
}
