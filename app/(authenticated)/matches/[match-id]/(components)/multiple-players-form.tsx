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
import { MAX_PLAYERS_PER_SAVE } from "@/utils/constants";
import { getLinesFromString } from "@/utils/get-lines-from-string";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
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
  const players = useWatch({ name: "players", control: form.control });

  /* We count the valid names in the form */
  const names = useMemo(() => {
    return getLinesFromString(players);
  }, [players]);

  const onSubmitHandler: () => Promise<void> = async () => {
    try {
      /* We just use the computed names so we don't need to format the submit handler values string again */
      const nextPlayers = names.map((name) => ({ name }));

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
                Agregá un nombre por línea. Se permiten hasta&nbsp;
                {MAX_PLAYERS_PER_SAVE} por lote.
              </FormDescription>
              {names.length > 0 ? (
                <FormDescription>
                  {names.length === 1
                    ? "Se ha detectado 1 nombre."
                    : `Se han detectado ${names.length} nombres.`}
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
