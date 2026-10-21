import { type ImageExportBackgroundId } from "@/utils/image-export-backgrounds";

// PROTOTYPE: compare fabric suspension and physical sign mounting at export scale.
const frame = "var(--export-frame-color)";
const trim = "var(--export-divider-color)";
const dark = "color-mix(in oklch, var(--export-frame-color) 72%, black)";
const light = "color-mix(in oklch, var(--export-divider-color) 60%, white)";

export function Cloth({ id, integrated = false }: { id: string; integrated?: boolean }) {
  return <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 1152 160" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={frame} />
        <stop offset=".45" stopColor={frame} />
        <stop offset="1" stopColor={dark} />
      </linearGradient>
      <linearGradient id={`${id}-fold`}>
        <stop stopColor="black" stopOpacity=".15" />
        <stop offset=".5" stopColor="black" stopOpacity="0" />
        <stop offset="1" stopColor="white" stopOpacity=".12" />
      </linearGradient>
    </defs>
    {/* One taut rope supports the loose cloth through visible eyelets and ties. */}
    {!integrated ? <>
      <path d="M8 16Q576 29 1144 16" fill="none" stroke={dark} strokeWidth="6" />
      <path d="M8 14Q576 27 1144 14" fill="none" stroke={light} strokeWidth="3" />
    </> : null}
    <path d="M26 32Q254 50 574 34Q840 22 1126 33L1120 121Q888 111 576 149Q266 141 32 120Z" fill="black" opacity=".14" transform="translate(2 8)" />
    <path d="M26 29Q254 47 574 31Q840 19 1126 30L1120 118Q888 108 576 146Q266 138 32 117Z" fill={`url(#${id}-cloth)`} />
    <path d="M27 29Q34 72 32 117L56 121Q42 77 47 31Z" fill={dark} opacity=".65" />
    <path d="M1104 29Q1115 70 1094 118L1120 118L1126 30Z" fill={dark} opacity=".65" />
    <path d="M42 41Q276 59 576 43Q864 31 1110 42M47 105Q290 126 576 133Q858 96 1106 106" fill="none" stroke={trim} strokeWidth="2" strokeDasharray="4 5" opacity=".6" />
    <path d="M80 34Q61 76 89 121L108 124Q85 74 101 35Z" fill={`url(#${id}-fold)`} />
    <path d="M1052 31Q1075 77 1044 116L1067 117Q1097 77 1078 31Z" fill={`url(#${id}-fold)`} />
    <path d="M304 42Q281 88 315 134L340 137Q311 91 329 42Z" fill={`url(#${id}-fold)`} opacity=".7" />
    <path d="M846 27Q869 70 843 117L869 115Q889 68 873 27Z" fill={`url(#${id}-fold)`} opacity=".6" />
    {[42,1110].map((x) => <g key={x}>
      <circle cx={x} cy="42" r="6" fill={dark} stroke={light} strokeWidth="3" />
      <path d={`M${x-3} 39L${x-8} 18q4-7 10-1l2 20m-6-18 9 1m-5 0 5 12`} fill="none" stroke={light} strokeWidth="3" strokeLinecap="round" />
    </g>)}
    {integrated ? <path d="M531 32q32 1 64-1" fill="none" stroke={light} strokeWidth="2" opacity=".4" /> : null}
  </svg>;
}

