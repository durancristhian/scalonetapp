import { describe, expect, it } from "vitest";
import {
  getImageExportTarget,
  ImageExportConfigurationError,
} from "@/utils/image-export-target";

describe("image export origin", () => {
  it("uses the configured local app port", () => {
    expect(
      getImageExportTarget({ NODE_ENV: "development", PORT: "3101" }),
    ).toEqual({ origin: "http://localhost:3101" });
  });

  it("keeps the default local port", () => {
    expect(getImageExportTarget({ NODE_ENV: "development" })).toEqual({
      origin: "http://localhost:3000",
    });
  });

  it.each(["0", "65536", "", "3101/path", "3.5"])(
    "rejects invalid local port %j",
    (PORT) => {
      expect(() => getImageExportTarget({ PORT })).toThrow(
        ImageExportConfigurationError,
      );
    },
  );

  it("keeps Production independent of the local port", () => {
    expect(
      getImageExportTarget({ NODE_ENV: "production", PORT: "3101" }),
    ).toEqual({ origin: "https://www.scalonet.app" });
  });

  it("keeps Preview scoped to its deployment", () => {
    expect(
      getImageExportTarget({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
        VERCEL_URL: "owned-preview.vercel.app",
        PORT: "3101",
      }),
    ).toEqual({
      origin: "https://owned-preview.vercel.app",
      bypassSecret: undefined,
    });
  });
});
