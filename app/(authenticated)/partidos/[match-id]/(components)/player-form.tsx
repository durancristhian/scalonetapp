"use client";

import { PlayerAvatarInput } from "@/components/player-avatar-input";
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PLAYER_SCHEMA, type PlayerSchema } from "@/schemas/player";
import { PLAYER_POSITIONS } from "@/utils/player-positions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState, type FC } from "react";
import { useForm } from "react-hook-form";

const PLAYER_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

const INPUT_PLACEHOLDER = "Juan Roman Riquelme";

type PlayerFormProps = {
  onSubmit: (values: PlayerSchema, photo?: Blob | null) => Promise<void>;
  avatar?: string;
  values?: PlayerSchema;
};

export const PlayerForm: FC<PlayerFormProps> = ({
  onSubmit,
  values,
  avatar,
}) => {
  const id = useId();
  const [photoPreparing, setPhotoPreparing] = useState(false);
  const [photo, setPhoto] = useState<Blob | null | undefined>();
  const form = useForm<PlayerSchema>({
    defaultValues: values || {
      name: "",
      level: Number(process.env.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL),
      position: "mid",
    },
    resolver: zodResolver(PLAYER_SCHEMA),
    values,
  });
  const onSubmitHandler: (values: PlayerSchema) => Promise<void> = async (
    values,
  ) => {
    if (photoPreparing) return;
    try {
      await onSubmit(values, photo);

      form.reset();
    } catch (error) {}
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder={INPUT_PLACEHOLDER} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <PlayerAvatarInput
          name={form.watch("name")}
          src={avatar}
          disabled={form.formState.isSubmitting}
          onChange={setPhoto}
          onPreparingChange={setPhotoPreparing}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel id={`${id}-position-label`}>Posición</FormLabel>
              <FormControl>
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  orientation="horizontal"
                  aria-labelledby={`${id}-position-label`}
                  className="grid-cols-2 gap-1 sm:grid-cols-4"
                >
                  {Object.entries(PLAYER_POSITIONS).map(([key, value]) => (
                    <RadioGroupItem
                      key={key}
                      value={key}
                      variant="button"
                      ref={field.value === key ? field.ref : undefined}
                    >
                      {value}
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel id={`${id}-level-label`}>Nivel de juego</FormLabel>
              <FormControl>
                <RadioGroup
                  name={field.name}
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(Number(value))}
                  onBlur={field.onBlur}
                  orientation="horizontal"
                  aria-labelledby={`${id}-level-label`}
                  className="grid-cols-5 gap-1"
                >
                  {PLAYER_LEVELS.map((level) => (
                    <RadioGroupItem
                      key={level}
                      value={String(level)}
                      variant="button"
                      ref={field.value === level ? field.ref : undefined}
                    >
                      {level}
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>{LEVEL_MESSAGES[field.value]}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootError />
        <DialogFooter>
          <Button
            type="submit"
            disabled={
              photoPreparing ||
              !form.formState.isValid ||
              form.formState.isSubmitting
            }
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
