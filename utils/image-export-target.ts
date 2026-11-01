type ExportEnvironment = {
  NODE_ENV?: string;
  IMAGE_EXPORT_ORIGIN?: string;
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
  VERCEL_AUTOMATION_BYPASS_SECRET?: string;
};

type ImageExportTarget = {
  origin: string;
  bypassSecret?: string;
};

export class ImageExportConfigurationError extends Error {}

export function getImageExportTarget(
  environment: ExportEnvironment = process.env,
): ImageExportTarget {
  if (environment.VERCEL_ENV === "preview") {
    const hostname = environment.VERCEL_URL;
    if (!hostname || !/^[a-z0-9-]+\.vercel\.app$/i.test(hostname)) {
      throw new ImageExportConfigurationError(
        "Preview image exports require a valid VERCEL_URL deployment hostname.",
      );
    }

    return {
      origin: `https://${hostname.toLowerCase()}`,
      bypassSecret: environment.VERCEL_AUTOMATION_BYPASS_SECRET,
    };
  }

  if (
    environment.NODE_ENV !== "production" &&
    environment.IMAGE_EXPORT_ORIGIN
  ) {
    const origin = environment.IMAGE_EXPORT_ORIGIN;
    if (
      !/^http:\/\/(?:127\.0\.0\.1|localhost):[1-9]\d{0,4}$/.test(origin) ||
      Number(new URL(origin).port) > 65535
    ) {
      throw new ImageExportConfigurationError(
        "Local image exports require a loopback HTTP origin with a valid port.",
      );
    }
    return { origin };
  }

  return {
    origin:
      environment.NODE_ENV === "production"
        ? "https://www.scalonet.app"
        : "http://localhost:3000",
  };
}

export function getImageExportRequestHeaders(
  requestUrl: string,
  headers: Record<string, string>,
  target: ImageExportTarget,
): Record<string, string> {
  const scopedHeaders = Object.fromEntries(
    Object.entries(headers).filter(
      ([name]) => name.toLowerCase() !== "x-vercel-protection-bypass",
    ),
  );

  if (target.bypassSecret && new URL(requestUrl).origin === target.origin) {
    scopedHeaders["x-vercel-protection-bypass"] = target.bypassSecret;
  }

  return scopedHeaders;
}
