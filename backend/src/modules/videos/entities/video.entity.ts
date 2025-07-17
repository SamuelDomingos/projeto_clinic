import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 500, nullable: true })
  thumbnail: string;

  @Column()
  user_id: number;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 