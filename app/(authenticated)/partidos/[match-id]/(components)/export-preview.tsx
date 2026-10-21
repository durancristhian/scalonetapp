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
    <div ref={viewport} className="my-auto w-full shrink-0">
      <div
        className="relative overflow-clip shadow-md"
        style={{ height: size.height * scale }}
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
