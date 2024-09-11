import { FEEDBACK_SCHEMA } from "@/schemas/feedback";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { Telegram } from "@/utils/telegram";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    /* We check auth */
    if (!userId || !user) {
      return NextResponse.json(
        { ok: false, error: ERROR_MESSAGES.unauthorized },
        { status: 500 }
      );
    }

    const body = await request.json();

    /* We parse the body so we can confirm it's in the form of the expected shape of data */
    const feedbackData = FEEDBACK_SCHEMA.parse(body);

    /* We generate the expected message format */
    const message = [
      `User id: ${userId}`,
      /* We loop over the emailAddresses just in case the user has more than 1 */
      `User emails: ${user.emailAddresses
        .map(({ id, emailAddress }) =>
          /* If the email is the primary one, we add a little note to it */
          user.primaryEmailAddressId && id === user.primaryEmailAddressId
            ? `${emailAddress} (Primary)`
            : emailAddress
        )
        .join(", ")}`,
      `Message: ${feedbackData.message}`,
    ].join("\n");

    const telegram = new Telegram();
    await telegram.sendMessage(message);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { ok: false, error: "No se pudo enviar el mensaje. Intente nuevamente." },
      { status: 500 }
    );
  }
}
