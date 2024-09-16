"use server";

import { FEEDBACK_SCHEMA } from "@/schemas/feedback";
import { ActionResult } from "@/types/action-result";
import { actionClient } from "@/utils/safe-action";
import { Telegram } from "@/utils/telegram";
import { auth, currentUser } from "@clerk/nextjs/server";
import { zfd } from "zod-form-data";

const feedbackSchema = zfd.formData(FEEDBACK_SCHEMA);

export const feedbackAction = actionClient
  .schema(feedbackSchema)
  .action<ActionResult>(async ({ parsedInput }) => {
    try {
      const { userId } = auth();
      const user = await currentUser();

      /* We check auth */
      if (!userId || !user) {
        return {
          ok: false,
          reason: "unauthorized",
        };
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
        `Message: ${parsedInput.message}`,
      ].join("\n");

      const telegram = new Telegram();
      await telegram.sendMessage(message);

      return {
        ok: true,
      };
    } catch (error) {
      console.error(error);

      return {
        ok: false,
        reason: "submit_feedback_error",
      };
    }
  });
