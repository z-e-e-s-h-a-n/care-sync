import type { Request } from "express";
import { Injectable } from "@nestjs/common";

import { InjectLogger } from "@/decorators/logger.decorator";
import { LoggerService } from "@/modules/logger/logger.service";

@Injectable()
export class PublicService {
  @InjectLogger()
  private readonly logger!: LoggerService;

  welcome(req: Request) {
    const origin = `${req.protocol}://${req.get("host")}`;

    this.logger.log(
      `Welcome endpoint hit from IP: ${req.ip}, path: ${origin}${req.url}`,
    );
    return { message: "Server is running 🚀" };
  }

  getHealth() {
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();

    this.logger.log(`Health check requested. Uptime: ${uptime}s`);
    return {
      message: "Server is healthy",
      status: "ok",
      uptime,
      timestamp,
    };
  }
}
