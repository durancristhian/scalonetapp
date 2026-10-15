import { tmpdir } from "node:os";
import { join } from "node:path";

type InflateArchive = (archivePath: string) => Promise<string>;
let previewLibraries: Promise<string> | undefined;

const inflatePreviewLibraries: InflateArchive = (archivePath) => {
  // Share extraction across concurrent exports in the same function instance.
  previewLibraries ??= import("@sparticuz/chromium-min/build/lambdafs.js")
    .then(({ default: module }) => {
      // Native Node imports wrap this CommonJS default; Next.js may unwrap it.
      const lambdaFS =
        "inflate" in module
          ? module
          : (module as { default: typeof module }).default;
      return lambdaFS.inflate(archivePath);
    })
    .catch((error) => {
      previewLibraries = undefined;
      throw error;
    });
  return previewLibraries;
};

export async function getPreviewChromiumEnv(
  environment: NodeJS.ProcessEnv = process.env,
  inflate: InflateArchive = inflatePreviewLibraries
): Promise<NodeJS.ProcessEnv | undefined> {
  if (environment.VERCEL_ENV !== "preview") return undefined;

  // executablePath(CHROMIUM_PATH) has already unpacked this original 123 archive.
  const libraryDirectory = await inflate(
    join(tmpdir(), "chromium-pack", "al2023.tar.br")
  );

  return {
    ...environment,
    FONTCONFIG_PATH: environment.FONTCONFIG_PATH ?? join(tmpdir(), "fonts"),
    LD_LIBRARY_PATH: [join(libraryDirectory, "lib"), environment.LD_LIBRARY_PATH]
      .filter(Boolean)
      .join(":"),
  };
}
