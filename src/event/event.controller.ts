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

@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly kopisService: KopisapiService,
  ) {}

  /** 공연명으로 검색 */
  @UseGuards(AuthGuard('jwt'))
  @Get('/search')
  async search(@Body() searchEventDto: SearchEventDto) {
    return await this.eventService.search(searchEventDto.keyword);
  }

  /** kopis로 공연 생성 */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('/kopis')
  async createEvents(@Body() createKopisEventDto: CreateKopisEventDto) {
    return await this.eventService.createKopisEvents(
      createKopisEventDto.page,
      createKopisEventDto.rows,
    );
  }
  @Get('/kopis')
  async getEvents(@Body() createKopisEventDto: CreateKopisEventDto) {
    return await this.kopisService.getEvents(
      createKopisEventDto.page,
      createKopisEventDto.rows,
    );
  }

  @Get('/kopis/:mt20id')
  async getEventDetail(@Param('mt20id') mt20id: string) {
    return await this.kopisService.getEventDetail(mt20id);
  }

  /** 공연 생성 */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('poster'))
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
  async findOne(@Param('id') id: number) {
    return await this.eventService.findOne(id);
  }

  /** 공연 목록 조회 */
  @Get()
  async findAll() {
    return await this.eventService.findAll();
  }

  /** 공연의 좌석 예매 정보 확인(예매 가능 좌석 조회) */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/seats')
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
