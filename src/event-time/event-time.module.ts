import { Module } from '@nestjs/common';
import { EventTimeService } from './event-time.service';
import { EventTime } from 'src/event-time/entities/eventTime.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([EventTime])],
  providers: [EventTimeService],
  exports: [EventTimeService],
})
export class EventTimeModule {}
