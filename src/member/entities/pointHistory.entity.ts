import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Member } from './member.entity';

@Entity({
  name: 'pointHistories',
})
export class PointHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  memberId: number;

  @Column({ type: 'int' })
  change: number;

  @Column({ type: 'varchar' })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Member, (member) => member.pointHistories)
  member: Member;
}
