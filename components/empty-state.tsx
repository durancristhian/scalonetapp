import { FC, PropsWithChildren } from "react";

export const EmptyState: FC<PropsWithChildren> = ({ children }) => {
  return <p className="text-slate-500 text-sm">{children}</p>;
};
