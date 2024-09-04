"use client";

import { SpicyTooltips } from "@/components/spicy-tooltips";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PLAYER_SCHEMA, PlayerSchema } from "@/schemas/player";
import { zodResolver } from "@hookform/resolvers/zod";
import { default as BoringAvatar } from "boring-avatars";
import { LoaderCircleIcon } from "lucide-react";
import { FC } from "react";
import { useForm } from "react-hook-form";

const NAME_PLACEHOLDER = "Juan Roman Riquelme";

const PLAYER_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const DEFAULT_PLAYER_LEVEL = 5;

const DEFAULT_VALUES = {
  name: "",
  level: DEFAULT_PLAYER_LEVEL,
};

type PlayerFormProps = {
  onSubmit: (values: PlayerSchema) => Promise<void>;
  values?: PlayerSchema;
};

export const PlayerForm: FC<PlayerFormProps> = ({ onSubmit, values }) => {
  const form = useForm<PlayerSchema>({
    defaultValues: values || DEFAULT_VALUES,
    resolver: zodResolver(PLAYER_SCHEMA),
    values,
  });

  const onSubmitHandler: (values: PlayerSchema) => Promise<void> = async (
    values
  ) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        form.setError("name", {
          message: error.message,
          type: "validate",
        });
      }

      return;
    }

    form.reset();
    form.setFocus("name");
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
                    name={field.value || NAME_PLACEHOLDER}
                    size={48}
                  />
                </SpicyTooltips>
              </div>
              <div className="grow">
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder={NAME_PLACEHOLDER} {...field} />
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
