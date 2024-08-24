"use client";

import { LOCAL_STORAGE } from "@/constants/local-storage";
import { VALIDATION_MESSAGES } from "@/constants/validation-messages";
import { zodResolver } from "@hookform/resolvers/zod";
import useLocalStorage from "beautiful-react-hooks/useLocalStorage";
import clsx from "clsx";
import uniqueId from "lodash/uniqueId";
import { useCallback } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

export const TeamsOrganizer = () => {
  return (
    <div className="py-4">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Armador de equipos</h2>
          <AddPlayerForm />
        </div>
      </div>
    </div>
  );
};

const PLAYER_SCHEMA = z.object({
  name: z.string().min(1, { message: VALIDATION_MESSAGES.required }),
});

type Player = {
  name: string;
};

const DEFAULT_VALUES = {
  name: "",
};

const AddPlayerForm = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
  } = useForm<Player>({
    resolver: zodResolver(PLAYER_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });
  const [players, setPlayers] = useLocalStorage<Player[]>(
    LOCAL_STORAGE.PLAYERS,
    []
  );

  const onSubmit: SubmitHandler<Player> = useCallback(
    (data) => {
      if (players?.findIndex((player) => player.name === data.name) !== -1) {
        setError("name", {
          type: "validate",
          message: VALIDATION_MESSAGES.already_exists,
        });

        return;
      }

      const nextPlayer = {
        ...data,
        id: uniqueId("player"),
      };

      setPlayers([...(players || []), nextPlayer]);
      reset(DEFAULT_VALUES);
    },
    [players, reset, setError, setPlayers]
  );

  return (
    <>
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
                    placeholder="Nombre"
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
    </>
  );
};
