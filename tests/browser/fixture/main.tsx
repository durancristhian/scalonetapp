import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Toaster } from "sonner";
import { MatchPlayers } from "@/app/(authenticated)/partidos/[match-id]/(components)/match-players";
import { MatchItem } from "@/app/(authenticated)/(components)/match-item";
import { match, player } from "../../fixtures";
import "@/app/globals.css";

import { FloatingMotionFixture } from "./floating-motion";
import { FocusFixture } from "./focus";
import { MotionFixture } from "./motion";
import { CarouselFixture } from "./carousel";

const roster = [player(1, { name: "Ana" })];
const router = {
  back() {},
  forward() {},
  refresh() {},
  push() {},
  replace() {},
  prefetch() {},
  bfcacheId: "fixture",
};
function Fixture() {
  const [clicks, setClicks] = useState(0);
  return (
    <>
      <button onClick={() => setClicks((value) => value + 1)}>
        Comprobar clics: {clicks}
      </button>
      <MatchItem match={match()} disableDuplication={false} />
      <AppRouterContext.Provider value={router}>
        <PathParamsContext.Provider value={{ "match-id": "1" }}>
          <MatchPlayers players={roster} />
        </PathParamsContext.Provider>
      </AppRouterContext.Provider>
      <Toaster />
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {new URLSearchParams(location.search).has("public-footer") ? (
      <>
        <PublicHeader />
        <PublicFooter />
      </>
    ) : new URLSearchParams(location.search).has("carousel") ? (
      <CarouselFixture />
    ) : new URLSearchParams(location.search).has("floating-motion") ? (
      <FloatingMotionFixture />
    ) : new URLSearchParams(location.search).has("motion") ? (
      <MotionFixture />
    ) : new URLSearchParams(location.search).has("focus") ? (
      <FocusFixture />
    ) : (
      <Fixture />
    )}
  </StrictMode>,
);
