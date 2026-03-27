import type { Request, Response } from "express";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import {
  UpdateIdentifierDto,
  RequestOtpDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  ValidateOtpDto,
  UpdateMfaDto,
} from "@workspace/contracts/auth";

import { AuthService } from "./auth.service";
import { Public } from "@/decorators/public.decorator";
import { User } from "@/decorators/user.decorator";
import { TokenService } from "@/modules/token/token.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Public()
  @Post("signup")
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post("signin")
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.authService.signIn(dto, req, res);
  }

  @Post("signout")
  async signOut(
    @User("sessionId") sessionId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signOut(sessionId, res);
  }

  @Public()
  @Post("request-otp")
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Public()
  @Get("validate-otp")
  async validateOtp(
    @Query() dto: ValidateOtpDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.authService.validateOtp(dto, req, res);
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Get("verify-update-identifier")
  async verifyUpdateIdentifier(@Query() dto: UpdateIdentifierDto) {
    return this.authService.verifyUpdateIdentifier(dto);
  }

  @Post("request-update-identifier")
  async requestUpdateIdentifier(@Body() dto: UpdateIdentifierDto) {
    return this.authService.requestUpdateIdentifier(dto);
  }

  @Post("update-mfa")
  async updateMfa(@Body() dto: UpdateMfaDto) {
    return this.authService.updateMfa(dto);
  }

  @Get("sessions")
  listSessions(@User() user: Express.User) {
    return this.tokenService.getUserSessions(user);
  }

  @Delete("sessions")
  revokeAllSessions(@User() user: Express.User) {
    return this.tokenService.revokeAllSessions(user);
  }

  @Delete("sessions/:sessionId")
  revokeSession(@Param("sessionId") sessionId: string) {
    return this.tokenService.revokeSession(sessionId);
  }

  @Get("session/validate")
  validateSession(@Req() req: Request, @User() user: Express.User) {
    return this.authService.validateSession(req, user);
  }
}
