import { cn } from "@/utils/cn";
import { type ComponentProps } from "react";

function Empty({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn("flex min-w-0 flex-col items-start gap-3", className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Empty, EmptyDescription };
