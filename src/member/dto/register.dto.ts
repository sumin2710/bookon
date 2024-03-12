import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  nickname: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @IsString()
  @IsNotEmpty({
    message:
      '비밀번호를 입력해주세요. 비밀번호는 최소 8글자에 대소문자,특수기호,숫자를 1개 이상 포함해야 합니다.',
  })
  pw: string;
}
