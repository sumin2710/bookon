import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReserveDto } from './dto/reserve.dto';
import { EventService } from 'src/event/event.service';
import { SeatService } from 'src/seat/seat.service';
import { MemberService } from 'src/member/member.service';
import { EventTimeService } from 'src/event-time/event-time.service';
import _ from 'lodash';
import { RedlockService } from 'src/redlock/redlock.service';
import { Lock } from 'redlock';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly eventService: EventService,
    private readonly dataSource: DataSource,
    private readonly seatService: SeatService,
    private readonly memberService: MemberService,
    private readonly eventTimeService: EventTimeService,
    private readonly redlockService: RedlockService,
  ) {}

  async reserve(email: string, eventId: number, reserveDto: ReserveDto) {
    let {
      eventTime,
      section1,
      seatNum1,
      section2,
      seatNum2,
      section3,
      seatNum3,
      section4,
      seatNum4,
      deliveryMethod,
      address,
      name,
      phone,
    } = reserveDto;

    let totalPrice: number = 0;

    // 예매자 확인
    const member = await this.memberService.findByEmail(email);
    if (_.isNil(phone)) {
      if (_.isNil(member.phone)) {
        throw new BadRequestException(
          '예매자 확인을 위한 전화번호를 입력하지 않으셨습니다. 프로필에 전화번호를 등록하시거나 전화번호를 입력해주세요.',
        );
      }
      phone = member.phone;
    }
    if (deliveryMethod === '배송') {
      if (_.isNil(address)) {
        if (_.isNil(member.address)) {
          throw new BadRequestException(
            '티켓을 수령할 배송지를 입력하지 않으셨습니다. 프로필에 주소를 등록하시거나 배송지를 입력해주세요.',
          );
        }
        address = member.address;
      }
      if (_.isNil(name)) {
        if (_.isNil(member.name)) {
          throw new BadRequestException(
            '수령인를 입력하지 않으셨습니다. 프로필에 이름을 등록하시거나 수령인을 입력해주세요.',
          );
        }
        name = member.name;
      }
      totalPrice += 3000; // 배송비 추가
    }

    const availableSeats = await this.eventService.findAvailableSeats(
      eventId,
      eventTime,
    );

    const canReserve = availableSeats.filter(
      (seat) =>
        (seat.section === section1 && seat.seatNum === seatNum1) ||
        (seat.section === section2 && seat.seatNum === seatNum2) ||
        (seat.section === section3 && seat.seatNum === seatNum3) ||
        (seat.section === section4 && seat.seatNum === seatNum4),
    );

    if (canReserve.length === 0) {
      throw new ConflictException('선택하신 좌석들이 이미 예매되었습니다.');
    }

    // redlock
    const redlock = this.redlockService.getRedlock();
    const resource = `locks:ticket:${eventId}`;
    const ttl = 1000; // ms

    let lock: Lock;
    try {
      lock = await redlock.acquire([resource], ttl); // lock 획득 시도

      // 트랜잭션 시작
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const seat of canReserve) {
          // 예매 전 좌석이 정말 available한지 확인
          if ((await this.seatService.isAvailableSeat(seat.id)) === false) {
            throw new ConflictException(
              `선택하신 좌석 (${seat.section}, ${seat.seatNum})이 이미 예매되었습니다.`,
            );
          }

          // 좌석 가격 계산
          totalPrice += seat.price;
        }

        // 사용자의 포인트가 충분한지 확인
        if (member.point < totalPrice) {
          throw new ConflictException('포인트가 부족합니다.');
        }

        // 예매 생성
        const existingEvent = await this.eventService.findOne(eventId);
        const existingEventTime = await this.eventTimeService.findOne(
          canReserve[0].eventTimeId,
        );
        const newBooking = await queryRunner.manager.save(Booking, {
          bookingDate: existingEventTime.time,
          deliveryMethod,
          eventId: existingEvent.id,
          eventName: existingEvent.name,
          eventRuntime: existingEvent.runtime,
          eventTimeId: existingEventTime.id,
          memberId: member.id,
          ticketCount: canReserve.length,
          totalPrice,
          phone,
          deliveryAddr: address,
          deliveryName: name,
        });

        // 충분하면, 사용자의 포인트 차감
        const reason = `티켓 예매: 예매번호 ${newBooking.id}번`;
        await this.memberService.decreasePoint(
          queryRunner,
          member.id,
          totalPrice,
          reason,
        );

        // 좌석 상태 업데이트
        for (const seat of canReserve) {
          await this.seatService.updateForReserve(
            queryRunner,
            seat.id,
            newBooking.id,
          );
        }

        await queryRunner.commitTransaction();

        return newBooking;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }

      // lock 해제
      await lock.release();
    } catch (err) {
      throw new ConflictException('예매가 불가능합니다.');
    }
  }

  async getMyBookings(memberId: number) {
    const bookings = await this.bookingRepository.find({
      where: {
        memberId,
      },
      relations: {
        seats: true,
      },
    });
    if (bookings.length === 0) {
      throw new NotFoundException('예매하신 이력이 없습니다.');
    }
    return bookings;
  }

  async findOne(id: number) {
    const booking = await this.bookingRepository.findOneBy({ id });
    if (_.isNil(booking)) {
      throw new NotFoundException('존재하지 않는 예매정보 입니다.');
    }
    return booking;
  }

  async getMyBooking(memberId: number, id: number) {
    const booking = await this.findOne(id);

    if (booking.memberId !== memberId) {
      throw new ForbiddenException('현재 사용자의 예매 정보가 아닙니다.');
    }

    return booking;
  }

  async cancel(memberId: number, id: number) {
    const booking = await this.getMyBooking(memberId, id);

    // 취소 가능 여부 확인 (공연 시작 3시간 전까지만 가능)
    const now = this.eventTimeService.convertTimeInKorea(new Date());
    const diffMSec = booking.bookingDate.getTime() - now.getTime();
    const diffHour = diffMSec / (60 * 60 * 1000);
    if (diffHour < 3) {
      throw new ConflictException(
        '공연 시작 3시간 전까지만 예매를 취소할 수 있습니다.',
      );
    }
    const diffDate = diffMSec / (24 * 60 * 60 * 1000);
    let cancelPrice = booking.totalPrice;
    let cancelFee = 0;
    if (diffDate <= 9 && diffDate >= 7) {
      cancelFee = cancelPrice * 0.1;
    } else if (diffDate <= 6 && diffDate >= 3) {
      cancelFee = cancelPrice * 0.2;
    } else if (diffDate <= 2 && diffDate >= 0) {
      cancelFee = cancelPrice * 0.3;
    }
    cancelPrice -= cancelFee;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 예매 정보 soft delete
      await queryRunner.manager.softDelete(Booking, {
        id,
      });

      // 사용자 포인트 반환
      const reason = `티켓 예매취소: 예매번호 ${id}번`;
      await this.memberService.increasePoint(
        queryRunner,
        memberId,
        cancelPrice,
        reason,
      );

      // 좌석 상태 변경
      await this.seatService.updateForCancel(queryRunner, id);

      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
