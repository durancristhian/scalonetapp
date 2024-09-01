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
import { FC } from "react";
import { useForm } from "react-hook-form";

const PLACEHOLDER = "Juan Roman Riquelme";

type PlayerFormProps = {
  onSubmit: (values: PlayerSchema) => Promise<void>;
  values?: PlayerSchema;
};

export const PlayerForm: FC<PlayerFormProps> = ({ onSubmit, values }) => {
  const form = useForm<PlayerSchema>({
    defaultValues: values || {
      name: "",
    },
    resolver: zodResolver(PLAYER_SCHEMA),
    values,
  });

  const onSubmitHandler: (values: PlayerSchema) => Promise<void> = async (
    values
  ) => {
    try {
      await onSubmit(values);
    } catch (error) {
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
                    name={field.value || PLACEHOLDER}
                    size={48}
                  />
                </SpicyTooltips>
              </div>
              <div className="grow">
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder={PLACEHOLDER} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            </div>
          )}
        />
        <Button type="submit" size="sm">
          Guardar
        </Button>
      </form>
    </Form>
  );
};