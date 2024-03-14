import { Booking } from 'src/booking/entities/booking.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PointHistory } from './pointHistory.entity';
import { ApiProperty } from '@nestjs/swagger';

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'members',
})
export class Member {
  @ApiProperty({ example: 2 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', select: false })
  pw: string;

  @ApiProperty({ example: '홍길동' })
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @ApiProperty({ example: 'monica' })
  @Column({ type: 'varchar', unique: true })
  nickname: string;

  @ApiProperty({ example: 'monica@gmail.com' })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @ApiProperty({ example: '010-1111-1111' })
  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @ApiProperty({ example: '2000-01-01' })
  @Column({ type: 'date', nullable: true })
  birth: Date;

  @ApiProperty({ example: 22222 })
  @Column({ type: 'int', nullable: true })
  postcode: number;

  @ApiProperty({ example: '대한민국' })
  @Column({ type: 'varchar', nullable: true })
  address: string;

  @ApiProperty({ example: '서울' })
  @Column({ type: 'varchar', nullable: true })
  detailAddress: string;

  @ApiProperty({ example: 0 })
  @Column({ type: 'tinyint', default: 0 })
  isAdmin: number;

  @ApiProperty({ example: 1000000 })
  @Column({ type: 'int', default: 1000000 })
  point: number;

  @ApiProperty({ example: '2024-03-12T05:28:42.245Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: null })
  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.member)
  bookings: Booking[];

  @OneToMany(() => PointHistory, (pointHistory) => pointHistory.member)
  pointHistories: PointHistory[];
}
