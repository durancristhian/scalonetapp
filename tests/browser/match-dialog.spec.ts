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
