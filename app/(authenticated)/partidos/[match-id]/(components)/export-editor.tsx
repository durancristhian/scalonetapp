"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import {
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
import { IMAGE_EXPORT_BACKGROUNDS } from "@/utils/image-export-backgrounds";
import { getImageExportBackground, getImageExportBackgroundStyle, getImageExportBackgroundUrl } from "@/utils/image-export-background";
import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  IMAGE_EXPORT_AVATARS,
  IMAGE_EXPORT_WEATHERS,
  readImageExportOptions,
  storeImageExportOptions,
  type ImageExportOptions,
} from "@/utils/image-export-options";
import { useEffect, useId, useMemo, useState } from "react";
import { ImageOff, Minus } from "lucide-react";
import { WeatherIllustration } from "@/components/team-export/weather-illustration";
import {
  IMAGE_EXPORT_PLAYER_ROLES,
  readImageExportTeamSelections,
  reconcileImageExportTeamSelections,
  storeImageExportTeamSelections,
  type ImageExportTeamSelections,
} from "@/utils/image-export-player-roles";
import { byName } from "@/utils/by-name";
import { ExportPreview } from "./export-preview";
import styles from "./export-editor.module.css";

type ExportEditorProps = {
  matchId: number;
  name: string;
  teams: Team[];
  disabled: boolean;
  processing: boolean;
  onExport: (options: ImageExportOptions, selections: ImageExportTeamSelections) => Promise<string | null>;
};

