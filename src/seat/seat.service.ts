import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { Seat } from 'src/seat/entities/seat.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async create(
    queryRunner: QueryRunner,
    eventTimeId: number,
    section: string,
    price: number,
    seatNum: number,
    bookingId: number = null,
  ) {
    return await queryRunner.manager.save(Seat, {
      eventTimeId,
      section,
      price,
      seatNum,
      bookingId,
    });
  }

  async findWithEventTimeId(eventTimeId: number) {
    return await this.seatRepository.find({
      where: {
        eventTimeId,
        isReserved: 0,
      },
    });
  }

  async isAvailableSeat(id: number) {
    const seat = await this.seatRepository.findOne({
      where: {
        id,
        isReserved: 0,
      },
    });
    if (_.isNil(seat)) {
      return false;
    }
    return true;
  }

  async updateForReserve(
    queryRunner: QueryRunner,
    id: number,
    bookingId: number,
  ) {
    await queryRunner.manager.update(
      Seat,
      { id },
      {
        bookingId,
        isReserved: 1,
      },
    );
  }

  async updateForCancel(queryRunner: QueryRunner, bookingId: number) {
    await queryRunner.manager.update(
      Seat,
      {
        bookingId,
      },
      { bookingId: null, isReserved: 0 },
    );
  }
}
