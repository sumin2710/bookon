import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Venue } from 'src/venue/entities/venue.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class VenueService {
  constructor(
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
  ) {}

  async create(
    queryRunner: QueryRunner,
    name: string,
    seatScale: number,
    address: string,
  ) {
    return await queryRunner.manager.save(Venue, {
      name,
      seatScale,
      address,
    });
  }

  async findOneWithName(name: string) {
    return await this.venueRepository.findOne({
      where: {
        name,
      },
    });
  }
}
