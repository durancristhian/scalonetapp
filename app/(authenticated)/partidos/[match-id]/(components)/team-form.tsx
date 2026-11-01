"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TEAM_SCHEMA, type TeamSchema } from "@/schemas/team";
import { zodResolver } from "@hookform/resolvers/zod";
import { type FC } from "react";
import { useForm } from "react-hook-form";

type TeamFormProps = {
  onSubmit: (values: TeamSchema) => void;
  values?: TeamSchema;
};

export const TeamForm: FC<TeamFormProps> = ({ onSubmit, values }) => {
  const form = useForm<TeamSchema>({
    defaultValues: values || {
      name: "",
    },
    resolver: zodResolver(TEAM_SCHEMA),
    mode: "onChange",
    resetOptions: { keepErrors: true },
    values,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="gap-0">
              <FormLabel className="sr-only">Nombre del equipo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre del equipo"
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    onSubmit({ name: event.target.value });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
