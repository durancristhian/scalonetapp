import { getMatchById } from "@/server/queries/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer";

const getBrowser: () => Promise<Browser> = async () =>
  process.env.NODE_ENV === "production"
    ? /* We connect to browserless in prod */
      puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_TOKEN}`,
      })
    : /* We use the puppeteer's bundled version of Chromium in other environments */
      puppeteer.launch();

const getAppDomain: () => string = () =>
  process.env.NODE_ENV === "production"
    ? "https://www.scalonet.app"
    : "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    /* pathname here will be /download/[match-id] */
    const pathname = request.nextUrl.pathname;
    /* We split the string by / and we grab the matchId */
    const [, , matchIdStr] = pathname.split("/");
    const matchId = Number(matchIdStr);

    /* We look for the match data in the db */
    const match = await getMatchById(matchId);

    if (!match) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.not_found },
        { status: 404 }
      );
    }

    const browser = await getBrowser();

    const page = await browser.newPage();
    page.setViewport({
      /* Height here is pointless (but needed) since we take a fullpage screenshot */
      height: 300,
      width: 1080,
    });
    await page.goto(`${getAppDomain()}/download/${matchId}/ui`);
    /* We add the match data to localStorage */
    await page.evaluate((data) => {
      window.localStorage.setItem("match", JSON.stringify(data));
    }, match);
    /* We navigate AGAIN to the same page so we have access to the localStorage data :) YES, IT'S A HACK */
    await page.goto(`${getAppDomain()}/download/${matchId}/ui`, {
      waitUntil: "networkidle0",
    });

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

    return NextResponse.json(
      { error: ERROR_MESSAGES.server_error },
      { status: 404 }
    );
  }
}
