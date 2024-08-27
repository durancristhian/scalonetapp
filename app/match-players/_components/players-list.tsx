import { deletePlayer } from "@/server/actions/delete-player";
import { getPlayers } from "@/server/queries";
import { TrashIcon } from "@heroicons/react/16/solid";

export const PlayersList = async () => {
  const players = await getPlayers();

  if (!players.length) {
    return (
      <h3 className="font-semibold">
        No hay jugadores en la lista por el momento.
      </h3>
    );
  }

  return (
    <>
      <h3 className="font-semibold">Hay {players.length}/10 en la lista:</h3>
      <div className="mt-4">
        <ul className="flex flex-col gap-2">
          {players.map((player) => (
            <li key={player.id} className="flex gap-2 items-center">
              <form
                action={async () => {
                  "use server";

                  await deletePlayer(player.id);
                }}
                className="inline-flex"
              >
                <button type="submit">
                  <TrashIcon className="h-4 text-zinc-500 w-4" />
                </button>
              </form>
              <div className="grow">
                <p>{player.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
