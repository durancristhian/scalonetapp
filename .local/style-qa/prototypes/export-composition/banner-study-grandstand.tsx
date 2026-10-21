// PROTOTYPE: subtle fabric shading versus visible attachment, retaining the approved composition.
import { useId } from "react";
import { type ImageExportOptions } from "@/utils/image-export-options";
import { ExportWeather } from "@/components/team-export/export-background";
import { cn } from "@/utils/cn";

const bannerOutlines = {
  pasto: "M3 5Q288 0 576 5T1149 4L1150 105Q864 111 576 106T3 108Z",
  natural:
    "M4 8Q180 0 376 8Q570 14 770 5Q954 1 1148 9L1150 103Q962 114 770 105Q568 100 376 109Q184 114 3 104Z",
  potrero:
    "M6 11Q158 0 315 9L480 4 648 14Q810 2 970 8L1146 3 1150 39 1145 70 1150 101Q978 114 807 105L635 110 462 101Q227 117 5 106L9 74 2 40Z",
};
const bannerHems = {
  pasto: "M14 15Q288 10 576 15T1138 14M14 98Q288 103 576 98T1138 96",
  natural:
    "M15 18Q180 10 376 18Q570 24 770 15Q954 11 1137 19M15 94Q184 104 376 99Q568 90 770 95Q962 104 1138 93",
  potrero:
    "M17 21Q158 10 315 19L480 14 648 24Q810 12 970 18L1135 13M17 96Q227 107 462 91L635 100 807 95Q978 104 1138 91",
};

const materials = {
  pasto: {
    stand:
      "[--stand-tread:color-mix(in_oklch,var(--export-divider-color)_60%,oklch(0.75_0_none))] [--stand-riser:color-mix(in_oklch,var(--export-frame-color)_65%,oklch(0.5_0_none))]",
    tread: "stroke-white/10 stroke-1",
    terraces: "",
    edge: "stroke-white/20 stroke-1",
    hem: "opacity-40 [stroke-dasharray:3_4]",
  },
  natural: {
    stand:
      "[--stand-tread:color-mix(in_oklch,var(--export-divider-color)_25%,oklch(0.65_0_none))] [--stand-riser:color-mix(in_oklch,var(--export-frame-color)_35%,oklch(0.5_0_none))]",
    tread: "",
    terraces: "",
    edge: "stroke-white/20 stroke-1 [stroke-opacity:0.6] [stroke-dasharray:140_2_80_1]",
    hem: "opacity-40 [stroke-dasharray:3_4]",
  },
  potrero: {
    stand:
      "[--stand-tread:color-mix(in_oklch,var(--export-divider-color)_80%,var(--export-frame-color))] [--stand-riser:color-mix(in_oklch,var(--export-divider-color)_45%,var(--export-frame-color))]",
    tread: "",
    terraces: "-skew-y-[0.15deg]",
    edge: "stroke-[var(--export-frame-color)] stroke-2 opacity-50",
    hem: "opacity-50 [stroke-dasharray:4_5]",
  },
};

