import { createZodDto } from "nestjs-zod";
import z, { type ZodType } from "zod";

export const createUZodDto = <T extends ZodType>(schema: T) => {
  return createZodDto(
    z.preprocess((data) => ({ payload: data }), z.object({ payload: schema })),
  );
};