export function Terrace({ integrated = false }: { integrated?: boolean }) {
  return <svg className="absolute inset-0 size-full" viewBox={integrated ? "0 0 1280 304" : "0 0 1280 216"} preserveAspectRatio="none" aria-hidden="true">
    <path d="M60 0H1220L1280 216H0Z" fill={dark} />
    {Array.from({ length: 6 }, (_, row) => {
      const y = row * 28, inset = 58 - row * 9;
      return <g key={row}>
        <path d={`M${inset} ${y}H${1280-inset}l4 15H${inset-4}Z`} fill={`color-mix(in oklch, ${trim} 48%, oklch(0.7 0 none))`} />
        <path d={`M${inset-4} ${y+15}H${1284-inset}v13H${inset-4}Z`} fill={`color-mix(in oklch, ${frame} 50%, oklch(0.45 0 none))`} />
        <path d={`M${inset-4} ${y+15}H${1284-inset}`} stroke="white" opacity=".15" />
      </g>;
    })}
    <path d={integrated ? "M0 168H1280V274H0Z" : "M0 168H1280V205H0Z"} fill={dark} />
    <path d="M0 168H1280" stroke={trim} strokeWidth="6" />
    <path d="M0 174H1280" stroke="white" strokeOpacity=".12" strokeWidth="2" />
    {integrated ? <>
      <path d="M0 274H1280L1252 290H28Z" fill={frame} />
      <path d="M28 290H1252" stroke="black" strokeWidth="16" opacity=".12" />
      {[36,316,640,964,1244].map(x => <path key={x} d={`M${x} 176v94`} stroke={frame} strokeWidth="5" />)}
    </> : <path d="M0 205H1280L1260 216H20Z" fill={frame} />}
    {[72,1208].map(x => <g key={x}>
      <path d={`M${x} 28V176`} stroke={dark} strokeWidth="10" />
      <circle cx={x} cy="28" r="7" fill={trim} />
    </g>)}
  </svg>;
}

export function GroundSign({ background, mounted = false, shortLegs = false, irregular = false }: { background: ImageExportBackgroundId; mounted?: boolean; shortLegs?: boolean; irregular?: boolean }) {
  const wooden = background !== "pasto";
  // Deliberate silhouettes follow the field's increasing irregularity. No random jitter.
  const outlines = {
    pasto: "M10 5Q138 2 268 5T526 4L528 78Q394 81 268 78T10 80Z",
    natural: "M12 6Q142 0 268 6L399 3 525 8 529 76Q395 83 268 78L140 82 10 78Z",
    potrero: "M12 9L119 3 238 8 342 2 434 10 524 5 527 30 523 51 530 77 412 82 288 77 164 85 11 79 14 52 9 28Z",
  };
  const outline = irregular ? outlines[background] : wooden ? "M10 3L526 7L528 78L10 80Z" : "M10 3H526V78H10Z";
  return <svg className="absolute inset-0 size-full overflow-visible" viewBox={mounted ? "0 0 544 96" : shortLegs ? "0 0 544 112" : "0 0 544 144"} preserveAspectRatio="none" aria-hidden="true">
    {!mounted ? <>
      <ellipse cx="274" cy={shortLegs ? 105 : 135} rx="242" ry="8" fill="black" opacity=".13" />
      <path d={shortLegs ? "M80 62H92V104H80ZM452 62H464V104H452Z" : "M80 62H92V134H80ZM452 62H464V134H452Z"} fill={dark} />
      <path d={shortLegs ? "M83 68H86V100H83ZM455 68H458V100H455Z" : "M83 68H86V130H83ZM455 68H458V130H455Z"} fill={trim} opacity=".35" />
    </> : <>
      <path d="M40 0V95M504 0V95" stroke={dark} strokeWidth="8" />
      <path d="M24 7H520V91H24Z" fill="black" opacity=".15" />
    </>}
    <path d={irregular ? outline : wooden ? "M14 5L529 9L532 80L13 84Z" : "M14 5H530V82H14Z"} fill={dark} transform={irregular ? "translate(3 8)" : "translate(0 6)"} />
    <path d={outline} fill={frame} stroke={trim} strokeWidth="3" />
    {wooden ? <>
      <path d={irregular ? background === "potrero" ? "M12 39L119 36 238 42 342 38 434 44 525 40" : "M12 39Q145 36 268 41T526 42" : "M12 39L526 43"} stroke={dark} strokeWidth="3" />
      <path d="M24 16q106 8 204 1m110 8q97-6 170 0M28 66q100-6 205 0m95-5q72 5 172-1" fill="none" stroke={trim} strokeWidth="1" opacity=".2" />
    </> : <>
      <path d={irregular ? "M14 9Q140 6 268 9T522 8M14 10L14 75" : "M13 7H524M13 8V75"} stroke="white" strokeWidth="2" opacity=".2" />
      <path d={irregular ? "M14 76Q140 80 268 76T524 76" : "M13 75H524"} stroke={dark} strokeWidth="4" />
    </>}
    {[24,512].flatMap(x => [17,65].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={trim} />))}
  </svg>;
}
