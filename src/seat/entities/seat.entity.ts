import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EventTime } from '../../event-time/entities/eventTime.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@Entity({
  name: 'seats',
})
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  eventTimeId: number;

  @Column({ type: 'int', nullable: true })
  bookingId: number;

  @Column({ type: 'varchar' })
  section: string;

  @Column({ type: 'int' })
  seatNum: number;

  @Column({ type: 'int', default: 0 })
  price: number;

  @Column({ type: 'tinyint', default: 0 })
  isReserved: number;

  @ManyToOne(() => Booking, (booking) => booking.seats)
  booking: Booking;

  @ManyToOne(() => EventTime, (eventTime) => eventTime.seats, {
    onDelete: 'CASCADE',
  })
  eventTime: EventTime;
}
