const HEIC_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);
const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "mif1", "msf1"]);
const RASTER_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const PLAYER_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";
export const PLAYER_PHOTO_SELECTION_ERROR = "Selecciona una foto JPG, PNG, WebP o HEIC de hasta 50 MB.";
const CONVERSION_ERROR = "No pudimos preparar esta foto HEIC. Prueba con otra.";

// Some file pickers omit HEIC's MIME type, so inspect its container brand too.
async function isHeic(file: File): Promise<boolean> {
  if (HEIC_TYPES.has(file.type) || /\.heic$|\.heif$/i.test(file.name)) return true;
  const header = new TextDecoder().decode(await file.slice(0, 64).arrayBuffer());
  if (header.slice(4, 8) !== "ftyp") return false;
  for (let offset = 8; offset + 4 <= header.length; offset += 4) {
    if (offset !== 12 && HEIC_BRANDS.has(header.slice(offset, offset + 4))) return true;
  }
  return false;
}

export async function preparePlayerPhoto(file: File, signal: AbortSignal): Promise<Blob> {
  if (!file.size || file.size > 50_000_000) throw new Error(PLAYER_PHOTO_SELECTION_ERROR);
  signal.throwIfAborted();
  const heic = await isHeic(file);
  signal.throwIfAborted();
  if (!heic) {
    if (!RASTER_TYPES.has(file.type)) throw new Error(PLAYER_PHOTO_SELECTION_ERROR);
    return file;
  }

  return new Promise((resolve, reject) => {
    // A dedicated worker owns conversion (including the decoder's child worker).
    // Termination releases the decoder on success, cancellation, failure or timeout.
    let worker: Worker;
    try {
      worker = new Worker(new URL("./prepare-player-photo.worker.ts", import.meta.url));
    } catch {
      reject(new Error(CONVERSION_ERROR));
      return;
    }
    const finish = (error?: Error, preview?: Blob) => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      worker.terminate();
      if (error) reject(error);
      else if (preview) resolve(preview);
      else reject(new Error(CONVERSION_ERROR));
    };
    const abort = () => finish(new DOMException("Photo preparation cancelled", "AbortError"));
    const timer = setTimeout(() => finish(new Error("La foto tarda demasiado en prepararse. Prueba con otra.")), 45_000);
    signal.addEventListener("abort", abort, { once: true });
    worker.onmessage = (event: MessageEvent<{ preview?: Blob }>) => finish(undefined, event.data.preview);
    worker.onerror = event => { event.preventDefault(); finish(new Error(CONVERSION_ERROR)); };
    worker.onmessageerror = () => finish(new Error(CONVERSION_ERROR));
    try { worker.postMessage(file); }
    catch { finish(new Error(CONVERSION_ERROR)); }
  });
}
