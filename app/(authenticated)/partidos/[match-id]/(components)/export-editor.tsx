"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
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
import {
  getImageExportBackground,
  getImageExportBackgroundStyle,
  getImageExportBackgroundUrl,
} from "@/utils/image-export-background";
import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  IMAGE_EXPORT_AVATARS,
  IMAGE_EXPORT_WEATHERS,
  readImageExportOptions,
  storeImageExportOptions,
  type ImageExportOptions,
} from "@/utils/image-export-options";
import { useEffect, useId, useMemo, useState } from "react";
import { AlignCenter, AlignLeft, ImageOff, Minus } from "lucide-react";
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
import { Label } from "@/components/ui/label";

type ExportEditorProps = {
  matchId: number;
  name: string;
  teams: Team[];
  disabled: boolean;
  processing: boolean;
  onExport: (
    options: ImageExportOptions,
    selections: ImageExportTeamSelections,
  ) => Promise<string | null>;
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
  const [savedSelections, setSavedSelections] = useState(() =>
    readImageExportTeamSelections(matchId, teams),
  );
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
    // Advance the remembered roster even if match data changes while open.
    setSavedSelections((saved) =>
      reconcileImageExportTeamSelections(teams, saved),
    );
  }, [teams]);

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
      className="h-[min(50rem,90dvh)] max-h-[90dvh] w-[calc(100%_-_2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-clip rounded-lg p-0 sm:p-0 lg:w-[calc(100%_-_4rem)] lg:max-w-screen-2xl motion-reduce:animate-none"
      closeLabel="Cerrar"
      closeDisabled={processing}
      onEscapeKeyDown={(event) => {
        if (processing) event.preventDefault();
      }}
      onInteractOutside={(event) => {
        if (processing) event.preventDefault();
      }}
    >
      <DialogHeader className="border-b p-4 sm:p-6 text-start">
        <DialogTitle>Exportar</DialogTitle>
        <DialogDescription>
          Personalizá la imagen de tus equipos.
        </DialogDescription>
      </DialogHeader>
      <div className="grid min-h-0 min-w-0 grid-cols-1 lg:grid-cols-[theme(spacing.80)_minmax(0,1fr)]">
        <div className="min-h-0 min-w-0 overflow-auto overscroll-contain p-4 sm:p-6">
          <fieldset
            disabled={processing}
            className="grid min-w-0 gap-6 disabled:opacity-60"
          >
            <legend className="sr-only">Opciones de la imagen</legend>
            <div className="grid min-w-0 grid-cols-1 gap-2">
              <Label
                id={`${id}-background`}
                htmlFor={`${id}-background-control`}
              >
                Tipo de cancha
              </Label>
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
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {IMAGE_EXPORT_BACKGROUNDS.map((background) => (
                    <SelectItem
                      key={background.id}
                      value={background.id}
                      textValue={background.label}
                    >
                      <span className="flex min-w-0 items-center gap-3 whitespace-nowrap text-start">
                        <span
                          aria-hidden="true"
                          className="grid size-8 shrink-0 place-items-center"
                        >
                          <span
                            className="size-6 rounded-sm bg-[var(--export-surface-color)] bg-cover"
                            style={{
                              ...getImageExportBackgroundStyle(background.id),
                              backgroundImage: `url("${getImageExportBackgroundUrl(background.id)}")`,
                            }}
                          />
                        </span>
                        <span className="min-w-0 truncate">
                          {background.label}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-2">
              <Label id={`${id}-weather`} htmlFor={`${id}-weather-control`}>
                Clima
              </Label>
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
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {IMAGE_EXPORT_WEATHERS.map((weather) => (
                    <SelectItem
                      key={weather.id}
                      value={weather.id}
                      textValue={weather.label}
                    >
                      <span className="flex min-w-0 items-center gap-3 whitespace-nowrap text-start">
                        <span
                          className="grid size-8 shrink-0 place-items-center"
                          aria-hidden="true"
                        >
                          <WeatherIllustration weather={weather.id} />
                        </span>
                        <span className="min-w-0 truncate">
                          {weather.label}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-2">
              <Label id={`${id}-avatar`} htmlFor={`${id}-avatar-control`}>
                Imágenes de jugadores
              </Label>
              <Select
                value={options.avatarShape}
                disabled={processing}
                onValueChange={(
                  avatarShape: ImageExportOptions["avatarShape"],
                ) => updateOptions({ ...options, avatarShape })}
              >
                <SelectTrigger
                  id={`${id}-avatar-control`}
                  aria-labelledby={`${id}-avatar`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {IMAGE_EXPORT_AVATARS.map(({ id: shape, label }) => (
                    <SelectItem
                      key={shape}
                      value={shape}
                      textValue={label}
                    >
                      <span className="flex min-w-0 items-center gap-3 whitespace-nowrap text-start">
                        <span
                          aria-hidden="true"
                          className="grid size-8 shrink-0 place-items-center"
                        >
                          {shape === "none" ? (
                            <ImageOff className="size-6 text-muted-foreground" />
                          ) : (
                            <PlayerAvatar
                              name="Alex"
                              size="sm"
                              shape={shape}
                              palette={palette}
                            />
                          )}
                        </span>
                        <span className="min-w-0 truncate">{label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-2">
              <Label
                id={`${id}-alignment`}
                htmlFor={`${id}-alignment-${options.alignment}`}
              >
                Alineación de jugadores
              </Label>
              <RadioGroup
                className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1"
                aria-labelledby={`${id}-alignment`}
                value={options.alignment}
                disabled={processing}
                onValueChange={(value) =>
                  updateOptions({
                    ...options,
                    alignment: value === "center" ? "center" : "left",
                  })
                }
              >
                <RadioGroupItem
                  variant="button"
                  className="gap-2"
                  id={`${id}-alignment-left`}
                  value="left"
                >
                  <AlignLeft className="size-4 shrink-0" aria-hidden="true" />
                  Izquierda
                </RadioGroupItem>
                <RadioGroupItem
                  variant="button"
                  className="gap-2"
                  id={`${id}-alignment-center`}
                  value="center"
                >
                  <AlignCenter className="size-4 shrink-0" aria-hidden="true" />
                  Centrada
                </RadioGroupItem>
              </RadioGroup>
            </div>
            {teams.map((team) => (
              <fieldset
                key={team.id}
                disabled={processing || !team.players.length}
                className="grid min-w-0 gap-4 [padding-block-start:theme(spacing.4)]"
              >
                <legend className="max-w-full text-base font-medium [overflow-wrap:anywhere]">
                  {team.name.trim()}
                </legend>
                {IMAGE_EXPORT_PLAYER_ROLES.map(({ id: role, label }) => (
                  <div key={role} className="grid min-w-0 grid-cols-1 gap-2">
                    <Label
                      id={`${id}-${role}-${team.id}`}
                      htmlFor={`${id}-${role}-${team.id}-control`}
                    >
                      {label}
                      <span className="sr-only"> de {team.name.trim()}</span>
                    </Label>
                    <Select
                      value={String(
                        selections[team.id].assignments[role] ?? "none",
                      )}
                      disabled={processing || !team.players.length}
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
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-[var(--radix-select-trigger-width)]">
                        <SelectItem
                          value="none"
                          textValue="No indicado"
                        >
                          <span className="flex min-w-0 items-center gap-3 whitespace-nowrap text-start">
                            <span
                              className="grid size-8 shrink-0 place-items-center"
                              aria-hidden="true"
                            >
                              <Minus className="size-6 text-muted-foreground" />
                            </span>
                            <span className="min-w-0 truncate">
                              No indicado
                            </span>
                          </span>
                        </SelectItem>
                        {[...team.players].sort(byName).map((player) => (
                          <SelectItem
                            key={player.id}
                            value={String(player.id)}
                            textValue={player.name}
                          >
                            <span className="flex min-w-0 items-center gap-3 whitespace-nowrap text-start">
                              <span
                                className="grid size-8 shrink-0 place-items-center"
                                aria-hidden="true"
                              >
                                <PlayerAvatar
                                  name={player.name}
                                  src={player.avatar}
                                  size="sm"
                                  palette={palette}
                                />
                              </span>
                              <span
                                className="min-w-0 truncate"
                                title={player.name}
                              >
                                {player.name}
                              </span>
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
          <section
            className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)] border-s bg-muted"
            aria-label="Vista previa"
          >
            <div
              className="flex min-h-0 min-w-0 flex-col overflow-clip p-4 sm:p-6"
              role="region"
              aria-label="Imagen de los equipos"
            >
              <ExportPreview
                name={name}
                teams={teams}
                options={options}
                playerRoles={selections}
              />
            </div>
          </section>
        ) : null}
      </div>
      <footer className="flex flex-wrap items-center gap-3 border-t p-4 sm:px-6">
        <div
          className="min-w-0 basis-full text-base"
          hidden={!error && !processing && !downloaded}
        >
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
        <DialogFooter className="ms-auto w-full gap-2 sm:w-auto sm:space-x-0">
          <Button
            type="button"
            className="flex-1"
            variant="outline"
            disabled={processing}
            onClick={() => updateOptions({ ...DEFAULT_IMAGE_EXPORT_OPTIONS })}
          >
            Restablecer valores
          </Button>
          <Button
            type="button"
            className="flex-1"
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
        </DialogFooter>
      </footer>
    </DialogContent>
  );
}
