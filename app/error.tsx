"use client";

import { Button } from "@/components/ui/button";
import { FC, useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error: FC<ErrorProps> = ({ error, reset }) => {
  useEffect(() => {
    /* TODO: Log the error to an error reporting service */
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full min-h-[inherit] p-2">
      <div className="max-w-3xl mx-auto w-full">
        <div className="grid gap-4 place-items-center">
          <h1 className="font-bold text-2xl text-slate-950">¡PENAAAL!</h1>
          <p>
            Ups! Algo salió mal y hemos cometido un penal. No te preocupes,
            capaz el dibu puede atajarlo por vos.
          </p>
          <p className="font-bold">{error.message}</p>
          <Button
            onClick={() => {
              reset();
            }}
          >
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error;
