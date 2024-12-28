"use client";

import { SoccerBall } from "@/components/soccer-ball";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useRef, useState, type SyntheticEvent } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const aspect = 1;

type ImageCropperProps = {
  dialogOpen: boolean;
  onImageCropped: (croppedImageFile: Blob) => Promise<void>;
  preview: string | null;
  removePreview: () => void;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ImageCropper({
  dialogOpen,
  onImageCropped,
  preview,
  removePreview,
  setDialogOpen,
}: ImageCropperProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const imgRef = useRef<HTMLImageElement | null>(null);

  function onImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const { width, height } = event.currentTarget;

    setCrop(centerAspectCrop({ width, height, aspect }));
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

  async function onCrop() {
    setUploadingImage(true);

    try {
      /* Transform croppedImage (base64) to Blob */
      const array = [];
      const blobBin = atob(croppedImageUrl?.split(",")[1] || "");

      for (let i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
      }

      const file = new Blob([new Uint8Array(array)], { type: "image/png" });

      await onImageCropped(file);

      setDialogOpen(false);
    } catch {}

    setUploadingImage(false);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Recortando la foto</DialogTitle>
          <DialogDescription className="max-md:text-balance">
            Selecciona la parte que más te guste para usar de avatar. Te
            recomendamos hacer foco en el rostro de la persona.
          </DialogDescription>
        </DialogHeader>
        <ReactCrop
          aspect={aspect}
          crop={crop}
          disabled={uploadingImage}
          onChange={(_crop, percentCrop) => {
            setCrop(percentCrop);
          }}
          onComplete={(crop) => {
            onCropComplete(crop);
          }}
        >
          <Avatar className="rounded-none size-full">
            <AvatarImage
              className="aspect-auto rounded-none size-full"
              src={preview || ""}
              onLoad={onImageLoad}
              ref={imgRef}
            />
          </Avatar>
        </ReactCrop>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={() => {
                removePreview();
              }}
              disabled={uploadingImage}
              type="reset"
              variant="outline"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={onCrop} disabled={uploadingImage} type="submit">
            {uploadingImage ? (
              <SoccerBall className="animate-spin h-4 mr-2 opacity-50 w-4" />
            ) : null}
            {uploadingImage ? "Guardando..." : "Recortar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to center the crop
const centerAspectCrop: (opts: {
  aspect: number;
  height: number;
  width: number;
}) => Crop = ({ aspect, height, width }) => {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 50,
        height: 50,
      },
      aspect,
      width,
      height
    ),
    width,
    height
  );
};
