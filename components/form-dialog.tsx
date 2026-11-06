"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ComponentProps,
} from "react";

const SubmissionContext = createContext<{
  pending: boolean;
  isPending: () => boolean;
  submit: (work: () => Promise<void>) => Promise<void>;
} | null>(null);

export function FormDialog({
  onOpenChange,
  ...props
}: ComponentProps<typeof Dialog>) {
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  const submit = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    try {
      await work();
    } finally {
      lock.current = false;
      setPending(false);
    }
  };
  return (
    <SubmissionContext.Provider
      value={{ pending, isPending: () => lock.current, submit }}
    >
      <Dialog
        {...props}
        onOpenChange={(open) => {
          if (!lock.current) onOpenChange?.(open);
        }}
      />
    </SubmissionContext.Provider>
  );
}

export function FormDialogContent({
  children,
  onEscapeKeyDown,
  onInteractOutside,
  ...props
}: ComponentProps<typeof DialogContent>) {
  const submission = useContext(SubmissionContext);
  return (
    <DialogContent
      {...props}
      closeDisabled={submission?.pending}
      onEscapeKeyDown={(event) => {
        if (submission?.isPending()) event.preventDefault();
        onEscapeKeyDown?.(event);
      }}
      onInteractOutside={(event) => {
        if (submission?.isPending()) event.preventDefault();
        onInteractOutside?.(event);
      }}
    >
      <fieldset
        disabled={submission?.pending}
        aria-busy={submission?.pending}
        className="contents"
      >
        {children}
      </fieldset>
    </DialogContent>
  );
}

export function useDialogSubmission() {
  const submission = useContext(SubmissionContext);
  return submission?.submit ?? ((work: () => Promise<void>) => work());
}
