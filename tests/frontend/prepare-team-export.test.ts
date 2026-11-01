import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  MAX_TEAM_EXPORT_BYTES,
  prepareTeamExport,
} from "@/server/prepare-team-export";

async function noisePng(width: number, height: number, seed: number) {
  const pixels = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixels.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    pixels[i] = seed >>> 24;
  }
  return sharp(pixels, { raw: { width, height, channels: 3 } })
    .png({ compressionLevel: 0 })
    .toBuffer();
}

describe("team export download size", () => {
  it.each([MAX_TEAM_EXPORT_BYTES - 1, MAX_TEAM_EXPORT_BYTES])(
    "keeps the exact original buffer at %i bytes",
    async (length) => {
      const png = Buffer.alloc(length);
      const result = await prepareTeamExport(png);
      expect(result.data).toBe(png);
      expect(result.contentType).toBe("image/png");
      expect(result.filename).toBe("equipos.png");
    },
  );

  it("recodes a large PNG without resizing when high quality fits", async () => {
    const png = await sharp({
      create: {
        width: 2000,
        height: 1000,
        channels: 3,
        background: "#698044",
      },
    })
      .png({ compressionLevel: 0 })
      .toBuffer();
    expect(png.length).toBeGreaterThan(MAX_TEAM_EXPORT_BYTES);
    const result = await prepareTeamExport(png);
    const { info } = await sharp(result.data)
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect(result.contentType).toBe("image/jpeg");
    expect(result.filename).toBe("equipos.jpg");
    expect(result.data.length).toBeLessThanOrEqual(MAX_TEAM_EXPORT_BYTES);
    expect(info.width).toBe(2000);
    expect(info.height).toBe(1000);
  });

  it("fits a complex image by reducing dimensions after recoding", async () => {
    const width = 2200;
    const png = await noisePng(width, width, 123456);
    const result = await prepareTeamExport(png);
    const { info } = await sharp(result.data)
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect(result.data.length).toBeLessThanOrEqual(MAX_TEAM_EXPORT_BYTES);
    expect(result.contentType).toBe("image/jpeg");
    expect(info.width).toBeLessThan(width);
    expect(info.width).toBeGreaterThanOrEqual(1280);
    expect(info.height).toBe(info.width);
  });

  it("rejects failed optimization instead of returning an oversized input", async () => {
    await expect(
      prepareTeamExport(Buffer.alloc(MAX_TEAM_EXPORT_BYTES + 1)),
    ).rejects.toThrow();
  });

  it("rejects an oversized image that cannot fit without shrinking below the canvas width", async () => {
    const png = await noisePng(1280, 5000, 654321);
    await expect(prepareTeamExport(png)).rejects.toThrow(
      "Image export could not fit the download size limit.",
    );
  });
});
