import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "127.0.0.1")
      throw new Error(`Unexpected external request: ${url.origin}`);
    return route.continue();
  });
});

test("should remain clickable after repeated rapid edits when the player dialog saves", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let saves = 0;
  await page.route("**/test-actions/player", async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      operation: "edit",
      id: 1,
    });
    saves++;
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Acciones de Ana" });
  for (let attempt = 1; attempt <= 5; attempt++) {
    await trigger.click();
    await page.getByRole("menuitem", { name: "Editar" }).click();
    const dialog = page.getByRole("dialog", {
      name: "Editar ficha del jugador",
    });
    await dialog
      .getByRole("textbox", { name: "Nombre", exact: true })
      .fill(`Ana ${attempt}`);
    await dialog.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await page
      .getByRole("button", { name: `Comprobar clics: ${attempt - 1}` })
      .click();
    await expect(
      page.getByRole("button", { name: `Comprobar clics: ${attempt}` }),
    ).toBeVisible();
  }
  expect(saves).toBe(5);
  expect(errors).toEqual([]);
});

test("should preserve the draft and recover when a player edit fails", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("**/test-actions/player", (route) => {
    attempts++;
    return route.fulfill({
      json:
        attempts === 1 ? { ok: false, error: "No autorizado." } : { ok: true },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Acciones de Ana" }).click();
  await page.getByRole("menuitem", { name: "Editar" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Nombre", exact: true })
    .fill("Ana nueva");
  await dialog.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("No autorizado.", { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole("textbox", { name: "Nombre", exact: true }),
  ).toHaveValue("Ana nueva");
  await dialog.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(attempts).toBe(2);
});

test("should keep the page clickable without deleting when confirmation is cancelled", async ({
  page,
}) => {
  let requests = 0;
  await page.route("**/test-actions/player", (route) => {
    requests++;
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Acciones de Ana" }).click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Cancelar" })
    .click();
  await expect(page.getByRole("alertdialog")).toBeHidden();
  const trigger = page.getByRole("button", { name: "Acciones de Ana" });
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByRole("menuitem", { name: "Editar" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Comprobar clics: 0" }).click();
  await expect(
    page.getByRole("button", { name: "Comprobar clics: 1" }),
  ).toBeVisible();
  expect(requests).toBe(0);
});

for (const action of ["Editar", "Eliminar"]) {
  test(`should restore focus after repeatedly escaping player ${action}`, async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Acciones de Ana" });
    for (let attempt = 0; attempt < 3; attempt++) {
      await trigger.click();
      await page.getByRole("menuitem", { name: action, exact: true }).click();
      const dialog = page.getByRole(
        action === "Editar" ? "dialog" : "alertdialog",
      );
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await page
        .getByRole("button", { name: `Comprobar clics: ${attempt}` })
        .click();
    }
  });
}
