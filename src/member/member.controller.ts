import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { AuthGuard } from '@nestjs/passport';
import { Member } from './entities/member.entity';
import { MemberInfo } from 'src/utils/memberInfo.decorator';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { string } from 'joi';

@ApiTags('사용자 API')
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공 메시지',
    type: string,
  })
  async register(@Body() registerDto: RegisterDto) {
    return await this.memberService.register(
      registerDto.email,
      registerDto.pw,
      registerDto.nickname,
    );
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'accessToken', type: String })
  async login(@Body() loginDto: LoginDto) {
    return await this.memberService.login(loginDto.email, loginDto.pw);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  @ApiOperation({ summary: '사용자 프로필 수정' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: '수정 성공 메시지', type: String })
  async updateProfile(
    @MemberInfo() member: Member,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return await this.memberService.updateProfile(member, updateProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: '프로필 조회' })
  @ApiResponse({ status: 200, description: '멤버 정보', type: Member })
  async getProfile(@MemberInfo() member: Member) {
    return member;
  }
}
