import { z } from "zod";

export const ID_SCHEMA = z.number().int().positive().max(2147483647);
