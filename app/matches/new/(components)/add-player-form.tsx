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
import { PLAYER_SCHEMA } from "@/server/schemas/player";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const AddPlayerForm = () => {
  const form = useForm<z.infer<typeof PLAYER_SCHEMA>>({
    resolver: zodResolver(PLAYER_SCHEMA),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit: (values: z.infer<typeof PLAYER_SCHEMA>) => void = (
    values
  ) => {
    /* TODO: implement */
    console.log(values);
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
        <Button type="submit">Agregar al partido</Button>
      </form>
    </Form>
  );
};
