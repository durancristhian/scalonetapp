import { ShowOff } from "@/components/show-off";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { FC } from "react";

export const LoggedOutContent: FC = () => {
  return (
    <div className="bg-slate-100 flex flex-col items-center justify-center min-h-dvh p-2">
      <h1 className="font-semibold text-2xl">
        Bienvenidos a&nbsp;
        <span className="font-bold text-slate-950 tracking-wide">
          Scalonet.app
        </span>
      </h1>
      <ShowOff />
      <div className="mt-8">
        <SignInButton mode="modal">
          <Button size="sm">Ingresar</Button>
        </SignInButton>
      </div>
    </div>
  );
};
