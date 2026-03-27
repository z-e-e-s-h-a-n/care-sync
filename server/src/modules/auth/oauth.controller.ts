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

@Controller("oauth")
export class OAuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
  ) {}

  // ===== GOOGLE =====

  @Get("google")
  @UseOAuthGuard("google")
  googleLogin() {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res);
  }

  // ===== SHARED =====

  private async handleOAuthCallback(req: Request, res: Response) {
    const user = req.user!;
    const redirectUrl = this.extractRedirectUrl(req);

    this.authService.checkUserStatus(user.status);

    await this.tokenService.createAuthSession(req, res, user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return res.redirect(redirectUrl);
  }

  private extractRedirectUrl(req: Request): string {
    const state = req.query.state;

    if (typeof state !== "string") {
      throw new BadRequestException("Invalid OAuth state");
    }

    try {
      return Buffer.from(state, "base64").toString("utf-8");
    } catch {
      throw new BadRequestException("Invalid OAuth state encoding");
    }
  }
}
