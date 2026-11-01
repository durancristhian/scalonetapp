import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { within } from "@testing-library/react";
import Template from "@/app/(authenticated)/template";
import { AnimatedListItem } from "@/components/animated-list-item";

it("serves visible route and list content without hydration or animation support", () => {
  const container = document.createElement("div");
  document.body.append(container);
  try {
    container.innerHTML = renderToString(
      <Template>
        {Array.from({ length: 100 }, (_, index) => (
          <AnimatedListItem key={index}>
            <button>Jugador {index + 1}</button>
          </AnimatedListItem>
        ))}
      </Template>,
    );
    const page = within(container);
    expect(page.getByRole("button", { name: "Jugador 1" })).toBeVisible();
    expect(page.getByRole("button", { name: "Jugador 100" })).toBeVisible();
  } finally {
    container.remove();
  }
});
