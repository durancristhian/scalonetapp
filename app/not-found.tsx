import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FC } from "react";

const NotFound: FC = () => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-full min-h-[inherit] p-2">
      <h1 className="font-semibold text-2xl text-slate-950">
        Está página no existe :(
      </h1>
      <Button asChild>
        <Link href="/">Volver a la página principal</Link>
      </Button>
    </div>
  );
};

export default NotFound;
