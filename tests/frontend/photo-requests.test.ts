import { expect, it, vi } from "vitest";
import { savePlayerPhoto } from "@/utils/save-player-photo";
import { PHOTO_UNAVAILABLE } from "@/utils/photo-policy";

it("should skip the request when the photo is unchanged", async () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  expect(await savePlayerPhoto(7, undefined)).toBeNull();
  expect(request).not.toHaveBeenCalled();
});
it.each(["upload", "remove"])(
  "should send the correct request when the user chooses to %s the photo",
  async (operation) => {
    const request = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", request);
    const photo =
      operation === "upload"
        ? new Blob(["photo"], { type: "image/png" })
        : null;
    expect(await savePlayerPhoto(7, photo)).toBeNull();
    expect(request).toHaveBeenCalledExactlyOnceWith("/api/players/7/avatar", {
      method: photo ? "POST" : "DELETE",
      body: photo || undefined,
      headers: photo ? { "Content-Type": "image/png" } : undefined,
      signal: expect.any(AbortSignal),
    });
  },
);
it.each(["offline", "invalid json", "missing error", "server error"])(
  "should return recoverable feedback when photo saving fails with %s",
  async (failure) => {
    const request = vi.fn();
    if (failure === "offline") request.mockRejectedValue(Error("offline"));
    else if (failure === "invalid json")
      request.mockResolvedValue(
        new Response("<html>Unavailable</html>", { status: 503 }),
      );
    else
      request.mockResolvedValue(
        Response.json(
          failure === "server error" ? { error: "Foto demasiado grande" } : {},
          { status: 400 },
        ),
      );
    vi.stubGlobal("fetch", request);
    expect(await savePlayerPhoto(7, null)).toBe(
      failure === "server error" ? "Foto demasiado grande" : PHOTO_UNAVAILABLE,
    );
  },
);
