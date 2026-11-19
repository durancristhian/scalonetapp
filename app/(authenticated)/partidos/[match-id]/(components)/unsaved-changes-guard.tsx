"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useRef, useState } from "react";

type PendingNavigation = { resume: () => void };

function getGuardedLink(event: MouseEvent): HTMLAnchorElement | null {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !(event.target instanceof Element)
  )
    return null;
  const link = event.target.closest("a[href]");
  if (
    !(link instanceof HTMLAnchorElement) ||
    link.hasAttribute("download") ||
    (link.target && link.target !== "_self")
  )
    return null;
  const destination = new URL(link.href, location.href);
  const sameDocument =
    destination.pathname === location.pathname &&
    destination.search === location.search;
  return destination.origin === location.origin && !sameDocument ? link : null;
}

export function UnsavedChangesGuard({ active }: { active: boolean }) {
  const [pending, setPending] = useState<PendingNavigation | null>(null);
  const released = useRef(false);

  useEffect(() => {
    if (!active) return;
    const navigation = "navigation" in window ? window.navigation : undefined;

    const onClick = (event: MouseEvent) => {
      if (released.current) return;
      const link = getGuardedLink(event);
      if (!link) return;
      event.preventDefault();
      setPending({
        resume: () => {
          released.current = true;
          link.click();
          released.current = false;
        },
      });
    };
    const onTraverse = (event: NavigateEvent) => {
      if (
        released.current ||
        event.navigationType !== "traverse" ||
        !event.cancelable
      )
        return;
      event.preventDefault();
      const { key } = event.destination;
      setPending({
        resume: () => {
          released.current = true;
          navigation
            ?.traverseTo(key)
            .finished?.catch(() => {})
            .finally(() => {
              released.current = false;
            });
        },
      });
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (released.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    document.addEventListener("click", onClick, true);
    navigation?.addEventListener("navigate", onTraverse);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("click", onClick, true);
      navigation?.removeEventListener("navigate", onTraverse);
      window.removeEventListener("beforeunload", onBeforeUnload);
      setPending(null);
    };
  }, [active]);

  return (
    <AlertDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) setPending(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Salir sin guardar los equipos?</AlertDialogTitle>
          <AlertDialogDescription>
            Hay cambios en los equipos que todavía no guardaste. Si salís de
            esta página, se van a perder.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Seguir editando</AlertDialogCancel>
          <AlertDialogAction onClick={() => pending?.resume()}>
            Salir sin guardar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
