"use server";

import { FeedbackSchema } from "@/schemas/feedback";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { Telegram } from "@/utils/telegram";
import { auth, currentUser } from "@clerk/nextjs/server";

export const feedbackAction: (data: FeedbackSchema) => Promise<void> = async (
  data
) => {
  try {
    const { userId } = auth();
    const user = await currentUser();

    /* We check auth */
    if (!userId || !user) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

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
      `Message: ${data.message}`,
    ].join("\n");

    const telegram = new Telegram();
    await telegram.sendMessage(message);
  } catch (error) {
    throw new Error(ERROR_MESSAGES.feedback_submit_error);
  }
};
