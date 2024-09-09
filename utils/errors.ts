import { ZodError } from "zod";

export const unfoldZodError: (error: unknown) => string[] = (error) => {
  if (error instanceof ZodError) {
    return error.errors.map(({ message }) => message);
  }

  return [];
};
