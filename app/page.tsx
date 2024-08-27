import { AddPlayer } from "@/app/match-players/add-player";
import { PlayersList } from "@/app/match-players/players-list";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="grow">
        <div className="container mx-auto p-4">
          {/* TODO: move this to a component */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg">Armador de equipos</h2>
            <div>
              <AddPlayer />
            </div>
            <div>
              <PlayersList />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
