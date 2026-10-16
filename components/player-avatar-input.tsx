"use client";
import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { ImageCropper } from "@/components/image-cropper";
import { PlayerAvatar } from "@/components/player-avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { PLAYER_PHOTO_ACCEPT, preparePlayerPhoto } from "@/utils/prepare-player-photo";

type Props = { name: string; src?: string; disabled?: boolean; onChange: (photo: Blob | null) => void; onPreparingChange: (preparing: boolean) => void };
export function PlayerAvatarInput({ name, src, disabled, onChange, onPreparingChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const preparation = useRef<AbortController | null>(null);
  const [preparing, setPreparing] = useState(false);
  useEffect(() => () => { preparation.current?.abort(); preparation.current = null; }, []);
  const [preview, setPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [open, setOpen] = useState(false);
  const { errorAlert } = useAlerts();
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => () => { if (selected) URL.revokeObjectURL(selected); }, [selected]);
  return <div className="space-y-2">
    <div className="flex items-center justify-center gap-4">
      <PlayerAvatar name={name || "Jugador"} src={selected || (removed ? undefined : src)} size="xl" />
      <input ref={input} hidden type="file" accept={PLAYER_PHOTO_ACCEPT} disabled={disabled || preparing} onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = "";
        if (!file) return;
        preparation.current?.abort();
        const controller = new AbortController();
        preparation.current = controller;
        setPreparing(true); onPreparingChange(true);
        try {
          const source = await preparePlayerPhoto(file, controller.signal);
          if (controller.signal.aborted) return;
          setPreview(URL.createObjectURL(source)); setOpen(true);
        } catch (error) {
          if (!controller.signal.aborted) errorAlert({ title: error instanceof Error ? error.message : "No pudimos preparar esta foto. Prueba con otra." });
        } finally {
          if (preparation.current === controller) {
            preparation.current = null;
            setPreparing(false); onPreparingChange(false);
          }
        }
      }} />
      <Button type="button" variant="outline" disabled={disabled || preparing} onClick={() => input.current?.click()}>Elegir foto</Button>
      {preparing && <Button type="button" variant="ghost" onClick={() => preparation.current?.abort()}>Cancelar preparación</Button>}
      {(selected || (!removed && src)) && <Button type="button" variant="ghost" disabled={disabled || preparing} onClick={() => { setSelected(null); setRemoved(true); onChange(null); }}>Quitar foto</Button>}
    </div>
    {preparing && <p role="status" className="text-sm text-muted-foreground">Preparando foto…</p>}
    <ImageCropper dialogOpen={open} setDialogOpen={value => { setOpen(value); if (value === false) setPreview(null); }} preview={preview} removePreview={() => setPreview(null)} onImageCropped={async blob => { setSelected(URL.createObjectURL(blob)); setRemoved(false); onChange(blob); setPreview(null); }} />
  </div>;
}
