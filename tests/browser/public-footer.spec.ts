import { expect, test } from "@playwright/test";

for (const [width, height] of [
  [320, 568],
  [768, 1024],
  [1024, 768],
  [1280, 800],
]) {
  test(`public footer keeps navigation and author usable at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?public-footer");
    const header = page.getByRole("banner");
    await expect(
      header.getByRole("link", { name: "scalonet.app", exact: true }),
    ).toHaveAttribute("href", "/");
    const headerBox = (await header.boundingBox())!;
    expect(headerBox.height).toBe(width < 768 ? 49 : 57);
    const footer = page.getByRole("contentinfo");
    const navigation = footer.getByRole("navigation", { name: "Información" });
    for (const [name, href] of [
      ["Acerca de", "/about"],
      ["Contacto", "/contact"],
      ["Privacidad", "/privacy"],
    ]) {
      const link = navigation.getByRole("link", { name, exact: true });
      await expect(link).toHaveAttribute("href", href);
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
    }
    const author = footer.getByRole("button", { name: /Hecho por/ });
    const navigationBox = (await navigation.boundingBox())!;
    const authorBox = (await author.boundingBox())!;
    if (width === 320)
      expect(authorBox.y).toBeGreaterThanOrEqual(
        navigationBox.y + navigationBox.height,
      );
    else expect(Math.abs(authorBox.y - navigationBox.y)).toBeLessThan(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await navigation
      .getByRole("link", { name: "Acerca de", exact: true })
      .focus();
    await expect(
      navigation.getByRole("link", { name: "Acerca de", exact: true }),
    ).toBeFocused();
    await author.click();
    const email = page.getByText("durancristhiandev@gmail.com");
    await expect(email).toBeVisible();
    const panel = (await page.getByRole("dialog").boundingBox())!;
    const emailLines = await email.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return [...range.getClientRects()].map((rect) => ({
        left: rect.left,
        right: rect.right,
      }));
    });
    for (const line of emailLines) {
      expect(line.left).toBeGreaterThanOrEqual(panel.x);
      expect(line.right).toBeLessThanOrEqual(panel.x + panel.width);
    }
    await page.keyboard.press("Escape");
    await expect(author).toBeFocused();
  });
}
