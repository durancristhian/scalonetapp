import { type Player } from "@prisma/client";

export type BaseTeam = {
  id: string;
  name: string;
  players: number[];
  defaultCaptainId?: number;
};

export type Team = Pick<BaseTeam, "id" | "name" | "defaultCaptainId"> & {
  players: Player[];
};
