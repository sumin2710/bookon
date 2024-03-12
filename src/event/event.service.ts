import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event } from './entities/event.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { CreateEventDto } from './dto/createEvent.dto';
import _ from 'lodash';

import { KopisapiService } from 'src/kopisapi/kopisapi.service';

import { VenueService } from 'src/venue/venue.service';
import { EventTimeService } from 'src/event-time/event-time.service';
import { SeatService } from 'src/seat/seat.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly kopisService: KopisapiService,
    private readonly venueService: VenueService,
    private readonly eventTimeService: EventTimeService,
    private readonly seatService: SeatService,
  ) {}

  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
    credentials: {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    },
  });

  async create(
    posterName: string,
    file: Buffer,
    createEventDto: CreateEventDto,
  ) {
    const {
      name,
      plot,
      category,
      cast,
      startDate,
      endDate,
      eventTime,
      runtime,
      venueName,
      venueAddr,
      seatScale,
      sectionPrice,
      seatInfo,
    } = createEventDto;

    const isExistingEvent = await this.eventRepository.findOne({
      where: {
        name,
      },
    });
    if (!_.isNil(isExistingEvent)) {
      throw new ConflictException('해당하는 이름의 공연이 이미 존재합니다.');
    }

    const now = this.eventTimeService.convertTimeInKorea(new Date());
    const endDateInKorea = this.eventTimeService.convertTimeStrInKorea(endDate);
    if (now > endDateInKorea) {
      throw new ConflictException(
        '입력하신 endDate가 이미 지났습니다. 이미 종료된 공연을 생성하실 수 없습니다.',
      );
    }

    const bucketName = this.configService.get('BUCKET_NAME');
    const encodeFileName = encodeURIComponent(posterName);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: posterName,
        Body: file,
      }),
    );
    const uploadUrl = `https://${bucketName}.s3.amazonaws.com/${encodeFileName}`;

    // 트랜잭션으로 처리
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let venue = await this.venueService.findOneWithName(venueName);

      if (_.isNil(venue)) {
        venue = await this.venueService.create(
          queryRunner,
          venueName,
          seatScale,
          venueAddr,
        );
      }

      const newEvent = await queryRunner.manager.save(Event, {
        name,
        plot,
        category,
        cast,
        poster: uploadUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        runtime: `${runtime} 분`,
        venueName,
        venueId: venue.id,
        price: sectionPrice,
        seatScale,
      });

      const eventTimeList: Date[] = [];
      const dayAndTimesList =
        this.eventTimeService.parseEventTimeStr(eventTime);
      for (const dayAndTimes of dayAndTimesList) {
        const tmp = this.kopisService.findDatesOfEvent(
          dayAndTimes,
          newEvent.startDate,
          newEvent.endDate,
        );

        eventTimeList.push(...tmp);
      }

      const sectionPriceObj = JSON.parse(sectionPrice);
      for (const eventTime of eventTimeList) {
        const newEventTime = await this.eventTimeService.create(
          queryRunner,
          newEvent.id,
          this.eventTimeService.convertTimeInKorea(eventTime),
        );

        const seatList = JSON.parse(seatInfo);
        for (const seat of seatList) {
          const price = sectionPriceObj[seat.section];
          if (price < 0 || price > 50000) {
            throw new BadRequestException(
              '좌석의 가격은 양수이고, 50000원을 넘어선 안됩니다.',
            );
          }
          await this.seatService.create(
            queryRunner,
            newEventTime.id,
            seat.section,
            price,
            seat.seatNum,
          );
        }
      }

      await queryRunner.commitTransaction();

      return newEvent;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number) {
    const event = await this.eventRepository
      .createQueryBuilder('event')
      .select('event')
      .addSelect('eventTime.time')
      .leftJoin('event.eventTimes', 'eventTime')
      .where('event.id = :id', { id })
      .getOne();
    if (_.isNil(event)) {
      throw new NotFoundException('존재하지 않는 공연입니다.');
    }
    return event;
  }

  async findAll() {
    const events = await this.eventRepository.find({
      select: ['id', 'name', 'endDate', 'startDate', 'runtime', 'category'],
    });
    // 현재 예매 가능 여부
    const now = new Date();
    const eventList = events.map((event) => {
      let endDate = new Date(event.endDate);
      if (now < endDate) {
        return { ...event, isAvailable: '현재 예매 가능합니다.' };
      } else {
        return { ...event, isAvailable: '현재 예매 불가능합니다.' };
      }
    });
    return eventList;
  }

  async search(keyword: string) {
    const eventList = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.name LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();

    return eventList.length > 0
      ? eventList
      : { message: '검색 결과가 없습니다.' };
  }

  async findAvailableSeats(eventId: number, eventTimeStr: string) {
    const event = await this.findOne(eventId);

    const eventTime = await this.eventTimeService.findOneWithEventIdAndTime(
      event.id,
      eventTimeStr,
    );

    if (_.isNil(eventTime)) {
      throw new NotFoundException('해당 시간대의 공연이 존재하지 않습니다.');
    }

    const seats = await this.seatService.findWithEventTimeId(eventTime.id);

    return seats;
  }

  async createKopisEvents(page: number, rows: number) {
    let events = await this.kopisService.getEvents(page, rows);
    // 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const event of events) {
        // 해당 이름의 공연이 이미 존재하는지 확인

        const isExistingEvent = await this.eventRepository.findOne({
          where: {
            name: event.shprfnm,
          },
        });
        if (!_.isNil(isExistingEvent)) {
          throw new BadRequestException(
            '생성하려는 이벤트가 이미 존재합니다. 다른 페이지로 재시도해주세요.',
          );
        }

        const eventDetail = await this.kopisService.getEventDetail(
          event.mt20id,
        );
        const venueDetail = await this.kopisService.getVenueDetail(
          eventDetail.mt10id,
        );

        // 해당 이름의 공연시설이 이미 존재하는지 확인
        let venue = await this.venueService.findOneWithName(
          venueDetail.fcltynm,
        );
        // 없다면 새로 생성
        if (_.isNil(venue)) {
          venue = await this.venueService.create(
            queryRunner,
            venueDetail.fcltynm,
            25, // venueDetail.seatscale // 너무 많아서 25로 고정...
            venueDetail.adres,
          );
        }

        // 좌석 섹션 당 가격 계산
        const section_price = {};
        eventDetail.pcseguidance.split(', ').forEach((v) => {
          v = v.split(' ');
          section_price[v[0]] = parseInt(v[1].replace(/[^0-9]/g, ''), 10);
        });

        // 공연 생성
        const newEvent = await queryRunner.manager.save(Event, {
          name: eventDetail.prfnm,
          plot: eventDetail.sty,
          category: eventDetail.genrenm,
          poster: eventDetail.poster,
          startDate: this.eventTimeService.convertTimeStrInKorea(
            eventDetail.prfpdfrom.replace(/\./g, '-'),
          ),
          endDate: this.eventTimeService.convertTimeStrInKorea(
            eventDetail.prfpdto.replace(/\./g, '-'),
          ),
          runtime: eventDetail.prfruntime,
          cast: eventDetail.prfcast,
          venueId: venue.id,
          seatScale: venue.seatScale,
          price: JSON.stringify(section_price),
          venueName: venue.name,
        });

        // 공연 시간 계산
        const dayAndTimes = this.kopisService.parseEventTimeStr(
          eventDetail.dtguidance,
        );
        const eventTimes: Date[] = this.kopisService.findDatesOfEvent(
          dayAndTimes,
          newEvent.startDate,
          newEvent.endDate,
        );

        // 섹션 종류 개수
        const sectionNum = Object.keys(section_price).length;
        // 한 섹션 당 좌석 개수 계산
        const seatNumPerSection = Math.floor(newEvent.seatScale / sectionNum);

        // 공연 시간 생성
        for (const eventTime of eventTimes) {
          const newEventTime = await this.eventTimeService.create(
            queryRunner,
            newEvent.id,
            eventTime,
          );
          // 공연 시간 하나 당 좌석 생성
          for (const key in section_price) {
            for (let i = 1; i <= seatNumPerSection; i++) {
              await this.seatService.create(
                queryRunner,
                newEventTime.id,
                key,
                Number.isNaN(section_price[key]) ? 0 : section_price[key],
                i,
              );
            }
          }

          ////////////
        }
        ////////////////
      }

      // 커밋
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
