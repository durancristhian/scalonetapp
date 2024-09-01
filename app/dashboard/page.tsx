import { MatchForm } from "@/app/dashboard/(components)/match-form";
import { MatchList } from "@/app/dashboard/(components)/match-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FC } from "react";

const Page: FC = () => {
  return (
    <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle>Nuevo partido</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchForm />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <div className="grid gap-4">
              <CardTitle>Tus partidos</CardTitle>
              <MatchList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
