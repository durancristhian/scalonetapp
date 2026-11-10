import { getMatchByIdQuery } from "@/server/queries/match";
import { captureTeamExport } from "@/server/capture-team-export";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import {
  getImageExportTarget,
  ImageExportConfigurationError,
} from "@/utils/image-export-target";
import { parseImageExportRequest } from "@/utils/image-export-request";
import { type NextRequest, NextResponse } from "next/server";
import { getSavedTeamsError } from "@/utils/team-validation";
import { readSavedTeams } from "@/utils/read-saved-teams";
import { hydrateTeams } from "@/utils/hydrate-teams";
import { lineupFingerprint } from "@/utils/lineup-fingerprint";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const exportRequest = parseImageExportRequest(request.nextUrl.searchParams);
  if (!exportRequest) {
    return NextResponse.json(
      { error: "Opciones de imagen no válidas." },
      { status: 400 },
    );
  }
  const { options, selections } = exportRequest;

  try {
    const exportTarget = getImageExportTarget();
    const pathname = request.nextUrl.pathname;
    const [, , matchIdStr] = pathname.split("/");
    const matchId = Number(matchIdStr);

    const match = await getMatchByIdQuery(matchId);

    if (!match) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.not_found },
        { status: 404 },
      );
    }

    let teams: unknown;
    try {
      teams = JSON.parse(match.teams);
    } catch {
      teams = null;
    }
    const teamsError = getSavedTeamsError(
      teams,
      match.players.map((player) => player.id),
    );
    if (teamsError) {
      return NextResponse.json({ error: teamsError }, { status: 422 });
    }
    const savedTeams = readSavedTeams(match.teams);
    const expected = request.headers.get("X-Lineup-Fingerprint");
    if (expected) {
      const hydrated = hydrateTeams(savedTeams, match.players);
      if (expected !== (await lineupFingerprint(match.name, hydrated))) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.match_export_changed },
          { status: 409 },
        );
      }
    }

    const image = await captureTeamExport(
      match,
      options,
      selections,
      exportTarget,
    );
    const response = new NextResponse(Buffer.from(image.data));
    response.headers.set("content-type", image.contentType);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename=${image.filename}`,
    );

    return response;
  } catch (error) {
    console.error(error);

    if (error instanceof ImageExportConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: ERROR_MESSAGES.server_error },
      { status: 404 },
    );
  }
}
