import { getMyPlayers } from "@/server/queries";

export const PlayersList = async () => {
  const players = await getMyPlayers();

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
        <ul className="list-decimal ml-4">
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      </div>
    </>
  );
};
