export async function loadModule<T>(
  load: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  signal?.throwIfAborted();
  try {
    return await load();
  } catch {
    signal?.throwIfAborted();
    await new Promise<void>((resolve, reject) => {
      const abort = () => {
        clearTimeout(timer);
        reject(signal?.reason);
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", abort);
        resolve();
      }, 500);
      signal?.addEventListener("abort", abort, { once: true });
    });
    signal?.throwIfAborted();
    return load();
  }
}
