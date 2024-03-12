import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventTime } from 'src/event-time/entities/eventTime.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class EventTimeService {
  constructor(
    @InjectRepository(EventTime)
    private readonly eventTimeRepository: Repository<EventTime>,
  ) {}

  parseEventTimeStr(eventTimeStr: string): any {
    const result = [];
    // 월요일(12:00), 화요일(13:00, 18:00),금요일(11:00)

    let tmp = eventTimeStr.replace(/\s/g, '').split('),'); // ['월요일(12:00','화요일(13:00,18:00','금요일(11:00)']

    tmp.forEach((v, idx) => {
      let [day, timesStr] = v.split('('); // '화요일' '13:00,18:00' // '금요일' '11:00)'

      if (idx == tmp.length - 1) {
        timesStr = timesStr.slice(0, -1); // 마지막 요소는 ")" 제거해줌 // '11:00)' -> '11:00'
      }

      const times = timesStr.split(',');
      result.push({ day, times });
    });
    return result; // [{'월요일', ['12:00']}, {'화요일', ['13:00','18:00']}, {'금요일', ['11:00']}]
  }

  async create(queryRunner: QueryRunner, eventId: number, time: Date) {
    return await queryRunner.manager.save(EventTime, {
      eventId,
      time,
    });
  }

  convertTimeStrInKorea(timeStr: string) {
    return new Date(new Date(timeStr).getTime() + 9 * 60 * 60 * 1000);
  }

  convertTimeInKorea(time: Date) {
    return new Date(time.getTime() + 9 * 60 * 60 * 1000);
  }

  async findOneWithEventIdAndTime(eventId: number, timeStr: string) {
    return await this.eventTimeRepository.findOne({
      where: {
        eventId,
        time: this.convertTimeStrInKorea(timeStr),
      },
    });
  }

  async findOne(id: number) {
    return await this.eventTimeRepository.findOneBy({ id });
  }
}
