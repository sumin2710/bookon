import { IsNotEmpty, IsString } from 'class-validator';

export class FindAvailableSeatDto {
  @IsString()
  @IsNotEmpty({
    message: `관람일자를 입력해주세요. 형식은 '2024-01-24 12:00:00' 입니다.`,
  })
  eventTime: string;
}
