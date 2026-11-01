type ExportEnvironment = {
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
  VERCEL_AUTOMATION_BYPASS_SECRET?: string;
  PORT?: string;
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

  if (environment.NODE_ENV === "production") {
    return { origin: "https://www.scalonet.app" };
  }

  const port = environment.PORT ?? "3000";
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new ImageExportConfigurationError(
      "Local image exports require a PORT between 1 and 65535.",
    );
  }

  return { origin: `http://localhost:${Number(port)}` };
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
