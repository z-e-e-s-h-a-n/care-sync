import KeyvRedis from "@keyv/redis";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import {
  Global,
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from "@nestjs/common";

import { CacheService } from "./cache.service";
import { CacheContextMiddleware } from "@/middleware/cache.middleware";

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      store: new KeyvRedis("redis://localhost:6379"),
      ttl: 60 * 60,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CacheContextMiddleware).forRoutes("*");
  }
}
