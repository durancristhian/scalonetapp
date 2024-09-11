import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FC } from "react";

const NotFound: FC = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-[inherit] p-2">
      <div className="max-w-3xl mx-auto w-full">
        <div className="grid gap-4 place-items-center">
          <h1 className="font-bold text-2xl">¡Offside de búsqueda!</h1>
          <p className="text-balance text-center text-muted-foreground">
            Parece que lo que estabas buscando se ha adelantado y está en una
            posición prohibida. No te preocupes, puedes volver al campo para
            intentar otra jugada.
          </p>
          <Button asChild>
            <Link href="/">Volver a la página principal</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
