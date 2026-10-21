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
import {
  IMAGE_EXPORT_WIDTH,
} from "@/utils/image-export-options";
import { parseImageExportRequest } from "@/utils/image-export-request";
import { getImageExportBackground, getImageExportBackgroundUrls } from "@/utils/image-export-background";
import { type NextRequest, NextResponse } from "next/server";
import { type Browser } from "puppeteer-core";
import { getSavedTeamsError } from "@/utils/team-validation";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Keep the external browser pack pinned to @sparticuz/chromium-min.
const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack.x64.tar";
let chromiumExecutablePath: Promise<string> | undefined;

const getBrowser: () => Promise<Browser> = async () => {
  if (process.env.NODE_ENV === "production") {
    const chromium = await import("@sparticuz/chromium-min").then(
      (mod) => mod.default,
    );

    const puppeteerCore = await import("puppeteer-core").then(
      (mod) => mod.default,
    );

    // Concurrent cold exports must share extraction, not partially unpacked files.
    chromiumExecutablePath ??= chromium
      .executablePath(CHROMIUM_PACK_URL)
      .catch((error) => {
        chromiumExecutablePath = undefined;
        throw error;
      });

    return puppeteerCore.launch({
      args: puppeteerCore.defaultArgs({
        args: chromium.args,
        headless: "shell",
      }),
      executablePath: await chromiumExecutablePath,
      headless: "shell",
    });
  } else {
    const puppeteer = await import("puppeteer").then((mod) => mod.default);

    const browser = await puppeteer.launch();

    /* puppeteer's Browser type difers from puppeteer-core's Browser type so we force-cast this return to make TS happy */
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
    /* pathname here will be /download/[match-id] */
    const pathname = request.nextUrl.pathname;
    /* We split the string by / and we grab the matchId */
    const [, , matchIdStr] = pathname.split("/");
    const matchId = Number(matchIdStr);

    /* We look for the match data in the db */
    const match = await getMatchByIdQuery(matchId);

    if (!match) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.not_found },
        { status: 404 },
      );
    }

    const teams: unknown = JSON.parse(match.teams);
    const teamsError = getSavedTeamsError(teams, match.players.map(player => player.id));
    if (teamsError) {
      return NextResponse.json({ error: teamsError }, { status: 422 });
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
      /* The canvas screenshot determines the final image height. */
      height: 300,
      width: IMAGE_EXPORT_WIDTH,
      /* So images get a better resolution */
      deviceScaleFactor: 2,
    });
    const exportUrl = `${exportTarget.origin}/download/${matchId}/ui`;
    // Pass this export's data before the page scripts run, without storage or reload.
    await page.evaluateOnNewDocument(
      (data, url, imageOptions, playerRoles) => {
        if (window === window.top && window.location.href === url) {
          (window as ImageExportWindow).__SCALONETA_EXPORT_MATCH__ = data;
          (window as ImageExportWindow).__SCALONETA_EXPORT_OPTIONS__ =
            imageOptions;
          (window as ImageExportWindow).__SCALONETA_EXPORT_PLAYER_ROLES__ = playerRoles;
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
      options.avatarShape === "none" ? [] : match.players.flatMap((player) => [
        player.avatar,
        getPlayerAvatarUrl(player.name, getImageExportBackground(options.background)!.palette),
      ]),
      getImageExportBackgroundUrls(options),
    );

    const canvas = await page.waitForSelector("[data-team-export]");
    if (!canvas) throw new Error("Image export canvas did not render.");
    const screenshot = await canvas.screenshot({ type: "png" });

    /* We close the pages and the browser since we don't need it anymore */
    for (const page of await browser.pages()) {
      await page.close();
    }
    await browser.close();

    const response = new NextResponse(Buffer.from(screenshot));
    response.headers.set("content-type", "image/png");
    response.headers.set("Cache-Control", "private, no-store");
    /* This header makes the response to be downloaded automatically by the user's browser */
    response.headers.set(
      "Content-Disposition",
      `attachment; filename=equipos.png`,
    );

    /* We're done, we return the screenshot */
    return response;
  } catch (error) {
    console.error(error);

    if (browser) {
      /* https://github.com/Sparticuz/chromium?tab=readme-ov-file#im-experiencing-timeouts-or-failures-closing-chromium */
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
