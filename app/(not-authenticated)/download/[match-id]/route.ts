/* This code was written inspired in https://github.com/gruckion/puppeteer-running-in-vercel/blob/main/src/app/api/route.ts */

import { getMatchByIdQuery } from "@/server/queries/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { NextRequest, NextResponse } from "next/server";
import { Browser } from "puppeteer-core";

export const dynamic = "force-dynamic";

const getBrowser: () => Promise<Browser> = async () => {
  if (process.env.NODE_ENV === "production") {
    const chromium = await import("@sparticuz/chromium-min").then(
      (mod) => mod.default
    );

    const puppeteerCore = await import("puppeteer-core").then(
      (mod) => mod.default
    );

    const executablePath = await chromium.executablePath(
      process.env.CHROMIUM_PATH
    );

    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    return browser;
  } else {
    const puppeteer = await import("puppeteer").then((mod) => mod.default);

    const browser = await puppeteer.launch();

    /* puppeteer's Browser type difers from puppeteer-core's Browser type so we force-cast this return to make TS happy */
    return browser as unknown as Browser;
  }
};

const getAppDomain: () => string = () =>
  process.env.NODE_ENV === "production"
    ? "https://www.scalonet.app"
    : "http://localhost:3000";

export async function GET(request: NextRequest) {
  let browser;

  try {
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
        { status: 404 }
      );
    }

    browser = await getBrowser();

    const page = await browser.newPage();
    page.setViewport({
      /* Height here is pointless (but needed) since we take a fullpage screenshot */
      height: 300,
      width: 1080,
      /* So images get a better resolution */
      deviceScaleFactor: 2,
    });
    await page.goto(`${getAppDomain()}/download/${matchId}/ui`);
    /* We add the match data to localStorage */
    await page.evaluate((data) => {
      window.localStorage.setItem("match", JSON.stringify(data));
    }, match);
    /* We navigate AGAIN to the same page so we have access to the localStorage data :) YES, IT'S A HACK */
    await page.goto(`${getAppDomain()}/download/${matchId}/ui`);
    await page.waitForNetworkIdle();

    const screenshot = await page.screenshot({
      captureBeyondViewport: true,
      fullPage: true,
      type: "png",
    });

    /* We close the browser since we don't need it anymore */
    await browser.close();

    const response = new NextResponse(screenshot);
    response.headers.set("content-type", "image/png");
    /* This header makes the response to be downloaded automatically by the user's browser */
    response.headers.set(
      "Content-Disposition",
      `attachment; filename=equipos.png`
    );

    /* We're done, we return the screenshot */
    return response;
  } catch (error) {
    console.error(error);

    if (browser) {
      browser.close();
    }

    return NextResponse.json(
      { error: ERROR_MESSAGES.server_error },
      { status: 404 }
    );
  }
}
