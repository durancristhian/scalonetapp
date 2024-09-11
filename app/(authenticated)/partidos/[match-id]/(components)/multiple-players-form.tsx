"use client";

import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
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
import { PLAYER_SCHEMA, PlayerSchema } from "@/schemas/player";
import { PLAYERS_SCHEMA, PlayersSchema } from "@/schemas/players";
import { unfoldZodError } from "@/utils/errors";
import { getLinesFromString } from "@/utils/get-lines-from-string";
import { getPlayersFromLines } from "@/utils/get-players-from-lines";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ZodError } from "zod";

const PLACEHOLDER = `Juan, 2
Roman
Riquelme, 10`;

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

      /* This seems redundant but it's not since each item in the array should be a valid player */
      nextPlayers.map((nextPlayer) => PLAYER_SCHEMA.parse(nextPlayer));

      await onSubmit(nextPlayers);

      form.setFocus("players");
      form.reset();
    } catch (error) {
      console.error(error);

      let errorMessage = "";

      if (error instanceof ZodError) {
        errorMessage = unfoldZodError(error).join(". ");
      } else if (error instanceof Error) {
        errorMessage =
          error.message ||
          `No pudimos agregar ${
            lines.length > 1 ? "el jugador" : "los jugadores"
          }. Por favor, verifica la información y prueba otra vez.`;
      }

      form.setError("root", {
        message: errorMessage,
        type: "validate",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitHandler)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="players"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea rows={10} placeholder={PLACEHOLDER} {...field} />
              </FormControl>
              <FormDescription>
                Agrega un nombre (obligatorio) y un nivel (opcional) por línea,
                separados por coma. Si no pones nivel, asignamos{" "}
                {process.env.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL} por defecto.
                ¡Puedes añadir hasta {process.env.NEXT_PUBLIC_MAX_PLAYERS_BATCH}{" "}
                jugadores de una sola vez!
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
        <Button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
          ) : null}
          {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
};
