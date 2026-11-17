"use client";

import { SoccerBall } from "@/components/soccer-ball";
import { Button, type ButtonProps } from "@/components/ui/button";

type PendingButtonProps = Omit<ButtonProps, "asChild"> & {
  pending: boolean;
  pendingLabel: string;
};

export function PendingButton({
  pending,
  pendingLabel,
  disabled,
  children,
  ...props
}: PendingButtonProps) {
  return (
    <Button {...props} disabled={disabled || pending} aria-busy={pending}>
      {pending ? (
        <SoccerBall
          aria-hidden="true"
          className="motion-safe:animate-spin size-4 me-2 shrink-0 opacity-50"
        />
      ) : null}
      {pending ? pendingLabel : children}
    </Button>
  );
}
