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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Booking } from './entities/booking.entity';
import { string } from 'joi';

@ApiTags('예매 API')
@UseGuards(AuthGuard('jwt'))
@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /** 좌석을 지정하여 공연 예매  */
  @Post('event/:id/booking')
  @ApiOperation({ summary: '좌석 지정해 예매하기' })
  @ApiBody({ type: ReserveDto })
  @ApiResponse({ status: 201, description: '예매 정보', type: Booking })
  @ApiParam({ name: 'id', required: true, description: '공연 아이디' })
  async reserve(
    @MemberInfo() member: Member,
    @Param('id') eventId: number,
    @Body() reserveDto: ReserveDto,
  ) {
    return await this.bookingService.reserve(member.email, eventId, reserveDto);
  }

  /** 내 예매 목록 조회 */
  @Get('member/booking')
  @ApiOperation({ summary: '사용자의 예매 목록 조회하기' })
  @ApiResponse({ status: 200, description: '예매 목록', type: [Booking] })
  async getMyBookings(@MemberInfo() member: Member) {
    return await this.bookingService.getMyBookings(member.id);
  }

  /** 예매 상세 조회 */
  @Get('member/booking/:id')
  @ApiOperation({ summary: '사용자 예매 상세 조회하기' })
  @ApiResponse({ status: 200, description: '예매 정보', type: Booking })
  @ApiParam({ name: 'id', required: true, description: '예매 아이디' })
  async getMyBooking(@MemberInfo() member: Member, @Param('id') id: number) {
    return await this.bookingService.getMyBooking(member.id, id);
  }

  /** 예매 취소 */
  @Delete('member/booking/:id')
  @ApiOperation({ summary: '사용자 예매 취소하기' })
  @ApiResponse({ status: 200, description: '예매 취소 메시지', type: string })
  @ApiParam({ name: 'id', required: true, description: '예매 아이디' })
  async cancel(@MemberInfo() member: Member, @Param('id') id: number) {
    if (await this.bookingService.cancel(member.id, id)) {
      return { message: '예매가 취소되었습니다.' };
    }
  }
}
