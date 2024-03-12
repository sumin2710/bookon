import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Seat } from '../../seat/entities/seat.entity';
import { Booking } from 'src/booking/entities/booking.entity';
@Entity({
  name: 'eventTimes',
})
export class EventTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  eventId: number;

  @Column({ type: 'datetime' })
  time: Date;

  @ManyToOne(() => Event, (event) => event.eventTimes)
  event: Event;

  @OneToMany(() => Seat, (seat) => seat.eventTime)
  seats: Seat[];

  @OneToMany(() => Booking, (booking) => booking.eventTime)
  bookings: Booking[];
}
