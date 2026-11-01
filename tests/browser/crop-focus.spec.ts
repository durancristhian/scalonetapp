import { test, expect } from "@playwright/test";
import { resolve } from "node:path";

const photo = resolve("public/me.jpg");

test("returns to the photo chooser after closing nested crop and to Add after closing its parent", async ({
  page,
}) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "127.0.0.1")
      throw new Error(`Unexpected external request: ${url.origin}`);
    return route.continue();
  });
  await page.goto("/");
  const add = page.getByRole("button", { name: "Agregar", exact: true });
  await add.click();
  const chooser = page.getByRole("button", {
    name: "Elegir foto",
    exact: true,
  });
  const crop = page.getByRole("dialog", { name: "Recortando la foto" });
  for (const close of ["Escape", "Cancelar", "Recortar"]) {
    const selection = page.waitForEvent("filechooser");
    await chooser.click();
    await (await selection).setFiles(photo);
    await expect(crop).toBeVisible();
    await expect(
      crop.getByRole("button", { name: "Recortar", exact: true }),
    ).toBeEnabled();
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveCSS("outline-style", "solid");
    await expect(focused).toHaveCSS("outline-width", "2px");
    await expect(focused).toHaveCSS("outline-offset", "2px");
    if (close === "Escape") await page.keyboard.press("Escape");
    else await crop.getByRole("button", { name: close, exact: true }).click();
    await expect(crop).toBeHidden();
    await expect(chooser).toBeFocused();
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(add).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
  await add.click();
  await expect(chooser).toBeVisible();
});
