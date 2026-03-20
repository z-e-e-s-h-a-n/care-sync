import { applyDecorators, UseGuards } from "@nestjs/common";
import { OAuthGuard, type OAuthProvider } from "@/guards/oauth.guard";
import { Public } from "@/decorators/public.decorator";

export function UseOAuthGuard(provider: OAuthProvider) {
  return applyDecorators(Public(), UseGuards(OAuthGuard(provider)));
}
