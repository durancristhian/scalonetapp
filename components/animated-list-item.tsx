import { type FC, type PropsWithChildren } from "react";

export const AnimatedListItem: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 motion-safe:duration-150 motion-safe:ease-out">
      {children}
    </div>
  );
};
