"use client";

import { SpicyTooltips } from "@/components/spicy-tooltips";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { PLAYER_SCHEMA, PlayerSchema } from "@/schemas/player";
import { unfoldZodError } from "@/utils/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { default as BoringAvatar } from "boring-avatars";
import { LoaderCircleIcon } from "lucide-react";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { ZodError } from "zod";

/* Players are categorized from 1 to 10 */
const PLAYER_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/* Description of every player level */
const LEVEL_MESSAGES: Record<number, string> = {
  1: "Un tronco realmente.",
  2: "Se defiende, pero podría jugar al pelota paleta mejor.",
  3: "Definitivamente hay peores.",
  4: "Ni bueno ni malo.",
  5: "Es un jugador regular. Cumple.",
  6: "Tiene sus días pero en general anda bien.",
  7: "Está por encima de la media.",
  8: "Che, a este hay que sumarlo al grupo.",
  9: "Andá a saber por que no llegó a primera.",
  10: "La verdadera máquina.",
};

/* Input placeholder */
const INPUT_PLACEHOLDER = "Juan Roman Riquelme";

type PlayerFormProps = {
  onSubmit: (values: PlayerSchema) => Promise<void>;
  values?: PlayerSchema;
};

export const PlayerForm: FC<PlayerFormProps> = ({ onSubmit, values }) => {
  const form = useForm<PlayerSchema>({
    defaultValues: values || {
      name: "",
      level: Number(process.env.DEFAULT_PLAYER_LEVEL),
    },
    resolver: zodResolver(PLAYER_SCHEMA),
    values,
  });

  const onSubmitHandler: (values: PlayerSchema) => Promise<void> = async (
    values
  ) => {
    try {
      await onSubmit(values);

      form.setFocus("name");
      form.reset();
    } catch (error) {
      console.error(error);

      let errorMessage = "";

      if (error instanceof ZodError) {
        errorMessage = unfoldZodError(error).join(". ");
      } else if (error instanceof Error) {
        errorMessage =
          error.message ||
          "No pudimos agregar el jugador. ¿Podrías volver a intentarlo?.";
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
          name="name"
          render={({ field }) => (
            <div className="flex gap-4 items-center">
              <div>
                <SpicyTooltips>
                  <BoringAvatar
                    variant="beam"
                    name={field.value || INPUT_PLACEHOLDER}
                    size={48}
                  />
                </SpicyTooltips>
              </div>
              <div className="grow">
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder={INPUT_PLACEHOLDER} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            </div>
          )}
        />
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel</FormLabel>
              <FormControl>
                <div className="auto-cols-max gap-1 grid grid-cols-10">
                  {PLAYER_LEVELS.map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={field.value === level ? "outline" : "ghost"}
                      /* We remove the horizontal padding in favor of getting space from the parent auto-cols-max */
                      className="px-0"
                      onClick={() => {
                        field.onChange(level);
                      }}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormDescription>{LEVEL_MESSAGES[field.value]}</FormDescription>
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
            <LoaderCircleIcon className="animate-spin h-4 mr-2 opacity-50 w-4" />
          ) : null}
          {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
};
