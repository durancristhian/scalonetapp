// Approved Coolors palettes. Keep IDs and source order stable for saved exports.
export const COLOR_PALETTES = [
  {
    "id": "clasico-rojo",
    "label": "Clásica",
    "sourceUrl": "https://coolors.co/palette/003049-d62828-f77f00-fcbf49-eae2b7",
    "colors": [
      "#003049",
      "#D62828",
      "#F77F00",
      "#FCBF49",
      "#EAE2B7"
    ],
    "roles": [
      "#D62828",
      "#003049",
      "#FCBF49",
      "#F77F00",
      "#EAE2B7"
    ]
  },
  {
    "id": "fuego-de-estadio",
    "label": "Fuego",
    "sourceUrl": "https://coolors.co/palette/03071e-370617-6a040f-9d0208-d00000-dc2f02-e85d04-f48c06-faa307-ffba08",
    "colors": [
      "#03071E",
      "#370617",
      "#6A040F",
      "#9D0208",
      "#D00000",
      "#DC2F02",
      "#E85D04",
      "#F48C06",
      "#FAA307",
      "#FFBA08"
    ],
    "roles": [
      "#D00000",
      "#FFBA08",
      "#E85D04",
      "#FAA307",
      "#DC2F02",
      "#F48C06",
      "#9D0208",
      "#6A040F",
      "#370617",
      "#03071E"
    ]
  },
  {
    "id": "azul-electrico",
    "label": "Eléctrica",
    "sourceUrl": "https://coolors.co/palette/ffbe0b-fb5607-ff006e-8338ec-3a86ff",
    "colors": [
      "#FFBE0B",
      "#FB5607",
      "#FF006E",
      "#8338EC",
      "#3A86FF"
    ],
    "roles": [
      "#3A86FF",
      "#FFBE0B",
      "#FF006E",
      "#FB5607",
      "#8338EC"
    ]
  },
  {
    "id": "cancha-tropical",
    "label": "Tropical",
    "sourceUrl": "https://coolors.co/palette/ef476f-ffd166-06d6a0-118ab2-073b4c",
    "colors": [
      "#EF476F",
      "#FFD166",
      "#06D6A0",
      "#118AB2",
      "#073B4C"
    ],
    "roles": [
      "#06D6A0",
      "#EF476F",
      "#FFD166",
      "#118AB2",
      "#073B4C"
    ]
  },
  {
    "id": "naranja-mecanica",
    "label": "Ámbar",
    "sourceUrl": "https://coolors.co/palette/8ecae6-219ebc-023047-ffb703-fb8500",
    "colors": [
      "#8ECAE6",
      "#219EBC",
      "#023047",
      "#FFB703",
      "#FB8500"
    ],
    "roles": [
      "#FB8500",
      "#219EBC",
      "#FFB703",
      "#023047",
      "#8ECAE6"
    ]
  },
  {
    "id": "verde-de-copa",
    "label": "Bosque",
    "sourceUrl": "https://coolors.co/palette/da2c38-226f54-87c38f-f4f0bb-43291f",
    "colors": [
      "#DA2C38",
      "#226F54",
      "#87C38F",
      "#F4F0BB",
      "#43291F"
    ],
    "roles": [
      "#226F54",
      "#DA2C38",
      "#87C38F",
      "#F4F0BB",
      "#43291F"
    ]
  },
  {
    "id": "pista-violeta",
    "label": "Neón",
    "sourceUrl": "https://coolors.co/palette/f72585-7209b7-3a0ca3-4361ee-4cc9f0",
    "colors": [
      "#F72585",
      "#7209B7",
      "#3A0CA3",
      "#4361EE",
      "#4CC9F0"
    ],
    "roles": [
      "#7209B7",
      "#4CC9F0",
      "#F72585",
      "#4361EE",
      "#3A0CA3"
    ]
  },
  {
    "id": "tribuna-multicolor",
    "label": "Fiesta",
    "sourceUrl": "https://coolors.co/palette/ff595e-ffca3a-8ac926-1982c4-6a4c93",
    "colors": [
      "#FF595E",
      "#FFCA3A",
      "#8AC926",
      "#1982C4",
      "#6A4C93"
    ],
    "roles": [
      "#FF595E",
      "#1982C4",
      "#FFCA3A",
      "#8AC926",
      "#6A4C93"
    ]
  },
  {
    "id": "oro-de-final",
    "label": "Oro",
    "sourceUrl": "https://coolors.co/palette/000000-14213d-fca311-e5e5e5-ffffff",
    "colors": [
      "#000000",
      "#14213D",
      "#FCA311",
      "#E5E5E5",
      "#FFFFFF"
    ],
    "roles": [
      "#FCA311",
      "#14213D",
      "#000000",
      "#E5E5E5",
      "#FFFFFF"
    ]
  },
  {
    "id": "pasion-granate",
    "label": "Pasión",
    "sourceUrl": "https://coolors.co/palette/390099-9e0059-ff0054-ff5400-ffbd00",
    "colors": [
      "#390099",
      "#9E0059",
      "#FF0054",
      "#FF5400",
      "#FFBD00"
    ],
    "roles": [
      "#9E0059",
      "#FFBD00",
      "#FF5400",
      "#FF0054",
      "#390099"
    ]
  }
] as const;

export type ColorPaletteId = (typeof COLOR_PALETTES)[number]["id"];
export const DEFAULT_COLOR_PALETTE: ColorPaletteId = "clasico-rojo";
export const ARTWORK_BACKGROUND = "#FFFFFF";

export function isColorPaletteId(value: unknown): value is ColorPaletteId {
  return COLOR_PALETTES.some(({ id }) => id === value);
}

export function getColorPalette(id: ColorPaletteId = DEFAULT_COLOR_PALETTE) {
  return COLOR_PALETTES.find((palette) => palette.id === id)!;
}

export function getArtworkStyle(id: ColorPaletteId = DEFAULT_COLOR_PALETTE) {
  const { roles } = getColorPalette(id);
  return {
    backgroundColor: ARTWORK_BACKGROUND,
    "--pattern-primary": roles[0],
    "--pattern-secondary": roles[1],
  };
}

export function parseColorPalette(params: URLSearchParams): ColorPaletteId | null {
  const values = params.getAll("palette");
  if (!values.length) return DEFAULT_COLOR_PALETTE;
  return values.length === 1 && isColorPaletteId(values[0]) ? values[0] : null;
}
