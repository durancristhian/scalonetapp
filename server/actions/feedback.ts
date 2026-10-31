"use server";

import { FEEDBACK_SCHEMA, type FeedbackSchema } from "@/schemas/feedback";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { Telegram } from "@/utils/telegram";
import { auth, currentUser } from "@clerk/nextjs/server";

export const feedbackAction: (data: FeedbackSchema) => Promise<void> = async (
  data,
) => {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      throw new Error(ERROR_MESSAGES.unauthorized);
    }

    const feedback = FEEDBACK_SCHEMA.parse(data);

    const message = [
      `User id: ${userId}`,
      `User emails: ${user.emailAddresses
        .map(({ id, emailAddress }) =>
          user.primaryEmailAddressId && id === user.primaryEmailAddressId
            ? `${emailAddress} (Primary)`
            : emailAddress,
        )
        .join(", ")}`,
      `Message: ${feedback.message}`,
    ].join("\n");

    const telegram = new Telegram();
    await telegram.sendMessage(message);
  } catch (error) {
    throw new Error(ERROR_MESSAGES.feedback_submit_error);
  }
};
