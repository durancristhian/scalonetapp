import Negotiator from "negotiator";

export function acceptRepresentation(
  accept: string | null,
): "html" | "markdown" | null {
  const type = new Negotiator({
    headers: { accept: accept ?? "*/*" },
  }).mediaType(["text/html; charset=utf-8", "text/markdown; charset=utf-8"]);
  return type === "text/html; charset=utf-8"
    ? "html"
    : type === "text/markdown; charset=utf-8"
      ? "markdown"
      : null;
}
