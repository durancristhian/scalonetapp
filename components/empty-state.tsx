import { FC, PropsWithChildren } from "react";

export const EmptyState: FC<PropsWithChildren> = ({ children }) => {
  return <p className="text-muted-foreground">{children}</p>;
};
