import { ERROR_MESSAGES } from "@/utils/error-messages";

type GetErrorMessage = (errorKey: keyof typeof ERROR_MESSAGES) => string;

export const getErrorMessage: GetErrorMessage = (errorKey) => {
  return ERROR_MESSAGES[errorKey];
};
