import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { PlayerAvatar } from "@/components/player-avatar";
import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrashIcon } from "lucide-react";
import { ChangeEventHandler, FC, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

/* type FileWithPreview = File & {
  preview: string;
}; */

type PlayerAvatarInputProps = {
  defaultName: string;
  updateAvatar: (nextAvatar: File) => Promise<void>;
};

export const PlayerAvatarInput: FC<PlayerAvatarInputProps> = ({
  defaultName,
  updateAvatar,
}) => {
  /* const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(
    null
  ); */
  const [uploadingImage, setUploadingImage] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { errorAlert } = useAlerts();
  const form = useFormContext();

  /* We register the field manually because of our custom UI for it. This also means listening for its changes */
  const avatar = form.watch("avatar");
  const avatarFieldProps = form.register("avatar");

  const onImageChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    setUploadingImage(true);

    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    /* This is safe to do since we don't accept multiple images in the file input */
    const file = files[0];

    const fileSizeInMb = file.size / 1024 / 1024;

    if (
      fileSizeInMb >= Number(process.env.NEXT_PUBLIC_IMAGE_UPLOAD_SIZE_LIMIT)
    ) {
      errorAlert({
        title: `La foto excede el tamaño máximo permitido (${process.env.NEXT_PUBLIC_IMAGE_UPLOAD_SIZE_LIMIT} MB).`,
      });

      /* We clean the input value */
      if (inputFileRef.current) {
        inputFileRef.current.value = "";

        form.setValue("avatar", "");
      }

      return;
    }

    /* const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });

    setSelectedFile(fileWithPreview); */

    await updateAvatar(file);

    setUploadingImage(false);
  };

  return (
    <div className="flex gap-4 items-center justify-center">
      <PlayerAvatar
        src={avatar || ""}
        name={form.watch("name") || defaultName}
        size="xl"
      />
      <input
        hidden
        type="file"
        /* We only accept jpg, jpeg and png extensions */
        accept=".jpg,.jpeg,.png"
        {...avatarFieldProps}
        ref={inputFileRef}
        onChange={onImageChange}
      />
      {avatar ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  /* We clean the input value */
                  if (inputFileRef.current) {
                    inputFileRef.current.value = "";

                    form.setValue("avatar", "");
                  }
                }}
                variant="ghost"
                size="icon"
              >
                <TrashIcon className="h-4 text-red-700 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button
          /* We trigger the input file click with this button */
          onClick={() => {
            if (inputFileRef.current) {
              inputFileRef.current.click();
            }
          }}
          disabled={uploadingImage}
          type="button"
          variant="outline"
        >
          {uploadingImage ? (
            <>
              <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
              Subiendo foto...
            </>
          ) : (
            "Subir una foto"
          )}
        </Button>
      )}
    </div>
  );
};
