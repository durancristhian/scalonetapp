"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useTransition } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error: FC<ErrorProps> = ({ error, reset }) => {
  const router = useRouter();
  const [retrying, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full min-h-[inherit] p-2">
      <div className="max-w-3xl mx-auto w-full">
        <div className="space-y-4 text-center">
          <h1 className="font-bold text-2xl">¡PENAAAL!</h1>
          <p className="text-balance text-center text-muted-foreground">
            Ups! Mala nuestra... Se escapó uno y lo tuvimos que bajar en el
            área. No te preocupes, capaz el dibu puede atajar este penal para
            vos.
          </p>
          <Button
            disabled={retrying}
            onClick={() => {
              startTransition(() => {
                router.refresh();
                reset();
              });
            }}
          >
            {retrying ? "Reintentando..." : "Reintentar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error;
