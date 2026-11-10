import type { MatchWithPlayers } from "@/types/match";
import type { ImageExportWindow } from "@/types/image-export";
import type { ImageExportOptions } from "@/utils/image-export-options";
import type { ImageExportTeamSelections } from "@/utils/image-export-player-roles";
import { IMAGE_EXPORT_WIDTH } from "@/utils/image-export-options";
import { getPlayerAvatarUrl } from "@/utils/player-avatar";
import { waitForImageExport } from "@/utils/wait-for-image-export";
import {
  getImageExportRequestHeaders,
  getImageExportTarget,
  ImageExportConfigurationError,
} from "@/utils/image-export-target";
import {
  getImageExportBackground,
  getImageExportBackgroundUrls,
} from "@/utils/image-export-background";
import { readSavedTeams } from "@/utils/read-saved-teams";
import { prepareTeamExport } from "@/server/prepare-team-export";
import type { Browser } from "puppeteer-core";

const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v153.0.0/chromium-v153.0.0-pack.x64.tar";
let chromiumExecutablePath: Promise<string> | undefined;

const getBrowser: () => Promise<Browser> = async () => {
  if (process.env.NODE_ENV === "production") {
    const [chromium, puppeteerCore] = await Promise.all([
      import("@sparticuz/chromium-min").then((mod) => mod.default),
      import("puppeteer-core").then((mod) => mod.default),
    ]);

    chromium.setGraphicsMode = false;

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

export async function captureTeamExport(
  match: MatchWithPlayers,
  options: ImageExportOptions,
  selections: ImageExportTeamSelections,
  exportTarget: ReturnType<typeof getImageExportTarget>,
) {
  const assignedPlayerIds = new Set(
    readSavedTeams(match.teams).flatMap((team) => team.players),
  );
  const browser = await getBrowser();
  let closing: Promise<void> | undefined;
  const closeBrowser = () =>
    (closing ??= (async () => {
      try {
        for (const page of await browser.pages()) await page.close();
      } finally {
        await browser.close();
      }
    })());
  try {
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
    const exportUrl = `${exportTarget.origin}/download/${match.id}/ui`;
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

    const [cleanup, prepared] = await Promise.allSettled([
      closeBrowser(),
      prepareTeamExport(Buffer.from(screenshot)),
    ]);
    if (cleanup.status === "rejected") throw cleanup.reason;
    if (prepared.status === "rejected") throw prepared.reason;
    return prepared.value;
  } finally {
    await closeBrowser();
  }
}
