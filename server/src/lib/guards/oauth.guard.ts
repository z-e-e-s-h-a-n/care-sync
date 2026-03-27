import {
  mixin,
  BadRequestException,
  type ExecutionContext,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { OAuthProvider } from "@workspace/contracts";

export function OAuthGuard(provider: OAuthProvider) {
  class OAuthGuardMixin extends AuthGuard(provider) {
    getAuthenticateOptions(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      const clientUrl = req.query.clientUrl;

      if (typeof clientUrl !== "string") {
        throw new BadRequestException("clientUrl is required");
      }

      return {
        state: Buffer.from(clientUrl).toString("base64"),
      };
    }
  }

  return mixin(OAuthGuardMixin);
}
