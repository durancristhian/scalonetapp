import { readFileSync } from "node:fs";

const notice = readFileSync(
  new URL("../public/licenses/heic.txt", import.meta.url),
  "utf8",
);
for (const path of notice.match(/^\/licenses\/[\w.-]+\.txt$/gm) ?? []) {
  if (
    !readFileSync(new URL(`../public${path}`, import.meta.url), "utf8").trim()
  ) {
    throw new Error(`Empty HEIC license file: ${path}`);
  }
}
const banner = `/*!\n${notice
  .trim()
  .split("\n")
  .map((line) => ` * ${line}`)
  .join("\n")}\n */\n`;
const pluginName = "HeicLicenseNotice";

function heicAssets(compilation) {
  const files = new Set();
  for (const chunk of compilation.chunks) {
    const modules = compilation.chunkGraph.getChunkModulesIterable(chunk);
    if (
      [...modules].some((module) =>
        /[\\/]node_modules[\\/]heic-to[\\/]/.test(module.identifier()),
      )
    ) {
      for (const file of chunk.files) {
        if (file.endsWith(".js")) files.add(file);
      }
    }
  }
  return files;
}

export function heicLicensePlugin(webpack) {
  return {
    apply(compiler) {
      compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
        compilation.hooks.processAssets.tap(
          // Run after minification but before source maps and content hashes.
          {
            name: pluginName,
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
          },
          () => {
            for (const file of heicAssets(compilation)) {
              compilation.updateAsset(
                file,
                (source) => new webpack.sources.ConcatSource(banner, source),
              );
            }
          },
        );
        compilation.hooks.processAssets.tap(
          {
            name: `${pluginName}Verify`,
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            const files = heicAssets(compilation);
            if (!files.size)
              throw new Error(
                "HEIC license verification failed: no converter bundle found.",
              );
            for (const file of files) {
              if (
                !compilation
                  .getAsset(file)
                  ?.source.source()
                  .toString()
                  .startsWith(banner)
              ) {
                throw new Error(
                  `HEIC license notice missing from final bundle: ${file}`,
                );
              }
            }
          },
        );
      });
    },
  };
}
