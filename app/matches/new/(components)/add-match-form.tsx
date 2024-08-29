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
import { addMatch } from "@/server/actions/match";
import { MATCH_SCHEMA, MatchSchema } from "@/server/schemas/match";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const DAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const AddMatchForm = () => {
  const form = useForm<MatchSchema>({
    resolver: zodResolver(MATCH_SCHEMA),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit: (values: MatchSchema) => Promise<void> = async (values) => {
    await addMatch(values);
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
              <FormLabel>Nombre del partido</FormLabel>
              <FormControl>
                <Input
                  placeholder={`Partido de los ${
                    DAY_LABELS[new Date().getDay()]
                  }`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Crear</Button>
      </form>
    </Form>
  );
};
