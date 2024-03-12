import { Module } from '@nestjs/common';
import { VenueService } from './venue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from 'src/venue/entities/venue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venue])],
  providers: [VenueService],
  exports: [VenueService],
})
export class VenueModule {}
