import { type Page } from "puppeteer-core";

export async function waitForPreviewExport(
  page: Page,
  matchName: string,
  avatarUrls: string[]
) {
  await page.waitForFunction(
    (name) => document.querySelector("h1")?.textContent === name,
    { timeout: 10_000 },
    matchName
  );

  await page.evaluate(async (urls) => {
    const fonts = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Preview export fonts did not finish loading.")),
        10_000
      );
      document.fonts.ready.then(
        () => {
          clearTimeout(timer);
          resolve();
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });

    // Radix preloads avatars before inserting <img>, so inspect expected URLs.
    const images = urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          const finish = () => {
            clearTimeout(timer);
            image.onload = null;
            image.onerror = null;
            resolve();
          };
          // Failed or stalled avatars retain the UI's existing fallback.
          const timer = setTimeout(finish, 5_000);
          image.onload = finish;
          image.onerror = finish;
          image.src = url;
        })
    );

    await Promise.all([fonts, ...images]);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }, [...new Set(avatarUrls.filter(Boolean))]);
}
