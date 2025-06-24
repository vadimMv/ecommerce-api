import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheKeyRegistry } from './cache-key-regestry.service';
@Global()
@Module({
  imports: [
    NestCacheModule.register({
      ttl: 10000,
      max: 1000,
      isGlobal: true,
    }),
  ],
  providers: [CacheKeyRegistry],
  exports: [CacheKeyRegistry],
})
export class CacheModule {}
