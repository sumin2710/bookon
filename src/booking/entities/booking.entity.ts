import { Member } from 'src/member/entities/member.entity';
import { Event } from 'src/event/entities/event.entity';
import { DeliveryMethod } from '../types/deliveryMethod.type';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Seat } from 'src/seat/entities/seat.entity';
import { EventTime } from 'src/event-time/entities/eventTime.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'bookings',
})
export class Booking {
  @ApiProperty({ example: 3 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 2 })
  @Column({ type: 'int' })
  memberId: number;

  @ApiProperty({ example: 6 })
  @Column({ type: 'int' })
  eventId: number;

  @ApiProperty({ example: 99 })
  @Column({ type: 'int' })
  eventTimeId: number;

  @ApiProperty({ example: '2024-03-26T10:30:00.000Z' })
  @Column({ type: 'datetime' })
  bookingDate: Date;

  @ApiProperty({ example: '스파르타 오케스트라' })
  @Column({ type: 'varchar' })
  eventName: string;

  @ApiProperty({ example: '2시간' })
  @Column({ type: 'varchar' })
  eventRuntime: string;

  @ApiProperty({ example: 40000 })
  @Column({ type: 'int' })
  totalPrice: number;

  @ApiProperty({ example: 2 })
  @Column({ type: 'int', default: 4 })
  ticketCount: number;

  @ApiProperty({ example: '배송' })
  @Column({
    type: 'enum',
    enum: DeliveryMethod,
    default: DeliveryMethod.PICKUP,
  })
  deliveryMethod: string;

  @ApiProperty({ example: '010-1111-1111' })
  @Column({ type: 'varchar' })
  phone: string;

  @ApiProperty({ example: '서울' })
  @Column({ type: 'varchar', nullable: true })
  deliveryAddr: string;

  @ApiProperty({ example: '홍길동' })
  @Column({ type: 'varchar', nullable: true })
  deliveryName: string;

  @ApiProperty({ example: null })
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Member, (member) => member.bookings)
  member: Member;

  @ManyToOne(() => Event, (event) => event.bookings)
  event: Event;

  @OneToMany(() => Seat, (seat) => seat.booking)
  seats: Seat[];

  @ManyToOne(() => EventTime, (eventTime) => eventTime.bookings)
  eventTime: EventTime;
}
