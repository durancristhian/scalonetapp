// Keep imports at the call site so the bundler can discover their chunks.
// Retry the loader once after a transient download failure, never its consumers.
export async function loadModule<T>(load: () => Promise<T>, signal?: AbortSignal): Promise<T> {
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
