import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('chat_histories')
export class ChatHistory {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'text' })
  messages: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
} 