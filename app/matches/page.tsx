import { MatchesList } from "./(components)/matches-list";

export default function Page() {
  return (
    <div className="py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-2xl">Tus partidos</h2>
          <MatchesList />
        </div>
      </div>
    </div>
  );
}
