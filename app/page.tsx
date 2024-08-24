"use client";

import { AddPlayer } from "@/app/match-creator/add-player";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PlayersList } from "./match-creator/players-list";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="grow">
        <div className="py-4">
          <div className="container mx-auto">
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
      </div>
      <Footer />
    </div>
  );
}
