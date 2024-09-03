import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { FC, PropsWithChildren } from "react";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div className="flex flex-col min-h-dvh">
        <Header />
        <div className="grow">{children}</div>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
