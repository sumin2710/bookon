import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../types/category.type';
import { Booking } from 'src/booking/entities/booking.entity';
import { EventTime } from '../../event-time/entities/eventTime.entity';
import { Venue } from '../../venue/entities/venue.entity';

@Entity({
  name: 'events',
})
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  plot: string;

  @Column({ type: 'enum', enum: Category })
  category: Category;

  @Column({ type: 'varchar', nullable: true })
  poster: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'varchar' })
  runtime: string;

  @Column({ type: 'varchar', nullable: true })
  cast: string;

  @Column({ type: 'int' })
  venueId: number;

  @Column({ type: 'varchar' })
  venueName: string;

  @Column({ type: 'int' })
  seatScale: number;

  @Column({ type: 'varchar' })
  price: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => EventTime, (eventTime) => eventTime.event)
  eventTimes: EventTime[];

  @OneToMany(() => Booking, (booking) => booking.event)
  bookings: Booking[];

  @ManyToOne(() => Venue, (venue) => venue.events)
  venue: Venue;
}
