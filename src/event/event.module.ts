import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';
import { Seat } from '../seat/entities/seat.entity';
import { EventTime } from '../event-time/entities/eventTime.entity';
import { Venue } from '../venue/entities/venue.entity';
import { VenueModule } from 'src/venue/venue.module';
import { EventTimeModule } from 'src/event-time/event-time.module';
import { SeatModule } from 'src/seat/seat.module';
import { AuthModule } from 'src/auth/auth.module';
import { KopisapiModule } from 'src/kopisapi/kopisapi.module';
import { CreateKopisEventDto } from './dto/createKopisEvent.dto';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Seat, EventTime, Venue]),
    VenueModule,
    EventTimeModule,
    SeatModule,
    AuthModule,
    KopisapiModule,
  ],
  providers: [EventService, CreateKopisEventDto],
  controllers: [EventController],
  exports: [EventService, CreateKopisEventDto],
})
export class EventModule {}
