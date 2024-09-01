import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { FC, PropsWithChildren } from "react";

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div className="flex flex-col min-h-dvh">
        <Header />
        <div className="grow">{children}</div>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};
