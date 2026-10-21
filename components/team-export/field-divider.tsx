import { type ImageExportBackgroundId } from "@/utils/image-export-backgrounds";

const markings = {
  pasto: {
    line: "M32 0V100",
    ring: "M28 1a27 27 0 1 1 0 54 27 27 0 0 1 0-54Z",
  },
  natural: {
    line: "M32 0C31 8 33 17 32 25S31 42 32 50 33 67 32 75 31 92 32 100",
    ring: "M28 1C43 .6 55 13 54.7 28S43 55 28 54.6 1 43 1.3 28 13 1.4 28 1Z",
  },
  potrero: {
    line: "M32 0C25 14 38 34 32 50S26 83 32 100",
    ring: "M28 2C43 0 54 13 54 28S42 55 27 54 1 42 2 27 13 .8 28 2Z",
  },
} satisfies Record<ImageExportBackgroundId, { line: string; ring: string }>;

export function FieldDivider({
  background,
}: {
  background: ImageExportBackgroundId;
}) {
  const { line, ring } = markings[background];
  return (
    <span
      aria-hidden="true"
      data-field-divider
      className="pointer-events-none absolute inset-0 grid place-items-center text-[var(--export-marking-color)] opacity-50 [&_path]:stroke-2"
    >
      <svg
        data-field-boundary
        className="absolute [inset-block-start:calc(theme(spacing.8)*-1)] -start-0.5 h-16 w-[calc(100%+4px)] overflow-visible"
        viewBox="0 0 100 64"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          d={line}
          transform="matrix(0 1 1 0 0 0)"
          fill="none"
          stroke="currentColor"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Line height, ring diameter and center point scale independently. */}
      <svg
        className="absolute [inset-block:0] h-full w-16 overflow-visible"
        viewBox="0 0 64 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <svg
        className="absolute h-3/4 w-1/4 overflow-visible"
        viewBox="0 0 56 56"
        focusable="false"
      >
        <path
          d={ring}
          fill="none"
          stroke="currentColor"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <svg className="absolute size-1" viewBox="0 0 4 4" focusable="false">
        <circle cx="2" cy="2" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}
