import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* This is only used by shadcn components */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
