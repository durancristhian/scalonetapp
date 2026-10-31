async function request(operation: string, id?: number, data?: unknown) {
  const response = await fetch("/test-actions/player", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, id, data }),
  });
  if (!response.ok) throw new Error("Action transport failed");
  return response.json();
}
export const addPlayerAction = (id: number, data: unknown) =>
  request("add", id, data);
export const addMultiplePlayersAction = (id: number, data: unknown) =>
  request("bulk", id, data);
export const editPlayerAction = (id: number, data: unknown) =>
  request("edit", id, data);
export const deletePlayerAction = (id: number) => request("delete", id);
