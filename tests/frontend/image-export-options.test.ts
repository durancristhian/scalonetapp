import { describe, expect, it } from "vitest";
import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  IMAGE_EXPORT_STORAGE_KEY,
  parseImageExportOptions,
  readImageExportOptions,
  storeImageExportOptions,
} from "@/utils/image-export-options";
import {
  imageExportRequestSearchParams,
  parseImageExportRequest,
} from "@/utils/image-export-request";

describe("export order preferences", () => {
  it("defaults new preferences and requests to alphabetical", () => {
    expect(readImageExportOptions().playerOrder).toBe("alphabetical");
    expect(parseImageExportOptions(new URLSearchParams())?.playerOrder).toBe(
      "alphabetical",
    );
  });

  it("adds alphabetical ordering to legacy preferences while preserving their other values", () => {
    localStorage.setItem(
      IMAGE_EXPORT_STORAGE_KEY,
      JSON.stringify({
        background: "pasto",
        weather: "snow",
        avatarShape: "circle",
        alignment: "center",
      }),
    );
    expect(readImageExportOptions()).toEqual({
      background: "pasto",
      weather: "snow",
      avatarShape: "circle",
      alignment: "center",
      playerOrder: "alphabetical",
    });
  });

  it.each(["alphabetical", "position"] as const)(
    "persists and passes %s through the download request",
    (playerOrder) => {
      const options = { ...DEFAULT_IMAGE_EXPORT_OPTIONS, playerOrder };
      storeImageExportOptions(options);
      expect(readImageExportOptions()).toEqual(options);
      expect(
        parseImageExportRequest(imageExportRequestSearchParams(options, {})),
      ).toEqual({ options, selections: {} });
    },
  );

  it.each([
    "playerOrder=level",
    "playerOrder=",
    "playerOrder=position&playerOrder=alphabetical",
  ])("rejects invalid order parameters: %s", (query) => {
    expect(parseImageExportRequest(new URLSearchParams(query))).toBeNull();
  });

  it("rejects invalid stored ordering rather than accepting it as a legacy preference", () => {
    localStorage.setItem(
      IMAGE_EXPORT_STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_IMAGE_EXPORT_OPTIONS,
        weather: "snow",
        playerOrder: "level",
      }),
    );
    expect(readImageExportOptions()).toEqual(DEFAULT_IMAGE_EXPORT_OPTIONS);
  });
});
