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

@Entity({
  name: 'bookings',
})
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  memberId: number;

  @Column({ type: 'int' })
  eventId: number;

  @Column({ type: 'int' })
  eventTimeId: number;

  @Column({ type: 'datetime' })
  bookingDate: Date;

  @Column({ type: 'varchar' })
  eventName: string;

  @Column({ type: 'varchar' })
  eventRuntime: string;

  @Column({ type: 'int' })
  totalPrice: number;

  @Column({ type: 'int', default: 4 })
  ticketCount: number;

  @Column({
    type: 'enum',
    enum: DeliveryMethod,
    default: DeliveryMethod.PICKUP,
  })
  deliveryMethod: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  deliveryAddr: string;

  @Column({ type: 'varchar', nullable: true })
  deliveryName: string;

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
