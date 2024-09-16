"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { PlayerAvatar } from "@/components/player-avatar";
import { SoccerBall } from "@/components/soccer-ball";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLAYER_SCHEMA, PlayerSchema } from "@/schemas/player";
import { unfoldZodError } from "@/utils/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "lucide-react";
import { ChangeEventHandler, FC, useRef, useState } from "react";
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
      avatar: "",
      name: "",
      level: Number(process.env.NEXT_PUBLIC_DEFAULT_PLAYER_LEVEL),
    },
    resolver: zodResolver(PLAYER_SCHEMA),
    values,
  });
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { errorAlert } = useAlerts();
  const [uploadingImage, setUploadingImage] = useState(false);

  /* We register the field manually because of our custom UI for it. This also means listening for its changes */
  const avatar = form.watch("avatar");
  const avatarFieldProps = form.register("avatar");

  const onUploadAvatar: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      const files = Array.from(event.target.files || []);

      if (!files.length) {
        return;
      }

      setUploadingImage(true);

      /* This is safe to do since we don't accept multiple images in the file input */
      const file = files[0];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "scalonetapp");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/cristhianjavierduran/image/upload",
        {
          method: "POST",
          body: formData,
        }
      ).then(async (response) => await response.json());

      if (response.error?.message) {
        throw new Error(`Cloudinary error: ${response.error.message}`);
      }

      const imageUrl = response.secure_url;

      form.setValue("avatar", imageUrl);

      setUploadingImage(false);
    } catch (error) {
      console.error(error);

      errorAlert({
        title: "Error al procesar la foto",
        description: "Por favor, prueba otra vez.",
      });

      /* We clean the input value */
      form.setValue("avatar", "");

      setUploadingImage(false);
    }
  };

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
          "No pudimos agregar el jugador. Por favor, verifica la información y prueba otra vez.";
      }

      form.setError("root", {
        message: errorMessage,
        type: "validate",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder={INPUT_PLACEHOLDER} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
              <div className="flex gap-4 items-center justify-center">
                <PlayerAvatar
                  src={avatar || ""}
                  name={field.value || INPUT_PLACEHOLDER}
                  size="lg"
                />
                <input
                  hidden
                  type="file"
                  /* We only accept jpg, jpeg and png extensions */
                  accept=".jpg,.jpeg,.png"
                  {...avatarFieldProps}
                  ref={inputFileRef}
                  onChange={onUploadAvatar}
                />
                {avatar ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            /* We clean the input value */
                            form.setValue("avatar", "");
                          }}
                          variant="ghost"
                          size="icon"
                        >
                          <TrashIcon className="h-4 text-red-700 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    /* We trigger the input file click with this button */
                    onClick={() => {
                      if (inputFileRef.current) {
                        inputFileRef.current.click();
                      }
                    }}
                    disabled={uploadingImage}
                    type="button"
                    variant="outline"
                  >
                    {uploadingImage ? (
                      <>
                        <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
                        Subiendo foto...
                      </>
                    ) : (
                      "Subir una foto"
                    )}
                  </Button>
                )}
              </div>
            </div>
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
        <div className="text-right">
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
        </div>
      </form>
    </Form>
  );
};
