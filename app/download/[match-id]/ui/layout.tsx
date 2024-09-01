import { FC, PropsWithChildren } from "react";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return <div className="bg-yellow-500 p-10">{children}</div>;
};

export default Layout;
