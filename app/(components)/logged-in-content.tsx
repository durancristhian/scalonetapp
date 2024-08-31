import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { FC, PropsWithChildren } from "react";

export const LoggedInContent: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <div className="grow">{children}</div>
      <Footer />
    </div>
  );
};
