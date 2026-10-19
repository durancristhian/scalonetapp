"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import { SoccerBall } from "@/components/soccer-ball";
import { exportFontClasses } from "@/components/team-export/fonts";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Team } from "@/types/team";
import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  IMAGE_EXPORT_BACKGROUNDS,
  IMAGE_EXPORT_FONTS,
  readImageExportOptions,
  storeImageExportOptions,
  type ImageExportOptions,
} from "@/utils/image-export-options";
import { useEffect, useId, useState } from "react";
import { ExportPreview } from "./export-preview";
import styles from "./export-editor.module.css";

type ExportEditorProps = {
  name: string;
  teams: Team[];
  disabled: boolean;
  processing: boolean;
  onExport: (options: ImageExportOptions) => Promise<string | null>;
};

export default function ExportEditor({
  name,
  teams,
  disabled,
  processing,
  onExport,
}: ExportEditorProps) {
  const [options, setOptions] = useState(readImageExportOptions);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const id = useId();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setShowPreview(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const updateOptions = (next: ImageExportOptions) => {
    setOptions(next);
    storeImageExportOptions(next);
    setError(null);
    setDownloaded(false);
  };

  const download = async () => {
    if (disabled || processing) return;
    setError(null);
    setDownloaded(false);
    const failure = await onExport(options);
    setError(failure);
    setDownloaded(!failure);
  };

  return (
    <DialogContent
      className={styles.dialog}
      closeLabel="Cerrar"
      closeDisabled={processing}
      onEscapeKeyDown={(event) => {
        if (processing) event.preventDefault();
      }}
      onInteractOutside={(event) => {
        if (processing) event.preventDefault();
      }}
    >
      <header className={styles.header}>
        <DialogTitle>Exportar</DialogTitle>
        <DialogDescription>
          Personalizá la imagen de tus equipos.
        </DialogDescription>
      </header>
      <div className={styles.body}>
        <div className={styles.options}>
          <fieldset disabled={processing} className={styles.fields}>
            <legend className="sr-only">Opciones de la imagen</legend>
            <div className={styles.field}>
              <h3 id={`${id}-font`} className={styles.label}>
                Fuente
              </h3>
              <Select
                value={options.font}
                disabled={processing}
                onValueChange={(font: ImageExportOptions["font"]) =>
                  updateOptions({ ...options, font })
                }
              >
                <SelectTrigger
                  aria-labelledby={`${id}-font`}
                  className={styles.selectTrigger}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={styles.selectContent}>
                  {IMAGE_EXPORT_FONTS.map((font) => (
                    <SelectItem
                      key={font.id}
                      value={font.id}
                      textValue={font.label}
                      className={styles.selectItem}
                    >
                      <span
                        className={`${styles.fontSample} ${exportFontClasses[font.id]}`}
                      >
                        {font.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={styles.field}>
              <h3 id={`${id}-background`} className={styles.label}>
                Fondo
              </h3>
              <Select
                value={options.background}
                disabled={processing}
                onValueChange={(background: ImageExportOptions["background"]) =>
                  updateOptions({ ...options, background })
                }
              >
                <SelectTrigger
                  aria-labelledby={`${id}-background`}
                  className={styles.selectTrigger}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={styles.selectContent}>
                  {IMAGE_EXPORT_BACKGROUNDS.map((background) => (
                    <SelectItem
                      key={background.id}
                      value={background.id}
                      textValue={background.label}
                      className={styles.selectItem}
                    >
                      <span className={styles.backgroundSample}>
                        <span
                          aria-hidden="true"
                          className={`${styles.swatch} ${background.src ? "" : "bg-pattern"}`}
                          style={
                            background.src
                              ? { backgroundImage: `url("${background.src}")` }
                              : undefined
                          }
                        />
                        {background.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={styles.field}>
              <h3 id={`${id}-avatar`} className={styles.label}>
                Avatares
              </h3>
              <RadioGroup
                className={styles.pair}
                aria-labelledby={`${id}-avatar`}
                value={options.avatarShape}
                disabled={processing}
                onValueChange={(
                  avatarShape: ImageExportOptions["avatarShape"],
                ) => updateOptions({ ...options, avatarShape })}
              >
                {([
                  ["circle", "Circulares"],
                  ["square", "Cuadrados"],
                ] as const).map(([shape, label]) => (
                  <label
                    key={shape}
                    className={`${styles.choice} ${styles.avatarChoice}`}
                  >
                    <span aria-hidden="true">
                      <PlayerAvatar name="Alex" shape={shape} />
                    </span>
                    <RadioGroupItem value={shape} aria-label={label} />
                    <span className={styles.avatarLabel}>{label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div className={styles.field}>
              <h3 id={`${id}-columns`} className={styles.label}>
                Columnas por equipo
              </h3>
              <RadioGroup
                className={styles.pair}
                aria-labelledby={`${id}-columns`}
                value={String(options.columns)}
                disabled={processing}
                onValueChange={(value) =>
                  updateOptions({ ...options, columns: value === "2" ? 2 : 1 })
                }
              >
                <label className={styles.choice}>
                  <RadioGroupItem value="1" />
                  Una
                </label>
                <label className={styles.choice}>
                  <RadioGroupItem value="2" />
                  Dos
                </label>
              </RadioGroup>
            </div>
          </fieldset>
        </div>
        {showPreview ? (
          <section className={styles.preview} aria-label="Vista previa">
            <h3 className={styles.previewLabel}>Vista previa</h3>
            <div
              className={styles.previewScroll}
              tabIndex={0}
              role="region"
              aria-label="Imagen de los equipos"
            >
              <ExportPreview name={name} teams={teams} options={options} />
            </div>
          </section>
        ) : null}
      </div>
      <footer className={styles.footer}>
        <div className={styles.feedback}>
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <p role="status">
            {processing
              ? "Preparando descarga…"
              : downloaded
                ? "¡Descarga iniciada!"
                : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className={styles.reset}
          disabled={processing}
          onClick={() => updateOptions({ ...DEFAULT_IMAGE_EXPORT_OPTIONS })}
        >
          Restablecer valores
        </Button>
        <div className={styles.actions}>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={processing}>
              Cerrar
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={disabled || processing}
            onClick={download}
            aria-busy={processing}
          >
            {processing ? (
              <SoccerBall
                aria-hidden="true"
                className="motion-safe:animate-spin size-4 me-2"
              />
            ) : null}
            {processing ? "Descargando…" : "Descargar"}
          </Button>
        </div>
      </footer>
    </DialogContent>
  );
}
