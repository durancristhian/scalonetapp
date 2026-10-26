"use client";

import {
  TeamExport,
  type TeamExportProps,
} from "@/components/team-export/team-export";
import { IMAGE_EXPORT_WIDTH } from "@/utils/image-export-options";
import { useEffect, useRef, useState } from "react";

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
    ? Math.min(size.width / IMAGE_EXPORT_WIDTH, size.height / size.contentHeight)
    : 0;
  return (
    <div
      ref={viewport}
      className="grid min-h-0 min-w-0 flex-1 place-items-center overflow-clip"
    >
      <div
        className="relative overflow-clip shadow-md"
        style={{
          width: IMAGE_EXPORT_WIDTH * scale,
          height: size.contentHeight * scale,
        }}
      >
        <div
          ref={canvas}
          className="absolute [inset-block-start:0] start-0 w-[1280px] origin-top-left"
          style={{ transform: `scale(${scale})` }}
        >
          <TeamExport {...props} />
        </div>
      </div>
    </div>
  );
}
