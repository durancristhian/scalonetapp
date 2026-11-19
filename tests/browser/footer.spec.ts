import { expect, test } from "@playwright/test";

for (const [width, height] of [
  [320, 568],
  [768, 1024],
  [1024, 768],
  [1280, 800],
]) {
  test(`footer keeps navigation and author usable at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?footer");
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
    await expect(page.getByRole("dialog")).toHaveAccessibleName(
      "Cristhian Duran",
    );
    const panel = (await page.getByRole("dialog").boundingBox())!;
    const emailLines = await email.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return [...range.getClientRects()].map((rect) => ({
        left: rect.left,
        right: rect.right,
      }));
    });
    expect(emailLines).toHaveLength(1);
    for (const line of emailLines) {
      expect(line.left).toBeGreaterThanOrEqual(panel.x);
      expect(line.right).toBeLessThanOrEqual(panel.x + panel.width);
    }
    await page.keyboard.press("Escape");
    await expect(author).toBeFocused();
  });
}

for (const width of [320, 1280, 1311, 1313, 1920]) {
  test(`public header and footer share the page shell at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/?footer");
    const logo = (await page
      .getByRole("banner")
      .getByRole("link", { name: "scalonet.app", exact: true })
      .boundingBox())!;
    const footer = page.getByRole("contentinfo");
    const navigation = (await footer
      .getByRole("navigation", { name: "Información" })
      .boundingBox())!;
    const author = (await footer
      .getByRole("button", { name: /Hecho por/ })
      .boundingBox())!;
    const pageWidth = await page.evaluate(
      () => document.body.getBoundingClientRect().width,
    );
    const shellLeft = Math.max(16, (pageWidth - 1280) / 2 + 16);
    expect(Math.abs(logo.x - shellLeft)).toBeLessThan(1);
    expect(Math.abs(navigation.x - shellLeft)).toBeLessThan(1);
    if (width > 320)
      expect(
        Math.abs(author.x + author.width - (pageWidth - shellLeft)),
      ).toBeLessThan(1);
  });
}

for (const [width, height] of [
  [320, 568],
  [768, 1024],
  [1024, 768],
  [1280, 800],
]) {
  test(`signed-in footer keeps information links beside feedback at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?footer&signed-in");
    const footer = page.getByRole("contentinfo");
    const navigation = footer.getByRole("navigation", { name: "Información" });
    const feedback = footer.getByRole("button", { name: "Feedback" });
    const author = footer.getByRole("button", { name: /Hecho por/ });
    const navigationBox = (await navigation.boundingBox())!;
    const feedbackBox = (await feedback.boundingBox())!;
    const authorBox = (await author.boundingBox())!;
    expect(feedbackBox.height).toBeGreaterThanOrEqual(48);
    expect(authorBox.height).toBeGreaterThanOrEqual(48);
    if (width === 320) {
      expect(feedbackBox.y).toBeGreaterThanOrEqual(
        navigationBox.y + navigationBox.height,
      );
      expect(authorBox.y).toBeGreaterThanOrEqual(
        feedbackBox.y + feedbackBox.height,
      );
    } else {
      expect(Math.abs(feedbackBox.y - navigationBox.y)).toBeLessThan(1);
      expect(Math.abs(authorBox.y - navigationBox.y)).toBeLessThan(1);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await navigation
      .getByRole("link", { name: "Privacidad", exact: true })
      .focus();
    await page.keyboard.press("Tab");
    await expect(feedback).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toHaveAccessibleName(
      "¿Qué te gustaría decirme?",
    );
    await page.keyboard.press("Escape");
    await expect(feedback).toBeFocused();
  });
}
