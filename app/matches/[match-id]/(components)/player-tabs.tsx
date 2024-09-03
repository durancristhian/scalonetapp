import { PlayerForm } from "@/app/matches/[match-id]/(components)/player-form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerSchema } from "@/schemas/player";
import { addPlayer } from "@/server/actions/player";
import { useParams } from "next/navigation";
import { FC } from "react";

type PlayerTabsProps = {};

export const PlayerTabs: FC<PlayerTabsProps> = ({}) => {
  const params = useParams();

  const onPlayerSubmit: (values: PlayerSchema) => Promise<void> = (values) => {
    return addPlayer(values, Number(params["match-id"]));
  };

  return (
    <>
      <Tabs defaultValue="single">
        <div className="grid gap-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="single">De a 1</TabsTrigger>
            <TabsTrigger value="multiple">De a muchos</TabsTrigger>
          </TabsList>
          <Separator />
          <TabsContent value="single">
            <PlayerForm onSubmit={onPlayerSubmit} />
          </TabsContent>
          <TabsContent value="multiple"></TabsContent>
        </div>
      </Tabs>
    </>
  );
};
