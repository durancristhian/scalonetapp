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
  FormMessage,
  FormRootError,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PlayerSchema } from "@/schemas/player";
import { PLAYERS_SCHEMA, PlayersSchema } from "@/schemas/players";
import { getLinesFromString } from "@/utils/get-lines-from-string";
import { getPlayersFromLines } from "@/utils/get-players-from-lines";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

const PLACEHOLDER = `Juan
Roman
Riquelme`;

type MultiplePlayersFormProps = {
  onSubmit: (values: PlayerSchema[]) => Promise<void>;
};

export const MultiplePlayersForm: FC<MultiplePlayersFormProps> = ({
  onSubmit,
}) => {
  const form = useForm<PlayersSchema>({
    defaultValues: {
      players: "",
    },
    resolver: zodResolver(PLAYERS_SCHEMA),
  });
  /* We listen for changes in the players string */
  const players = useWatch({
    name: "players",
    control: form.control,
  });

  /* We count the valid lines in the form */
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
              <FormControl>
                <Textarea rows={10} placeholder={PLACEHOLDER} {...field} />
              </FormControl>
              <FormDescription>
                Agrega un nombre por línea.¡Puedes añadir hasta{" "}
                {process.env.NEXT_PUBLIC_MAX_PLAYERS_BATCH} al mismo tiempo.
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
