import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FindAvailableSeatDto } from 'src/event/dto/findAvailableSeat.dto';

export class ReserveDto extends FindAvailableSeatDto {
  @IsString()
  @IsNotEmpty({
    message:
      '예매하시려는 첫번째 좌석의 섹션을 지정해주세요. 한번에 최대 4개의 좌석 예매가 가능합니다.',
  })
  section1: string;

  @IsNumber()
  @IsNotEmpty({ message: '예매하시려는 첫번째 좌석의 번호를 입력해주세요.' })
  seatNum1: number;

  @IsOptional()
  @IsNotEmpty({ message: '두번째 좌석부턴 필수 입력 사항이 아닙니다.' })
  @IsString({
    message: `예매하시려는 두번째 좌석의 섹션을 지정해주세요. 형식은 'S석' 식입니다.`,
  })
  section2: string;

  @IsOptional()
  @IsNotEmpty({ message: '예매하시려는 두번째 좌석의 번호를 입력해주세요.' })
  @IsInt({ message: '형식은 숫자입니다.' })
  seatNum2: number;

  @IsOptional()
  @IsNotEmpty({ message: '세번째 좌석은 필수 입력 사항이 아닙니다.' })
  @IsString({
    message: `예매하시려는 세번째 좌석의 섹션을 지정해주세요. 형식은 'R석' 식입니다.`,
  })
  section3: string;

  @IsOptional()
  @IsNotEmpty({ message: '예매하시려는 세번째 좌석의 번호를 입력해주세요.' })
  @IsInt({ message: '형식은 숫자입니다.' })
  seatNum3: number;

  @IsOptional()
  @IsNotEmpty({ message: '네번째 좌석은 필수 입력 사항이 아닙니다.' })
  @IsString({
    message: `예매하시려는 네번째 좌석의 섹션을 지정해주세요. 형식은 'S석' 식입니다.`,
  })
  section4: string;

  @IsOptional()
  @IsNotEmpty({ message: '예매하시려는 네번째 좌석의 번호를 입력해주세요.' })
  @IsInt({ message: '형식은 숫자입니다.' })
  seatNum4: number;

  @IsString()
  @IsNotEmpty({
    message: `티켓을 수령할 방식을 선택해주세요. 방식은 '현장수령'과 '배송'의 2가지입니다. 배송을 선택할 시 3000원의 배송비가 청구됩니다.`,
  })
  deliveryMethod: string;

  @IsOptional()
  @IsNotEmpty({
    message:
      '배송을 선택하셨다면, 티켓을 배송받을 주소를 입력해주세요. 입력하지 않았을 경우 프로필에 저장된 주소로 배송됩니다.',
  })
  @IsString()
  address: string;

  @IsOptional({
    message:
      '배송을 선택하셨다면, 티켓을 받을 수령인을 입력해주세요. 입력하지 않았을 경우 프로필에 저장된 이름으로 배송됩니다.',
  })
  @IsString()
  name: string;

  @IsOptional()
  @IsNotEmpty({
    message:
      '예매자 확인을 위한 전화번호를 입력해주세요. 이미 전화번호를 프로필로 등록하셨다면 생략하셔도 좋습니다.',
  })
  @IsString()
  phone: string;
}
