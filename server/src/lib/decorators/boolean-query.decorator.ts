import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export const BooleanQuery = createParamDecorator(
  (key: string, ctx: ExecutionContext): boolean => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.query[key];

    if (value === undefined) return false;

    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }

    return false;
  },
);
