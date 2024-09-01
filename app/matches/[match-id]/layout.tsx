import { AppLayout } from "@/app/(components)/app-layout";
import { FC, PropsWithChildren } from "react";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return <AppLayout>{children}</AppLayout>;
};

export default Layout;
