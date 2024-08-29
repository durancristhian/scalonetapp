import { FC } from "react";

type PlayersInMatchProps = {
  players: number;
};

/* TODO: Handle pluralization with an npm package */
export const PlayersInMatchLabel: FC<PlayersInMatchProps> = ({ players }) => {
  let content;

  switch (players) {
    case 0:
      content = "No hay personas";
      break;
    case 1:
      content = "1 persona";
      break;
    default:
      content = `${players} personas`;
      break;
  }

  return content;
};
