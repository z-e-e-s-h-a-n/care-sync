import KeyvRedis from "@keyv/redis";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";

import { CacheService } from "./cache.service";

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
export class CacheModule {}
