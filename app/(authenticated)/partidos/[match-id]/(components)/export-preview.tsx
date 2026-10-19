"use client";

import {
  TeamExport,
  type TeamExportProps,
} from "@/components/team-export/team-export";
import { IMAGE_EXPORT_WIDTH } from "@/utils/image-export-options";
import { useEffect, useRef, useState } from "react";
import styles from "./export-editor.module.css";

export function ExportPreview(props: TeamExportProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = viewport.current;
    const content = canvas.current;
    if (!container || !content) return;
    const observer = new ResizeObserver(() => {
      setSize({ width: container.clientWidth, height: content.offsetHeight });
    });
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const scale = size.width / IMAGE_EXPORT_WIDTH;
  return (
    <div ref={viewport} className={styles.previewViewport}>
      <div
        className={styles.previewSized}
        style={{ height: size.height * scale }}
      >
        <div
          ref={canvas}
          className={styles.previewCanvas}
          style={{ transform: `scale(${scale})` }}
        >
          <TeamExport {...props} />
        </div>
      </div>
    </div>
  );
}
