import { type FC, type PropsWithChildren } from "react";

const Template: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-500 motion-safe:ease-in-out">
      {children}
    </div>
  );
};

export default Template;
