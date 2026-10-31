import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  type ImageExportOptions,
} from "./image-export-options.ts";
import { imageExportRequestSearchParams } from "./image-export-request.ts";
import { type ImageExportTeamSelections } from "./image-export-player-roles.ts";
import { ActionError } from "./action-result.ts";
import { ERROR_MESSAGES } from "./error-messages.ts";

export const fetchTeamExport = async (
  matchId: number,
  options: ImageExportOptions = DEFAULT_IMAGE_EXPORT_OPTIONS,
  selections: ImageExportTeamSelections = {},
  fingerprint?: string,
): Promise<Blob> => {
  const response = await fetch(
    `/download/${matchId}?${imageExportRequestSearchParams(options, selections)}`,
    {
      cache: "no-store",
      headers: fingerprint
        ? { "X-Lineup-Fingerprint": fingerprint }
        : undefined,
    },
  );

  if (response.status === 409) {
    throw new ActionError(ERROR_MESSAGES.match_export_changed);
  }

  if (
    !response.ok ||
    response.headers.get("content-type")?.split(";")[0].trim() !== "image/png"
  ) {
    throw new Error("Invalid image response");
  }

  const blob = await response.blob();
  if (!blob.size) throw new Error("Empty image response");
  return blob;
};
