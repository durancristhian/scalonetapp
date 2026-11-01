"use client";

import { useRef, useState } from "react";

export function useMenuDialog<DialogId extends string>() {
  const [menuOpened, setMenuOpened] = useState(false);
  const [dialogId, setDialogId] = useState<DialogId | null>(null);
  const pendingDialog = useRef<DialogId | null>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);

  const selectDialog = (id: DialogId) => {
    pendingDialog.current = id;
  };

  const onMenuCloseAutoFocus = () => {
    const nextDialog = pendingDialog.current;
    pendingDialog.current = null;
    if (nextDialog) setDialogId(nextDialog);
  };

  const closeDialog = () => {
    pendingDialog.current = null;
    setDialogId(null);
    setMenuOpened(false);
  };

  const restoreFocus = (event: Event) => {
    if (menuTrigger.current?.isConnected) {
      event.preventDefault();
      menuTrigger.current.focus();
    }
  };

  return {
    menuOpened,
    setMenuOpened,
    dialogId,
    menuTrigger,
    selectDialog,
    onMenuCloseAutoFocus,
    closeDialog,
    restoreFocus,
  };
}
