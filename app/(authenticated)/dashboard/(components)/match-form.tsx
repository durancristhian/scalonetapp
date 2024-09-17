"use client";

import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRootError,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MATCH_SCHEMA, MatchSchema } from "@/schemas/match";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";

const DAY_LABELS = [
  "domingos",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábados",
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

      form.reset();
    } catch (error) {}
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
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
        <FormRootError />
        <div className="text-right">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
            ) : null}
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
