import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingService } from './booking.service';
import { ReserveDto } from './dto/reserve.dto';
import { MemberInfo } from 'src/utils/memberInfo.decorator';
import { Member } from 'src/member/entities/member.entity';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /** 좌석을 지정하여 공연 예매  */
  @Post('event/:id/booking')
  async reserve(
    @MemberInfo() member: Member,
    @Param('id') eventId: number,
    @Body() reserveDto: ReserveDto,
  ) {
    return await this.bookingService.reserve(member.email, eventId, reserveDto);
  }

  /** 내 예매 목록 조회 */
  @Get('member/booking')
  async getMyBookings(@MemberInfo() member: Member) {
    return await this.bookingService.getMyBookings(member.id);
  }

  /** 예매 상세 조회 */
  @Get('member/booking/:id')
  async getMyBooking(@MemberInfo() member: Member, @Param('id') id: number) {
    return await this.bookingService.getMyBooking(member.id, id);
  }

  /** 예매 취소 */
  @Delete('member/booking/:id')
  async cancel(@MemberInfo() member: Member, @Param('id') id: number) {
    if (await this.bookingService.cancel(member.id, id)) {
      return { message: '예매가 취소되었습니다.' };
    }
  }
}
