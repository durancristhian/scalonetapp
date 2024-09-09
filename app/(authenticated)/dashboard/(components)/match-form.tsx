"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormRootError,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MATCH_SCHEMA, MatchSchema } from "@/schemas/match";
import { unfoldZodError } from "@/utils/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { ZodError } from "zod";

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

      form.setFocus("name");
      form.reset();
    } catch (error) {
      console.error(error);

      if (error instanceof ZodError) {
        form.setError("root", {
          message: unfoldZodError(error).join(". "),
          type: "validate",
        });
      }
    }
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
              <FormControl>
                <Input placeholder={placeholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootError />
        <Button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <LoaderCircleIcon className="animate-spin h-4 mr-2 opacity-50 w-4" />
          ) : null}
          {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
};
