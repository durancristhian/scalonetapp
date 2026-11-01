import { type Player } from "@prisma/client";

export type BaseTeam = {
  id: string;
  name: string;
  players: number[];
};

export type Team = Pick<BaseTeam, "id" | "name"> & {
  players: Player[];
};
