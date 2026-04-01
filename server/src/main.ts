import "reflect-metadata";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { WinstonModule } from "nest-winston";
import { AppModule } from "@/app.module";
import { EnvService } from "@/modules/env/env.service";
import { LoggerService } from "@/modules/logger/logger.service";
import { winstonConfig } from "@/modules/logger/winston.config";
import { AllExceptionsFilter } from "@/filters/exceptions.filter";
import { ResponseInterceptor } from "@/interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  const env = app.get(EnvService);
  const logger = await app.resolve(LoggerService);

  const start = Date.now();
  const port = env.get("APP_PORT");
  const endpoint = env.get("APP_ENDPOINT");
  const nodeEnv = env.get("NODE_ENV");
  const allowedOrigins = env.get("CORS_ORIGIN");

  app.set("trust proxy", 1);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-client-url",
      "x-trusted-device",
    ],
  });
  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalInterceptors(app.get(ResponseInterceptor));
  app.useGlobalFilters(app.get(AllExceptionsFilter));
  await app.listen(port, "0.0.0.0");

  logger.log("==========================================");
  logger.log(`🚀 Server started successfully!`);
  logger.log(`🌐 Endpoint: ${endpoint}`);
  logger.log(`🔒 Environment: ${nodeEnv}`);
  logger.log(`📦 Listening on port: ${port}`);
  logger.log(`⏱️ Startup time: ${Date.now() - start}ms`);
  logger.log(
    `🪵 Logger initialized with Winston (see logs directory if enabled)`,
  );
  logger.log("==========================================");
}
await bootstrap();
