import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from '../../event/entities/event.entity';

@Entity({
  name: 'venues',
})
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'int' })
  seatScale: number;

  @Column({ type: 'int' })
  address: string;

  @OneToMany(() => Event, (event) => event.venue)
  events: Event[];
}
