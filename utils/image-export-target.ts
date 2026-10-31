type ExportEnvironment = {
  NODE_ENV?: string;
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
  // Redirects can inherit headers. Remove the secret before checking each origin.
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
