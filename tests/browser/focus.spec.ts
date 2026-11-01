import { test, expect, type Locator } from "@playwright/test";

async function expectFocusOutline(control: Locator, offset = "2px") {
  await expect(control).toBeFocused();
  await expect(control).toHaveCSS("outline-style", "solid");
  await expect(control).toHaveCSS("outline-width", "2px");
  await expect(control).toHaveCSS("outline-offset", offset);
}

for (const [width, height] of [
  [320, 568],
  [768, 1024],
  [1024, 768],
  [1280, 800],
]) {
  for (const dark of [false, true]) {
    test(`unifies keyboard focus across controls in ${dark ? "dark" : "light"} theme at ${width}x${height}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/?focus");
      await expect(
        page.getByRole("link", { name: "Navegación" }),
      ).toBeVisible();
      if (dark)
        await page.locator("html").evaluate((e) => e.classList.add("dark"));
      const names = [
        "Navegación",
        "Principal",
        "Secundario",
        "Nombre",
        "Descripción",
        "Seleccionar",
        "Azules",
        "Jugadores",
        "Lista de jugadores",
        "Posición",
      ];
      for (const name of names) {
        await page.keyboard.press("Tab");
        const active = page.locator(":focus");
        await expectFocusOutline(active);
        if (name === "Lista de jugadores")
          await expect(active).toHaveRole("tabpanel");
        else await expect(active).toHaveAccessibleName(name);
        await expect(active).toHaveCSS(
          "outline-color",
          dark ? "rgb(214, 211, 209)" : "rgb(12, 10, 9)",
        );
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.keyboard.press("Enter");
      await expectFocusOutline(
        page.getByRole("option", { name: "Posición 1", exact: true }),
        "-2px",
      );
      await page.keyboard.press("End");
      await expectFocusOutline(
        page.getByRole("option", { name: "Posición 20" }),
        "-2px",
      );
      await page.keyboard.press("Escape");
      await expectFocusOutline(page.getByRole("combobox"));
    });
  }
}

test("keeps focus visible in menus, dialogs and forced colors", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Comprobar clics: 0" }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expectFocusOutline(
    page.getByRole("button", { name: "Comprobar clics: 0" }),
  );
  await page.keyboard.press("Tab");
  await expectFocusOutline(page.getByRole("link", { name: /Amistoso/ }));
  await page.keyboard.press("Tab");
  const trigger = page.getByRole("button", { name: "Acciones de Amistoso" });
  await expectFocusOutline(trigger);
  await expect(trigger).toHaveCSS("outline-color", "rgb(0, 0, 0)");
  await page.keyboard.press("Enter");
  await expectFocusOutline(
    page.getByRole("menuitem", { name: "Duplicar", exact: true }),
    "-2px",
  );
  await page.keyboard.press("ArrowDown");
  await expectFocusOutline(
    page.getByRole("menuitem", { name: "Editar", exact: true }),
    "-2px",
  );
  await page.keyboard.press("Enter");
  await expectFocusOutline(page.getByRole("textbox", { name: "Nombre" }));
  await page.keyboard.press("Escape");
  await expectFocusOutline(trigger);
});

test("pointer clicks do not add a keyboard outline to buttons", async ({
  page,
}) => {
  await page.goto("/?focus");
  const button = page.getByRole("button", { name: "Principal", exact: true });
  await button.click();
  await expect(button).not.toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Tab");
  await expectFocusOutline(
    page.getByRole("button", { name: "Secundario", exact: true }),
  );
});
