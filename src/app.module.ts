import Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MemberModule } from './member/member.module';
import { EventModule } from './event/event.module';
import { BookingModule } from './booking/booking.module';
import { Member } from './member/entities/member.entity';
import { Event } from './event/entities/event.entity';
import { Seat } from './seat/entities/seat.entity';
import { Booking } from './booking/entities/booking.entity';
import { AuthModule } from './auth/auth.module';
import { EventTime } from './event-time/entities/eventTime.entity';
import { PointHistory } from './member/entities/pointHistory.entity';
import { KopisapiModule } from './kopisapi/kopisapi.module';
import { Venue } from './venue/entities/venue.entity';
import { Xml2objectModule } from './xml2object/xml2object.module';
import { VenueModule } from './venue/venue.module';
import { EventTimeModule } from './event-time/event-time.module';
import { SeatModule } from './seat/seat.module';
import { RedisModule } from './redis/redis.module';
import { RedlockModule } from './redlock/redlock.module';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASSWORD'),
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    database: configService.get('DATABASE_NAME'),
    entities: [Member, Event, EventTime, Seat, Booking, PointHistory, Venue],
    synchronize: configService.get('DATABASE_SYNC'),
    logging: true,
    timezone: 'Z',
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_SYNC: Joi.boolean().required(),
        SESSION_SECRET: Joi.string().required(),
        REDIS_USERNAME: Joi.string().required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        BUCKET_NAME: Joi.string().required(),
        AWS_S3_REGION: Joi.string().required(),
        SERVICE_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    MemberModule,
    EventModule,
    BookingModule,
    KopisapiModule,
    Xml2objectModule,
    VenueModule,
    EventTimeModule,
    SeatModule,
    RedisModule,
    RedlockModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
