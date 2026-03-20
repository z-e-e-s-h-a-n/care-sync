import type { Request, Response, NextFunction } from "express";
import { Injectable, type NestMiddleware } from "@nestjs/common";

import { EnvService } from "@/modules/env/env.service";
import { CacheService } from "@/modules/cache/cache.service";

@Injectable()
export class CacheContextMiddleware implements NestMiddleware {
  constructor(
    private readonly cache: CacheService,
    private readonly env: EnvService,
  ) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const allowedOrigins = this.env.get("CORS_ORIGIN");
    const incomingUrl =
      (req.headers["x-client-url"] as string) ||
      (req.query.clientUrl as string);
    if (incomingUrl && allowedOrigins.includes(incomingUrl)) {
      await this.cache.set("clientUrl", incomingUrl);
    }
    next();
  }
}
