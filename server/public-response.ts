import { acceptRepresentation } from "@/utils/accept-representation";
import {
  homeMarkdown,
  pageMarkdown,
  publicPages,
  type PublicPath,
} from "@/utils/public-content";

export function publicResponse(request: Request): Response | null {
  if (!["GET", "HEAD"].includes(request.method)) return null;
  const requestedPath = new URL(request.url).pathname;
  const isMarkdownPath =
    requestedPath === "/index.md" ||
    Object.keys(publicPages).some((path) => requestedPath === `${path}.md`);
  const path =
    requestedPath === "/index.md"
      ? "/"
      : isMarkdownPath
        ? requestedPath.slice(0, -3)
        : requestedPath;
  if (path !== "/" && !Object.hasOwn(publicPages, path)) return null;
  if (request.headers.has("rsc") || request.headers.has("next-action"))
    return null;
  const representation = isMarkdownPath
    ? "markdown"
    : acceptRepresentation(request.headers.get("accept"));
  if (representation === "html") return null;
  return new Response(
    request.method === "HEAD"
      ? null
      : representation === "markdown"
        ? path === "/"
          ? homeMarkdown
          : pageMarkdown(path as PublicPath)
        : "No acceptable representation. Request text/html or text/markdown.\n",
    {
      status: representation ? 200 : 406,
      headers: {
        "Content-Type": representation
          ? "text/markdown; charset=utf-8"
          : "text/plain; charset=utf-8",
        Vary: "Accept",
        "Cache-Control": "private, no-store",
        Link: '</llms.txt>; rel="describedby"',
      },
    },
  );
}
