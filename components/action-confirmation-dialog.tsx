"use client";

import { PendingButton } from "@/components/pending-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type ComponentProps, type ReactNode, useRef, useState } from "react";

type ActionConfirmationDialogProps = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  onCloseAutoFocus?: ComponentProps<
    typeof AlertDialogContent
  >["onCloseAutoFocus"];
};

export function ActionConfirmationDialog({
  title,
  description,
  confirmLabel,
  pendingLabel,
  onConfirm,
  onClose,
  onCloseAutoFocus,
}: ActionConfirmationDialogProps) {
  const [processing, setProcessing] = useState(false);
  const pending = useRef(false);

  const confirm = async () => {
    if (pending.current) return;
    pending.current = true;
    setProcessing(true);
    try {
      await onConfirm();
    } catch {
    } finally {
      pending.current = false;
      setProcessing(false);
    }
  };

  const close = () => {
    if (!pending.current) onClose();
  };

  return (
    <AlertDialog open>
      <AlertDialogContent
        onCloseAutoFocus={onCloseAutoFocus}
        onEscapeKeyDown={(event) => {
          if (pending.current) event.preventDefault();
          else onClose();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="max-md:text-balance">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing} onClick={close}>
            Cancelar
          </AlertDialogCancel>
          <PendingButton
            type="button"
            onClick={confirm}
            pending={processing}
            pendingLabel={pendingLabel}
          >
            {confirmLabel}
          </PendingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
