"use client";

import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";

export const Header = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="bg-slate-100 border-b border-slate-300 h-12">
      <div className="container h-full mx-auto">
        <div className="flex h-full items-center justify-between">
          <Link href={isSignedIn ? "/dashboard" : "/"}>
            <h1 className="font-semibold text-xl">scalonetapp</h1>
          </Link>
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button>Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </div>
  );
};
