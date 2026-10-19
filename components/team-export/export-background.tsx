import { type ImageExportOptions } from "@/utils/image-export-options";
import {
  getImageExportBackgroundUrl,
  IMAGE_EXPORT_BACKGROUND_FRAMING,
} from "@/utils/image-export-background";
import styles from "./export-background.module.css";

// Shared by the selector swatches, live preview, and PNG canvas.
// The parent provides a positioned box; this decorative layer does not affect layout.
export function ExportBackground({
  background,
  palette,
}: Pick<ImageExportOptions, "background" | "palette">) {
  const { scale, x, y, rotation } = IMAGE_EXPORT_BACKGROUND_FRAMING[background];

  return (
    <span aria-hidden="true" className={styles.layer}>
      <span
        className={styles.artwork}
        style={{
          backgroundImage: `url("${getImageExportBackgroundUrl(background, palette)}")`,
          insetInlineStart: `${x}%`,
          insetBlockStart: `${y}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        }}
      />
    </span>
  );
}
