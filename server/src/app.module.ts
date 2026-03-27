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
import { BranchModule } from "@/modules/branch/branch.module";
import { PatientModule } from "@/modules/patient/patient.module";
import { DoctorModule } from "@/modules/doctor/doctor.module";
import { AvailabilityModule } from "@/modules/availability/availability.module";
import { AppointmentModule } from "@/modules/appointment/appointment.module";
import { ChatModule } from "@/modules/chat/chat.module";
import { PaymentModule } from "@/modules/payment/payment.module";
import { CommerceModule } from "@/modules/commerce/commerce.module";
import { CampaignModule } from "@/modules/campaign/campaign.module";
import { ClientModule } from "./modules/client/client.module";

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
    ClientModule,
    PrismaModule,
    LoggerModule,
    NotificationModule,
    AuthModule,
    TokenModule,
    UserModule,
    AdminModule,
    MediaModule,
    AuditModule,
    BranchModule,
    PatientModule,
    DoctorModule,
    AvailabilityModule,
    AppointmentModule,
    ChatModule,
    PaymentModule,
    CommerceModule,
    CampaignModule,
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
