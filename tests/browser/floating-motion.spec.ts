import { expect, test } from "@playwright/test";

const surfaces = [
  { trigger: "Select", role: "listbox", name: "Jugadores" },
  { trigger: "Popover", role: "dialog", name: "Opciones" },
  { trigger: "DropdownMenu", role: "menu", name: "DropdownMenu" },
  { trigger: "Sheet", role: "dialog", name: "Navegación", overlay: true },
  { trigger: "Dialog", role: "dialog", name: "Editar partido", overlay: true },
  {
    trigger: "AlertDialog",
    role: "alertdialog",
    name: "Eliminar partido",
    overlay: true,
  },
] as const;

for (const [width, height] of [
  [320, 568],
  [768, 1024],
  [1024, 768],
  [1280, 800],
]) {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test.describe(`${width}x${height} ${reducedMotion}`, () => {
      test.use({ viewport: { width, height } });
      for (const surface of surfaces) {
        test(`${surface.trigger} opens and dismisses with keyboard`, async ({
          page,
        }) => {
          await page.emulateMedia({ reducedMotion });
          await page.goto("/?floating-motion");
          const trigger =
            surface.trigger === "Select"
              ? page.getByRole("combobox", {
                  name: surface.trigger,
                  exact: true,
                })
              : page.getByRole("button", {
                  name: surface.trigger,
                  exact: true,
                });
          await trigger.focus();
          await page.keyboard.press("Enter");
          const content = page.getByRole(surface.role, {
            name: surface.name,
            exact: true,
          });
          await expect(content).toBeVisible();
          const styles = await content.evaluate((element, hasOverlay) => {
            const elements = hasOverlay
              ? [element, element.previousElementSibling!]
              : [element];
            return elements.map((node) => {
              const style = getComputedStyle(node);
              return {
                animation: style.animationName,
                duration: parseFloat(style.animationDuration),
                transition: style.transitionProperty,
                transitionDuration: style.transitionDuration,
                opacity: style.opacity,
              };
            });
          }, "overlay" in surface);
          console.log(surface.trigger, reducedMotion, JSON.stringify(styles));
          if (reducedMotion === "reduce") {
            for (const style of styles) {
              expect.soft(style.animation).toBe("none");
              expect.soft(style.opacity).toBe("1");
              expect
                .soft(
                  style.transition === "none" ||
                    style.transitionDuration
                      .split(",")
                      .every((duration) => parseFloat(duration) === 0),
                )
                .toBe(true);
            }
          } else {
            for (const style of styles) {
              expect(style.animation).not.toBe("none");
              expect(style.duration).toBeGreaterThan(0);
            }
          }
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          await expect(content).toBeInViewport();
          await expect
            .poll(() =>
              content.evaluate((element) =>
                element.contains(document.activeElement),
              ),
            )
            .toBe(true);
          await content.evaluate((element, hasOverlay) => {
            const nodes = hasOverlay
              ? [element, element.previousElementSibling!]
              : [element];
            const record = document.querySelector("main")!;
            record.setAttribute("data-exit-animations", "[]");
            const animations: string[] = [];
            const observer = new MutationObserver(() => {
              for (const node of nodes) {
                if (
                  node.isConnected &&
                  node.getAttribute("data-state") === "closed"
                ) {
                  animations.push(getComputedStyle(node).animationName);
                }
              }
              record.setAttribute(
                "data-exit-animations",
                JSON.stringify(animations),
              );
              if (nodes.every((node) => !node.isConnected))
                observer.disconnect();
            });
            observer.observe(document.body, {
              subtree: true,
              childList: true,
              attributes: true,
              attributeFilter: ["data-state"],
            });
          }, "overlay" in surface);
          await page.keyboard.press("Escape");
          await expect(content).toHaveCount(0);
          await expect(trigger).toBeFocused();
          if (reducedMotion === "reduce") {
            const exits: string[] = JSON.parse(
              (await page
                .locator("main")
                .getAttribute("data-exit-animations"))!,
            );
            expect(exits.every((animation) => animation === "none")).toBe(true);
          }
          await page.keyboard.press("Enter");
          await expect(content).toBeVisible();
          await page.keyboard.press("Escape");
          await expect(content).toHaveCount(0);
          await expect(trigger).toBeFocused();
        });
      }
    });
  }
}
