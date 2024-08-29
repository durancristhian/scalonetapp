import { FC } from "react";

type PlayersInMatchProps = {
  players: number;
};

export const PlayersInMatchLabel: FC<PlayersInMatchProps> = ({ players }) => {
  let content;

  switch (players) {
    case 0:
      content = "No hay personas anotadas";
      break;
    case 1:
      content = "1 persona";
      break;
    default:
      content = `${players} personas`;
      break;
  }

  return <p className="text-sm text-slate-700">{content}</p>;
};
