"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PlayerSchema } from "@/schemas/player";
import { PLAYERS_SCHEMA, PlayersSchema } from "@/schemas/players";
import { DEFAULT_PLAYER_LEVEL, MAX_PLAYERS_BATCH } from "@/utils/constants";
import { getLinesFromString } from "@/utils/get-lines-from-string";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import { FC, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

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
      const nextPlayers = lines.map((line) => {
        const lastCommaIdx = line.lastIndexOf(",");

        if (lastCommaIdx === -1) {
          return {
            name: line,
            level: DEFAULT_PLAYER_LEVEL,
          };
        }

        return {
          name: line.substring(0, lastCommaIdx).trim(),
          level: Number(line.substring(lastCommaIdx + 1).trim()),
        };
      });

      await onSubmit(nextPlayers);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        form.setError("players", {
          message: error.message,
          type: "validate",
        });
      }

      return;
    }

    form.reset();
    form.setFocus("players");
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
                Agregá un nombre (requerido) y un nivel (opcional) por línea
                separados por coma. Quienes no tengan nivel, se les asigna{" "}
                {DEFAULT_PLAYER_LEVEL} por defecto. Se permiten hasta&nbsp;
                {MAX_PLAYERS_BATCH} líneas por lote.
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
        <Button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <LoaderCircleIcon className="animate-spin h-4 mr-2 opacity-50 w-4" />
          ) : null}
          {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
};
