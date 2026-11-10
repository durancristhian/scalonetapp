import {
  isValidAvatarName,
  playerAvatarResponse,
} from "@/server/player-avatar";
import { type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  if (!isValidAvatarName(name)) {
    return new Response("Invalid avatar name", { status: 400 });
  }
  return playerAvatarResponse(name, {
    backgroundColor: ["#780000", "#c1121f", "#fdf0d5", "#003049", "#669bbc"],
  });
}
