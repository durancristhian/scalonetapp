import { MultiplePlayersForm } from "@/app/(authenticated)/matches/[match-id]/(components)/multiple-players-form";
import { PlayerForm } from "@/app/(authenticated)/matches/[match-id]/(components)/player-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerSchema } from "@/schemas/player";
import { addMultiplePlayers, addPlayer } from "@/server/actions/player";
import { useParams } from "next/navigation";
import { FC } from "react";

export const PlayerTabs: FC = ({}) => {
  const params = useParams();
  const matchId = Number(params["match-id"]);

  const onPlayerSubmit: (values: PlayerSchema) => Promise<void> = (values) => {
    return addPlayer(matchId, values);
  };

  const onMultiplePlayersSubmit: (values: PlayerSchema[]) => Promise<void> = (
    values
  ) => {
    return addMultiplePlayers(matchId, values);
  };

  return (
    <>
      <Tabs defaultValue="single">
        <div className="grid gap-2">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="single">De a uno</TabsTrigger>
            <TabsTrigger value="multiple">De a muchos</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <PlayerForm onSubmit={onPlayerSubmit} />
          </TabsContent>
          <TabsContent value="multiple">
            <MultiplePlayersForm onSubmit={onMultiplePlayersSubmit} />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
};
