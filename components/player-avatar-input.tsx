import { useAlerts } from "@/app/(authenticated)/(hooks)/use-alerts";
import { PlayerAvatar } from "@/components/player-avatar";
import { SoccerBall } from "@/components/soccer-ball";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { CropIcon, TrashIcon } from "lucide-react";
import {
  ChangeEventHandler,
  FC,
  SyntheticEvent,
  useRef,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";

const ASPECT = 1;

type FileWithPreview = File & {
  preview: string;
};

type PlayerAvatarInputProps = {
  defaultName: string;
  updateAvatar: (nextAvatar: File) => Promise<void>;
};

export const PlayerAvatarInput: FC<PlayerAvatarInputProps> = ({
  defaultName,
  updateAvatar,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(
    null
  );
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { errorAlert } = useAlerts();
  const form = useFormContext();

  /* We register the field manually because of our custom UI for it. This also means listening for its changes */
  const avatar = form.watch("avatar");
  const avatarFieldProps = form.register("avatar");

  const onImageChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
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

    const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });

    setSelectedFile(fileWithPreview);
  };

  const [crop, setCrop] = useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");

  function onImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    if (ASPECT) {
      const { width, height } = event.currentTarget;

      setCrop(centerAspectCrop(width, height, ASPECT));
    }
  }

  function onCropComplete(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);

      setCroppedImageUrl(croppedImageUrl);
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    }

    return canvas.toDataURL("image/png", 1.0);
  }

  // Function to convert base64 string to File object
  const base64ToFile = (dataUrl: string, fileName: string): File => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
  };

  async function onCrop() {
    try {
      setSelectedFile(null);

      const nextAvatar: File = base64ToFile(croppedImageUrl, "avatar");

      updateAvatar(nextAvatar);
    } catch (error) {
      alert("Something went wrong!");
    }
  }

  return (
    <>
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
      <Dialog
        open={!!selectedFile}
        onOpenChange={() => {
          setSelectedFile(null);
        }}
      >
        <DialogContent className="p-0 gap-0">
          <div className="p-6 size-full">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => onCropComplete(c)}
              aspect={ASPECT}
              className="w-full"
            >
              <Avatar className="size-full rounded-none">
                <AvatarImage
                  ref={imgRef}
                  className="size-full rounded-none "
                  alt="Image Cropper Shell"
                  src={selectedFile?.preview}
                  onLoad={onImageLoad}
                />
                <AvatarFallback className="size-full min-h-[460px] rounded-none">
                  Loading...
                </AvatarFallback>
              </Avatar>
            </ReactCrop>
          </div>
          <DialogFooter className="p-6 pt-0 justify-center ">
            <DialogClose asChild>
              <Button
                type="reset"
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                }}
              >
                <TrashIcon className="mr-1.5 size-4" />
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={onCrop}>
              <CropIcon className="mr-1.5 size-4" />
              Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper function to center the crop
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 50,
        height: 50,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}
