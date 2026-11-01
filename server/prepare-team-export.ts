import { IMAGE_EXPORT_WIDTH } from "@/utils/image-export-options";

export const MAX_TEAM_EXPORT_BYTES = 5_000_000;

export async function prepareTeamExport(png: Buffer): Promise<{
  data: Buffer;
  contentType: "image/png" | "image/jpeg";
  filename: "equipos.png" | "equipos.jpg";
}> {
  if (png.length <= MAX_TEAM_EXPORT_BYTES) {
    return { data: png, contentType: "image/png", filename: "equipos.png" };
  }

  const sharp = (await import("sharp")).default;
  const image = sharp(png).flatten({ background: "white" });
  let candidate;

  for (const quality of [95, 90, 85]) {
    candidate = await image
      .clone()
      .timeout({ seconds: 5 })
      .jpeg({ quality, chromaSubsampling: "4:4:4" })
      .toBuffer({ resolveWithObject: true });
    if (candidate.data.length <= MAX_TEAM_EXPORT_BYTES) {
      return {
        data: candidate.data,
        contentType: "image/jpeg",
        filename: "equipos.jpg",
      };
    }
  }

  if (candidate) {
    const width = Math.max(
      Math.min(IMAGE_EXPORT_WIDTH, candidate.info.width),
      Math.floor(
        candidate.info.width *
          Math.min(
            0.9,
            Math.sqrt(MAX_TEAM_EXPORT_BYTES / candidate.data.length) * 0.9,
          ),
      ),
    );
    if (width < candidate.info.width) {
      const resized = await image
        .clone()
        .timeout({ seconds: 5 })
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality: 85, chromaSubsampling: "4:4:4" })
        .toBuffer();
      if (resized.length <= MAX_TEAM_EXPORT_BYTES) {
        return {
          data: resized,
          contentType: "image/jpeg",
          filename: "equipos.jpg",
        };
      }
    }
  }

  throw new Error("Image export could not fit the download size limit.");
}
