"use client";

import {
  TeamExport,
  type TeamExportProps,
} from "@/components/team-export/team-export";
import { IMAGE_EXPORT_WIDTH } from "@/utils/image-export-options";
import { memo, useEffect, useRef, useState } from "react";

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
    <div
      ref={viewport}
      className="grid min-h-0 min-w-0 flex-1 place-items-center overflow-clip"
    >
      <div
        className="relative overflow-clip rounded-[4px] bg-white shadow-[0_8px_28px_oklch(18%_0.015_155_/_0.16)]"
        style={{
          width: IMAGE_EXPORT_WIDTH * scale,
          height: size.contentHeight * scale,
        }}
      >
        <div
          ref={canvas}
          className="absolute inset-bs-0 start-0 origin-top-left"
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
