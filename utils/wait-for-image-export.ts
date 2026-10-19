import { type Page } from "puppeteer-core";

export async function waitForImageExport(
  page: Page,
  matchName: string,
  avatarUrls: string[],
  backgroundUrl?: string,
) {
  await page.waitForFunction(
    (name) => document.querySelector("h1")?.textContent === name,
    { timeout: 10_000 },
    matchName,
  );

  await page.evaluate(
    async (urls, background) => {
      const fonts = new Promise<void>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Image export fonts did not finish loading.")),
          10_000,
        );
        document.fonts.ready.then(
          () => {
            clearTimeout(timer);
            resolve();
          },
          (error) => {
            clearTimeout(timer);
            reject(error);
          },
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
          }),
      );

      const backgroundImage = background
        ? new Promise<void>((resolve, reject) => {
            const image = new Image();
            const timer = setTimeout(
              () => reject(new Error("Image export background did not load.")),
              10_000,
            );
            image.onload = () => {
              clearTimeout(timer);
              resolve();
            };
            image.onerror = () => {
              clearTimeout(timer);
              reject(new Error("Image export background did not load."));
            };
            image.src = background;
          })
        : Promise.resolve();

      await Promise.all([fonts, backgroundImage, ...images]);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    },
    [...new Set(avatarUrls.filter(Boolean))],
    backgroundUrl,
  );
}
