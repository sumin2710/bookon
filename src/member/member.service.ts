import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryRunner, Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, compare } from 'bcrypt';
import _ from 'lodash';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { PointHistory } from './entities/pointHistory.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    private readonly jwtService: JwtService,
  ) {}

  async findByEmail(email: string) {
    return await this.memberRepository.findOneBy({ email });
  }

  async register(email: string, pw: string, nickname: string) {
    const existingMember = await this.findByEmail(email);
    if (existingMember) {
      throw new ConflictException(
        '이미 해당 이메일로 가입된 멤버가 존재합니다.',
      );
    }

    const hashedPw = await hash(pw, 10);
    const member = await this.memberRepository.save({
      email,
      pw: hashedPw,
      nickname,
    });

    await this.pointHistoryRepository.save({
      memberId: member.id,
      change: 1000000,
      reason: '첫 회원가입 기념 백만포인트 지급',
    });
  }

  async login(email: string, pw: string) {
    const member = await this.memberRepository.findOne({
      select: ['id', 'email', 'pw'],
      where: { email },
    });
    if (_.isNil(member)) {
      throw new UnauthorizedException('이메일을 확인해주세요.');
    }

    if (!(await compare(pw, member.pw))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    const payload = { email, sub: member.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async updateProfile(member: Member, updateProfileDto: UpdateProfileDto) {
    const { id } = member;
    const isExistingMember = await this.memberRepository.findOneBy({ id });
    if (_.isNil(isExistingMember)) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    await this.memberRepository.update({ id }, updateProfileDto);
  }

  async decreasePoint(
    queryRunner: QueryRunner,
    id: number,
    change: number,
    reason: string,
  ) {
    await queryRunner.manager
      .createQueryBuilder()
      .update(Member)
      .set({ point: () => `point - ${change}` })
      .where('id = :id', { id })
      .execute();

    await queryRunner.manager.save(PointHistory, {
      memberId: id,
      change: -change,
      reason,
    });
  }

  async increasePoint(
    queryRunner: QueryRunner,
    id: number,
    change: number,
    reason: string,
  ) {
    await queryRunner.manager
      .createQueryBuilder()
      .update(Member)
      .set({ point: () => `point + ${change}` })
      .where('id = :id', { id })
      .execute();

    await queryRunner.manager.save(PointHistory, {
      memberId: id,
      change: +change,
      reason,
    });
  }
}
