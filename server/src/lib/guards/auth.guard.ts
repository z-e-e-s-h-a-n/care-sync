import { Reflector } from "@nestjs/core";
import type { Request, Response } from "express";
import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import type { UserRole } from "@workspace/db/client";

import { ROLES_KEY } from "@/decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "@/decorators/public.decorator";
import { TokenService } from "@/modules/token/token.service";
import { ClientService } from "@/modules/client/client.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
    private readonly client: ClientService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    try {
      const payload = await this.tokenService.verifyToken(req, "accessToken");
      this.checkRoles(payload.rol, requiredRoles);
      await this.client.assertRoleAccess(req, payload.rol);
      this.tokenService.attachAuthContext(req, payload);
      return true;
    } catch (err: any) {
      const code = err?.response?.errorCode ?? err?.errorCode;
      if (code !== "access_token_missing") throw err;

      const payload = await this.tokenService.verifyToken(req, "refreshToken");
      this.checkRoles(payload.rol, requiredRoles);
      await this.client.assertRoleAccess(req, payload.rol);
      await this.tokenService.refreshTokens(req, res, payload);
      if (!req["user"]) throw new UnauthorizedException("User not found");
      return true;
    }
  }

  private checkRoles(userRole: UserRole, requiredRoles?: UserRole[]) {
    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((role) => role === userRole);
      if (!hasRole) {
        throw new ForbiddenException({
          errorCode: "forbidden",
          message: "You do not have permission to access this resource.",
        });
      }
    }
  }
}
