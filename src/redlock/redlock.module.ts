import { Module } from '@nestjs/common';
import { RedlockService } from './redlock.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [RedlockService],
  exports: [RedlockService],
})
export class RedlockModule {}
