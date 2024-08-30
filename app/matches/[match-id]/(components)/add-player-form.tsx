"use client";

import { Avatar } from "@/components/avatar";
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
import { addPlayer } from "@/server/actions/player";
import { PLAYER_SCHEMA, PlayerSchema } from "@/server/schemas/player";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const PLACEHOLDER = "Juan Roman Riquelme";

export const AddPlayerForm = () => {
  const form = useForm<PlayerSchema>({
    resolver: zodResolver(PLAYER_SCHEMA),
    defaultValues: {
      name: "",
    },
  });
  const params = useParams();

  const onSubmit: (values: PlayerSchema) => Promise<void> = async (values) => {
    try {
      await addPlayer(values, Number(params["match-id"]));
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
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <div className="flex gap-4 items-center">
              <div>
                <Avatar name={field.value || PLACEHOLDER} />
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
        <Button type="submit">Agregar</Button>
      </form>
    </Form>
  );
};