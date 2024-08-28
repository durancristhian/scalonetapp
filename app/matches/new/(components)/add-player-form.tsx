"use client";

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
import { PLAYER_SCHEMA, PlayerSchema } from "@/server/schemas/player";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

/* TODO: Move this somewhere else */

export const AddPlayerForm = () => {
  const form = useForm<PlayerSchema>({
    resolver: zodResolver(PLAYER_SCHEMA),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit: (values: PlayerSchema) => Promise<void> = async (values) => {
    /* TODO: Complete */
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Juan Roman Riquelme" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Agregar</Button>
      </form>
    </Form>
  );
};
