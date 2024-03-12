import { Module } from '@nestjs/common';
import { SeatService } from './seat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from 'src/seat/entities/seat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seat])],
  providers: [SeatService],
  exports: [SeatService],
})
export class SeatModule {}
