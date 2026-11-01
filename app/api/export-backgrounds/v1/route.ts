import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest } from "next/server";
import {
  colorizeExportBackground,
  getImageExportBackground,
} from "@/utils/image-export-background";

export const runtime = "nodejs";
const templates = new Map<string, Promise<string>>();

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const backgrounds = params.getAll("background");
  const background =
    backgrounds.length === 1
      ? getImageExportBackground(backgrounds[0])
      : undefined;
  if (!background) {
    return new Response("Invalid background", { status: 400 });
  }

  const { src: source } = background;
  const development = process.env.NODE_ENV === "development";
  let template = development ? undefined : templates.get(source);
  if (!template) {
    template = readFile(join(process.cwd(), "public", source), "utf8").catch(
      (error) => {
        templates.delete(source);
        throw error;
      },
    );
    if (!development) templates.set(source, template);
  }
  return new Response(colorizeExportBackground(await template, background.id), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": development
        ? "no-store"
        : "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
