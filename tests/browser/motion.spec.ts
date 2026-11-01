import { expect, test } from "@playwright/test";

for (const [width, height] of [
  [320, 568],
  [768, 1024],
  [1024, 768],
  [1280, 800],
]) {
  test.describe(`${width}x${height}`, () => {
    test.use({ viewport: { width, height } });

    test("shows the hundredth list item promptly alongside the first", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto("/?motion");
      await expect(
        page.locator('[aria-label="Jugadores"]').locator(".."),
      ).toHaveCSS("opacity", "1", { timeout: 1000 });
      await expect(
        page
          .getByRole("button", { name: "Jugador 100", exact: true })
          .locator(".."),
      ).toHaveCSS("opacity", "1", { timeout: 1000 });
      await expect(
        page.getByRole("button", { name: "Jugador 1", exact: true }),
      ).toBeVisible();
      const timing = await page
        .locator('[aria-label="Jugadores"]')
        .evaluate((list) => {
          const route = getComputedStyle(list.parentElement!);
          return {
            routeAnimated: route.animationName !== "none",
            routeDuration: parseFloat(route.animationDuration),
            items: [...list.children].map((item) => {
              const style = getComputedStyle(item);
              return {
                animated: style.animationName !== "none",
                delay: parseFloat(style.animationDelay),
                duration: parseFloat(style.animationDuration),
              };
            }),
          };
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const last = page.getByRole("button", {
        name: "Jugador 100",
        exact: true,
      });
      await last.scrollIntoViewIfNeeded();
      await expect(last).toBeInViewport();
      expect(timing.routeAnimated).toBe(true);
      expect(timing.routeDuration).toBeGreaterThan(0);
      expect(timing.routeDuration).toBeLessThanOrEqual(0.5);
      expect(
        timing.items.every(
          (item) =>
            item.animated &&
            item.delay === 0 &&
            item.duration > 0 &&
            item.duration <= 0.15,
        ),
      ).toBe(true);
    });

    test("keeps route and list content static with reduced motion", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/?motion");
      await expect(
        page.locator('[aria-label="Jugadores"]').locator(".."),
      ).toHaveCSS("opacity", "1", { timeout: 1000 });
      await expect(
        page.getByRole("button", { name: "Jugador 100", exact: true }),
      ).toBeVisible();
      expect(
        await page.locator('[aria-label="Jugadores"]').evaluate((list) => {
          const elements = [list.parentElement!, ...list.children];
          return elements.every((element) => {
            const style = getComputedStyle(element);
            return (
              style.animationName === "none" &&
              style.opacity === "1" &&
              style.transform === "none"
            );
          });
        }),
      ).toBe(true);
    });
  });
}
