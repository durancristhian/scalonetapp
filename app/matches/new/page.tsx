import { AddMatchForm } from "@/app/matches/new/(components)/add-match-form";
import { AddPlayerForm } from "@/app/matches/new/(components)/add-player-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-2xl">Creá un partido</h2>
          <div className="flex md:flex-row gap-4">
            <div className="md:flex-1">
              <AddMatchForm />
            </div>
            <div className="md:flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>¿Quienes juegan?</CardTitle>
                  <CardDescription>
                    Si ya sabés quienes van a jugar podés agregarlos ahora. No
                    es necesario que agregues al 100% de las personas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddPlayerForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