export function BannerStudyGrandstand({
  name,
  background,
  weather,
  treatment,
  hideTies = false,
}: Pick<ImageExportOptions, "background" | "weather"> & { name: string; treatment: "fabric" | "ties"; hideTies?: boolean }) {
  const material = materials[background];
  const id = useId();
  const foldStrength = { pasto: .12, natural: .16, potrero: .2 }[background];
  const tieOffset = { pasto: 0, natural: 2, potrero: 4 }[background];
  return (
    <header
      className={cn(
        "relative grid h-40 place-items-center overflow-clip bg-[color-mix(in_oklch,var(--export-frame-color)_80%,black)]",
        material.stand,
      )}
      data-match-grandstand
    >
      <svg
        className={cn("absolute inset-0 size-full", material.terraces)}
        viewBox="0 0 1280 160"
        aria-hidden="true"
      >
        {/* Treads and risers widen toward the field to give the frontal stand depth. */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => {
          const y = row * 20;
          const inset = 44 - row * 6;
          return (
            <g key={row}>
              <path
                className={cn("fill-[var(--stand-tread)]", material.tread)}
                d={`M${inset} ${y}H${1280 - inset}l6 10H${inset - 6}Z`}
              />
              <path
                className={"fill-[var(--stand-riser)]"}
                d={`M${inset - 6} ${y + 10}H${1286 - inset}v10H${inset - 6}Z`}
              />
              <path
                className={cn("fill-none", material.edge)}
                d={`M${inset - 6} ${y + 10}H${1286 - inset}`}
              />
            </g>
          );
        })}
        {background === "natural" ? (
          <path
            className={
              "fill-none stroke-[var(--export-frame-color)] stroke-2 opacity-40"
            }
            d="M58 28l20 2m1100 16-12 3M31 109l17-2m1180 34-24-1M96 7l25 1"
          />
        ) : null}
        {background === "potrero" ? (
          <path
            className={
              "fill-none stroke-[var(--export-frame-color)] stroke-1 opacity-50"
            }
            d="M50 6q65-5 118 0m939 18q70 4 111-1M26 65q60-4 104 0m1005 20q60-5 111-1M12 127q70 6 120 0m1004 18q53-4 119 0"
          />
        ) : null}
      </svg>
      <ExportWeather weather={weather} snowAccumulation={false} />
      {treatment === "ties" && !hideTies ? <svg className="absolute inset-0 size-full" viewBox="0 0 1280 160" aria-hidden="true">
        {[77, 1203].map((x, i) => {
          const anchor = x + (i === 0 ? -8 - tieOffset : 8 + tieOffset);
          return <g key={x}>
            <circle cx={anchor} cy="14" r="4" fill="var(--export-frame-color)" />
            <path d={`M${anchor} 14Q${x-3} 24 ${x} 37`} fill="none" stroke="var(--export-frame-color)" strokeWidth="5" />
            <path d={`M${anchor} 14Q${x-3} 24 ${x} 37`} fill="none" stroke="color-mix(in oklch, var(--export-divider-color) 65%, white)" strokeWidth="2" />
          </g>;
        })}
      </svg> : null}
      <div
        className={cn("relative grid h-28 w-[90%] min-w-0 place-items-center", treatment === "fabric" ? "drop-shadow-sm" : "drop-shadow-md")}
        data-match-banner
      >
        <svg
          className={"absolute inset-0 size-full"}
          viewBox="0 0 1152 112"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={`${id}-cloth-clip`}><path d={bannerOutlines[background]} /></clipPath>
            <linearGradient id={`${id}-cloth-tone`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="color-mix(in oklch, var(--export-frame-color) 95%, white)" />
              <stop offset=".45" stopColor="var(--export-frame-color)" />
              <stop offset="1" stopColor="color-mix(in oklch, var(--export-frame-color) 92%, black)" />
            </linearGradient>
            <linearGradient id={`${id}-cloth-fold`}>
              <stop stopColor="black" stopOpacity="0" />
              <stop offset=".4" stopColor="black" stopOpacity={foldStrength} />
              <stop offset=".58" stopColor="white" stopOpacity={foldStrength * .55} />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            fill={treatment === "fabric" ? `url(#${id}-cloth-tone)` : "var(--export-frame-color)"}
            stroke="color-mix(in oklch, var(--export-frame-color) 70%, black)"
            strokeWidth={treatment === "fabric" ? 1 : 2}
            d={bannerOutlines[background]}
          />
          <path
            className={cn(
              "fill-none stroke-[var(--export-divider-color)] stroke-1",
              material.hem,
            )}
            d={bannerHems[background]}
          />
          {treatment === "fabric" ? <g clipPath={`url(#${id}-cloth-clip)`} fill={`url(#${id}-cloth-fold)`}>
            <path d="M10 0Q40 50 12 112H66Q58 55 76 0Z" />
            <path d="M226 0Q208 56 242 112H308Q266 55 292 0Z" />
            <path d="M830 0Q862 58 826 112H894Q920 56 896 0Z" />
            <path d="M1080 0Q1100 52 1070 112H1144Q1132 56 1152 0Z" />
          </g> : <>
          <path
            className={"fill-none stroke-black/10 stroke-[5]"}
            d="M28 6q-8 48 0 98M1124 5q8 48 0 98M279 6q-6 48 0 99M873 5q6 48 0 100"
          />
          <path
            className={"fill-none stroke-white/5 stroke-[5]"}
            d="M33 6q-8 48 0 98M1119 5q8 48 0 98M284 6q-6 48 0 99M868 5q6 48 0 100"
          />
            <path d="M17 16Q38 25 63 35M1135 16Q1110 27 1089 36" fill="none" stroke="black" strokeOpacity={foldStrength} strokeWidth="3" />
            <path d="M18 19Q38 28 62 38M1134 19Q1110 30 1090 39" fill="none" stroke="white" strokeOpacity={foldStrength * .4} strokeWidth="2" />
          </>}
          {background === "potrero" ? (
            <g className={"fill-[var(--export-divider-color)] fill-opacity-20"}>
              <path d="M1040 78l38-3 3 27-39 2Z" />
              <path
                className={
                  "fill-none stroke-[var(--export-divider-color)] stroke-1 stroke-opacity-50"
                }
                d="M1047 79v6m9-7v6m9-6v6m9-6v6m-25 14v6m9-7v6m9-6v6"
              />
            </g>
          ) : null}
          <g
            className={
              "fill-[var(--export-divider-color)] stroke-[var(--export-frame-color)] stroke-1"
            }
          >
            <circle cx="13" cy="13" r="3" />
            <circle cx="1139" cy="13" r="3" />
          </g>
          {treatment === "ties" && !hideTies ? <g fill="none" stroke="color-mix(in oklch, var(--export-divider-color) 65%, white)" strokeWidth="2" strokeLinecap="round">
            <path d="M10 9q-4 4 3 7q6 1 2-5m-3 4-2 8m5-8 4 6" />
            <path d="M1136 9q-4 4 3 7q6 1 2-5m-3 4-2 8m5-8 4 6" />
          </g> : null}
        </svg>
        <h1
          className={
            "relative w-[calc(100%_-_theme(spacing.20))] min-w-0 truncate text-center text-4xl font-bold text-white"
          }
          title={name}
        >
          {name}
        </h1>
      </div>
    </header>
  );
}
