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
import { addMatch, editMatch } from "@/server/actions/match";
import { MATCH_SCHEMA, MatchSchema } from "@/server/schemas/match";
import { zodResolver } from "@hookform/resolvers/zod";
import { Match } from "@prisma/client";
import { PartyPopper } from "lucide-react";
import { FC } from "react";
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

const DEFAULT_FORM_VALUES: MatchSchema = {
  name: "",
};

type MatchFormProps = {
  match?: Match;
  mode?: "add" | "edit";
  onFinish?: () => void;
};

export const MatchForm: FC<MatchFormProps> = ({
  match,
  mode = "add",
  onFinish,
}) => {
  const form = useForm<MatchSchema>({
    resolver: zodResolver(MATCH_SCHEMA),
    defaultValues: match
      ? {
          name: match.name,
        }
      : DEFAULT_FORM_VALUES,
  });

  const onSubmit: (values: MatchSchema) => Promise<void> = async (values) => {
    try {
      if (mode === "add") {
        await addMatch(values);
      } else if (mode === "edit" && !!match) {
        await editMatch(match.id, values);
      }

      onFinish?.();
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

    if (mode === "add") {
      toast("Se ha creado tu partido.", {
        icon: <PartyPopper className="h-4 opacity-50 w-4" />,
      });
    }
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
        <Button type="submit" size="sm">
          Guardar
        </Button>
      </form>
    </Form>
  );
};
