import { Injectable } from '@nestjs/common';
import Redlock from 'redlock';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RedlockService {
  private readonly redlock: Redlock;

  constructor(private readonly redisService: RedisService) {
    this.redlock = new Redlock([this.redisService.getClient()], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200,
    });
  }

  getRedlock(): Redlock {
    return this.redlock;
  }
}
