"use client";

import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRootError,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { type PlayerSchema } from "@/schemas/player";
import { createPlayersSchema, type PlayersSchema } from "@/schemas/players";
import { getLinesFromString } from "@/utils/get-lines-from-string";
import {
  getRemainingPlayerSlots,
  MAX_PLAYERS_BATCH,
} from "@/utils/player-limits";
import { getPlayersFromLines } from "@/utils/get-players-from-lines";
import { zodResolver } from "@hookform/resolvers/zod";
import { type FC, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

const PLACEHOLDER = `Juan
Roman
Riquelme`;

type MultiplePlayersFormProps = {
  currentPlayerCount: number;
  onSubmit: (values: PlayerSchema[]) => Promise<void>;
};

export const MultiplePlayersForm: FC<MultiplePlayersFormProps> = ({
  currentPlayerCount,
  onSubmit,
}) => {
  const schema = useMemo(
    () => createPlayersSchema(currentPlayerCount),
    [currentPlayerCount],
  );
  const availableSlots = getRemainingPlayerSlots(currentPlayerCount);
  const form = useForm<PlayersSchema>({
    mode: "onChange",
    defaultValues: {
      players: "",
    },
    resolver: zodResolver(schema),
  });
  const players = useWatch({
    name: "players",
    control: form.control,
  });

  const lines = useMemo(() => {
    return getLinesFromString(players);
  }, [players]);

  const onSubmitHandler: () => Promise<void> = async () => {
    try {
      const nextPlayers = getPlayersFromLines(lines);

      await onSubmit(nextPlayers);

      form.reset();
    } catch (error) {}
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="players"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jugadores</FormLabel>
              <FormControl>
                <Textarea rows={10} placeholder={PLACEHOLDER} {...field} />
              </FormControl>
              <FormDescription>
                Agregá un nombre por línea, hasta {MAX_PLAYERS_BATCH} por carga.
                Podés agregar hasta {availableSlots}{" "}
                {availableSlots === 1 ? "jugador más" : "jugadores más"} a este
                partido.
              </FormDescription>
              {lines.length > 0 ? (
                <FormDescription>
                  {lines.length === 1
                    ? "Se ha detectado 1 nombre."
                    : `Se han detectado ${lines.length} nombres.`}
                </FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootError />
        <DialogFooter>
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
            ) : null}
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
