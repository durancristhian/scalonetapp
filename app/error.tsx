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
    <div className="flex flex-col gap-4 items-center justify-center h-full min-h-[inherit] p-2">
      <h1 className="font-bold text-2xl text-slate-950">Algo salió mal :(</h1>
      <p>{error.message}</p>
      <Button
        onClick={() => {
          reset();
        }}
      >
        Reintentar
      </Button>
    </div>
  );
};

export default Error;
