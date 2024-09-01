import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { default as BoringAvatar } from "boring-avatars";
import { FC } from "react";

const Page: FC = () => {
  return (
    <div className="px-4 py-8">
      <div className="grid gap-8">
        <p className="font-semibold text-4xl text-center">
          La Escuelita - 27/Ago
        </p>
        <div className="grid grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Equipo 1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-4 items-center">
                  <BoringAvatar variant="beam" name="Jugador 1" size={48} />
                  <div className="grow">
                    <p className="text-xl">Jugador 1</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <p className="text-slate-500 text-center">
          Hecho con{" "}
          <span className="underline underline-offset-2">scalonet.app</span>
        </p>
      </div>
    </div>
  );
};

export default Page;
