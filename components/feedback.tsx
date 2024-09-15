"use client";

import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRootError,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FEEDBACK_SCHEMA, FeedbackSchema } from "@/schemas/feedback";
import { unfoldZodError } from "@/utils/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { ZodError } from "zod";

export const Feedback = () => {
  const { successAlert } = useAlerts();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setDialogOpen(true);
          }}
          variant="outline"
        >
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>¿Que te gustaría decirme?</DialogTitle>
          <DialogDescription className="text-balance">
            Todo feedback, idea y/o sugerencia es bienvenida (:
          </DialogDescription>
        </DialogHeader>
        <FeedbackForm
          afterSubmit={() => {
            setDialogOpen(false);

            successAlert({
              title: "¡Su feedback fue enviado!",
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

type FeedbackFormProps = {
  afterSubmit: () => void;
};

const FeedbackForm: FC<FeedbackFormProps> = ({ afterSubmit }) => {
  const form = useForm<FeedbackSchema>({
    defaultValues: {
      message: "",
    },
    resolver: zodResolver(FEEDBACK_SCHEMA),
  });

  const onSubmitHandler: (values: FeedbackSchema) => Promise<void> = async (
    values
  ) => {
    return fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then(() => {
        afterSubmit();
      })
      .catch((error) => {
        console.error(error);

        if (error instanceof ZodError) {
          form.setError("root", {
            message: unfoldZodError(error).join(". "),
            type: "validate",
          });
        }
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitHandler)}
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Hola Cris, me gustaría que..."
                  {...field}
                />
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
            <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
          ) : null}
          {form.formState.isSubmitting ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
};
