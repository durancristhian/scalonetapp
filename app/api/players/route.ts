import { apiGet, apiPost } from "@/app/api/database";
import { uniqueId } from "lodash";

export async function GET(req: Request, res: Response) {
  const query = `
    SELECT * from players
`;

  let status, body;

  try {
    await apiGet(query)
      .then((res) => {
        status = 200;
        body = res;
      })
      .catch((error: Error) => {
        status = 400;
        body = { error };
      });

    return Response.json(body, {
      status,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error },
      {
        status: 400,
      }
    );
  }
}

export async function POST(req: Request, res: Response) {
  const body = await req.json();
  const { name } = body;

  const query = `
    INSERT INTO players(id, name)
    VALUES(?, ?)
`;
  const values = [uniqueId("player-"), name];

  let status, respBody;

  await apiPost(query, values)
    .then(() => {
      status = 200;
      respBody = { message: "Successfully created player." };
    })
    .catch((err) => {
      status = 400;
      respBody = err;
    });

  return Response.json(respBody, {
    status,
  });
}
