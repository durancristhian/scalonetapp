import { palettePlayerAvatarResponse } from "@/server/player-avatar";
import { type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  return palettePlayerAvatarResponse(request.nextUrl.searchParams, {
    eyesVariant: ["variant03", "variant04", "variant05"],
    eyesProbability: 100,
  });
}
