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
  defaultValues: TeamSchema;
  onSubmit: (values: TeamSchema) => void;
};

export const TeamForm: FC<TeamFormProps> = ({ defaultValues, onSubmit }) => {
  const form = useForm<TeamSchema>({
    defaultValues,
    resolver: zodResolver(TEAM_SCHEMA),
  });

  return (
    <Form {...form}>
      <form
        /* This form is special since we submit data on each form change */
        onChange={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
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
