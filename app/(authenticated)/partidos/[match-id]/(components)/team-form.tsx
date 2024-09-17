"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TEAM_SCHEMA, TeamSchema } from "@/schemas/team";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
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
    values,
  });

  return (
    <Form {...form}>
      <form
        /* This form is special since we also submit data on each form change */
        onChange={form.handleSubmit(onSubmit)}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Nombre del equipo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
