import { workSans } from "@/utils/fonts";
import { Exo_2, Saira } from "next/font/google";

const exo2 = Exo_2({ subsets: ["latin"], display: "swap", preload: false });
const saira = Saira({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const exportFontClasses = {
  "work-sans": workSans.className,
  "exo-2": exo2.className,
  saira: saira.className,
};
