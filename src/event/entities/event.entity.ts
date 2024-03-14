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
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'events',
})
export class Event {
  @ApiProperty({ example: 11 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '인피니티 플라잉' })
  @Column({ type: 'varchar', unique: true })
  name: string;

  @ApiProperty({ example: '신라 도깨비, 화랑 무술 대회장에 나타나다!' })
  @Column({ type: 'text', nullable: true })
  plot: string;

  @ApiProperty({ example: '뮤지컬' })
  @Column({ type: 'enum', enum: Category })
  category: Category;

  @ApiProperty({
    example:
      'http://www.kopis.or.kr/upload/pfmPoster/PF_PF236543_240304_141451.png',
  })
  @Column({ type: 'varchar', nullable: true })
  poster: string;

  @ApiProperty({ example: '2024-03-23' })
  @Column({ type: 'date' })
  startDate: Date;

  @ApiProperty({ example: '2024-11-30' })
  @Column({ type: 'date' })
  endDate: Date;

  @ApiProperty({ example: '1시간 20분' })
  @Column({ type: 'varchar' })
  runtime: string;

  @ApiProperty({ example: '' })
  @Column({ type: 'varchar', nullable: true })
  cast: string;

  @ApiProperty({ example: 11 })
  @Column({ type: 'int' })
  venueId: number;

  @ApiProperty({ example: '경주세계문화엑스포' })
  @Column({ type: 'varchar' })
  venueName: string;

  @ApiProperty({ example: 25 })
  @Column({ type: 'int' })
  seatScale: number;

  @ApiProperty({ example: '{"전석":40000}' })
  @Column({ type: 'varchar' })
  price: string;

  @ApiProperty({ example: '2024-03-12T05:27:14.089Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: null })
  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => EventTime, (eventTime) => eventTime.event)
  eventTimes: EventTime[];

  @OneToMany(() => Booking, (booking) => booking.event)
  bookings: Booking[];

  @ManyToOne(() => Venue, (venue) => venue.events)
  venue: Venue;
}
