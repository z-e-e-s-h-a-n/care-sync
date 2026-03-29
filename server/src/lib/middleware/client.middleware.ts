import type { Request, Response, NextFunction } from "express";
import {
  BadRequestException,
  Injectable,
  type NestMiddleware,
} from "@nestjs/common";

import { EnvService } from "@/modules/env/env.service";
import { CacheService } from "@/modules/cache/cache.service";

@Injectable()
export class ClientContextMiddleware implements NestMiddleware {
  private allowedOrigins: string[];
  private readonly publicPaths = new Set(["/", "/health"]);

  constructor(
    private readonly cache: CacheService,
    private readonly env: EnvService,
  ) {
    this.allowedOrigins = this.env.get("CORS_ORIGIN");
  }

  async use(req: Request, _: Response, next: NextFunction) {
    const incomingUrl =
      (req.headers["x-client-url"] as string) ||
      (req.query.clientUrl as string);

    if (!incomingUrl && this.shouldBypass(req)) {
      next();
      return;
    }

    if (!incomingUrl) {
      throw new BadRequestException("clientUrl is required");
    }

    if (!this.allowedOrigins.includes(incomingUrl)) {
      throw new BadRequestException("Invalid clientUrl");
    }

    await this.setClientContext(req);

    next();
  }

  private shouldBypass(req: Request): boolean {
    return req.method === "GET" && this.publicPaths.has(req.path);
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
