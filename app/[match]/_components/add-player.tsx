"use client";

import { Button } from "@/components/ui/button";
import { addPlayer } from "@/server/actions/add-player";
import { PLAYER_SCHEMA } from "@/utils/schemas";
import { VALIDATION_MESSAGES } from "@/utils/validation-messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { Player } from "@prisma/client";
import clsx from "clsx";
import { useRef } from "react";
import { useFormState } from "react-dom";
import { Controller, useForm } from "react-hook-form";

export const AddPlayer = () => {
  return (
    <>
      <h3 className="font-semibold">¿Quienes juegan?</h3>
      <p>Agregá las personas una a una hasta completar el cupo.</p>
      <div className="mt-4">
        <AddPlayerForm />
      </div>
    </>
  );
};

/* This sub-type contains only the player properties we want to use in the form */
type UIPlayer = Pick<Player, "name">;

const DEFAULT_VALUES = {
  name: "",
};

export const AddPlayerForm = () => {
  /* TODO: avoid calling the action if we already reached the limit of players */
  const [actionState, formAction] = useFormState(addPlayer, {
    message: null,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const {
    control,
    formState,
    handleSubmit,
    /* TODO: how should we use these 2 methods? */
    /* reset, */
    /* setError, */
  } = useForm<UIPlayer>({
    resolver: zodResolver(PLAYER_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={handleSubmit(() => {
          formRef?.current?.submit();
        })}
      >
        <div className="flex gap-4">
          <div className="grow">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <>
                  <input
                    {...field}
                    className={clsx(
                      "bg-zinc-100 rounded p-2 w-full",
                      formState.errors.name
                        ? "border-2 border-red-800"
                        : "border border-zinc-400"
                    )}
                    placeholder="Juan Román Riquelme"
                  />
                </>
              )}
            />
            {actionState.message ? (
              <div className="mt-1 text-red-800">
                {VALIDATION_MESSAGES[actionState.message]}
              </div>
            ) : null}
          </div>
          <div>
            <Button type="submit">Agregar</Button>
          </div>
        </div>
      </form>
      {formState.errors.name ? (
        <div className="mt-1 text-red-800">
          {formState.errors.name?.message}
        </div>
      ) : null}
    </>
  );
};
