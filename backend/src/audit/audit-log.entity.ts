import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
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
  action: string; // e.g., 'LOGIN', 'LOGOUT'

  @Column()
  ipAddress: string;

  @Column({ type: 'text' })
  userAgent: string;

  @Column({ nullable: true })
  location: string; // Optional: could be filled by a geo-ip service later

  @CreateDateColumn()
  timestamp: Date;
}
