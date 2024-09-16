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
import { feedbackAction } from "@/server/actions/feedback";
import { getErrorMessage } from "@/utils/get-error-message";
import { valuesToFormData } from "@/utils/values-to-formdata";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";

export const Feedback = () => {
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
            Todo feedback es bienvenido. No te garantizo que este mensaje sea
            contestado pero si te aseguro que lo voy a leer.
          </DialogDescription>
        </DialogHeader>
        <FeedbackForm
          afterSubmit={() => {
            setDialogOpen(false);
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
  const { successAlert, errorAlert } = useAlerts();
  const { executeAsync: submitFeedback } = useAction(feedbackAction);
  const form = useForm<FeedbackSchema>({
    defaultValues: {
      message: "",
    },
    resolver: zodResolver(FEEDBACK_SCHEMA),
  });

  const onSubmitHandler: (values: FeedbackSchema) => void = async (values) => {
    const formData = valuesToFormData(values);
    const result = await submitFeedback(formData);

    if (!result?.data?.ok) {
      errorAlert({
        title: "Error al enviar su feedback",
        description: result?.data?.reason
          ? getErrorMessage(result.data.reason)
          : null,
      });

      return;
    }

    afterSubmit();

    successAlert({
      title: "¡Su feedback fue enviado!",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tu mensaje</FormLabel>
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
        <div className="text-right">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
            ) : null}
            {form.formState.isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
