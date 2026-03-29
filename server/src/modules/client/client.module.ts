import {
  Global,
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from "@nestjs/common";

import { ClientService } from "./client.service";
import { ClientContextMiddleware } from "@/middleware/client.middleware";

@Global()
@Module({
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClientContextMiddleware).forRoutes("*");
  }
}
