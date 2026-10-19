import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest } from "next/server";
import { parseColorPalette } from "@/utils/color-palettes";
import { colorizeExportBackground, getImageExportBackgroundSource } from "@/utils/image-export-background";

export const runtime = "nodejs";
const templates = new Map<string, Promise<string>>();

// Public, deterministic artwork. Never reads match or account data.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const backgrounds = params.getAll("background");
  const source = backgrounds.length === 1
    ? getImageExportBackgroundSource(backgrounds[0])
    : undefined;
  const palette = parseColorPalette(params);
  if (!source || !palette) {
    return new Response("Invalid background or palette", { status: 400 });
  }

  let template = templates.get(source);
  if (!template) {
    template = readFile(join(process.cwd(), "public", source), "utf8")
      .catch((error) => { templates.delete(source); throw error; });
    templates.set(source, template);
  }
  return new Response(colorizeExportBackground(await template, palette), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
