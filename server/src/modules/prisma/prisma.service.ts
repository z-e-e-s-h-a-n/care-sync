import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@workspace/db/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { softDeleteExtension } from "./prisma.extension";
import { InjectLogger } from "@/decorators/logger.decorator";
import { EnvService } from "@/modules/env/env.service";
import { LoggerService } from "@/modules/logger/logger.service";

declare global {
  var prismaClient: PrismaService | undefined;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  @InjectLogger()
  private readonly logger!: LoggerService;
  private dbHost!: string;

  constructor(env: EnvService) {
    const connectionString = env.get("DB_URI");
    const adapter = new PrismaPg({ connectionString });

    if (global.prismaClient) return global.prismaClient;

    super({
      adapter,
      log:
        env.get("NODE_ENV") === "production"
          ? ["error", "warn"]
          : ["error", "warn", "info"],
    });

    global.prismaClient = this;

    const host = new URL(connectionString).hostname;
    this.dbHost = host;

    Object.assign(this, this.$extends(softDeleteExtension));
  }

  async onModuleInit() {
    this.logger.log("Connecting to the database...");
    try {
      const isLocal =
        this.dbHost === "localhost" || this.dbHost === "127.0.0.1";
      this.logger.log(`DB: ${isLocal ? "LOCAL" : "REMOTE"} (${this.dbHost})`);
      await this.$connect();
      this.logger.log("✅ Database connection established.");
    } catch (error) {
      this.logger.error("❌ Database connection failed", { error });
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log("Disconnecting from the database...");
    try {
      await this.$disconnect();
      this.logger.log("Database connection closed.");
    } catch (error) {
      this.logger.error("❌ Error disconnecting database", { error });
      throw error;
    }
  }
}
