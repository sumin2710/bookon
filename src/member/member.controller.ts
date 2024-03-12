import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { AuthGuard } from '@nestjs/passport';
import { Member } from './entities/member.entity';
import { MemberInfo } from 'src/utils/memberInfo.decorator';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.memberService.register(
      registerDto.email,
      registerDto.pw,
      registerDto.nickname,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.memberService.login(loginDto.email, loginDto.pw);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateProfile(
    @MemberInfo() member: Member,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return await this.memberService.updateProfile(member, updateProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getProfile(@MemberInfo() member: Member) {
    return member;
  }
}
