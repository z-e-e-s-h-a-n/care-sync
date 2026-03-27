import { applyDecorators, UseGuards } from "@nestjs/common";
import { OAuthGuard } from "@/guards/oauth.guard";
import { Public } from "@/decorators/public.decorator";
import type { OAuthProvider } from "@workspace/contracts";

export function UseOAuthGuard(provider: OAuthProvider) {
  return applyDecorators(Public(), UseGuards(OAuthGuard(provider)));
}
