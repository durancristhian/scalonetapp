"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
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
import { PLAYER_SCHEMA, PlayerSchema } from "@/schemas/player";
import { PLAYER_POSITIONS } from "@/utils/player-positions";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useRef, useState } from "react";
import { useForm } from "react-hook-form";

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

const INPUT_PLACEHOLDER = "Juan Roman Riquelme";

type PlayerFormProps = {
  onSubmit: (values: PlayerSchema) => Promise<void>;
  values?: PlayerSchema;
};

export const PlayerForm: FC<PlayerFormProps> = ({ onSubmit, values }) => {
  const form = useForm<PlayerSchema>({
    defaultValues: values || {
      avatar: "",
      name: "",
      level: Number(process.env.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL),
      position: "mid",
    },
    resolver: zodResolver(PLAYER_SCHEMA),
    values,
  });
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { errorAlert } = useAlerts();
  const [uploadingImage, setUploadingImage] = useState(false);

  const updateAvatar: (nextAvatar: File) => Promise<void> = async (
    nextAvatar
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", nextAvatar);
      formData.append("upload_preset", "scalonetapp");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/cristhianjavierduran/image/upload",
        {
          method: "POST",
          body: formData,
        }
      ).then(async (response) => await response.json());

      if (response.error?.message) {
        throw new Error(response.error.message);
      }

      const imageUrl = response.secure_url;

      form.setValue("avatar", imageUrl);

      setUploadingImage(false);
    } catch (error) {
      console.error(error);

      errorAlert({
        title: "Error al subir la foto.",
      });

      /* We clean the input value */
      if (inputFileRef.current) {
        inputFileRef.current.value = "";

        form.setValue("avatar", "");
      }

      setUploadingImage(false);
    }
  };

  const onSubmitHandler: (values: PlayerSchema) => Promise<void> = async (
    values
  ) => {
    try {
      await onSubmit(values);

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
        <FormField
          control={form.control}
          name="avatar"
          render={() => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <PlayerAvatarInput
                  defaultName={INPUT_PLACEHOLDER}
                  updateAvatar={updateAvatar}
                />
              </FormControl>
              <FormDescription>
                La foto puede pesar hasta{" "}
                {process.env.NEXT_PUBLIC_IMAGE_UPLOAD_SIZE_LIMIT} MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posición</FormLabel>
              <FormControl>
                <div className="auto-cols-max gap-1 grid grid-cols-4">
                  {Object.entries(PLAYER_POSITIONS).map(([key, value]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={field.value === key ? "outline" : "ghost"}
                      /* We remove the horizontal padding in favor of getting space from the parent auto-cols-max */
                      className="px-0"
                      onClick={() => {
                        field.onChange(key);
                      }}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
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
              <FormLabel>Nivel de juego</FormLabel>
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
        <DialogFooter>
          <Button
            type="submit"
            disabled={
              !form.formState.isValid ||
              form.formState.isSubmitting ||
              uploadingImage
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
