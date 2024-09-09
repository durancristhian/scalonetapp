import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { FC, PropsWithChildren } from "react";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div className="flex flex-col h-full min-h-[inherit]">
        <Header />
        <div className="grow">{children}</div>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
