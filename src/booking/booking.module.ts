import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from 'src/seat/entities/seat.entity';
import { Booking } from './entities/booking.entity';
import { EventModule } from 'src/event/event.module';
import { Member } from 'src/member/entities/member.entity';
import { PointHistory } from 'src/member/entities/pointHistory.entity';
import { SeatModule } from 'src/seat/seat.module';
import { MemberModule } from 'src/member/member.module';
import { EventTimeModule } from 'src/event-time/event-time.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    EventModule,
    SeatModule,
    MemberModule,
    EventTimeModule,
  ],
  providers: [BookingService],
  controllers: [BookingController],
})
export class BookingModule {}
