"use client";
import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { ImageCropper } from "@/components/image-cropper";
import { PlayerAvatar } from "@/components/player-avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

type Props = { name: string; src?: string; disabled?: boolean; onChange: (photo: Blob | null) => void };
export function PlayerAvatarInput({ name, src, disabled, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
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
      <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={event => {
        const file = event.target.files?.[0]; event.target.value = "";
        if (!file) return;
        if (file.size > 50_000_000 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) { errorAlert({ title: "Selecciona una foto JPG, PNG o WebP de hasta 50 MB." }); return; }
        setPreview(URL.createObjectURL(file)); setOpen(true);
      }} />
      <Button type="button" variant="outline" disabled={disabled} onClick={() => input.current?.click()}>Elegir foto</Button>
      {(selected || (!removed && src)) && <Button type="button" variant="ghost" disabled={disabled} onClick={() => { setSelected(null); setRemoved(true); onChange(null); }}>Quitar foto</Button>}
    </div>
    <ImageCropper dialogOpen={open} setDialogOpen={value => { setOpen(value); if (value === false) setPreview(null); }} preview={preview} removePreview={() => setPreview(null)} onImageCropped={async blob => { setSelected(URL.createObjectURL(blob)); setRemoved(false); onChange(blob); setPreview(null); }} />
  </div>;
}
