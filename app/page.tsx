import { MatchesList } from "@/app/matches/(components)/matches-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center justify-between">
            <h2 className="font-semibold text-2xl">Tus partidos</h2>
            <Button asChild>
              <Link href="/matches/new">Crear</Link>
            </Button>
          </div>
          <MatchesList />
        </div>
      </div>
    </div>
  );
}