export default function ExportEditor({
  matchId,
  name,
  teams,
  disabled,
  processing,
  onExport,
}: ExportEditorProps) {
  const [options, setOptions] = useState(readImageExportOptions);
  const [savedSelections, setSavedSelections] = useState(() => readImageExportTeamSelections(matchId, teams));
  const selections = useMemo(
    () => reconcileImageExportTeamSelections(teams, savedSelections),
    [teams, savedSelections],
  );
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const id = useId();
  const palette = getImageExportBackground(options.background)!.palette;

  useEffect(() => {
    storeImageExportTeamSelections(matchId, selections);
  }, [matchId, selections]);

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
    const failure = await onExport(options, selections);
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
              <label
                id={`${id}-background`}
                htmlFor={`${id}-background-control`}
                className={styles.label}
              >
                Tipo de cancha
              </label>
              <Select
                value={options.background}
                disabled={processing}
                onValueChange={(background: ImageExportOptions["background"]) =>
                  updateOptions({ ...options, background })
                }
              >
                <SelectTrigger
                  id={`${id}-background-control`}
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
                      <span className={styles.avatarSample}>
                        <span
                          aria-hidden="true"
                          className={styles.backgroundSwatch}
                          style={{
                            ...getImageExportBackgroundStyle(background.id),
                            backgroundImage: `url("${getImageExportBackgroundUrl(background.id)}")`,
                          }}
                        />
                        <span className={styles.sampleLabel}>{background.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={styles.field}>
              <label
                id={`${id}-weather`}
                htmlFor={`${id}-weather-control`}
                className={styles.label}
              >
                Clima
              </label>
              <Select
                value={options.weather}
                disabled={processing}
                onValueChange={(weather: ImageExportOptions["weather"]) =>
                  updateOptions({ ...options, weather })
                }
              >
                <SelectTrigger
                  id={`${id}-weather-control`}
                  aria-labelledby={`${id}-weather`}
                  className={styles.selectTrigger}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={styles.selectContent}>
                  {IMAGE_EXPORT_WEATHERS.map((weather) => (
                    <SelectItem
                      key={weather.id}
                      value={weather.id}
                      textValue={weather.label}
                      className={styles.selectItem}
                    >
                      <span className={styles.avatarSample}>
                        <span className={styles.avatarIllustration} aria-hidden="true">
                          <WeatherIllustration weather={weather.id} />
                        </span>
                        <span className={styles.sampleLabel}>{weather.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={styles.field}>
              <label
                id={`${id}-avatar`}
                htmlFor={`${id}-avatar-control`}
                className={styles.label}
              >
                Imágenes de jugadores
              </label>
              <Select
                value={options.avatarShape}
                disabled={processing}
                onValueChange={(avatarShape: ImageExportOptions["avatarShape"]) =>
                  updateOptions({ ...options, avatarShape })
                }
              >
                <SelectTrigger
                  id={`${id}-avatar-control`}
                  aria-labelledby={`${id}-avatar`}
                  className={styles.selectTrigger}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={styles.selectContent}>
                  {IMAGE_EXPORT_AVATARS.map(({ id: shape, label }) => (
                    <SelectItem
                      key={shape}
                      value={shape}
                      textValue={label}
                      className={styles.selectItem}
                    >
                      <span className={styles.avatarSample}>
                        <span aria-hidden="true" className={styles.avatarIllustration}>
                          {shape === "none" ? (
                            <ImageOff className={styles.noAvatarIcon} strokeWidth={1.5} />
                          ) : (
                            <PlayerAvatar name="Alex" size="sm" shape={shape} palette={palette} />
                          )}
                        </span>
                        <span className={styles.sampleLabel}>{label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={styles.field}>
              <label
                id={`${id}-columns`}
                htmlFor={`${id}-columns-${options.columns}`}
                className={styles.label}
              >
                Columnas por equipo
              </label>
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
                  <RadioGroupItem id={`${id}-columns-1`} value="1" aria-label="Una" />
                  Una
                </label>
                <label className={styles.choice}>
                  <RadioGroupItem id={`${id}-columns-2`} value="2" aria-label="Dos" />
                  Dos
                </label>
              </RadioGroup>
            </div>
            {teams.map((team) => (
              <fieldset key={team.id} className={styles.teamRoles}>
                <legend className={styles.label}>{team.name.trim()}</legend>
                {IMAGE_EXPORT_PLAYER_ROLES.map(({ id: role, label }) => (
                  <div key={role} className={styles.field}>
                    <label
                      id={`${id}-${role}-${team.id}`}
                      htmlFor={`${id}-${role}-${team.id}-control`}
                      className={styles.label}
                    >
                      {label}
                      <span className="sr-only"> de {team.name.trim()}</span>
                    </label>
                    <Select
                      value={String(selections[team.id].assignments[role] ?? "none")}
                      disabled={processing}
                      onValueChange={(value) => {
                        setSavedSelections({
                          ...selections,
                          [team.id]: {
                            ...selections[team.id],
                            assignments: {
                              ...selections[team.id].assignments,
                              [role]: value === "none" ? null : Number(value),
                            },
                          },
                        });
                        setError(null);
                        setDownloaded(false);
                      }}
                    >
                      <SelectTrigger
                        id={`${id}-${role}-${team.id}-control`}
                        aria-labelledby={`${id}-${role}-${team.id}`}
                        data-player-role-control={role}
                        data-role-team={team.id}
                        className={styles.selectTrigger}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={styles.selectContent}>
                        <SelectItem value="none" textValue="No indicado" className={styles.selectItem}>
                          <span className={styles.avatarSample}>
                            <span className={styles.avatarIllustration} aria-hidden="true"><Minus strokeWidth={1.5} className={styles.noAvatarIcon} /></span>
                            <span className={styles.sampleLabel}>No indicado</span>
                          </span>
                        </SelectItem>
                        {[...team.players].sort(byName).map((player) => (
                          <SelectItem key={player.id} value={String(player.id)} textValue={player.name} className={styles.selectItem}>
                            <span className={styles.avatarSample}>
                              <span className={styles.avatarIllustration} aria-hidden="true">
                                <PlayerAvatar name={player.name} src={player.avatar} size="sm" palette={palette} />
                              </span>
                              <span className={styles.sampleLabel} title={player.name}>{player.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </fieldset>
            ))}
          </fieldset>
        </div>
        {showPreview ? (
          <section className={styles.preview} aria-label="Vista previa">
            <div
              className={styles.previewScroll}
              tabIndex={0}
              role="region"
              aria-label="Imagen de los equipos"
            >
              <ExportPreview name={name} teams={teams} options={options} playerRoles={selections} />
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
        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            disabled={processing}
            onClick={() => updateOptions({ ...DEFAULT_IMAGE_EXPORT_OPTIONS })}
          >
            Restablecer valores
          </Button>
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
