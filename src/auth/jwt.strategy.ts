import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport'; // 소셜 로그인 등에도 이미 만들어진 PassportStrategy 사용
import { MemberService } from 'src/member/member.service';
import _ from 'lodash';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly memberService: MemberService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    // TODO. payload로 전달된 데이터를 통해 실제 유저 정보를 조회해야 해요! jwt 검증 후 추가로 DB에서 확인해보는 절차
    const member = await this.memberService.findByEmail(payload.email);
    if (_.isNil(member)) {
      throw new NotFoundException('해당하는 사용자를 찾을 수 없습니다.');
    }
    return member;
  }
}
