"use client";

import { useEffect, useState } from "react";
import { TeamExport } from "@/components/team-export/team-export";
import { type Team } from "@/types/team";
import { type ImageExportOptions } from "@/utils/image-export-options";
import { BannerStudyExport } from "../../../prototypes/export-composition/banner-study-canvas";
import { GradedExport } from "../../../prototypes/export-composition/graded-canvas";
import { RevisedExport } from "../../../prototypes/export-composition/revised-canvas";
import { CompositionExport } from "../../../prototypes/export-composition/canvas";

// PROTOTYPE: current composition and two alternatives, with identical teams.
const names = ["Alex", "Sofía Rodríguez", "Tomás", "Martín", "Valentina", "Julián", "Ángel", "Lautaro", "Nicolás", "Leonel", "Camila", "Bruno"];
const variants = ["actual", "A", "B", "C", "D", "E", "F", "G"];
const labels = { G: "B sin soguitas", E: "Tela y pliegues suaves", F: "Sujeción visible", D: "Irregularidad por niveles", C: "Ajuste · Patas cortas", actual: "Actual", A: "A · Tela y apoyos", B: "B · Frente de tribuna" };
export default function CompositionStudy() {
  const [search, setSearch] = useState("");
  useEffect(() => { setSearch(location.search); }, []);
  const params = new URLSearchParams(search);
  const variant = variants.includes(params.get("variant") || "") ? params.get("variant")! as keyof typeof labels : "actual";
  const background = (params.get("background") || "pasto") as ImageExportOptions["background"];
  const count = Math.max(0, Math.min(100, Number(params.get("count") || 12)));
  const roster = Array.from({ length: count }, (_, index) => ({ id: index + 1, name: names[index % names.length], avatar: "", position: "mid" as const, level: 5, matchId: 0, createdAt: new Date(0), updatedAt: new Date(0) }));
  const teams: Team[] = [{ id: "a", name: "Los del miércoles", players: roster.slice(0, Math.ceil(count / 2)) }, { id: "b", name: "La banda de la esquina", players: roster.slice(Math.ceil(count / 2)) }];
  const playerRoles = Object.fromEntries(teams.map(team => [team.id, { playerIds: team.players.map(player => player.id), assignments: { goalkeeper: team.players[0]?.id ?? null, captain: team.players[1]?.id ?? null } }]));
  if (params.has("long")) teams.forEach(team => { team.name = "UnNombreDeEquipoExtensoSinEspaciosDePrueba"; });
  const options: ImageExportOptions = { background, weather: (params.get("weather") || "none") as ImageExportOptions["weather"], avatarShape: (params.get("avatarShape") || "square") as ImageExportOptions["avatarShape"], alignment: (params.get("alignment") || "left") as ImageExportOptions["alignment"] };
  const shared = { name: "El partido del miércoles", teams, options, playerRoles };
  const change = (next: string) => { const params = new URLSearchParams(location.search); params.set("variant", next); history.replaceState(null, "", `?${params}`); setSearch(`?${params}`); };
  useEffect(() => { const key = (event: KeyboardEvent) => { if ((event.target as Element)?.closest("input,select,textarea,[contenteditable]")) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); change(variants[(variants.indexOf(variant) + (event.key === "ArrowRight" ? 1 : variants.length - 1)) % variants.length]); } }; addEventListener("keydown", key); return () => removeEventListener("keydown", key); }, [variant]);
  return <main data-qa-search={search} className="w-fit">
    {variant === "actual" ? <TeamExport {...shared} /> : variant === "C" ? <RevisedExport {...shared} /> : variant === "D" ? <GradedExport {...shared} /> : variant === "E" || variant === "F" || variant === "G" ? <BannerStudyExport {...shared} treatment={variant === "E" ? "fabric" : "ties"} hideTies={variant === "G"} /> : <CompositionExport {...shared} variant={variant} />}
    {process.env.NODE_ENV !== "production" ? <nav aria-label="Comparar composiciones" className="fixed [inset-block-end:theme(spacing.4)] start-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-foreground p-3 text-background shadow-lg">
      <button onClick={() => change(variants[(variants.indexOf(variant) + variants.length - 1) % variants.length])} aria-label="Variante anterior" className="size-10 rounded-full border">←</button>
      <span>{labels[variant]} · {background} · {count} jugadores</span>
      <button onClick={() => change(variants[(variants.indexOf(variant) + 1) % variants.length])} aria-label="Variante siguiente" className="size-10 rounded-full border">→</button>
    </nav> : null}
  </main>;
}
