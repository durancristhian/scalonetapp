import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export const Header = () => {
  return (
    <div className="bg-zinc-200 border-b border-zinc-300 h-14 px-4">
      <div className="container h-full mx-auto">
        <div className="flex h-full items-center justify-between">
          <h1 className="font-semibold text-xl">scalonetapp</h1>
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              {/* TODO: use button component */}
              <button className="bg-zinc-300 border border-zinc-400 rounded px-4 py-2">
                Login
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton showName />
          </SignedIn>
        </div>
      </div>
    </div>
  );
};
