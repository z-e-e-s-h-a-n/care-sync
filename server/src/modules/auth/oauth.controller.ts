import {
  Get,
  Req,
  Res,
  UseGuards,
  Controller,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { UseOAuthGuard } from "@/decorators/oauth.decorator";
import { TokenService } from "@/modules/token/token.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ClientService } from "@/modules/client/client.service";
import { Public } from "@/lib/decorators/public.decorator";

@Controller("oauth")
export class OAuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly client: ClientService,
  ) {}

  @Get("google")
  @UseOAuthGuard("google")
  googleLogin() {}

  @Get("google/callback")
  @Public()
  @UseGuards(AuthGuard("google"))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res);
  }

  private async handleOAuthCallback(req: Request, res: Response) {
    const user = req.user!;
    const redirectUrl = this.extractRedirectUrl(req);
    req.headers["x-client-url"] = redirectUrl.origin;
    this.authService.checkUserStatus(user.status);
    await this.client.assertRoleAccess(req, user.role);

    await this.tokenService.createAuthSession(req, res, user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return res.redirect(redirectUrl.href);
  }

  private extractRedirectUrl(req: Request) {
    const state = req.query.state;

    if (typeof state !== "string") {
      throw new BadRequestException("Invalid OAuth state");
    }

    try {
      const redirectUrl = Buffer.from(state, "base64").toString("utf-8");
      return new URL(redirectUrl);
    } catch {
      throw new BadRequestException("Invalid OAuth redirect URL");
    }
  }
}
