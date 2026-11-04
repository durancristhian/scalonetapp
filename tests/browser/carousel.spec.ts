import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 320, height: 568 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
]) {
  test(`keeps carousel controls stable through repeated keyboard navigation at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/?carousel");
    const before = page.getByRole("button", { name: "Antes del carrusel" });
    const after = page.getByRole("button", { name: "Después del carrusel" });
    const resume = page.getByRole("button", { name: "Reanudar animación" });
    const previous = page.getByRole("button", { name: "Ver ejemplo anterior" });
    const next = page.getByRole("button", { name: "Ver ejemplo siguiente" });
    const current = page.getByRole("group", { name: /Los once titulares/ });
    await before.focus();
    await page.keyboard.press("Tab");
    await expect(resume).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(previous).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(next).toBeFocused();
    const first = await current.getAttribute("aria-label");
    const visited = new Set([first]);
    for (let index = 0; index < 10; index++) {
      const label = await current.getAttribute("aria-label");
      await page.keyboard.press("Enter");
      await expect(current).not.toHaveAttribute("aria-label", label!);
      await expect(next).toBeFocused();
      visited.add(await current.getAttribute("aria-label"));
    }
    expect(visited.size).toBe(10);
    await expect(current).toHaveAttribute("aria-label", first!);
    await page.keyboard.press("Tab");
    await expect(after).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(next).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(previous).toBeFocused();
    for (let index = 0; index < 10; index++) {
      const label = await current.getAttribute("aria-label");
      await page.keyboard.press("Space");
      await expect(current).not.toHaveAttribute("aria-label", label!);
      await expect(previous).toBeFocused();
    }
    await expect(current).toHaveAttribute("aria-label", first!);
    await page.keyboard.press("Shift+Tab");
    await expect(resume).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: "Pausar animación" }),
    ).toBeFocused();
    await expect(current).not.toHaveAttribute("aria-label", first!, {
      timeout: 6500,
    });
    await page.keyboard.press("Shift+Tab");
    await expect(before).toBeFocused();
  });
}

test("keeps keyboard navigation available with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?carousel");
  await page.getByRole("button", { name: "Antes del carrusel" }).focus();
  await page.keyboard.press("Tab");
  const previous = page.getByRole("button", { name: "Ver ejemplo anterior" });
  await expect(previous).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("group", { name: /Los once titulares/ }),
  ).toHaveAttribute(
    "aria-label",
    /Potrero con nieve y avatares cuadrados centrados/,
  );
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Ver ejemplo siguiente" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Después del carrusel" }),
  ).toBeFocused();
});

for (const appearance of ["light", "dark", "forced-colors"]) {
  test(`shows keyboard focus on carousel controls in ${appearance}`, async ({
    page,
  }) => {
    if (appearance === "forced-colors") {
      await page.emulateMedia({ forcedColors: "active" });
    }
    await page.goto("/?carousel");
    if (appearance === "dark") {
      await page.evaluate(() => document.documentElement.classList.add("dark"));
    }
    await page.getByRole("button", { name: "Antes del carrusel" }).focus();
    for (const name of [
      "Reanudar animación",
      "Ver ejemplo anterior",
      "Ver ejemplo siguiente",
    ]) {
      await page.keyboard.press("Tab");
      const button = page.getByRole("button", { name });
      await expect(button).toBeFocused();
      const focus = await button.evaluate((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          width: style.outlineWidth,
          style: style.outlineStyle,
          color: style.outlineColor,
          contained:
            rect.left >= 0 &&
            rect.right <= innerWidth &&
            rect.top >= 0 &&
            rect.bottom <= innerHeight,
        };
      });
      expect(focus.width).toBe("2px");
      expect(focus.style).toBe("solid");
      expect(focus.color).not.toBe("rgba(0, 0, 0, 0)");
      expect(focus.contained).toBe(true);
    }
  });
}
