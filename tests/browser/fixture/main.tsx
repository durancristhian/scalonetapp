import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { Toaster } from "sonner";
import { MatchPlayers } from "@/app/(authenticated)/partidos/[match-id]/(components)/match-players";
import { player } from "../../fixtures";
import "@/app/globals.css";

const roster = [player(1, { name: "Ana" })];
function Fixture() {
  const [clicks, setClicks] = useState(0);
  return <><button onClick={() => setClicks(value => value + 1)}>Comprobar clics: {clicks}</button>
    <PathParamsContext.Provider value={{ "match-id": "1" }}><MatchPlayers players={roster} /></PathParamsContext.Provider><Toaster /></>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><Fixture /></StrictMode>);
