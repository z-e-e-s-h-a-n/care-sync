import type { Request, Response, NextFunction } from "express";
import {
  BadRequestException,
  Injectable,
  type NestMiddleware,
} from "@nestjs/common";

import { EnvService } from "@/modules/env/env.service";
import { CacheService } from "@/modules/cache/cache.service";

@Injectable()
export class CacheContextMiddleware implements NestMiddleware {
  private clientEndpoint: string;
  private adminEndpoint: string;
  private allowedOrigins: string[];

  constructor(
    private readonly cache: CacheService,
    private readonly env: EnvService,
  ) {
    this.clientEndpoint = this.env.get("CLIENT_ENDPOINT");
    this.adminEndpoint = this.env.get("ADMIN_ENDPOINT");
    this.allowedOrigins = this.env.get("CORS_ORIGIN");
  }

  async use(req: Request, _: Response, next: NextFunction) {
    const incomingUrl =
      (req.headers["x-client-url"] as string) ||
      (req.query.clientUrl as string);

    if (!incomingUrl) {
      throw new BadRequestException("clientUrl is required");
    }

    if (!this.allowedOrigins.includes(incomingUrl)) {
      throw new BadRequestException("Invalid clientUrl");
    }

    await this.setClientContext(req);

    next();
  }

  private async setClientContext(req: Request): Promise<void> {
    const incomingUrl =
      (req.headers["x-client-url"] as string) ||
      (req.query.clientUrl as string);

    if (!incomingUrl) {
      throw new BadRequestException("clientUrl is required");
    }

    if (!this.allowedOrigins.includes(incomingUrl)) {
      throw new BadRequestException("Invalid clientUrl");
    }

    await this.cache.set("clientUrl", incomingUrl);
  }
}
