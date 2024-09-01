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
import { MATCH_SCHEMA, MatchSchema } from "@/schemas/match";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";

const DAY_LABELS = [
  "Domingos",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábados",
];

type MatchFormProps = {
  onSubmit: (values: MatchSchema) => Promise<void>;
  values?: MatchSchema;
};

export const MatchForm: FC<MatchFormProps> = ({ onSubmit, values }) => {
  const form = useForm<MatchSchema>({
    defaultValues: values || {
      name: "",
    },
    resolver: zodResolver(MATCH_SCHEMA),
    values,
  });

  const onSubmitHandler: (values: MatchSchema) => Promise<void> = async (
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

  const placeholder = `Partido de los ${DAY_LABELS[new Date().getDay()]}`;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitHandler)}
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder={placeholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm">
          Guardar
        </Button>
      </form>
    </Form>
  );
};
