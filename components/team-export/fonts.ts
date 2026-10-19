import { workSans } from "@/utils/fonts";
import { Barlow_Condensed, Teko } from "next/font/google";

const teko = Teko({ subsets: ["latin"], display: "swap", preload: false });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

export const exportFontClasses = {
  "work-sans": workSans.className,
  teko: teko.className,
  "barlow-condensed": barlowCondensed.className,
};
