import { type FC, type PropsWithChildren } from "react";
import { Empty, EmptyDescription } from "@/components/ui/empty";

export const EmptyState: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Empty>
      <EmptyDescription>{children}</EmptyDescription>
    </Empty>
  );
};
