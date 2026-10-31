"use client";

import {
  TeamExport,
  type TeamExportProps,
} from "@/components/team-export/team-export";
import { IMAGE_EXPORT_WIDTH } from "@/utils/image-export-options";
import { memo, useEffect, useRef, useState } from "react";
import styles from "./export-preview.module.css";

// Resizing the preview changes its scale, not the export composition.
const MemoizedTeamExport = memo(TeamExport);

export function ExportPreview(props: TeamExportProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0, contentHeight: 0 });

  useEffect(() => {
    const container = viewport.current;
    const content = canvas.current;
    if (!container || !content) return;
    const observer = new ResizeObserver(() => {
      setSize({
        width: container.clientWidth,
        height: container.clientHeight,
        contentHeight: content.offsetHeight,
      });
    });
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const scale = size.contentHeight
    ? Math.min(
        size.width / IMAGE_EXPORT_WIDTH,
        size.height / size.contentHeight,
      )
    : 0;
  return (
    <div ref={viewport} className={styles.viewport}>
      <div
        className={styles.frame}
        style={{
          width: IMAGE_EXPORT_WIDTH * scale,
          height: size.contentHeight * scale,
        }}
      >
        <div
          ref={canvas}
          className={styles.canvas}
          style={{
            inlineSize: IMAGE_EXPORT_WIDTH,
            transform: `scale(${scale})`,
          }}
        >
          <MemoizedTeamExport {...props} />
        </div>
      </div>
    </div>
  );
}
