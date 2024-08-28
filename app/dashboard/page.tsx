"use client";

import { useUser } from "@clerk/nextjs";

export default function Page() {
  const { isLoaded, user } = useUser();

  return (
    <div className="py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-2xl">
            Hola, {isLoaded ? user?.fullName : "..."}
          </h2>
        </div>
      </div>
    </div>
  );
}
