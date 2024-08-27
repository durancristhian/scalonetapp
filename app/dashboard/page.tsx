"use client";

import { useUser } from "@clerk/nextjs";
import { Matches } from "./_components/matches";

export default function Page() {
  const { isLoaded, user } = useUser();

  return (
    <div className="px-4 py-2">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">
            Hola, {isLoaded ? user?.fullName : "..."}
          </h2>
          <div>
            <Matches />
          </div>
        </div>
      </div>
    </div>
  );
}
