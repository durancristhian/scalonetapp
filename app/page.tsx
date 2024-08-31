import { AddMatchForm } from "@/app/(components)/add-match-form";
import { MatchList } from "@/app/(components)/match-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid gap-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Card className="bg-slate-50">
                <CardHeader>
                  <CardTitle>Nuevo partido</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddMatchForm />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tus partidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <MatchList />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
