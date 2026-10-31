import { loadModule } from "./load-module";

self.onmessage = async (event: MessageEvent<File>) => {
  let bitmap: ImageBitmap | undefined;
  let canvas: OffscreenCanvas | undefined;
  try {
    try {
      bitmap = await createImageBitmap(event.data);
    } catch {
      const { heicTo } = await loadModule(() => import("heic-to/next"));
      bitmap = await heicTo({ blob: event.data, type: "bitmap" });
    }
    const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    canvas = new OffscreenCanvas(
      Math.max(1, Math.round(bitmap.width * scale)),
      Math.max(1, Math.round(bitmap.height * scale)),
    );
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const preview = await canvas.convertToBlob({ type: "image/png" });
    self.postMessage({ preview });
  } catch {
    self.postMessage({ error: true });
  } finally {
    bitmap?.close();
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
};
