import { type ImageExportBackgroundId } from "@/utils/image-export-backgrounds";

const frame = "var(--export-frame-color)";
const trim = "var(--export-divider-color)";
const dark = "color-mix(in oklch, var(--export-frame-color) 72%, black)";

// Match the field markings: subtle in synthetic, organic in natural, rough in potrero.
const silhouettes = {
  pasto: {
    outline: "M10 5Q138 2 268 5T526 4L528 78Q394 81 268 78T10 80Z",
    seam: "",
  },
  natural: {
    outline: "M12 6Q142 0 268 6L399 3 525 8 529 76Q395 83 268 78L140 82 10 78Z",
    seam: "M12 39Q145 36 268 41T526 42",
  },
  potrero: {
    outline:
      "M12 9L119 3 238 8 342 2 434 10 524 5 527 30 523 51 530 77 412 82 288 77 164 85 11 79 14 52 9 28Z",
    seam: "M12 39L119 36 238 42 342 38 434 44 525 40",
  },
} satisfies Record<ImageExportBackgroundId, { outline: string; seam: string }>;

export function TeamBillboard({
  id,
  name,
  background,
}: {
  id: string;
  name: string;
  background: ImageExportBackgroundId;
}) {
  const { outline, seam } = silhouettes[background];
  return (
    <div className="relative mx-6 h-28 min-w-0" data-team-billboard>
      <svg
        className="absolute inset-0 size-full overflow-visible"
        viewBox="0 0 544 112"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <ellipse cx="274" cy="105" rx="242" ry="8" fill="black" opacity=".13" />
        <path d="M80 62H92V104H80ZM452 62H464V104H452Z" fill={dark} />
        <path
          d="M83 68H86V100H83ZM455 68H458V100H455Z"
          fill={trim}
          opacity=".35"
        />
        <path d={outline} fill={dark} transform="translate(3 8)" />
        <path d={outline} fill={frame} stroke={trim} strokeWidth="3" />
        {background === "pasto" ? (
          <>
            <path
              d="M14 9Q140 6 268 9T522 8M14 10L14 75"
              stroke="white"
              strokeWidth="2"
              opacity=".2"
            />
            <path
              d="M14 76Q140 80 268 76T524 76"
              stroke={dark}
              strokeWidth="4"
            />
          </>
        ) : (
          <>
            <path d={seam} stroke={dark} strokeWidth="3" />
            <path
              d="M24 16q106 8 204 1m110 8q97-6 170 0M28 66q100-6 205 0m95-5q72 5 172-1"
              fill="none"
              stroke={trim}
              strokeWidth="1"
              opacity=".2"
            />
          </>
        )}
        {[24, 512].flatMap((x) =>
          [17, 65].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={trim} />
          )),
        )}
      </svg>
      <h2
        id={id}
        className="absolute inset-x-12 [inset-block-start:theme(spacing.6)] truncate text-center text-3xl font-bold leading-9 text-white"
        title={name}
      >
        {name}
      </h2>
    </div>
  );
}
