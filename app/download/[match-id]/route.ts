import { ERROR_MESSAGES } from "@/utils/validation-messages";
import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer";

const delay: (time: number) => Promise<void> = (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const getBrowser: () => Promise<Browser> = async () =>
  process.env.NODE_ENV === "production"
    ? /* We connect to browserless in prod */
      puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_TOKEN}`,
      })
    : /* We use the puppeteer's bundled version of Chromium in other environments */
      puppeteer.launch();

/* TODO: Change this to a POST */
export async function GET(request: NextRequest) {
  /* pathname here will be /[match-id]/export */
  const pathname = request.nextUrl.pathname;
  /* We split the string by / and we grab the matchId */
  const [_, matchIdStr] = pathname.split("/");
  const matchId = Number(matchIdStr);

  try {
    const browser = await getBrowser();

    const page = await browser.newPage();
    page.setViewport({
      height: 1920,
      width: 1080,
    });
    await page.goto(`https://www.scalonet.app/download/${matchId}/ui`);

    /* We wait a few seconds just in case */
    await delay(3000);

    const screenshot = await page.screenshot({ type: "png" });

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
    console.log(error);

    return NextResponse.json(
      { error: ERROR_MESSAGES.server_error },
      { status: 404 }
    );
  }
}
