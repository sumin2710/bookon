import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/createEvent.dto';
import { SearchEventDto } from './dto/searchEvent.dto';
import { FindAvailableSeatDto } from './dto/findAvailableSeat.dto';
import { AdminGuard } from 'src/auth/admin.guard';
import { CreateKopisEventDto } from './dto/createKopisEvent.dto';
import { KopisapiService } from 'src/kopisapi/kopisapi.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Event } from './entities/event.entity';
import { Seat } from 'src/seat/entities/seat.entity';

@ApiTags('공연 API')
@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly kopisService: KopisapiService,
  ) {}

  /** 공연명으로 검색 */
  @UseGuards(AuthGuard('jwt'))
  @Get('/search')
  @ApiOperation({ summary: '공연명으로 검색하기' })
  @ApiResponse({ status: 200, description: '공연 정보', type: [Event] })
  @ApiBody({ type: SearchEventDto })
  async search(@Body() searchEventDto: SearchEventDto) {
    return await this.eventService.search(searchEventDto.keyword);
  }

  /** kopis로 공연 생성 */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('/kopis')
  @ApiOperation({ summary: 'KOPIS로 공연 생성하기' })
  @ApiResponse({ status: 200, description: '공연 정보', type: Event })
  @ApiBody({ type: CreateKopisEventDto })
  async createEvents(@Body() createKopisEventDto: CreateKopisEventDto) {
    return await this.eventService.createKopisEvents(
      createKopisEventDto.page,
      createKopisEventDto.rows,
    );
  }

  @Get('/kopis')
  @ApiOperation({ summary: 'KOPIS에서 가져온 공연 목록 조회하기' })
  @ApiResponse({ status: 200, description: '공연 정보' })
  @ApiBody({ type: CreateKopisEventDto })
  async getEvents(@Body() createKopisEventDto: CreateKopisEventDto) {
    return await this.kopisService.getEvents(
      createKopisEventDto.page,
      createKopisEventDto.rows,
    );
  }

  @Get('/kopis/:mt20id')
  @ApiOperation({ summary: 'KOPIS로 공연 상세 조회하기' })
  @ApiResponse({ status: 200, description: '공연 정보' })
  @ApiParam({
    name: 'mt20id',
    required: true,
    description: 'KOPIS 공연 아이디',
  })
  async getEventDetail(@Param('mt20id') mt20id: string) {
    return await this.kopisService.getEventDetail(mt20id);
  }

  /** 공연 생성 */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('poster'))
  @ApiOperation({ summary: '공연 생성하기' })
  @ApiResponse({ status: 200, description: '공연 정보', type: Event })
  @ApiBody({ type: CreateEventDto })
  async create(
    @UploadedFile() file: Express.MulterS3.File,
    @Body() createEventDto: CreateEventDto,
  ) {
    if (!file) throw new BadRequestException('포스터를 첨부해주세요.');
    const posterName = `eventImage/${Date.now()}-${file.originalname}`;
    return await this.eventService.create(
      posterName,
      file.buffer,
      createEventDto,
    );
  }

  /** 공연 상세 조회 */
  @Get(':id')
  @ApiOperation({ summary: '공연 상세 조회하기' })
  @ApiResponse({ status: 200, description: '공연 정보', type: Event })
  @ApiParam({ name: 'id', required: true, description: '공연 아이디' })
  async findOne(@Param('id') id: number) {
    return await this.eventService.findOne(id);
  }

  /** 공연 목록 조회 */
  @Get()
  @ApiOperation({ summary: '공연 전체 목록 조회하기' })
  @ApiResponse({ status: 200, description: '공연 목록', type: [Event] })
  async findAll() {
    return await this.eventService.findAll();
  }

  /** 공연의 좌석 예매 정보 확인(예매 가능 좌석 조회) */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/seats')
  @ApiOperation({ summary: '공연의 예매 가능 좌석 조회하기' })
  @ApiResponse({ status: 200, description: '좌석 정보', type: [Seat] })
  @ApiParam({ name: 'id', required: true, description: '공연 아이디' })
  @ApiBody({ type: FindAvailableSeatDto })
  async findAvailableSeats(
    @Param('id') id: number,
    @Body() findAvailableSeatDto: FindAvailableSeatDto,
  ) {
    return await this.eventService.findAvailableSeats(
      id,
      findAvailableSeatDto.eventTime,
    );
  }
}
