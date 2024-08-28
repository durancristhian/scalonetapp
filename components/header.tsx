import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export const Header = () => {
  return (
    <div className="border-b border-slate-300 h-14 px-4">
      <div className="container h-full mx-auto">
        <div className="flex h-full items-center justify-between">
          <h1 className="font-semibold text-xl">scalonetapp</h1>
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
