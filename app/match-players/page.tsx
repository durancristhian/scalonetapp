import { AddPlayer } from "@/app/match-players/_components/add-player";
import { PlayersList } from "@/app/match-players/_components/players-list";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">TODO: update me</h2>
      <div>
        <AddPlayer />
      </div>
      <div>
        <PlayersList />
      </div>
    </div>
  );
}
