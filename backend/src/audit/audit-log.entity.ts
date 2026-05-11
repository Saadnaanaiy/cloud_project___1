import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../auth/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  user: User;

  @Column()
  action: string;

  @Column({ nullable: true })
  entity: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  location: string;

  @CreateDateColumn()
  timestamp: Date;
}
