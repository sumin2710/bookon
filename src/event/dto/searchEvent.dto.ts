import { IsNotEmpty, IsString } from 'class-validator';

export class SearchEventDto {
  @IsString()
  @IsNotEmpty({ message: '검색하시려는 공연명을 입력해주세요' })
  keyword: string;
}
