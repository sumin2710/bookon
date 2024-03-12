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

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'members',
})
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', select: false })
  pw: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', unique: true })
  nickname: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  birth: Date;

  @Column({ type: 'int', nullable: true })
  postcode: number;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  detailAddress: string;

  @Column({ type: 'tinyint', default: 0 })
  isAdmin: number;

  @Column({ type: 'int', default: 1000000 })
  point: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.member)
  bookings: Booking[];

  @OneToMany(() => PointHistory, (pointHistory) => pointHistory.member)
  pointHistories: PointHistory[];
}
