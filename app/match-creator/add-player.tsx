import { VALIDATION_MESSAGES } from "@/constants/validation-messages";
import { Player } from "@/types/player";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useCallback } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

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

const PLAYER_SCHEMA = z.object({
  name: z.string().min(1, { message: VALIDATION_MESSAGES.required }),
});

const DEFAULT_VALUES = {
  name: "",
};

export const AddPlayerForm = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    /* setError, */
  } = useForm<Player>({
    resolver: zodResolver(PLAYER_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit: SubmitHandler<Player> = useCallback(
    (data) => {
      /* TODO: make a POST to the API */
      /* setError("name", {
        type: "validate",
        message: '',
      }); */

      reset(DEFAULT_VALUES);
    },
    [reset]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                    errors.name
                      ? "border-2 border-red-800"
                      : "border border-zinc-400"
                  )}
                  placeholder="Juan Román Riquelme"
                />
                {errors.name ? (
                  <div className="mt-1 text-red-800">
                    {errors.name?.message}
                  </div>
                ) : null}
              </>
            )}
          />
        </div>
        <div>
          <input
            type="submit"
            value="Agregar"
            className="bg-zinc-300 border border-zinc-400 rounded px-4 py-2"
          />
        </div>
      </div>
    </form>
  );
};
