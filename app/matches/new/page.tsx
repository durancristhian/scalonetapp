import { AddMatchForm } from "@/app/matches/new/(components)/add-match-form";

export default function Page() {
  return (
    <div className="py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-2xl">Creá un partido</h2>
          <div className="max-w-lg">
            <AddMatchForm />
          </div>
        </div>
      </div>
    </div>
  );
}
