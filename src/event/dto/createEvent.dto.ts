import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { Category } from '../types/category.type';
import { Transform } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: '공연명을 입력해주세요.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '줄거리를 입력해주세요.' })
  plot: string;

  @IsEnum(Category)
  @IsNotEmpty({
    message: `장르를 입력해주세요. "연극,무용(서양/한국무용),대중무용,서양음악(클래식),한국음악(국악),대중음악,복합,서커스/마술,뮤지컬"중 하나입니다.`,
  })
  category: Category;

  @IsString()
  @IsNotEmpty({ message: '출연진을 입력해주세요.' })
  cast: string;

  @IsDateString()
  @IsNotEmpty({
    message: `공연 시작일자를 입력해주세요. 형식은 '2024-02-24' 식입니다.`,
  })
  startDate: string;

  @IsDateString()
  @IsNotEmpty({
    message: `공연 종료일자를 입력해주세요. 형식은 2024-03-10' 식입니다.`,
  })
  endDate: string;

  @IsString()
  @IsNotEmpty({
    message: `공연시간을 입력해주세요. 형식은 '월요일(12:00), 일요일(12:00, 18:00)' 식입니다.`,
  })
  eventTime: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @IsNotEmpty({ message: '공연 러닝타임을 입력해주세요. 분단위 입니다.' })
  runtime: number;

  @IsString()
  @IsNotEmpty({ message: '공연 시설의 이름을 입력해주세요.' })
  venueName: string;

  @IsString()
  @IsNotEmpty({ message: '공연 시설의 주소를 입력해주세요.' })
  venueAddr: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @IsNotEmpty({ message: '좌석수를 입력해주세요.' })
  seatScale: number;

  @IsString()
  @IsNotEmpty({
    message: `좌석 섹션과 섹션에 따른 금액을 입력해주세요. 형식은 '{"VIP": 50000, "S": 10000, "R": 5000}'식입니다. 금액은 음수이거나 50000원을 넘을 수 없습니다.`,
  })
  sectionPrice: string;

  @IsString()
  @IsNotEmpty({
    message:
      '좌석 정보를 입력해주세요. 형식은 [{"section":"VIP", "seatNum":1}, {"section":"R", "seatNum":2}] 식입니다.',
  })
  seatInfo: string;
}
