import { test, expect } from "@playwright/test";

for (const mode of ["rapid", "settled"]) {
  for (const action of ["Duplicar", "Editar", "Eliminar"]) {
    test(`should restore focus and clicks after ${mode} escaping ${action}`, async ({
      page,
    }) => {
      await page.goto("/");
      const trigger = page.getByRole("button", {
        name: "Acciones de Amistoso",
      });
      for (let attempt = 0; attempt < 3; attempt++) {
        await trigger.click();
        if (mode === "settled")
          await page.evaluate(async () => {
            await Promise.allSettled(
              document
                .getAnimations()
                .filter((a) => a.effect?.getTiming().iterations !== Infinity)
                .map((a) => a.finished),
            );
          });
        await page.getByRole("menuitem", { name: action, exact: true }).click();
        const dialog = page.getByRole(
          action === "Editar" ? "dialog" : "alertdialog",
        );
        await expect(dialog).toBeVisible();
        if (mode === "settled")
          await dialog.evaluate(async (e) => {
            await Promise.allSettled(e.getAnimations().map((a) => a.finished));
          });
        await page.keyboard.press("Tab");
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(page.locator("body")).not.toHaveCSS(
          "pointer-events",
          "none",
        );
        await expect(trigger).toBeFocused();
        await page
          .getByRole("button", { name: `Comprobar clics: ${attempt}` })
          .click();
      }
    });
  }
}

for (const action of ["Duplicar", "Eliminar"]) {
  test(`should restore the match menu after cancelling ${action}`, async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", {
      name: "Acciones de Amistoso",
    });
    await trigger.click();
    await page.getByRole("menuitem", { name: action, exact: true }).click();
    const dialog = page.getByRole("alertdialog");
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitem", { name: "Editar" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
  });
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 639, height: 800 },
  { width: 640, height: 800 },
  { width: 768, height: 1024 },
  { width: 1023, height: 768 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
]) {
  test(`should select and dismiss menu dialogs by keyboard at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const name of ["Amistoso", "Ana"]) {
      const trigger = page.getByRole("button", {
        name: `Acciones de ${name}`,
      });
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("menu")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("menu")).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page.getByRole("alertdialog")).toHaveCount(0);
      await page.keyboard.press("Enter");
      const edit = page.getByRole("menuitem", { name: "Editar", exact: true });
      await page.keyboard.press("Home");
      if (name === "Amistoso") await page.keyboard.press("ArrowDown");
      await expect(edit).toBeFocused();
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(page.getByRole("menu")).toBeHidden();
      const save = dialog.getByRole("button", { name: "Guardar", exact: true });
      for (let tab = 0; tab < 20; tab++) {
        if (await save.evaluate((button) => button === document.activeElement))
          break;
        await page.keyboard.press("Tab");
      }
      await expect(save).toBeFocused();
      await expect(save).toBeInViewport();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
