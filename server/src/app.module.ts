import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";

import { EnvModule } from "@/modules/env/env.module";
import { validateEnv } from "@/schemas/env.schema";
import { AuthGuard } from "@/guards/auth.guard";
import { AuthModule } from "@/modules/auth/auth.module";
import { TokenModule } from "@/modules/token/token.module";
import { PublicModule } from "@/modules/public/public.module";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { LoggerModule } from "@/modules/logger/logger.module";
import { SchedulerModule } from "@/modules/scheduler/scheduler.module";
import { NotificationModule } from "@/modules/notification/notification.module";
import { AllExceptionsFilter } from "@/filters/exceptions.filter";
import { ResponseInterceptor } from "@/interceptors/response.interceptor";
import { AdminModule } from "@/modules/admin/admin.module";
import { CacheModule } from "@/modules/cache/cache.module";
import { UserModule } from "@/modules/user/user.module";
import { MediaModule } from "@/modules/media/media.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { BusinessModule } from "@/modules/business/business.module";
import { DashboardModule } from "@/modules/dashboard/dashboard.module";
import { TrafficModule } from "@/modules/traffic/traffic.module";
import { LeadModule } from "./modules/lead/lead.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    EnvModule,
    CacheModule,
    SchedulerModule,
    PublicModule,
    PrismaModule,
    LoggerModule,
    NotificationModule,
    AuthModule,
    TokenModule,
    UserModule,
    AdminModule,
    MediaModule,
    AuditModule,
    BusinessModule,
    DashboardModule,
    TrafficModule,
    LeadModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    AllExceptionsFilter,
    ResponseInterceptor,
  ],
})
export class AppModule {}
