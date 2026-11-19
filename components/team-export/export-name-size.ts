import { TEAMS_PER_MATCH } from "@/utils/team-count";
import { EXPORT_LAYOUT } from "./export-layout";

const LABEL_PADDING_INLINE = 10;
const LABEL_GAP = 8;
const BADGE_GAP = 4;
const SPACE_WIDTH = 0.3;
const NARROW_CHARACTERS = new Set(".,;:'´`!|()1IÍÌÏ");
const WIDE_CHARACTERS = new Set("MWÆŒ");

const NAME_SIZES = [
  { fontSize: 24, lines: 2 },
  { fontSize: 20, lines: 2 },
  { fontSize: 16, lines: 3 },
  { fontSize: 14, lines: 3 },
] as const;

export type ExportNameSize = (typeof NAME_SIZES)[number]["fontSize"];

const labelWidth =
  (EXPORT_LAYOUT.width / TEAMS_PER_MATCH -
    2 * EXPORT_LAYOUT.teamInset -
    EXPORT_LAYOUT.columnGap) /
    2 -
  2 * LABEL_PADDING_INLINE;

function characterWidth(character: string): number {
  if (NARROW_CHARACTERS.has(character)) return 0.45;
  if (WIDE_CHARACTERS.has(character)) return 1;
  return character.codePointAt(0)! > 0x24f ? 1.25 : 0.75;
}

function countLines(name: string, lineWidth: number): number {
  let lines = 1;
  let used = 0;
  for (const word of name.toUpperCase().split(/\s+/).filter(Boolean)) {
    for (const [index, segment] of word.split(/(?<=-)/).entries()) {
      const characters = Array.from(segment);
      const width = characters.reduce(
        (total, character) => total + characterWidth(character),
        0,
      );
      const gap = used && !index ? SPACE_WIDTH : 0;
      if (used + gap + width <= lineWidth) {
        used += gap + width;
        continue;
      }
      if (used) lines++;
      used = 0;
      for (const character of characters) {
        const advance = characterWidth(character);
        if (used && used + advance > lineWidth) {
          lines++;
          used = 0;
        }
        used += advance;
      }
    }
  }
  return lines;
}

export function getExportNameSize(
  name: string,
  inlineBadges: number,
): ExportNameSize {
  const fitting = NAME_SIZES.find(({ fontSize, lines }) => {
    const badges = inlineBadges
      ? inlineBadges * fontSize + (inlineBadges - 1) * BADGE_GAP + LABEL_GAP
      : 0;
    return countLines(name, (labelWidth - badges) / fontSize) <= lines;
  });
  return (fitting ?? NAME_SIZES.at(-1)!).fontSize;
}
