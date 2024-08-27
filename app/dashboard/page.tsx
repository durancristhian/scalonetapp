"use client";

import { useUser } from "@clerk/nextjs";
import { Matches } from "./_components/matches";

export default function Page() {
  const { isLoaded, user } = useUser();

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-lg">
          Hola, {isLoaded ? user?.fullName : "..."}
        </h2>
        <div>
          <Matches />
        </div>
      </div>
    </div>
  );
}
