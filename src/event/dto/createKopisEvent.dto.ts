import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateKopisEventDto {
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({
    message:
      'KOPIS로부터 현재로부터 3개월간의 공연 예정인 n개 공연들의 데이터를 가져옵니다. 페이지 수를 입력해주세요. 페이지는 1부터 시작합니다.',
  })
  page: number;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty({
    message: '한 페이지당 몇개의 행을 가져올지 입력해주세요.',
  })
  rows: number;
}
