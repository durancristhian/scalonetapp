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
import { addMatch } from "@/server/actions/match";
import { MATCH_SCHEMA, MatchSchema } from "@/server/schemas/match";
import { zodResolver } from "@hookform/resolvers/zod";
import { PartyPopper } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DAY_LABELS = [
  "Domingos",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábados",
];

export const AddMatchForm = () => {
  const form = useForm<MatchSchema>({
    resolver: zodResolver(MATCH_SCHEMA),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit: (values: MatchSchema) => Promise<void> = async (values) => {
    try {
      await addMatch(values);
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

    toast("Se ha creado tu partido.", {
      icon: <PartyPopper className="h-4 opacity-50 w-4" />,
    });
  };

  const placeholder = `Partido de los ${DAY_LABELS[new Date().getDay()]}`;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
      </form>
    </Form>
  );
};
